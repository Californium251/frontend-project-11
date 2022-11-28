export default (state, element) => {
  const li = document.createElement('li');
  const title = document.createElement('h3');
  const paragraph = document.createElement('p');
  li.classList.add('list-group-item', 'border-0', 'border-end-0');
  title.classList.add('h6', 'm-0');
  paragraph.classList.add('m-0', 'small', 'text-black-50');
  title.textContent = state.title;
  paragraph.textContent = state.description;
  li.append(title);
  li.append(paragraph);
  element.append(li);
};
