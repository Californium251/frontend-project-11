export default (input, content) => {
  input.classList.add('text-success');
  input.classList.remove('text-danger');
  input.textContent = content;
};
