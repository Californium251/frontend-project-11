import onChange from 'on-change';
import renderError from './renderError';
import renderFeeds from './renderFeeds';
import renderItems from './renderItems';
import renderModal from './renderModal';
import renderRSSloaded from './renderRSSloaded';
import renderValidationErr from './renderValidationErr';
import markPostWatched from './markPostWatched';

export default (state, i18nextInstance, elements) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssLink.error':
        renderError(
          elements.feedback,
          elements.input,
          watchedState.rssLink.error,
          i18nextInstance,
        );
        break;
      case 'rssLink.isValid':
        renderValidationErr(watchedState.rssLink.isValid, elements.input);
        break;
      case 'feeds':
        renderFeeds(
          value,
          elements.feeds,
          'feedsHeader',
          i18nextInstance,
        );
        renderRSSloaded(elements.feedback, 'RSSok', i18nextInstance);
        break;
      case 'posts':
        renderItems(
          value,
          elements.posts,
          watchedState.UIstate.posts,
          'showItemButton',
          'itemsHeader',
          i18nextInstance,
        );
        break;
      default:
        break;
    }
    if (path === 'modal') {
      const targetPost = watchedState.posts.filter((post) => post.postID === value)[0];
      watchedState.UIstate.posts.filter((post) => post.postID === value)[0].watched = true;
      markPostWatched(value);
      renderModal(elements.modal, targetPost);
    }
  });
  return watchedState;
};
