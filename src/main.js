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
    const { feed, posts } = parser(res.data.contents);
    const feedID = _.uniqueId('feed-');
    watchedState.feeds = [...watchedState.feeds, {
      url,
      title: feed.title,
      description: feed.description,
      feedID,
    }];
    const newPosts = posts.map((post) => {
      post.postID = _.uniqueId('post-');
      post.feedID = feedID;
      return post;
    });
    watchedState.posts = [...watchedState.posts, ...newPosts];
    watchedState.dataLoad.state = 'success';
  })
  .catch((e) => {
    const getErrorCode = (err) => {
      if (err.isParsingError) {
        return 'noRSS';
      }
      if (axios.isAxiosError(err)) {
        return err.name;
      }
      return 'unknown';
    };
    console.log(e);
    watchedState.dataLoad.error = getErrorCode(e);
    watchedState.dataLoad.state = 'error';
  });

const getUpdates = (watchedState) => {
  const promises = watchedState.feeds.map((feed) => {
    const urlWithProxy = addProxy(feed.url);
    return axios.get(urlWithProxy).then((res) => {
      const { posts } = parser(res.data.contents);
      const getNewPosts = (state, postsArr) => {
        const flatState = state.map((postEl) => postEl.link);
        return postsArr.filter((postEl) => !flatState.includes(postEl.link));
      };
      const newPosts = getNewPosts(watchedState.posts, posts).map((post) => {
        post.postID = _.uniqueId('post-');
        post.feedID = feed.feedID;
        return post;
      });
      watchedState.posts = [...watchedState.posts, ...newPosts];
    }).catch((e) => {
      console.log(e.message);
    });
  });
  Promise.all(promises).finally(() => setTimeout(() => {
    getUpdates(watchedState);
  }, 5000));
};

const app = async () => {
  const initialState = {
    form: {
      state: 'ready',
      error: '',
    },
    dataLoad: {
      state: 'idle',
      error: '',
    },
    UIstate: {
      posts: [],
    },
    feeds: [],
    posts: [],
    modal: null,
  };
  const elements = {
    input: document.querySelector('#url-input'),
    submitButton: document.querySelector('button[type="submit"]'),
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
      if (!watchedState.UIstate.posts.includes(id)) {
        watchedState.UIstate.posts = [...watchedState.UIstate.posts, id];
      }
      watchedState.modal = id;
    });
    elements.form.addEventListener('submit', (evt) => {
      evt.preventDefault();
      watchedState.form.state = 'sending';
      const formData = new FormData(evt.target);
      const url = formData.get('url');
      validateUrl(url, watchedState.feeds)
        .then(() => {
          getPosts(watchedState, url);
          watchedState.form.error = '';
          watchedState.form.state = 'ready';
        })
        .catch((e) => {
          const getErrorCode = (error) => {
            if (error.name === 'ValidationError') {
              return error.message;
            }
            return 'unknown';
          };
          watchedState.form.error = getErrorCode(e);
          watchedState.form.state = 'error';
        });
    });
    getUpdates(watchedState);
  });
};

export default app;
