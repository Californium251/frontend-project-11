import axios from 'axios';
import * as yup from 'yup';
import i18next from 'i18next';
import _ from 'lodash';
import resources from './locales/index';
import watchers from './watchers';
import parser from './parser';
import 'bootstrap';

const addProxy = (url) => `https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`;
const getPosts = (watchedState, url) => axios
  .get(addProxy(url))
  .then((res) => {
    watchedState.rssLink.RSSadded = true;
    const { feedData, postsData } = parser(res.data.contents);
    const feedId = _.uniqueId('feed-');
    watchedState.feeds = [...watchedState.feeds, {
      url,
      title: feedData.title,
      description: feedData.description,
      feedID: feedId,
    }];
    const posts = postsData.map((post) => {
      post.postID = _.uniqueId('post-');
      post.feedID = feedId;
      return post;
    });
    const UIposts = posts.map((post) => ({ postID: post.postID, watched: false }));
    watchedState.UIstate.posts = [...watchedState.UIstate.posts, ...UIposts];
    watchedState.posts = [...watchedState.posts, ...posts];
  })
  .catch((e) => {
    const getErrorCode = (err) => {
      if (err.isParsingError) {
        return 'parserError';
      }
      if (axios.isAxiosError(err)) {
        return err.name;
      }
      return 'unknown';
    };
    watchedState.rssLink.error = getErrorCode(e);
  })
  .finally(() => {
    watchedState.feedsTemp = [];
  });

const getUpdates = (watchedState) => {
  const requestUpdates = () => {
    const promises = watchedState.feeds.map((feed) => axios.get(addProxy(feed.url)).then((res) => {
      const { postsData } = parser(res.data.contents);
      const getNewPosts = (state, postsArr) => {
        const flatState = state.map((postEl) => postEl.link);
        return postsArr.filter((postEl) => !flatState.includes(postEl.link));
      };
      const feedId = _.uniqueId('feed-');
      const newPosts = getNewPosts(watchedState.posts, postsData).map((post) => {
        post.postID = _.uniqueId('post-');
        post.feedID = feedId;
        return post;
      });
      const UIposts = newPosts.map((post) => ({ postID: post.postID, watched: false }));
      watchedState.UIposts = [...watchedState.UIposts, ...UIposts];
      watchedState.posts = [...watchedState.posts, ...newPosts];
    }).catch(() => {}));
    Promise.all(promises).finally(() => setTimeout(requestUpdates, 5000));
  };
  requestUpdates();
};

const app = async () => {
  const initialState = {
    rssLink: {
      value: '',
      isValid: true,
      error: '',
      RSSadded: false,
    },
    UIstate: {
      posts: [],
    },
    feeds: [],
    feedsTemp: [],
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
    modal: document.querySelector('#modal'),
  };
  const i18nextInstance = i18next.createInstance();
  i18nextInstance.init({
    lng: 'ru',
    debug: true,
    resources,
  }).then(() => {
    const watchedState = watchers(
      initialState,
      i18nextInstance,
      elements,
    );
    yup.setLocale({
      string: {
        url: 'invalidUrl',
      },
      mixed: {
        required: 'required',
        notOneOf: 'RSSalreadyExists',
      },
    });
    const inputSchema = yup
      .string()
      .required()
      .url();
    const validateUrl = (url, feedsArr, feedsTemp) => {
      const feedUrls = feedsArr.map((feed) => feed.url);
      const actualUrlSchema = inputSchema.notOneOf(feedUrls).notOneOf(feedsTemp);
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
      validateUrl(url, watchedState.feeds, watchedState.feedsTemp)
        .then(() => {
          watchedState.feedsTemp.push(url);
          watchedState.rssLink.error = '';
          watchedState.rssLink.isValid = true;
          return getPosts(watchedState, url);
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
    getUpdates(watchedState);
  });
};

export default app;
