export default (state, feed) => state.feeds.reduce((acc, el) => {
  if (el.url === feed) {
    acc = true;
  }
  return acc;
}, false);
