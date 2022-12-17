const addItemsList = (element, header, i18nextInstance) => {
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardHeader = document.createElement('h2');
  const ul = document.createElement('ul');
  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  cardHeader.classList.add('card-title', 'h4');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  cardHeader.textContent = i18nextInstance.t(header);
  cardBody.append(cardHeader);
  card.append(cardBody);
  card.append(ul);
  element.append(card);
  return ul;
};

const addItem = (post, watchedPosts, buttonText, itemsList, i18nextInstance) => {
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
  button.textContent = i18nextInstance.t(buttonText);
  li.append(link);
  li.append(button);
  itemsList.append(li);
};

export default (posts, element, UIposts, buttonText, itemsHeader, i18nextInstance) => {
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
