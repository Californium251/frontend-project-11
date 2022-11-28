// Import our custom CSS
import axios from 'axios';
import '../scss/styles.scss';
import onChange from 'on-change';
import { setLocale, string } from 'yup';
import i18next from 'i18next';
import resources from './locales/index';
import watchers from './index';
import parser from './parser';
import feedIsAdded from './feedIsAdded';
import getNewPosts from './getNewPosts';
import 'bootstrap';

const app = async () => {
  const state = {
    rssLink: {
      value: '',
      isValid: true,
      error: '',
    },
    feeds: [],
    posts: [],
    watchedPosts: [],
    postID: 0,
    modal: 'hidden',
  };
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const i18nextInstance = i18next.createInstance();
  const form = document.querySelector('.rss-form');
  const feeds = document.querySelector('.feeds');
  const posts = document.querySelector('.posts');
  const { ru, en } = resources;
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: { en, ru },
  }).then(() => {
    const modal = document.querySelector('#modal');
    modal.querySelectorAll('[data-bs-dismiss="modal"]').forEach((el) => {
      el.addEventListener('click', (evt) => {
        evt.preventDefault();
        state.modal = 'hidden';
      });
    });
    const watchedState = onChange(state, (path, value, previousValue) => {
      const modalCallback = (evt, post) => {
        evt.preventDefault();
        watchedState.modal = post;
        watchers.markPostWatched(document.querySelector(`[data-post-id="${post.postID}"]`));
      };
      if (path === 'rssLink.RSSadded') {
        watchers.alertRSSloaded(feedback, value);
      }
      if (path === 'rssLink.isValid') {
        watchers.addRedBorderToInput(state.rssLink.isValid, input);
        watchers.showHideError(state.rssLink.isValid, feedback, state.rssLink.error);
      }
      if (path === 'feeds') {
        if (previousValue.length === 0) {
          watchers.addFeedCard(feeds, i18nextInstance.t('feedsHeader'));
        }
        const list = feeds.querySelector('.list-group');
        watchers.addFeed(value[value.length - 1], list);
      }
      if (path === 'posts') {
        if (previousValue.length === 0) {
          watchers.addItemsList(posts, i18nextInstance.t('itemsHeader'));
        }
        const list = posts.querySelector('.list-group');
        watchers.addItem(value[value.length - 1], list, i18nextInstance.t('showItemButton'), modalCallback);
      }
      if (path === 'modal') {
        watchers.showDialogBlock(document.querySelector('#modal'), value);
      }
    });
    const inputSchema = string().required().url();
    setLocale({
      string: {
        url: i18next.t('invalidUrl'),
      },
    });
    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const url = input.value.trim();
      if (url.length === 0) {
        throw new Error(i18nextInstance.t('blankInput'));
      }
      inputSchema.isValid(url)
        .then((val) => {
          if (!val) {
            state.rssLink.error = i18nextInstance.t('invalidUrl');
            watchedState.rssLink.isValid = false;
          } else {
            state.rssLink.error = '';
            watchedState.rssLink.isValid = true;
          }
        })
        .then(() => {
          if (feedIsAdded(state, url)) {
            state.rssLink.error = i18nextInstance.t('RSSalreadyExists');
            watchedState.rssLink.isValid = false;
            throw new Error(i18nextInstance('RSSalreadyExists'));
          }
          return new Promise((resolve, reject) => {
            axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`)
              .then((result) => resolve(result))
              .catch((e) => reject(e));
          });
        })
        .then((res) => {
          if (!res.data.status.content_type.includes('application/rss+xml')) {
            throw new Error(i18nextInstance.t('noRSS'));
          }
          watchedState.rssLink.RSSadded = i18nextInstance.t('RSSok');
          const { feedData, postsData } = parser(res.data.contents, url);
          if (!feedIsAdded(state, url)) {
            watchedState.feeds.push({
              url,
              title: feedData.title,
              description: feedData.description,
            });
            postsData.forEach((post) => {
              post.postID = state.postID;
              watchedState.posts.push(post);
              state.postID += 1;
            });
          }
        })
        .then(() => {
          const makeReq = () => {
            const promises = state.feeds.reduce((acc, feed) => {
              acc.push(axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feed.url)}`));
              return acc;
            }, []);
            Promise.all(promises).then((res) => {
              res.forEach((el) => {
                const { postsData } = parser(el.data.contents, el.data.status.url);
                const newPosts = getNewPosts(state.posts, postsData);
                newPosts.forEach((newPost) => {
                  newPost.postID = state.postID;
                  watchedState.posts.push(newPost);
                  state.postID += 1;
                });
              });
            });
          };
          const setInt = (fn, delay) => {
            const wrapper = () => {
              fn();
              return setTimeout(wrapper, delay);
            };
            setTimeout(wrapper, delay);
          };
          setInt(makeReq, 5000);
        })
        .catch((e) => {
          if (e.code === 'ERR_NETWORK') {
            state.rssLink.error = i18nextInstance.t(e.code);
          } else {
            state.rssLink.error = e.message;
          }
          watchedState.rssLink.isValid = false;
        });
    });
  });
};

export default app();
