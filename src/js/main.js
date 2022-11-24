// Import our custom CSS
import axios from 'axios';
import '../scss/styles.scss';
import onChange from 'on-change';
import { setLocale, string } from 'yup';
import i18next from 'i18next';
import resources from './locales/index';
import watchers from './watchers/index';
import parser from './parsers/index';
import checkFeed from './checkFeed';

// Import all of Bootstrap's JS
// import * as bootstrap from 'bootstrap';

const app = async () => {
  const state = {
    rssLink: {
      value: '',
      isValid: true,
      error: '',
    },
    feeds: [],
    posts: [],
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
    const watchedState = onChange(state, (path, value, previousValue) => {
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
        watchers.addItem(value[value.length - 1], list, i18nextInstance.t('showItemButton'));
      }
      if (path === 'modal') {
        if (value === 'hidden') {
          watchers.hideDialogBlock(document.querySelector('#modal'));
        } else {
          watchers.showDialogBlock(document.querySelector('#modal'), value[0]);
        }
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
      inputSchema.isValid(url)
        .then((val) => {
          if (!val) {
            state.rssLink.error = i18nextInstance.t('invalidUrl');
            watchedState.rssLink.isValid = false;
          } else {
            state.rssLink.error = i18nextInstance.t('');
            watchedState.rssLink.isValid = true;
          }
        })
        .then(() => {
          if (checkFeed(state, url)) {
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
          const { feedData, postsData } = parser(res.data.contents, url);
          if (!checkFeed(state, url)) {
            watchedState.feeds.push({
              url,
              title: feedData.title,
              description: feedData.description,
            });
            postsData.forEach((post) => {
              post.postID = state.postID;
              state.postID += 1;
              watchedState.posts.push(post);
            });
            document.querySelectorAll('[data-bs-toggle="modal"]').forEach((elem) => {
              elem.addEventListener('click', (event) => {
                event.preventDefault();
                const targetPost = state.posts.filter((el) => el.postID === +event.target.getAttribute('data-post-id'));
                watchedState.modal = targetPost;
                const closeModal = (evt) => {
                  evt.preventDefault();
                  watchedState.modal = 'hidden';
                };
                document.querySelectorAll('[data-bs-dismiss="modal"]').forEach((el) => {
                  el.addEventListener('click', closeModal);
                });
              });
            });
          }
        })
        .catch((e) => {
          state.rssLink.error = e;
          watchedState.rssLink.isValid = false;
        });
    });
  });
};

app();
