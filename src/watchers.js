import onChange from 'on-change';

const renderError = (element, error, i18nextInstance) => {
  if (error === '') {
    element.textContent = ' ';
  } else {
    element.classList.add('text-danger');
    element.textContent = i18nextInstance.t(error);
  }
};

const renderFeeds = (feeds, element, feedsHeader, i18nextInstance) => {
  const addFeedList = (el, header, i18next) => {
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const cardBodyHeader = document.createElement('h2');
    const list = document.createElement('ul');
    card.classList.add('card', 'border-0');
    cardBody.classList.add('card-body');
    cardBodyHeader.classList.add('card-title', 'h4');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    cardBodyHeader.textContent = i18next.t(header);
    cardBody.append(cardBodyHeader);
    card.append(cardBody);
    card.append(list);
    el.append(card);
    return list;
  };

  const addFeed = (feed, feedList) => {
    const li = document.createElement('li');
    const title = document.createElement('h3');
    const paragraph = document.createElement('p');
    li.classList.add('list-group-item', 'border-0', 'border-end-0');
    title.classList.add('h6', 'm-0');
    paragraph.classList.add('m-0', 'small', 'text-black-50');
    title.textContent = feed.title;
    paragraph.textContent = feed.description;
    li.append(title);
    li.append(paragraph);
    feedList.append(li);
  };

  const feedList = element.querySelector('.list-group') || addFeedList(element, feedsHeader, i18nextInstance);
  feedList.innerHTML = '';
  feeds.forEach((feed) => addFeed(feed, feedList));
};

const renderItems = (posts, element, UIposts, buttonText, itemsHeader, i18nextInstance) => {
  const addItemsList = (el, header, i18next) => {
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const cardHeader = document.createElement('h2');
    const ul = document.createElement('ul');
    card.classList.add('card', 'border-0');
    cardBody.classList.add('card-body');
    cardHeader.classList.add('card-title', 'h4');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    cardHeader.textContent = i18next.t(header);
    cardBody.append(cardHeader);
    card.append(cardBody);
    card.append(ul);
    el.append(card);
    return ul;
  };

  const addItem = (post, watchedPosts, btnText, itemsList, i18next) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    const button = document.createElement('button');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    if (watchedPosts.includes(post.postID)) {
      link.classList.add('fw-normal');
    } else {
      link.classList.add('fw-bold');
    }
    link.setAttribute('target', '_blank');
    link.setAttribute('href', post.link);
    link.setAttribute('data-post-id', post.postID);
    link.textContent = post.title;
    button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
    button.setAttribute('type', 'button');
    button.setAttribute('data-bs-toggle', 'modal');
    button.setAttribute('data-bs-target', '#modal');
    button.setAttribute('data-post-id', post.postID);
    button.textContent = i18next.t(btnText);
    li.append(link);
    li.append(button);
    itemsList.append(li);
  };

  const itemsList = element.querySelector('.list-group') || addItemsList(element, itemsHeader, i18nextInstance);
  itemsList.innerHTML = '';
  const watchedPosts = UIposts.reduce((acc, post) => {
    if (post.watched) {
      acc.push(post.postID);
    }
    return acc;
  }, []);
  posts.forEach((post) => addItem(post, watchedPosts, buttonText, itemsList, i18nextInstance));
};

const renderModal = (element, post) => {
  const modalTitle = element.querySelector('.modal-title');
  const modalBody = element.querySelector('.modal-body');
  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  element.querySelector('a.btn-primary').setAttribute('href', post.link);
};

const renderRSSloaded = (input, key, i18nextInstance) => {
  input.classList.add('text-success');
  input.classList.remove('text-danger');
  input.textContent = i18nextInstance.t(key);
};

const renderValidationErr = (state, inputEl) => {
  if (state === false) {
    inputEl.classList.add('is-invalid');
  } else {
    inputEl.classList.remove('is-invalid');
  }
};

const getNewUIPosts = (posts, UIposts) => {
  const UIpostsIDs = UIposts.map((post) => post.postID);
  const newPostsIDs = posts.map((post) => post.postID).filter((id) => !UIpostsIDs.includes(id));
  return posts
    .filter((post) => newPostsIDs.includes(post.postID))
    .map((post) => ({ postID: post.postID, watched: false }));
};

export default (state, i18nextInstance, elements) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'formState':
        if (value === 'sending') {
          elements.submitButton.setAttribute('disabled', true);
        } else if (value === 'ready') {
          elements.submitButton.removeAttribute('disabled');
        }
        break;
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
        watchedState.UIstate.posts = [
          ...watchedState.UIstate.posts,
          ...getNewUIPosts(value, watchedState.UIstate.posts),
        ];
        renderItems(
          value,
          elements.posts,
          watchedState.UIstate.posts,
          'showItemButton',
          'itemsHeader',
          i18nextInstance,
        );
        break;
      case 'modal':
        renderModal(
          elements.modal,
          watchedState.posts.filter((post) => post.postID === value)[0],
        );
        watchedState.posts = [...watchedState.posts];
        break;
      default:
        break;
    }
  });
  return watchedState;
};
