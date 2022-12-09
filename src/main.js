import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index';
import watchers from './watchers';
import parser from './parser';
import 'bootstrap';

const getPosts = (state, url, getUrlFunc, i18nextInstance) => axios
  .get(getUrlFunc(url))
  .then((res) => {
    const watchedState = state;
    watchedState.rssLink.RSSadded = true;
    const { feedData, postsData } = parser(res.data.contents);
    const feedId = _.uniqueId('feed-');
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
  })
  .catch((e) => {
    const getErrorCode = (err) => {
      if (err.isParsingError) {
        return 'parserError';
      }
      if (e.name === 'AxiosError') {
        return e.name;
      }
      return 'unkown';
    };
    const watchedState = state;
    watchedState.rssLink.error = i18nextInstance.t(getErrorCode(e));
    watchedState.rssLink.isValid = false;
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
  }).then(() => setTimeout(getUpdates(watchedState, getAllOriginsUrl, i18nextInstance), 5000));
};

const app = async () => {
  const initialState = {
    rssLink: {
      value: '',
      isValid: true,
      error: '',
      RSSadded: false,
    },
    feeds: [],
    posts: [],
    watchedPosts: [],
    modal: null,
  };
  const elements = {
    input: document.querySelector('#url-input'),
    feedback: document.querySelector('.feedback'),
    form: document.querySelector('.rss-form'),
    feeds: document.querySelector('.feeds'),
    posts: document.querySelector('.posts'),
  };
  const i18nextInstance = i18next.createInstance();
  const { ru, en } = resources;
  const getAllOriginsUrl = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources: { en, ru },
  }).then(() => {
    const watchedState = watchers(
      initialState,
      i18nextInstance,
      elements.feeds,
      elements.posts,
      elements.feedback,
      elements.input,
    );
    yup.setLocale({
      string: {
        url: i18nextInstance.t('RSSalreadyExists'),
      },
      mixed: {
        required: i18nextInstance.t('required'),
        notOneOf: i18nextInstance.t('RSSalreadyExists'),
      },
    });
    const inputSchema = yup
      .string()
      .required()
      .url();
    const validateUrl = (url, feedsArr) => {
      const feedUrls = feedsArr.map((feed) => feed.url);
      const actualUrlSchema = inputSchema.notOneOf(feedUrls);
      return actualUrlSchema.validate(url);
    };
    elements.posts.addEventListener('click', (evt) => {
      const id = evt.target.getAttribute('data-post-id') || null;
      if (!id) {
        return;
      }
      watchedState.modal = id;
    });
    elements.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      const url = elements.input.value.trim();
      validateUrl(url, watchedState.feeds)
        .then(() => {
          watchedState.rssLink.error = '';
          watchedState.rssLink.isValid = true;
          return getPosts(watchedState, url, getAllOriginsUrl, i18nextInstance);
        })
        .catch((e) => {
          const getErrorCode = (error) => {
            if (error.name === 'ValidationError') {
              return error.message;
            }
            return 'unknown';
          };
          watchedState.rssLink.error = getErrorCode(e);
          watchedState.rssLink.isValid = false;
        });
    });
    getUpdates(watchedState, getAllOriginsUrl, i18nextInstance)();
  });
};

export default app;
