export default (state, element, inputEl, content) => {
  const newEl = element;
  if (state === false) {
    newEl.classList.add('text-danger');
    inputEl.classList.add('is-invalid');
    newEl.textContent = content;
  } else {
    newEl.textContent = ' ';
    inputEl.classList.remove('is-invalid');
  }
};
