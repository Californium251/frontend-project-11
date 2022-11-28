export default (input, content) => {
  const newInput = input;
  newInput.classList.add('text-success');
  newInput.classList.remove('text-danger');
  newInput.textContent = content;
};
