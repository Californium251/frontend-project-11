export default (element, inputEl, error, i18nextInstance) => {
  if (error === '') {
    element.textContent = ' ';
  } else {
    element.classList.add('text-danger');
    element.textContent = i18nextInstance.t(error);
  }
};
