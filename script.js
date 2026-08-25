const header = document.getElementById('siteHeader');
const button = document.getElementById('menuButton');
if (header && button) button.addEventListener('click', () => header.classList.toggle('open'));

// The Situation + The Arrangement now live as one story: “So… what’s the plan?”
document.querySelectorAll('a[href="situation.html"]').forEach(link => {
  link.textContent = 'So… what’s the plan?';
});
document.querySelectorAll('a[href="arrangement.html"]').forEach(link => link.remove());

// Memories is not a front-of-house category.
document.querySelectorAll('a[href="memories.html"]').forEach(link => link.remove());

// Contact belongs with the legal/support links in the footer, not the main navigation.
document.querySelectorAll('.nav-links a[href="contact.html"]').forEach(link => link.remove());

// Ensure Sitemap sits with Contact, Terms, Privacy and Cookies in the footer.
document.querySelectorAll('.footer').forEach(footer => {
  const aboutHeading = [...footer.querySelectorAll('h3')].find(h => h.textContent.trim().toUpperCase() === 'ABOUT');
  const about = aboutHeading?.parentElement;
  if (about && !about.querySelector('a[href="sitemap.xml"]')) {
    const sitemap = document.createElement('a');
    sitemap.href = 'sitemap.xml';
    sitemap.textContent = 'Sitemap';
    about.appendChild(sitemap);
  }
});

// Preserve old links/bookmarks while retiring The Arrangement as a separate category.
if (/\/arrangement(?:\.html)?\/?$/.test(window.location.pathname)) {
  window.location.replace('situation.html');
}
