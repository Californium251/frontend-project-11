export default (state, element, inputEl, content) => {
  if (state === false) {
    element.classList.add('text-danger');
    inputEl.classList.add('is-invalid');
    element.textContent = content;
  } else {
    element.textContent = ' ';
    inputEl.classList.remove('is-invalid');
  }
};
