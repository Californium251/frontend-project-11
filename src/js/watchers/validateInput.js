export default (state, input) => {
  if (state === false) {
    input.classList.add('is-invalid');
  } else {
    input.classList.remove('is-invalid');
  }
};
