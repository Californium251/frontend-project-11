export default (data, url) => {
  const domParser = new DOMParser();
  const parsedData = domParser.parseFromString(data, 'text/html');
  const feedParser = (html) => {
    const title = html.querySelector('title').textContent;
    const description = html.querySelector('description').innerHTML;
    return { title, description };
  };
  const postsParser = (html, feedUrl) => {
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
          watched: false,
        };
      });
    return items;
  };
  return {
    feedData: feedParser(parsedData),
    postsData: postsParser(parsedData, url),
  };
};
