const addFeedList = (element, header) => {
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

export default (feeds, element, feedsHeader) => {
  const feedList = element.querySelector('.list-group') || addFeedList(element, feedsHeader);
  feedList.innerHTML = '';
  feeds.forEach((feed) => addFeed(feed, feedList));
};
