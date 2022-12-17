export default (state, inputEl) => {
  if (state === false) {
    inputEl.classList.add('is-invalid');
  } else {
    inputEl.classList.remove('is-invalid');
  }
};
