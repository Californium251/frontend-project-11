import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index';
import watchers from './watchers';
import parser from './parser';
import 'bootstrap';

const getPosts = (state, url, getUrlFunc) => axios.get(getUrlFunc(url)).then((res) => {
  const watchedState = state;
  watchedState.rssLink.RSSadded = true;
  const { feedData, postsData } = parser(res.data.contents);
  const feedId = _.uniqueId('feed-');
  watchedState.feedUrls.push(url);
  watchedState.feeds.push({
    url,
    title: feedData.title,
    description: feedData.description,
    feedID: feedId,
  });
  postsData.forEach((post) => {
    const newPost = post;
    newPost.postID = _.uniqueId('post-');
    newPost.feedID = feedId;
    watchedState.posts.push(post);
  });
});

const getUpdates = (watchedState, getAllOriginsUrl, i18nextInstance) => () => {
  const promises = watchedState.feeds.reduce((acc, feed) => {
    acc.push(axios.get(getAllOriginsUrl(feed.url)));
    return acc;
  }, []);
  Promise.all(promises).then((res) => {
    res.forEach((el) => {
      const { postsData } = parser(el.data.contents, i18nextInstance.t('parserError'));
      const getNewPosts = (state, postsArr) => {
        const flatState = state.map((postEl) => postEl.link);
        return postsArr.filter((postEl) => !flatState.includes(postEl.link));
      };
      const newPosts = getNewPosts(watchedState.posts, postsData);
      const feedId = _.uniqueId('feed-');
      newPosts.forEach((newPost) => {
        const post = newPost;
        post.postID = _.uniqueId('post-');
        post.feedID = feedId;
        watchedState.posts.push(newPost);
      });
    });
  });
};

const app = async () => {
  const initialState = {
    rssLink: {
      value: '',
      isValid: true,
      error: '',
    },
    feeds: [],
    feedUrls: [],
    posts: [],
    watchedPosts: [],
    modal: null,
  };
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const i18nextInstance = i18next.createInstance();
  const form = document.querySelector('.rss-form');
  const feeds = document.querySelector('.feeds');
  const posts = document.querySelector('.posts');
  const { ru, en } = resources;
  const getAllOriginsUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: { en, ru },
  }).then(() => {
    const watchedState = watchers(initialState, i18nextInstance, feeds, posts, feedback, input);
    const inputSchema = yup
      .string()
      .required()
      .url()
      .notOneOf(watchedState.feeds.map((feed) => feed.url));
    yup.setLocale({
      string: {
        url: i18nextInstance.t('invalidUrl'),
        required: i18nextInstance.t('inputRequired'),
        notOneOf: i18nextInstance.t('RSSalreadyExists'),
      },
    });
    posts.addEventListener('click', (evt) => {
      const id = evt.target.getAttribute('data-post-id') || null;
      if (!id) {
        return;
      }
      watchedState.modal = id;
    });
    form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const url = input.value.trim();
      inputSchema.validate(url)
        .then(() => {
          watchedState.rssLink.error = '';
          watchedState.rssLink.isValid = true;
          return getPosts(watchedState, url, getAllOriginsUrl);
        })
        .catch((e) => {
          const getErrorCode = (error) => {
            if (error.name === 'ValidationError') {
              return 'invalidUrl';
            }
            if (error.code === 'ERR_NETWORK') {
              return 'ERR_NETWORK';
            }
            if (error.isParsingError) {
              return 'parserError';
            }
            if (error.isAxiosError) {
              return 'network';
            }
            return 'unknown';
          };
          watchedState.rssLink.error = getErrorCode(e);
          watchedState.rssLink.isValid = false;
        });
    });
    const setInt = (fn, delay) => {
      const wrapper = () => {
        fn();
        return setTimeout(wrapper, delay);
      };
      setTimeout(wrapper, delay);
    };
    setInt(getUpdates(watchedState, getAllOriginsUrl, i18nextInstance), 5000);
  });
};

export default app;
