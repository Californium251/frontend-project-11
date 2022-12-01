import onChange from 'on-change';
import showHideError from './showHideError';
import addFeed from './addFeed';
import addItem from './addItem';
import showDialogBlock from './showDialogBlock';
import alertRSSloaded from './alertRSSloaded';

export default (state, i18nextInstance, feeds, posts, feedback, input) => {
  const watchedState = onChange(state, (path, value, previousValue) => {
    if (path === 'rssLink.RSSadded') {
      alertRSSloaded(feedback, value);
    }
    if (path === 'rssLink.isValid') {
      showHideError(
        watchedState.rssLink.isValid,
        feedback,
        input,
        watchedState.rssLink.error,
      );
    }
    if (path === 'feeds') {
      const feedListIsToBeAdded = previousValue.length === 0;
      addFeed(value[value.length - 1], feeds, feedListIsToBeAdded, i18nextInstance.t('feedsHeader'));
    }
    if (path === 'posts') {
      const listIsToBeAdded = previousValue.length === 0;
      addItem(
        value[value.length - 1],
        posts,
        i18nextInstance.t('showItemButton'),
        listIsToBeAdded,
        i18nextInstance.t('itemsHeader'),
        watchedState,
      );
    }
    if (path === 'modal') {
      console.log(value);
      showDialogBlock(document.querySelector('#modal'), value);
    }
  });
  return watchedState;
};
