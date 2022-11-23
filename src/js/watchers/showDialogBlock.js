export default (element, post) => {
  element.querySelector('.modal-title').textContent = post.title;
  element.querySelector('.modal-body').textContent = post.description;
  element.setAttribute('display', 'block');
};
