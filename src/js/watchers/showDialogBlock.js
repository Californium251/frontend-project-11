export default (element, post) => {
  element.querySelector('.modal-title').textContent = post.title;
  element.querySelector('.modal-body').textContent = post.description;
  element.classList.add('show');
  element.style.display = 'block';
  element.removeAttribute('aria-hidden');
};
