export default (post) => {
  const postEl = document.querySelector(`[data-post-id="${post.postID}"]`);
  postEl.classList.remove('fw-bold');
  postEl.classList.add('fw-normal');
};
