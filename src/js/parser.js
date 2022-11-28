import feedParser from './feedParser';
import postsParser from './postsParser';

export default (data, url) => {
  const domParser = new DOMParser();
  const parsedData = domParser.parseFromString(data, 'text/html');
  return {
    feedData: feedParser(parsedData),
    postsData: postsParser(parsedData, url),
  };
};
