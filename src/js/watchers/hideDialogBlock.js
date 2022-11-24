export default (element) => {
  element.querySelector('.modal-title').textContent = '';
  element.querySelector('.modal-body').textContent = '';
  element.classList.remove('show');
  element.style.display = 'none';
  element.setAttribute('aria-hidden', 'true');
};
