const header = document.getElementById('siteHeader');
const button = document.getElementById('menuButton');
const navLinks = document.getElementById('navLinks');

/* --------------------------------------------------------------------------
   SITE-WIDE SEO + STRUCTURED DATA
   -------------------------------------------------------------------------- */
const SITE_URL = 'https://thegirlstripguide.com';
const SITE_NAME = 'The Girls Trip Guide';
const LOGO_URL = `${SITE_URL}/assets/images/girls-trip-guide-logo.png`;
const normalisePath = path => {
  const clean = (path || '/').replace(/\/+$/, '') || '/';
  if (clean === '/index.html') return '/';
  return clean;
};
const currentPath = normalisePath(window.location.pathname);

const seoPages = {
  '/': {
    title: 'Girls Trip Planner for Group Holidays | The Girls Trip Guide',
    description: 'Plan a girls trip in one private place for dates, flights, stays, costs, reminders and memories. Start free and upgrade only if you want the GALS involved.',
    image: '/assets/images/hero.png',
    imageAlt: 'The Girls Trip Guide',
    schemaType: 'WebPage',
    breadcrumb: []
  },
  '/situation.html': {
    title: 'Girls Trip Planning Without Group Chat Chaos | The Girls Trip Guide',
    description: 'Turn “we should go away” into an actual girls trip. Keep dates, flights, hotels, money and reminders together instead of buried in the group chat.',
    image: '/assets/images/girls-trip-plan-hero.png',
    imageAlt: 'Friends planning a girls trip',
    schemaType: 'WebPage',
    breadcrumb: [['Home','/'],['So… What’s the Plan?','/situation.html']]
  },
  '/the-gals.html': {
    title: 'How The Girls Trip Guide Works | Group Trip Planner',
    description: 'See how The Girls Trip Guide keeps flights, stays, money, reminders and trip memories together in one private place for the whole group.',
    image: '/assets/images/how-it-works-hero.png',
    imageAlt: 'The Girls Trip Guide trip dashboard',
    schemaType: 'WebPage',
    breadcrumb: [['Home','/'],['How It Works','/the-gals.html']]
  },
  '/free-vs-full.html': {
    title: 'Free vs Full Trip | Girls Trip Planner Pricing',
    description: 'Compare Free and Full Trip. Free handles the real planning. Full Trip adds the GALS, richer nudges, trip media and hidden gallery for £24.99 one-off.',
    image: '/assets/images/group-drinks.png',
    imageAlt: 'Friends together on a girls trip',
    schemaType: 'WebPage',
    breadcrumb: [['Home','/'],['Free vs Full','/free-vs-full.html']]
  },
  '/gals.html': {
    title: 'Meet the GALS | The Girls Trip Guide',
    description: 'Meet Grace, Ava, Lola and Seb — the four personalities behind Full Trip, each stepping in when the plan, money, reminders or chaos needs handling.',
    image: '/assets/images/group-drinks.png',
    imageAlt: 'The GALS from The Girls Trip Guide',
    schemaType: 'AboutPage',
    breadcrumb: [['Home','/'],['The GALS','/gals.html']]
  },
  '/briefing.html': {
    title: 'The Briefing | Girls Trip Planning Rules & Setup',
    description: 'The Girls Trip Guide briefing: the situation, the arrangement, the rules and why one private place beats another 247-message group-chat excavation.',
    image: '/assets/images/briefing-hero.png',
    imageAlt: 'Girls raising drinks on a night out',
    schemaType: 'WebPage',
    breadcrumb: [['Home','/'],['The Briefing','/briefing.html']]
  },
  '/contact.html': {
    title: 'Contact & Support | The Girls Trip Guide',
    description: 'Need help with a trip, invite, account, payment or privacy question? Give Ava the useful version and The Girls Trip Guide will take it from there.',
    image: '/assets/images/ava.png',
    imageAlt: 'Ava, The Organised One',
    schemaType: 'ContactPage',
    breadcrumb: [['Home','/'],['Contact & Support','/contact.html']]
  },
  '/terms.html': {
    title: 'Terms & Conditions | The Girls Trip Guide',
    description: 'Terms and Conditions for The Girls Trip Guide, including Free Trip, the £24.99 Full Trip upgrade, trip media, user content and service responsibilities.',
    image: '/assets/images/girls-trip-guide-logo.png',
    imageAlt: 'The Girls Trip Guide logo',
    schemaType: 'WebPage',
    breadcrumb: [['Home','/'],['Terms & Conditions','/terms.html']]
  },
  '/privacy.html': {
    title: 'Privacy Policy | The Girls Trip Guide',
    description: 'How The Girls Trip Guide handles account, trip, invitation, payment, media and support data for private invitation-only group trips.',
    image: '/assets/images/girls-trip-guide-logo.png',
    imageAlt: 'The Girls Trip Guide logo',
    schemaType: 'WebPage',
    breadcrumb: [['Home','/'],['Privacy Policy','/privacy.html']]
  },
  '/cookie-policy.html': {
    title: 'Cookie Policy | The Girls Trip Guide',
    description: 'Cookie Policy for The Girls Trip Guide, covering essential storage, preferences, security and any analytics or measurement tools used by the service.',
    image: '/assets/images/girls-trip-guide-logo.png',
    imageAlt: 'The Girls Trip Guide logo',
    schemaType: 'WebPage',
    breadcrumb: [['Home','/'],['Cookie Policy','/cookie-policy.html']]
  },
  '/create-trip.html': {
    title: 'Create a Free Trip | The Girls Trip Guide',
    description: 'Free trip creation is being connected. See how The Girls Trip Guide will keep dates, flights, stays, costs and your group together in one private plan.',
    image: '/assets/images/girls-trip-guide-logo.png',
    imageAlt: 'The Girls Trip Guide logo',
    schemaType: 'WebPage',
    noindex: true,
    breadcrumb: [['Home','/'],['Create a Free Trip','/create-trip.html']]
  },
  '/full-trip.html': {
    title: 'Full Trip | The Girls Trip Guide',
    description: 'Full Trip adds Grace, Ava, Lola and Seb, richer nudges, photo and video sharing and the hidden post-trip gallery for £24.99 one-off.',
    image: '/assets/images/group-drinks.png',
    imageAlt: 'Friends together on a girls trip',
    schemaType: 'WebPage',
    noindex: true,
    breadcrumb: [['Home','/'],['Full Trip','/full-trip.html']]
  }
};

function upsertMeta(selector, attrs) {
  let el = document.head.querySelector(selector);
  if (!el) {
    el = document.createElement('meta');
    document.head.appendChild(el);
  }
  Object.entries(attrs).forEach(([key,value]) => el.setAttribute(key,value));
  return el;
}
function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement('link');
    el.rel = rel;
    document.head.appendChild(el);
  }
  el.href = href;
  return el;
}
function setSeo() {
  const page = seoPages[currentPath] || seoPages['/'];
  const canonical = currentPath === '/' ? `${SITE_URL}/` : `${SITE_URL}${currentPath}`;
  const image = page.image.startsWith('http') ? page.image : `${SITE_URL}${page.image}`;
  document.documentElement.lang = 'en-GB';
  document.title = page.title;

  upsertMeta('meta[name="description"]',{name:'description',content:page.description});
  upsertMeta('meta[name="robots"]',{name:'robots',content:page.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'});
  upsertMeta('meta[name="googlebot"]',{name:'googlebot',content:page.noindex ? 'noindex,follow' : 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1'});
  upsertMeta('meta[name="theme-color"]',{name:'theme-color',content:'#050406'});
  upsertMeta('meta[name="color-scheme"]',{name:'color-scheme',content:'dark'});
  upsertLink('canonical',canonical);

  upsertMeta('meta[property="og:type"]',{property:'og:type',content:'website'});
  upsertMeta('meta[property="og:site_name"]',{property:'og:site_name',content:SITE_NAME});
  upsertMeta('meta[property="og:locale"]',{property:'og:locale',content:'en_GB'});
  upsertMeta('meta[property="og:title"]',{property:'og:title',content:page.title});
  upsertMeta('meta[property="og:description"]',{property:'og:description',content:page.description});
  upsertMeta('meta[property="og:url"]',{property:'og:url',content:canonical});
  upsertMeta('meta[property="og:image"]',{property:'og:image',content:image});
  upsertMeta('meta[property="og:image:alt"]',{property:'og:image:alt',content:page.imageAlt});

  upsertMeta('meta[name="twitter:card"]',{name:'twitter:card',content:'summary_large_image'});
  upsertMeta('meta[name="twitter:title"]',{name:'twitter:title',content:page.title});
  upsertMeta('meta[name="twitter:description"]',{name:'twitter:description',content:page.description});
  upsertMeta('meta[name="twitter:image"]',{name:'twitter:image',content:image});
  upsertMeta('meta[name="twitter:image:alt"]',{name:'twitter:image:alt',content:page.imageAlt});

  document.querySelectorAll('script[data-site-schema]').forEach(node => node.remove());
  const graph = [
    {
      '@type':'Organization','@id':`${SITE_URL}/#organization`,name:SITE_NAME,url:`${SITE_URL}/`,
      logo:{'@type':'ImageObject','@id':`${SITE_URL}/#logo`,url:LOGO_URL,contentUrl:LOGO_URL,caption:SITE_NAME}
    },
    {
      '@type':'WebSite','@id':`${SITE_URL}/#website`,url:`${SITE_URL}/`,name:SITE_NAME,
      publisher:{'@id':`${SITE_URL}/#organization`},inLanguage:'en-GB'
    },
    {
      '@type':page.schemaType || 'WebPage','@id':`${canonical}#webpage`,url:canonical,name:page.title,
      description:page.description,isPartOf:{'@id':`${SITE_URL}/#website`},about:{'@id':`${SITE_URL}/#organization`},
      primaryImageOfPage:{'@type':'ImageObject',url:image},inLanguage:'en-GB'
    }
  ];
  if (page.breadcrumb?.length) {
    const breadcrumbId = `${canonical}#breadcrumb`;
    graph.push({
      '@type':'BreadcrumbList','@id':breadcrumbId,
      itemListElement:page.breadcrumb.map(([name,path],index)=>({
        '@type':'ListItem',position:index+1,name,item:`${SITE_URL}${path === '/' ? '/' : path}`
      }))
    });
    graph[2].breadcrumb = {'@id':breadcrumbId};
  }
  const schema = document.createElement('script');
  schema.type = 'application/ld+json';
  schema.dataset.siteSchema = 'true';
  schema.textContent = JSON.stringify({'@context':'https://schema.org','@graph':graph});
  document.head.appendChild(schema);
}
setSeo();

/* --------------------------------------------------------------------------
   LIGHTHOUSE / ACCESSIBILITY / IMAGE DELIVERY
   -------------------------------------------------------------------------- */
const main = document.querySelector('main');
if (main && !main.id) main.id = 'main-content';
if (main && !document.querySelector('.skip-link')) {
  const skip = document.createElement('a');
  skip.className = 'skip-link';
  skip.href = '#main-content';
  skip.textContent = 'Skip to main content';
  document.body.insertBefore(skip, document.body.firstChild);
}

document.querySelectorAll('img').forEach(img => {
  img.decoding = 'async';
  if (!img.alt) img.alt = '';
  const isLogo = img.closest('.site-header') || img.closest('.brand');
  const isHero = img.classList.contains('hero-image') || img.closest('.ava-visual') || img.closest('.hero')?.querySelector('img') === img;
  if (isLogo || isHero) {
    img.loading = 'eager';
    if (isHero) img.fetchPriority = 'high';
  } else if (!img.hasAttribute('loading')) {
    img.loading = 'lazy';
  }
});

document.querySelectorAll('a[target="_blank"]').forEach(link => {
  const rel = new Set((link.getAttribute('rel') || '').split(/\s+/).filter(Boolean));
  rel.add('noopener'); rel.add('noreferrer');
  link.setAttribute('rel',[...rel].join(' '));
});

/* --------------------------------------------------------------------------
   PAGE POSITION
   -------------------------------------------------------------------------- */
if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
const restorePagePosition = () => {
  const hash = window.location.hash;
  if (hash) {
    const target = document.getElementById(decodeURIComponent(hash.slice(1)));
    if (target) {
      requestAnimationFrame(() => target.scrollIntoView({block:'start',behavior:'auto'}));
      return;
    }
  }
  window.scrollTo({top:0,left:0,behavior:'auto'});
};
window.addEventListener('pageshow', restorePagePosition);

/* --------------------------------------------------------------------------
   SHARED NAVIGATION
   -------------------------------------------------------------------------- */
if (navLinks) {
  navLinks.innerHTML = `
    <a href="situation.html">So… what’s the plan?</a>
    <a href="the-gals.html#how-it-works">How It Works</a>
    <a href="free-vs-full.html">Free vs Full</a>
    <a href="gals.html">The GALS</a>
    <a href="briefing.html">The Briefing</a>
  `;

  navLinks.querySelectorAll('a').forEach(link => {
    const href = link.getAttribute('href');
    const active = (/situation(?:\.html)?\/?$/.test(currentPath) && href === 'situation.html') ||
      (/free-vs-full(?:\.html)?\/?$/.test(currentPath) && href === 'free-vs-full.html') ||
      (/gals(?:\.html)?\/?$/.test(currentPath) && href === 'gals.html') ||
      (/briefing(?:\.html)?\/?$/.test(currentPath) && href === 'briefing.html') ||
      (/the-gals(?:\.html)?\/?$/.test(currentPath) && href.startsWith('the-gals.html'));
    if (active) {
      link.classList.add('active');
      link.setAttribute('aria-current','page');
    }
  });
}

document.querySelectorAll('.brand').forEach(brand => {
  brand.classList.add('site-logo');
  brand.setAttribute('aria-label','The Girls Trip Guide home');
  brand.setAttribute('href','index.html');
  if (!brand.querySelector('img')) {
    brand.innerHTML = '';
    const img = document.createElement('img');
    img.src = 'assets/images/girls-trip-guide-logo.png';
    img.alt = 'The Girls Trip Guide — Good Plans. Better Stories.';
    img.loading = 'eager';
    img.decoding = 'async';
    brand.appendChild(img);
  }
});

document.querySelectorAll('.nav-cta').forEach(link => {
  link.href = 'create-trip.html';
  link.textContent = 'Plan your trip';
});

document.querySelectorAll('a[href="how-it-works.html"]').forEach(link => link.href = 'the-gals.html#how-it-works');
document.querySelectorAll('a[href="plans.html"]').forEach(link => link.href = 'free-vs-full.html');
document.querySelectorAll('a[href="the-gals.html#free-vs-full"],a[href="#free-vs-full"]').forEach(link => link.href = 'free-vs-full.html');
document.querySelectorAll('a[href="arrangement.html"]').forEach(link => link.href = 'situation.html');
document.querySelectorAll('a[href="the-gals.html"]').forEach(link => link.href = 'gals.html');

const navStyle = document.createElement('style');
navStyle.textContent = `
  [id]{scroll-margin-top:96px}
  .skip-link{position:fixed;left:12px;top:12px;z-index:10000;transform:translateY(-160%);padding:10px 14px;border-radius:8px;background:#ff4fa3;color:#10080d;font-family:Inter,Arial,sans-serif;font-size:12px;font-weight:900;text-decoration:none;transition:transform .15s ease}.skip-link:focus{transform:translateY(0)}
  :focus-visible{outline:3px solid #ff82c0!important;outline-offset:3px!important}
  .site-header{height:82px!important;background:#050406!important;border-bottom:1px solid rgba(255,79,163,.16)!important;position:relative;z-index:100}
  .site-header .wrap.nav{width:min(1500px,calc(100% - 48px))!important;max-width:none!important;height:82px!important;min-height:82px!important;margin:0 auto!important;padding:0!important;display:flex!important;align-items:center!important;gap:24px!important}
  .brand.site-logo{display:inline-flex;align-items:center;justify-content:center;width:120px;height:72px;overflow:hidden;flex:0 0 120px;background:#050406;margin-right:auto!important}
  .brand.site-logo img{display:block;width:120px;height:auto;max-width:none}
  .nav-links{display:flex!important;align-items:center!important;gap:22px!important;margin:0!important;padding:0!important;font-family:Inter,Arial,sans-serif!important;font-size:11px!important;font-weight:800!important;line-height:1!important;text-transform:uppercase!important;white-space:nowrap!important}
  .nav-links a{display:inline-flex!important;align-items:center!important;min-height:42px!important}
  .nav-links a.active{color:#ff4fa3!important}
  .nav-cta{display:inline-flex!important;align-items:center!important;justify-content:center!important;width:150px!important;min-width:150px!important;max-width:150px!important;height:46px!important;min-height:46px!important;margin:0!important;padding:0!important;border-radius:10px!important;background:#ff4fa3!important;color:#10080d!important;font-family:Inter,Arial,sans-serif!important;font-size:12px!important;font-weight:900!important;line-height:1!important;text-align:center!important;text-transform:uppercase!important;white-space:nowrap!important}
  .mobile-plan-link,.mobile-drawer{display:none}
  .menu-button{border:0;background:transparent;color:#fff;cursor:pointer}
  .hero-how-cta{display:inline-flex;align-items:center;justify-content:center;min-height:42px;margin:26px 0 2px;padding:0 18px;border:1px solid rgba(255,79,163,.62);border-radius:999px;background:rgba(255,79,163,.05);color:#ff70b7;font-size:11px;font-weight:900;letter-spacing:.08em;text-transform:uppercase}
  .footer .brand.site-logo{width:150px;height:112px;justify-content:flex-start;margin:0 0 6px;background:#0f0b0e;flex-basis:150px}.footer .brand.site-logo img{width:150px;height:auto}
  @media(max-width:1120px) and (min-width:701px){.site-header .wrap.nav{gap:14px!important}.nav-links{gap:12px!important;font-size:10px!important}.nav-cta{width:140px!important;min-width:140px!important;max-width:140px!important;font-size:10px!important}.brand.site-logo{width:100px;flex-basis:100px}.brand.site-logo img{width:100px}}
  @media(max-width:700px){[id]{scroll-margin-top:88px}.site-header{position:sticky!important;top:0!important;height:auto!important}.site-header .wrap.nav{width:min(100% - 32px,1500px)!important;height:76px!important;min-height:76px!important;gap:8px!important;flex-wrap:nowrap!important;align-items:center!important;position:relative!important}.brand.site-logo{width:96px;height:66px;flex:0 0 96px}.brand.site-logo img{width:96px}.nav-links,.site-header.open .nav-links,.nav-cta{display:none!important}.mobile-plan-link{display:inline-flex!important;align-items:center!important;justify-content:center!important;margin-left:auto!important;min-height:34px!important;padding:0 12px!important;border:1px solid rgba(255,79,163,.78)!important;border-radius:999px!important;background:rgba(255,79,163,.06)!important;color:#ff70b7!important;font-family:Inter,Arial,sans-serif!important;font-size:9px!important;font-weight:900!important;line-height:1!important;letter-spacing:.045em!important;text-transform:uppercase!important;white-space:nowrap!important}.menu-button{display:flex!important;align-items:center!important;justify-content:center!important;width:44px!important;height:44px!important;flex:0 0 44px!important;margin-left:0!important;padding:0!important;font-size:27px!important;line-height:1!important}.mobile-drawer{position:absolute!important;left:0!important;right:0!important;top:100%!important;z-index:100!important;display:none!important;padding:14px 18px 18px!important;background:#070608!important;border-top:1px solid rgba(255,79,163,.16)!important;border-bottom:1px solid rgba(255,79,163,.28)!important;box-shadow:0 18px 34px rgba(0,0,0,.38)!important}.site-header.open .mobile-drawer{display:grid!important;gap:3px!important}.mobile-drawer a{display:flex!important;align-items:center!important;justify-content:space-between!important;min-height:48px!important;padding:0 8px!important;border-bottom:1px solid rgba(255,255,255,.07)!important;color:rgba(255,255,255,.9)!important;font-family:Inter,Arial,sans-serif!important;font-size:12px!important;font-weight:800!important;letter-spacing:.06em!important;text-transform:uppercase!important}.mobile-drawer a:last-child{border-bottom:0!important}.mobile-drawer a::after{content:'→';color:#ff70b7;font-size:14px}}
`;
document.head.appendChild(navStyle);

const heroActions = document.querySelector('.hero .hero-actions');
if ((currentPath === '/') && heroActions && !document.querySelector('.hero-how-cta')) {
  const link = document.createElement('a');
  link.className = 'hero-how-cta';
  link.href = 'the-gals.html#how-it-works';
  link.textContent = 'HOW IT WORKS →';
  heroActions.parentElement.insertBefore(link, heroActions);
}

if (header && button) {
  button.setAttribute('aria-expanded','false');
  button.setAttribute('aria-controls','mobileNavigation');
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
    drawer.id = 'mobileNavigation';
    drawer.setAttribute('aria-label','Mobile navigation');
    drawer.innerHTML = `
      <a href="situation.html">So… what’s the plan?</a>
      <a href="the-gals.html#how-it-works">How It Works</a>
      <a href="free-vs-full.html">Free vs Full</a>
      <a href="gals.html">The GALS</a>
      <a href="briefing.html">The Briefing</a>
      <a href="create-trip.html">Create a Free Trip</a>
    `;
    header.appendChild(drawer);
    drawer.querySelectorAll('a').forEach(link => link.addEventListener('click',()=>{
      header.classList.remove('open');
      button.setAttribute('aria-expanded','false');
    }));
  }
  button.addEventListener('click',()=>{
    const isOpen = header.classList.toggle('open');
    button.setAttribute('aria-expanded',String(isOpen));
  });
  document.addEventListener('keydown',event=>{
    if (event.key === 'Escape' && header.classList.contains('open')) {
      header.classList.remove('open');
      button.setAttribute('aria-expanded','false');
      button.focus();
    }
  });
}

document.querySelectorAll('.footer').forEach(footer => {
  const exploreHeading = [...footer.querySelectorAll('h3')].find(h => h.textContent.trim().toUpperCase() === 'EXPLORE');
  const explore = exploreHeading?.parentElement;
  if (explore) {
    explore.querySelectorAll('a').forEach(a=>a.remove());
    [['situation.html','So… what’s the plan?'],['the-gals.html#how-it-works','How It Works'],['free-vs-full.html','Free vs Full'],['gals.html','The GALS'],['briefing.html','The Briefing']].forEach(([href,text])=>{
      const a = document.createElement('a'); a.href = href; a.textContent = text; explore.appendChild(a);
    });
  }
});