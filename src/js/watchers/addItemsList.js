export default (element, header) => {
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
