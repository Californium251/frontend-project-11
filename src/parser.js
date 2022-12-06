export default (data) => {
  const domParser = new DOMParser();
  const parsedData = domParser.parseFromString(data, 'text/html');
  if (parsedData.querySelector('parsererror')) {
    const e = new Error();
    e.isParsingError = true;
    throw e;
  }
  try {
    const items = Array.from(parsedData.querySelectorAll('item'))
      .map((item) => {
        const itemTitle = item.querySelector('title').textContent;
        const itemLink = item.querySelector('guid').textContent;
        const description = item.querySelector('description').innerHTML;
        return {
          title: itemTitle,
          link: itemLink,
          description,
        };
      });
    const result = {
      feedData: {
        title: parsedData.querySelector('title').textContent,
        description: parsedData.querySelector('description').innerHTML,
      },
      postsData: items,
    };
    return result;
  } catch (e) {
    e.isParsingError = true;
    throw e;
  }
};
