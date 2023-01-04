import onChange from 'on-change';

const renderValidationError = (elements, text, i18nextInstance) => {
  const { feedback, input } = elements;
  feedback.classList.remove('text-success');
  feedback.classList.add('text-danger');
  input.classList.add('is-invalid');
  feedback.textContent = i18nextInstance.t(text);
};

const renderDataLoadedFeedback = (feedBackElement, text, i18nextInstance) => {
  feedBackElement.classList.remove('text-danger');
  feedBackElement.classList.add('text-success');
  feedBackElement.textContent = i18nextInstance.t(text);
};

const renderDataLoadError = (feedBackElement, type, text, i18nextInstance) => {
  feedBackElement.classList.remove('text-success');
  feedBackElement.classList.add('text-danger');
  feedBackElement.textContent = i18nextInstance.t(text);
};

const renderFeeds = (element, feeds, i18nextInstance) => {
  const addFeedList = () => {
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const cardBodyHeader = document.createElement('h2');
    const list = document.createElement('ul');
    card.classList.add('card', 'border-0');
    cardBody.classList.add('card-body');
    cardBodyHeader.classList.add('card-title', 'h4');
    list.classList.add('list-group', 'border-0', 'rounded-0');
    cardBodyHeader.textContent = i18nextInstance.t('feedsHeader');
    cardBody.append(cardBodyHeader);
    card.append(cardBody);
    card.append(list);
    element.append(card);
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

  const feedList = element.querySelector('.list-group') || addFeedList();
  feedList.innerHTML = '';
  feeds.forEach((feed) => addFeed(feed, feedList));
};

const renderItems = (
  element,
  posts,
  UIposts,
  i18nextInstance,
) => {
  const addItemsList = () => {
    const card = document.createElement('div');
    const cardBody = document.createElement('div');
    const cardHeader = document.createElement('h2');
    const ul = document.createElement('ul');
    card.classList.add('card', 'border-0');
    cardBody.classList.add('card-body');
    cardHeader.classList.add('card-title', 'h4');
    ul.classList.add('list-group', 'border-0', 'rounded-0');
    cardHeader.textContent = i18nextInstance.t('itemsHeader');
    cardBody.append(cardHeader);
    card.append(cardBody);
    card.append(ul);
    element.append(card);
    return ul;
  };

  const addItem = (post, itemsList) => {
    const li = document.createElement('li');
    const link = document.createElement('a');
    const button = document.createElement('button');
    li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
    if (UIposts.includes(post.postID)) {
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
    button.textContent = i18nextInstance.t('showItemButton');
    li.append(link);
    li.append(button);
    itemsList.append(li);
  };

  const itemsList = element.querySelector('.list-group') || addItemsList();
  itemsList.innerHTML = '';
  posts.forEach((post) => addItem(post, itemsList));
};

const renderModal = (element, post) => {
  const modalTitle = element.querySelector('.modal-title');
  const modalBody = element.querySelector('.modal-body');
  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  element.querySelector('a.btn-primary').setAttribute('href', post.link);
};

export default (state, i18nextInstance, elements) => {
  const watchedState = onChange(state, (path, value) => {
    switch (path) {
      case 'form.state':
        switch (value) {
          case 'sending':
            elements.submitButton.setAttribute('disabled', true);
            break;
          case 'ready':
            elements.submitButton.removeAttribute('disabled');
            elements.input.classList.remove('is-invalid');
            break;
          case 'error':
            elements.submitButton.removeAttribute('disabled');
            renderValidationError(elements, watchedState.form.error, i18nextInstance);
            break;
          default:
            break;
        }
        break;
      case 'dataLoad.state':
        switch (value) {
          case 'error':
            renderDataLoadError(
              elements.feedback,
              watchedState.dataLoad.error,
              i18nextInstance,
            );
            break;
          case 'success':
            renderDataLoadedFeedback(elements.feedback, 'RSSok', i18nextInstance);
            elements.input.value = '';
            break;
          default:
            break;
        }
        break;
      case 'feeds':
        renderFeeds(
          elements.feeds,
          value,
          i18nextInstance,
        );
        break;
      case 'posts':
      case 'UIstate.posts':
        renderItems(
          elements.posts,
          watchedState.posts,
          watchedState.UIstate.posts,
          i18nextInstance,
        );
        break;
      case 'modal':
        renderModal(
          elements.modal,
          watchedState.posts.filter((post) => post.postID === value)[0],
        );
        break;
      default:
        break;
    }
  });
  return watchedState;
};
