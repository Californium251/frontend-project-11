// Import our custom CSS
import '../scss/styles.scss';
import onChange from 'on-change';
import { string } from 'yup';

// Import all of Bootstrap's JS
import * as bootstrap from 'bootstrap';

const app = async () => {
  const state = {
    rssLink: {
      value: '',
      isValid: true,
    },
    feeds: [],
  };
  const watchedState = onChange(state, (path, value, previousValue) => {

  });
  const inputSchema = string().required().url();
  document.querySelector('#url-input').addEventListener('keyup', (evt) => {
    console.log('ok');
    inputSchema.isValid(evt.target.value)
      .then((val) => console.log(val));
  });
};

app();
