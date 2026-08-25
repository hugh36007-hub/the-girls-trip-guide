const header = document.getElementById('siteHeader');
const button = document.getElementById('menuButton');
if (header && button) button.addEventListener('click', () => header.classList.toggle('open'));
