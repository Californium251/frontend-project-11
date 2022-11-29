export default (state, feed) => {
  let flag = false;
  state.feeds.forEach((el) => {
    if (el.url === feed) {
      flag = true;
    }
  });
  return flag;
};
