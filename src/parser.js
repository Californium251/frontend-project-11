export default (data) => {
  const domParser = new DOMParser();
  const parsedData = domParser.parseFromString(data, 'text/html');
  if (parsedData.querySelector('parsererror') || !parsedData.querySelector('rss')) {
    const e = new Error();
    e.isParsingError = true;
    throw e;
  }
  const nodeList = parsedData.querySelectorAll('item');
  const items = Array.from(nodeList)
    .map((item) => {
      const itemTitle = item.querySelector('title').textContent;
      const itemLink = item.querySelector('guid').textContent;
      const description = item.querySelector('description').textContent;
      return {
        title: itemTitle,
        link: itemLink,
        description,
      };
    });
  const result = {
    feed: {
      title: parsedData.querySelector('title').textContent,
      description: parsedData.querySelector('description').textContent,
    },
    posts: items,
  };
  return result;
};
