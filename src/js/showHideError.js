export default (state, element, content) => {
  if (state === false) {
    element.classList.add('text-danger');
    element.textContent = content;
  } else {
    element.textContent = ' ';
  }
};
