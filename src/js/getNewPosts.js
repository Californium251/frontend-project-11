export default (state, posts) => {
  const flatState = state.map((el) => el.link);
  return posts.filter((el) => !flatState.includes(el.link));
};
