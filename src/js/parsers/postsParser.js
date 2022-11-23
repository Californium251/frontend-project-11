export default (html, feedUrl) => {
  console.log(html);
  const items = Array.from(html.querySelectorAll('item'))
    .map((item) => {
      const itemTitle = item.querySelector('title').textContent;
      const itemLink = item.querySelector('guid').textContent;
      const description = item.querySelector('description').innerHTML;
      return {
        url: feedUrl,
        title: itemTitle,
        link: itemLink,
        description,
      };
    });
  return items;
};
