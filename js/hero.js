const typedEl = document.getElementById('typed-text');
if (!typedEl) throw new Error('Typed text element not found');

const codeText = 'powered by zmk';
let index = 0;

const interval = setInterval(() => {
  if (index <= codeText.length) {
    typedEl.textContent = codeText.slice(0, index);
    index++;
  } else {
    clearInterval(interval);
  }
}, 100);
