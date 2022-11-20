export default (html) => {
  const regex = /\[\w+?\[([\w|\W]+?)]/;
  const title = html.querySelector('title').textContent.match(regex)[1];
  const description = html.querySelector('description').innerHTML.match(regex)[1];
  const items = Array.from(html.querySelectorAll('item'))
    // .map((item) => {
    //   const itemTitle = item.querySelector('title').textContent;
    //   const itemBody = item.querySelector('')
    // });
  return { title, description, items };
};
