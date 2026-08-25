const header = document.getElementById('siteHeader');
const button = document.getElementById('menuButton');
if (header && button) button.addEventListener('click', () => header.classList.toggle('open'));

// Apply the approved Girls Trip Guide logo across the site.
const logoStyle = document.createElement('style');
logoStyle.textContent = `
  .brand.site-logo{display:inline-flex;align-items:center;justify-content:center;width:132px;height:88px;overflow:hidden;flex:0 0 auto}
  .brand.site-logo img{display:block;width:132px;height:auto;max-width:none}
  .footer .brand.site-logo{width:240px;height:190px;justify-content:flex-start;margin-bottom:8px}
  .footer .brand.site-logo img{width:240px;height:auto}
  @media(max-width:600px){.brand.site-logo{width:108px;height:78px}.brand.site-logo img{width:108px}.footer .brand.site-logo{width:210px;height:165px}.footer .brand.site-logo img{width:210px}}
`;
document.head.appendChild(logoStyle);

document.querySelectorAll('.brand').forEach(brand => {
  brand.classList.add('site-logo');
  brand.innerHTML = '';
  const img = document.createElement('img');
  img.src = 'assets/images/girls-trip-guide-logo.png';
  img.alt = 'The Girls Trip Guide — Good Plans. Better Stories.';
  brand.appendChild(img);
});

// One front-of-house story for the planning setup.
document.querySelectorAll('a[href="situation.html"]').forEach(link => {
  link.textContent = 'So… what’s the plan?';
});
document.querySelectorAll('a[href="arrangement.html"]').forEach(link => link.remove());

// The GALS, How it works and Free vs Full now live on one combined page.
document.querySelectorAll('.nav-links a[href="how-it-works.html"], .nav-links a[href="plans.html"]').forEach(link => link.remove());
document.querySelectorAll('.footer a[href="how-it-works.html"], .footer a[href="plans.html"]').forEach(link => link.remove());

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

// Preserve old links/bookmarks while retiring separate categories.
const path = window.location.pathname;
if (/\/arrangement(?:\.html)?\/?$/.test(path)) window.location.replace('situation.html');
if (/\/how-it-works(?:\.html)?\/?$/.test(path)) window.location.replace('the-gals.html#how-it-works');
if (/\/plans(?:\.html)?\/?$/.test(path)) window.location.replace('the-gals.html#free-vs-full');
if (/\/memories(?:\.html)?\/?$/.test(path)) window.location.replace('index.html');
