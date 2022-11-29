const addItemsList = (element, header) => {
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardHeader = document.createElement('h2');
  const ul = document.createElement('ul');
  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  cardHeader.classList.add('card-title', 'h4');
  ul.classList.add('list-group', 'border-0', 'rounded-0');
  cardHeader.textContent = header;
  cardBody.append(cardHeader);
  card.append(cardBody);
  card.append(ul);
  element.append(card);
};

export default (state, element, buttonText, cb, listIsToBeAdded, itemsHeader) => {
  if (listIsToBeAdded) {
    addItemsList(element, itemsHeader);
  }
  const itemsList = element.querySelector('.list-group');
  const li = document.createElement('li');
  const link = document.createElement('a');
  const button = document.createElement('button');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  link.classList.add('fw-bold');
  link.setAttribute('target', '_blank');
  link.setAttribute('href', state.link);
  link.setAttribute('data-post-id', state.postID);
  link.textContent = state.title;
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.setAttribute('type', 'button');
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-bs-target', '#modal');
  button.setAttribute('data-post-id', state.postID);
  button.textContent = buttonText;
  button.addEventListener('click', (evt) => {
    cb.call(null, evt, state);
  });
  li.append(link);
  li.append(button);
  itemsList.append(li);
};
