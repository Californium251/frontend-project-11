import axios from 'axios';
import { setLocale, string, addMethod } from 'yup';
import i18next from 'i18next';
import resources from './locales/index';
import watchers from './watchers';
import parser from './parser';
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
    const feedIsNotAdded = (feed) => {
      let flag = true;
      watchedState.feeds.forEach((el) => {
        if (el.url === feed) {
          flag = false;
        }
      });
      if (flag) {
        return flag;
      }
      const newErr = new Error();
      newErr.isFeedAlreadyAdded = true;
      throw newErr;
    };
    const inputSchema = string().required().url().test(feedIsNotAdded);
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
      inputSchema.isValid(url)
        .then((val) => {
          if (!val) {
            const newErr = new Error();
            newErr.isInvalidUrl = true;
            throw newErr;
          } else {
            watchedState.rssLink.error = '';
            watchedState.rssLink.isValid = true;
          }
          return axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(url)}`);
        })
        .then((res) => {
          watchedState.rssLink.RSSadded = true;
          const { feedData, postsData } = parser(res.data.contents);
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
        })
        .catch((e) => {
          const getErrorCode = (e) => {
            if (e.isInvalidUrl) {
              return 'invalidUrl';
            }
            if (e.code === 'ERR_NETWORK') {
              return 'ERR_NETWORK';
            }
            if (e.isParsingError) {
              return 'parserError';
            }
            if (e.isFeedAlreadyAdded) {
              return 'RSSalreadyExists';
            }
            if (e.isAxiosError) {
              return 'network';
            }
            return 'unknown';
          };
          watchedState.rssLink.error = getErrorCode(e);
          watchedState.rssLink.isValid = false;
        });
    });
    const makeReq = () => {
      const promises = watchedState.feeds.reduce((acc, feed) => {
        acc.push(axios.get(`https://allorigins.hexlet.app/get?disableCache=true&url=${encodeURIComponent(feed.url)}`));
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
  });
};

export default app;
