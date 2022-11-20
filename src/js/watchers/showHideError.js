export default (state, element, content) => {
  if (state === false) {
    element.textContent = content;
  } else {
    element.textContent = ' ';
  }
};
