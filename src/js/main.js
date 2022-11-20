// Import our custom CSS
import axios from 'axios';
import '../scss/styles.scss';
import onChange from 'on-change';
import { setLocale, string } from 'yup';
import i18next from 'i18next';
import resources from './locales/index';
import validateInput from './watchers/validateInput';
import showHideError from './watchers/showHideError';
import addFeedCard from './watchers/addFeedCard';
import addFeed from './watchers/addFeed';
import parser from './parser';
import checkFeed from './checkFeed';

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap';

const app = async () => {
  const state = {
    rssLink: {
      value: '',
      isValid: true,
    },
    feeds: [],
    posts: [],
  };
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const i18nextInstance = i18next.createInstance();
  const form = document.querySelector('.rss-form');
  const feeds = document.querySelector('.feeds');
  const { ru, en } = resources;
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: { en, ru },
  }).then(() => {
    const watchedState = onChange(state, (path, value, previousValue) => {
      if (path === 'rssLink.isValid') {
        validateInput(state.rssLink.isValid, input);
        showHideError(state.rssLink.isValid, feedback, i18nextInstance.t('invalidUrl'));
      }
      if (path === 'feeds') {
        if (state.feeds.length === 1) {
          addFeedCard(feeds);
          document.querySelector('.card-title').textContent = i18nextInstance.t('feedsHeader');
        }
        const list = feeds.querySelector('.list-group');
        addFeed(value[value.length - 1], list);
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
            watchedState.rssLink.isValid = false;
          } else {
            watchedState.rssLink.isValid = true;
          }
        })
        .then(() => {
          if (state.feeds.includes(url)) {
            throw new Error('Feed is already added');
          }
          return new Promise((resolve, reject) => {
            axios.get(`https://allorigins.hexlet.app/get?url=${encodeURIComponent(url)}`)
              .then((result) => resolve(result))
              .catch((e) => reject(e));
          })})
        .then((res) => {
          const domParser = new DOMParser();
          const data = parser(domParser.parseFromString(res.data.contents, 'text/html'));
          if (!checkFeed(state, url)) {
            watchedState.feeds.push({ url, title: data.title, description: data.description });
            // watchedState.posts.push({ url, data: data.items });
          };
        })
        .catch((e) => {
          console.log(e);
        });
    });
  });
};

app();
