export default (element, header) => {
  const card = document.createElement('div');
  const cardBody = document.createElement('div');
  const cardBodyHeader = document.createElement('h2');
  const list = document.createElement('ul');
  card.classList.add('card', 'border-0');
  cardBody.classList.add('card-body');
  cardBodyHeader.classList.add('card-title', 'h4');
  list.classList.add('list-group', 'border-0', 'rounded-0');
  cardBodyHeader.textContent = header;
  cardBody.append(cardBodyHeader);
  card.append(cardBody);
  card.append(list);
  element.append(card);
};
