const header = document.getElementById('siteHeader');
const button = document.getElementById('menuButton');
if (header && button) button.addEventListener('click', () => header.classList.toggle('open'));

// Apply the approved Girls Trip Guide logo and the darker brand header across the site.
const logoStyle = document.createElement('style');
logoStyle.textContent = `
  .site-header{background:#050406!important;backdrop-filter:none!important;border-bottom:1px solid rgba(255,79,163,.14)!important}
  .nav{min-height:76px!important}
  .brand.site-logo{display:inline-flex;align-items:center;justify-content:center;width:120px;height:72px;overflow:hidden;flex:0 0 auto;background:#050406}
  .brand.site-logo img{display:block;width:120px;height:auto;max-width:none}
  .paper-rip{display:none!important}
  .footer .brand.site-logo{width:150px;height:112px;justify-content:flex-start;margin:0 0 6px;background:#0f0b0e}
  .footer .brand.site-logo img{width:150px;height:auto}
  @media(max-width:600px){
    .nav{min-height:76px!important;gap:10px!important;flex-wrap:nowrap!important;align-items:center!important}
    .brand.site-logo{width:108px;height:66px;flex:0 0 108px}.brand.site-logo img{width:108px}
    .nav-links{display:grid!important;grid-template-columns:1fr!important;gap:5px!important;margin-left:auto!important;width:min(170px,46vw)!important;order:initial!important;padding:0!important;align-items:stretch!important}
    .nav-links a{display:flex!important;align-items:center!important;justify-content:center!important;margin:0!important;padding:6px 9px!important;border:1px solid rgba(255,79,163,.48)!important;border-radius:999px!important;background:rgba(255,79,163,.06)!important;color:#fff!important;font-size:9px!important;line-height:1.05!important;letter-spacing:.035em!important;text-align:center!important;white-space:nowrap!important}
    .nav-links a:first-child{border-color:rgba(255,79,163,.78)!important;color:#ff70b7!important}
    .site-header.open .nav{flex-wrap:nowrap!important}
    .site-header.open .nav-links{display:grid!important;order:initial!important;width:min(170px,46vw)!important;padding:0!important;align-items:stretch!important}
    .menu-button{display:none!important}
    .nav-cta{display:none!important}
    .footer{padding:32px 0 18px}
    .footer .brand.site-logo{width:138px;height:100px;margin-bottom:2px}.footer .brand.site-logo img{width:138px}
    .footer-grid{gap:24px}.footer p{margin:4px 0 0}.footer h3{margin-bottom:8px}.footer a:not(.brand){margin:5px 0}.footer-bottom{margin-top:18px;padding-top:14px}
  }
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

document.querySelectorAll('.footer p').forEach(p => {
  if (p.textContent.trim() === 'Good times. Great people. No stress.') p.textContent = 'Good Plans. Better Stories.';
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
