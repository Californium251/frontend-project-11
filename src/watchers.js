import onChange from 'on-change';
import showHideError from './showHideError';
import addFeed from './addFeed';
import addItem from './addItem';
import showDialogBlock from './showDialogBlock';
import alertRSSloaded from './alertRSSloaded';

export default (state, i18nextInstance, feeds, posts, feedback, input) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    if (path === 'rssLink.RSSadded') {
      alertRSSloaded(feedback, i18nextInstance.t('RSSok'));
    }
    if (path === 'rssLink.isValid') {
      showHideError(
        watchedState.rssLink.isValid,
        feedback,
        input,
        i18nextInstance.t(watchedState.rssLink.error),
      );
    }
    if (path === 'feeds') {
      const feedListIsToBeAdded = previousValue.length === 0;
      addFeed(value[value.length - 1], feeds, feedListIsToBeAdded, i18nextInstance.t('feedsHeader'));
    }
    if (path === 'posts') {
      addItem(
        value[value.length - 1],
        posts,
        i18nextInstance.t('showItemButton'),
        i18nextInstance.t('itemsHeader'),
      );
    }
    if (path === 'modal') {
      const targetPost = watchedState.posts.filter((post) => post.postID === value)[0];
      showDialogBlock(document.querySelector('#modal'), targetPost);
    }
  });
  return watchedState;
};
