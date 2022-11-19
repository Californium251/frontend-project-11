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
  const input = document.querySelector('#url-input');
  const feedback = document.querySelector('.feedback');
  const watchedState = onChange(state, (path, value, previousValue) => {
    if (path === 'rssLink.isValid') {
      if (value === false) {
        input.classList.add('is-invalid');
        feedback.textContent = 'Ссылка должна быть валидным URL';
      } else {
        input.classList.remove('is-invalid');
        feedback.textContent = ' ';
      }
    }
  });
  const inputSchema = string().required().url();
  document.querySelector('.rss-form').addEventListener('submit', (evt) => {
    evt.preventDefault();
    inputSchema.isValid(input.value.trim())
      .then((val) => {
        if (val) {
          watchedState.rssLink.isValid = true;
        } else {
          watchedState.rssLink.isValid = false;
        }
      });
  });
};

app();
