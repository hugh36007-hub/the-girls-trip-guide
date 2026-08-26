const header = document.getElementById('siteHeader');
const button = document.getElementById('menuButton');

if (header && button) {
  button.setAttribute('aria-expanded', 'false');
  button.addEventListener('click', () => {
    const isOpen = header.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });
}

// Apply the approved Girls Trip Guide logo and the darker brand header across the site.
const logoStyle = document.createElement('style');
logoStyle.textContent = `
  .site-header{background:#050406!important;backdrop-filter:none!important;border-bottom:1px solid rgba(255,79,163,.14)!important}
  .nav{min-height:76px!important}
  .brand.site-logo{display:inline-flex;align-items:center;justify-content:center;width:120px;height:72px;overflow:hidden;flex:0 0 auto;background:#050406}
  .brand.site-logo img{display:block;width:120px;height:auto;max-width:none}
  .paper-rip{display:none!important}
  .mobile-plan-link,.mobile-drawer{display:none}
  .hero-how-cta{display:inline-flex;align-items:center;justify-content:center;min-height:42px;margin:28px 0 2px;padding:0 18px;border:1px solid rgba(255,79,163,.62);border-radius:999px;background:rgba(255,79,163,.05);color:#ff70b7;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase;transition:background .2s ease,border-color .2s ease,transform .2s ease}
  .hero-how-cta:hover{background:rgba(255,79,163,.11);border-color:#ff70b7;transform:translateY(-1px)}
  .footer .brand.site-logo{width:150px;height:112px;justify-content:flex-start;margin:0 0 6px;background:#0f0b0e}
  .footer .brand.site-logo img{width:150px;height:auto}

  @media(max-width:600px){
    .site-header{position:sticky!important;top:0!important}
    .nav{min-height:76px!important;gap:8px!important;flex-wrap:nowrap!important;align-items:center!important;position:relative!important}
    .brand.site-logo{width:96px;height:66px;flex:0 0 96px}.brand.site-logo img{width:96px}

    /* Desktop nav stays out of the mobile header. */
    .nav-links,.site-header.open .nav-links{display:none!important}
    .nav-cta{display:none!important}

    /* Keep only the planning CTA visible beside the hamburger. */
    .mobile-plan-link{display:inline-flex!important;align-items:center!important;justify-content:center!important;margin-left:auto!important;min-height:34px!important;padding:0 12px!important;border:1px solid rgba(255,79,163,.78)!important;border-radius:999px!important;background:rgba(255,79,163,.06)!important;color:#ff70b7!important;font-size:9px!important;font-weight:900!important;line-height:1!important;letter-spacing:.045em!important;text-transform:uppercase!important;white-space:nowrap!important}

    .menu-button{display:flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:36px!important;flex:0 0 36px!important;margin-left:0!important;padding:0!important;border:0!important;background:transparent!important;color:#fff!important;font-size:27px!important;line-height:1!important;cursor:pointer!important}

    /* Full mobile navigation drawer opened by the hamburger. */
    .mobile-drawer{position:absolute!important;left:0!important;right:0!important;top:100%!important;z-index:100!important;display:none!important;padding:14px 18px 18px!important;background:#070608!important;border-top:1px solid rgba(255,79,163,.16)!important;border-bottom:1px solid rgba(255,79,163,.28)!important;box-shadow:0 18px 34px rgba(0,0,0,.38)!important}
    .site-header.open .mobile-drawer{display:grid!important;gap:3px!important}
    .mobile-drawer a{display:flex!important;align-items:center!important;justify-content:space-between!important;min-height:43px!important;padding:0 8px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;color:rgba(255,255,255,.9)!important;font-size:12px!important;font-weight:800!important;letter-spacing:.06em!important;text-transform:uppercase!important}
    .mobile-drawer a:last-child{border-bottom:0!important}
    .mobile-drawer a::after{content:'→';color:#ff70b7;font-size:14px}
    .mobile-drawer a.mobile-sign-in{color:#ff70b7!important}

    .hero-how-cta{min-height:40px;margin:30px 0 0;padding:0 17px;font-size:10px;letter-spacing:.07em}
    .hero-actions{margin-top:24px!important}
    .hero-note{margin-top:22px!important}
    .hero-join{margin-top:24px!important}

    .footer{padding:32px 0 18px}
    .footer .brand.site-logo{width:138px;height:100px;margin-bottom:2px}.footer .brand.site-logo img{width:138px}
    .footer-grid{gap:24px}.footer p{margin:4px 0 0}.footer h3{margin-bottom:8px}.footer a:not(.brand){margin:5px 0}.footer-bottom{margin-top:18px;padding-top:14px}
  }

  @media(max-width:370px){
    .brand.site-logo{width:88px;flex-basis:88px}.brand.site-logo img{width:88px}
    .mobile-plan-link{padding:0 9px!important;font-size:8px!important;letter-spacing:.025em!important}
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

// Homepage: a clear How It Works step between the explanation and the two main actions.
const heroActions = document.querySelector('.hero .hero-actions');
if (heroActions && !document.querySelector('.hero-how-cta')) {
  const howItWorks = document.createElement('a');
  howItWorks.className = 'hero-how-cta';
  howItWorks.href = 'the-gals.html#how-it-works';
  howItWorks.textContent = 'HOW IT WORKS →';
  heroActions.parentElement.insertBefore(howItWorks, heroActions);
}

// Mobile header: keep the planning button visible and place the rest inside the hamburger menu.
if (header && button) {
  const nav = button.parentElement;
  if (nav && !nav.querySelector('.mobile-plan-link')) {
    const planLink = document.createElement('a');
    planLink.className = 'mobile-plan-link';
    planLink.href = 'situation.html';
    planLink.textContent = 'So… what’s the plan?';
    nav.insertBefore(planLink, button);
  }

  if (!header.querySelector('.mobile-drawer')) {
    const drawer = document.createElement('nav');
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('aria-label', 'Mobile navigation');
    drawer.innerHTML = `
      <a class="mobile-sign-in" href="index.html#sign-in">Sign In</a>
      <a href="the-gals.html#how-it-works">How It Works</a>
      <a href="the-gals.html">The GALS</a>
      <a href="the-gals.html#free-vs-full">Free vs Full</a>
      <a href="contact.html">Contact</a>
    `;
    header.appendChild(drawer);

    drawer.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        header.classList.remove('open');
        button.setAttribute('aria-expanded', 'false');
      });
    });
  }

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('open')) {
      header.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

document.querySelectorAll('.footer p').forEach(p => {
  if (p.textContent.trim() === 'Good times. Great people. No stress.') p.textContent = 'Good Plans. Better Stories.';
});

// One front-of-house story for the planning setup.
document.querySelectorAll('a[href="situation.html"]').forEach(link => {
  if (!link.classList.contains('mobile-plan-link')) link.textContent = 'So… what’s the plan?';
});
document.querySelectorAll('a[href="arrangement.html"]').forEach(link => link.remove());

// The GALS, How it works and Free vs Full now live on one combined page.
document.querySelectorAll('.nav-links a[href="how-it-works.html"], .nav-links a[href="plans.html"]').forEach(link => link.remove());
document.querySelectorAll('.footer a[href="how-it-works.html"], .footer a[href="plans.html"]').forEach(link => link.remove());

// Memories is not a front-of-house category.
document.querySelectorAll('a[href="memories.html"]').forEach(link => link.remove());

// Contact belongs with the legal/support links in the footer, not the desktop navigation.
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
