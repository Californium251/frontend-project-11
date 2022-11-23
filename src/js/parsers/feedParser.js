export default (html) => {
  const title = html.querySelector('title').textContent;
  const description = html.querySelector('description').innerHTML;
  return { title, description };
};
