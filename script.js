const header = document.getElementById('siteHeader');
const button = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');

// Keep one front-of-house navigation across the main product pages.
if (navLinks) {
  navLinks.innerHTML = `
    <a href="situation.html">So… what’s the plan?</a>
    <a href="the-gals.html#how-it-works">How It Works</a>
    <a href="briefing.html">The Briefing</a>
  `;

  const path = window.location.pathname;
  navLinks.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    if ((/situation\.html$/.test(path) && href === 'situation.html') ||
        (/briefing\.html$/.test(path) && href === 'briefing.html') ||
        (/the-gals\.html$/.test(path) && href.startsWith('the-gals.html'))) {
      link.classList.add('active');
    }
  });
}

// Apply the approved logo consistently, including pages that still contain old text branding.
document.querySelectorAll('.brand').forEach(brand => {
  brand.classList.add('site-logo');
  brand.setAttribute('aria-label', 'The Girls Trip Guide home');
  brand.setAttribute('href', 'index.html');
  if (!brand.querySelector('img')) {
    brand.innerHTML = '';
    const img = document.createElement('img');
    img.src = 'assets/images/girls-trip-guide-logo.png';
    img.alt = 'The Girls Trip Guide — Good Plans. Better Stories.';
    brand.appendChild(img);
  }
});

// Point all primary planning actions at the temporary Free Trip page until the live engine is connected.
document.querySelectorAll('.nav-cta').forEach(link => {
  link.href = 'create-trip.html';
  link.textContent = 'Plan your trip';
});

// Retire any stale internal links left in older markup.
document.querySelectorAll('a[href="how-it-works.html"]').forEach(link => link.href = 'the-gals.html#how-it-works');
document.querySelectorAll('a[href="plans.html"]').forEach(link => link.href = 'the-gals.html#free-vs-full');
document.querySelectorAll('a[href="arrangement.html"]').forEach(link => link.href = 'situation.html');

const navStyle = document.createElement('style');
navStyle.textContent = `
  .site-header{background:#050406!important;border-bottom:1px solid rgba(255,79,163,.16)!important;position:relative;z-index:100}
  .brand.site-logo{display:inline-flex;align-items:center;justify-content:center;width:120px;height:72px;overflow:hidden;flex:0 0 auto;background:#050406}
  .brand.site-logo img{display:block;width:120px;height:auto;max-width:none}
  .nav-links a.active{color:#ff4fa3!important}
  .mobile-plan-link,.mobile-drawer{display:none}
  .menu-button{border:0;background:transparent;color:#fff;cursor:pointer}
  .hero-how-cta{display:inline-flex;align-items:center;justify-content:center;min-height:42px;margin:26px 0 2px;padding:0 18px;border:1px solid rgba(255,79,163,.62);border-radius:999px;background:rgba(255,79,163,.05);color:#ff70b7;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
  .footer .brand.site-logo{width:150px;height:112px;justify-content:flex-start;margin:0 0 6px;background:#0f0b0e}
  .footer .brand.site-logo img{width:150px;height:auto}
  @media(max-width:700px){
    .site-header{position:sticky!important;top:0!important}
    .nav{min-height:76px!important;gap:8px!important;flex-wrap:nowrap!important;align-items:center!important;position:relative!important}
    .brand.site-logo{width:96px;height:66px;flex:0 0 96px}.brand.site-logo img{width:96px}
    .nav-links,.site-header.open .nav-links,.nav-cta{display:none!important}
    .mobile-plan-link{display:inline-flex!important;align-items:center!important;justify-content:center!important;margin-left:auto!important;min-height:34px!important;padding:0 12px!important;border:1px solid rgba(255,79,163,.78)!important;border-radius:999px!important;background:rgba(255,79,163,.06)!important;color:#ff70b7!important;font-size:9px!important;font-weight:900!important;line-height:1!important;letter-spacing:.045em!important;text-transform:uppercase!important;white-space:nowrap!important}
    .menu-button{display:flex!important;align-items:center!important;justify-content:center!important;width:36px!important;height:36px!important;flex:0 0 36px!important;margin-left:0!important;padding:0!important;font-size:27px!important;line-height:1!important}
    .mobile-drawer{position:absolute!important;left:0!important;right:0!important;top:100%!important;z-index:100!important;display:none!important;padding:14px 18px 18px!important;background:#070608!important;border-top:1px solid rgba(255,79,163,.16)!important;border-bottom:1px solid rgba(255,79,163,.28)!important;box-shadow:0 18px 34px rgba(0,0,0,.38)!important}
    .site-header.open .mobile-drawer{display:grid!important;gap:3px!important}
    .mobile-drawer a{display:flex!important;align-items:center!important;justify-content:space-between!important;min-height:43px!important;padding:0 8px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;color:rgba(255,255,255,.9)!important;font-size:12px!important;font-weight:800!important;letter-spacing:.06em!important;text-transform:uppercase!important}
    .mobile-drawer a:last-child{border-bottom:0!important}.mobile-drawer a::after{content:'→';color:#ff70b7;font-size:14px}
  }
`;
document.head.appendChild(navStyle);

// Homepage: insert a clear How It Works link between the setup copy and the main actions.
const heroActions = document.querySelector('.hero .hero-actions');
if (heroActions && !document.querySelector('.hero-how-cta')) {
  const link = document.createElement('a');
  link.className = 'hero-how-cta';
  link.href = 'the-gals.html#how-it-works';
  link.textContent = 'HOW IT WORKS →';
  heroActions.parentElement.insertBefore(link, heroActions);
}

// Mobile navigation shared by all front-of-house pages that load this script.
if (header && button) {
  button.setAttribute('aria-expanded', 'false');
  const nav = button.parentElement;

  if (nav && !nav.querySelector('.mobile-plan-link')) {
    const planLink = document.createElement('a');
    planLink.className = 'mobile-plan-link';
    planLink.href = 'create-trip.html';
    planLink.textContent = 'Plan your trip';
    nav.insertBefore(planLink, button);
  }

  if (!header.querySelector('.mobile-drawer')) {
    const drawer = document.createElement('nav');
    drawer.className = 'mobile-drawer';
    drawer.setAttribute('aria-label', 'Mobile navigation');
    drawer.innerHTML = `
      <a href="situation.html">So… what’s the plan?</a>
      <a href="the-gals.html#how-it-works">How It Works</a>
      <a href="briefing.html">The Briefing</a>
      <a href="the-gals.html#free-vs-full">Free vs Full</a>
      <a href="create-trip.html">Create a Free Trip</a>
    `;
    header.appendChild(drawer);
    drawer.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
      header.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }));
  }

  button.addEventListener('click', () => {
    const isOpen = header.classList.toggle('open');
    button.setAttribute('aria-expanded', String(isOpen));
  });

  document.addEventListener('keydown', event => {
    if (event.key === 'Escape' && header.classList.contains('open')) {
      header.classList.remove('open');
      button.setAttribute('aria-expanded', 'false');
    }
  });
}

// Keep footer navigation aligned with the current journey where the fuller footer exists.
document.querySelectorAll('.footer').forEach(footer => {
  const exploreHeading = [...footer.querySelectorAll('h3')].find(h => h.textContent.trim().toUpperCase() === 'EXPLORE');
  const explore = exploreHeading?.parentElement;
  if (explore) {
    explore.querySelectorAll('a').forEach(a => a.remove());
    [
      ['situation.html','So… what’s the plan?'],
      ['the-gals.html#how-it-works','How It Works'],
      ['briefing.html','The Briefing'],
      ['the-gals.html#free-vs-full','Free vs Full']
    ].forEach(([href,text]) => {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = text;
      explore.appendChild(a);
    });
  }
});
