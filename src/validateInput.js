export default (state, input) => {
  if (state) {
    input.classList.remove('is-invalid');
  } else {
    input.classList.add('is-invalid');
  }
};
