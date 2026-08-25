const header = document.getElementById('siteHeader');
const button = document.getElementById('menuButton');
if (header && button) button.addEventListener('click', () => header.classList.toggle('open'));

// The Situation + The Arrangement now live as one story: “So… what’s the plan?”
document.querySelectorAll('a[href="situation.html"]').forEach(link => {
  link.textContent = 'So… what’s the plan?';
});
document.querySelectorAll('a[href="arrangement.html"]').forEach(link => link.remove());

// Preserve old links/bookmarks while retiring The Arrangement as a separate category.
if (/\/arrangement(?:\.html)?\/?$/.test(window.location.pathname)) {
  window.location.replace('situation.html');
}
