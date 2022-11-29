export default (element, post) => {
  const postEl = document.querySelector(`[data-post-id="${post.postID}"]`);
  postEl.classList.remove('fw-bold');
  postEl.classList.add('fw-normal');

  const modalTitle = element.querySelector('.modal-title');
  const modalBody = element.querySelector('.modal-body');
  modalTitle.textContent = post.title;
  modalBody.textContent = post.description;
  element.querySelector('a.btn-primary').setAttribute('href', post.link);
};
