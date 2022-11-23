export default (state, element, buttonText) => {
  const li = document.createElement('li');
  const link = document.createElement('a');
  const button = document.createElement('button');
  li.classList.add('list-group-item', 'd-flex', 'justify-content-between', 'align-items-start', 'border-0', 'border-end-0');
  link.classList.add('fw-bold');
  link.setAttribute('target', '_blank');
  link.setAttribute('href', state.link);
  link.textContent = state.title;
  button.classList.add('btn', 'btn-outline-primary', 'btn-sm');
  button.setAttribute('type', 'button');
  button.setAttribute('data-bs-toggle', 'modal');
  button.setAttribute('data-post-id', state.postID);
  button.textContent = buttonText;
  li.append(link);
  li.append(button);
  element.append(li);
};
