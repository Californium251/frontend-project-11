import axios from 'axios';
import { setLocale, string } from 'yup';
import i18next from 'i18next';
import resources from './locales/index';
import watchers from './watchers';
import parser from './parser';
import feedIsAdded from './feedIsAdded';
import getNewPosts from './getNewPosts';
import 'bootstrap';

const app = async () => {
  const initialState = {
    rssLink: {
      value: '',
      isValid: true,
      error: '',
    },
    feeds: [],
    posts: [],
    watchedPosts: [],
    postID: 0,
    feedID: 0,
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
    const watchedState = watchers(initialState, i18nextInstance, feeds, posts, feedback, input);
    const inputSchema = string().required().url();
    setLocale({
      string: {
        url: i18next.t('invalidUrl'),
      },
    });
    posts.addEventListener('click', (evt) => {
      if (evt.target.getAttribute('data-bs-toggle') === 'modal') {
        evt.preventDefault();
        const id = evt.target.previousSibling.getAttribute('data-post-id');
        const post = watchedState.posts.filter((el) => el.postID === +id)[0];
        watchedState.modal = post;
      }
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
            watchedState.rssLink.error = i18nextInstance.t('invalidUrl');
            watchedState.rssLink.isValid = false;
          } else {
            watchedState.rssLink.error = '';
            watchedState.rssLink.isValid = true;
          }
        })
        .then(() => {
          if (feedIsAdded(watchedState, url)) {
            watchedState.rssLink.error = i18nextInstance.t('RSSalreadyExists');
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
          const { feedData, postsData } = parser(res.data.contents, i18nextInstance.t('parserError'));
          if (!feedIsAdded(watchedState, url)) {
            watchedState.feeds.push({
              url,
              title: feedData.title,
              description: feedData.description,
              feedID: watchedState.feedID,
            });
            postsData.forEach((post) => {
              const newPost = post;
              newPost.postID = watchedState.postID;
              newPost.feedID = watchedState.feedID;
              watchedState.posts.push(post);
              watchedState.postID += 1;
            });
            watchedState.feedID += 1;
          }
        })
        .then(() => {
          const makeReq = () => {
            const promises = watchedState.feeds.reduce((acc, feed) => {
              acc.push(axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feed.url)}`));
              return acc;
            }, []);
            Promise.all(promises).then((res) => {
              res.forEach((el) => {
                const { postsData } = parser(el.data.contents, i18nextInstance.t('parserError'));
                const newPosts = getNewPosts(watchedState.posts, postsData);
                newPosts.forEach((newPost) => {
                  const post = newPost;
                  post.postID = watchedState.postID;
                  post.feedID = watchedState.feedID;
                  watchedState.posts.push(newPost);
                  watchedState.postID += 1;
                });
                watchedState.feedID += 1;
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
            watchedState.rssLink.error = i18nextInstance.t(e.code);
          } else {
            watchedState.rssLink.error = e.message;
          }
          watchedState.rssLink.isValid = false;
        });
    });
  });
};

export default app;
