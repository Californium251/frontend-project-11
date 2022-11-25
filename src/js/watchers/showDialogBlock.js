export default (element, post) => {
  element.querySelector('.modal-title').textContent = post.title;
  element.querySelector('.modal-body').textContent = post.description;
  console.log(element.querySelector('a.btn-primary'));
  element.querySelector('a.btn-primary').setAttribute('href', post.link);
  element.classList.add('show');
  element.style.display = 'block';
  element.removeAttribute('aria-hidden');
};
