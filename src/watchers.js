import onChange from 'on-change';
import showHideError from './showHideError';
import addFeeds from './addFeeds';
import addItems from './addItems';
import showDialogBlock from './showDialogBlock';
import alertRSSloaded from './alertRSSloaded';
import markPostWatched from './markPostWatched';

export default (state, i18nextInstance, elements) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'rssLink.isValid':
        showHideError(
          watchedState.rssLink.isValid,
          elements.feedback,
          elements.input,
          i18nextInstance.t(watchedState.rssLink.error),
        );
        break;
      case 'feeds':
        addFeeds(
          value,
          elements.feeds,
          i18nextInstance.t('feedsHeader'),
        );
        alertRSSloaded(elements.feedback, i18nextInstance.t('RSSok'));
        break;
      case 'posts':
        addItems(
          value,
          elements.posts,
          i18nextInstance.t('showItemButton'),
          i18nextInstance.t('itemsHeader'),
        );
        break;
      default:
        break;
    }
    if (path === 'modal') {
      const targetPost = watchedState.posts.filter((post) => post.postID === value)[0];
      targetPost.isWatched = true;
      markPostWatched(targetPost);
      showDialogBlock(elements.modal, targetPost);
    }
  });
  return watchedState;
};
