export default (postID) => {
  const postEl = document.querySelector(`[data-post-id="${postID}"]`);
  postEl.classList.remove('fw-bold');
  postEl.classList.add('fw-normal');
};
