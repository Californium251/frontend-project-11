export default (element) => {
  element.classList.remove('show');
  element.style.display = 'none';
  element.setAttribute('aria-hidden', 'true');
};
