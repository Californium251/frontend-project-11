export default (input, key, i18nextInstance) => {
  input.classList.add('text-success');
  input.classList.remove('text-danger');
  input.textContent = i18nextInstance.t(key);
};
