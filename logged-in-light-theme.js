(()=>{
'use strict';
const clean=p=>{let x=(p||'/').replace(/\/+$/,'')||'/';if(x==='/index.html')return '/';return x.replace(/\.html$/,'')};
if(clean(location.pathname)!=='/create-trip')return;

document.documentElement.classList.add('gtg-app-light');
const theme=document.querySelector('meta[name="theme-color"]');if(theme)theme.setAttribute('content','#ffffff');
const scheme=document.querySelector('meta[name="color-scheme"]');if(scheme)scheme.setAttribute('content','light');

document.querySelectorAll('.brand img').forEach(img=>{
  img.src='/assets/images/hero-trans.png';
  img.alt='The Girls Trip Guide — Good Plans. Better Stories.';
  img.style.background='transparent';
});

const style=document.createElement('style');
style.id='gtg-logged-in-light-theme';
style.textContent=`
html.gtg-app-light{--bg:#fff;--panel:#fff;--panel2:#fffafd;--panel3:#fff5f9;--pink:#ff4fa3;--pink2:#ed2f8b;--white:#191316;--muted:#6c5962;--line:rgba(255,79,163,.30);--line2:rgba(25,19,22,.09);--shadow:0 18px 46px rgba(68,31,49,.09)}
html.gtg-app-light body{background:radial-gradient(circle at 14% 0,rgba(255,79,163,.07),transparent 30%),#fff!important;color:#191316!important}
html.gtg-app-light .appbar{background:rgba(255,255,255,.97)!important;border-bottom:1px solid rgba(255,79,163,.18)!important;box-shadow:0 1px 12px rgba(40,20,30,.055)!important}
html.gtg-app-light .brand{background:transparent!important}
html.gtg-app-light .brand img{width:auto!important;height:66px!important;max-width:106px!important;object-fit:contain!important;background:transparent!important}
html.gtg-app-light .trip-title strong{color:#191316!important}
html.gtg-app-light .trip-title span{color:#79636e!important}
html.gtg-app-light .icon-btn{background:#fff!important;border:1px solid rgba(255,79,163,.38)!important;color:#191316!important;box-shadow:0 7px 18px rgba(63,28,46,.05)!important}
html.gtg-app-light .dashboard{background:transparent!important}

/* Keep the photographic trip hero as the dark visual anchor. */
html.gtg-app-light .hero-card{border:1.5px solid rgba(255,79,163,.36)!important;background:#120b11!important;box-shadow:0 20px 46px rgba(63,28,46,.11)!important;color:#fff!important}
html.gtg-app-light .hero-card:after{background:linear-gradient(180deg,rgba(3,2,3,.02) 12%,rgba(5,3,5,.16) 46%,rgba(5,3,5,.83) 100%)!important}
html.gtg-app-light .hero-meta,html.gtg-app-light .hero-meta h1{color:#fff!important}
html.gtg-app-light .hero-meta h1 span,html.gtg-app-light .hero-card .eyebrow{color:#ff83c1!important}
html.gtg-app-light .hero-meta p{color:rgba(255,255,255,.82)!important}
html.gtg-app-light .trip-stamp{border:1px solid rgba(255,137,196,.62)!important;background:rgba(20,10,16,.76)!important;color:#fff!important;box-shadow:0 10px 26px rgba(0,0,0,.14)!important}
html.gtg-app-light .trip-stamp b{color:#ff9dcc!important}
html.gtg-app-light .trip-stamp span{color:#fff!important}

html.gtg-app-light .stat,
html.gtg-app-light .card,
html.gtg-app-light .trip-option,
html.gtg-app-light .gal-option{
  background:linear-gradient(180deg,#fff 0%,#fffafd 100%)!important;
  border:1.5px solid rgba(255,79,163,.30)!important;
  color:#191316!important;
  box-shadow:0 13px 32px rgba(63,28,46,.06)!important;
}
html.gtg-app-light .stat:hover,html.gtg-app-light .trip-option:hover,html.gtg-app-light .gal-option:hover{border-color:rgba(255,79,163,.58)!important;box-shadow:0 16px 34px rgba(63,28,46,.09)!important}
html.gtg-app-light .stat b{color:#191316!important}
html.gtg-app-light .stat>span{color:#ed2f8b!important}
html.gtg-app-light .stat small{color:#7b6871!important}
html.gtg-app-light .section-head h2,html.gtg-app-light .card h2,html.gtg-app-light .card h3{color:#191316!important;text-shadow:0 1px 8px rgba(48,22,34,.05)!important}
html.gtg-app-light .section-head h2 span,html.gtg-app-light .booking .kicker{color:#ed2f8b!important}
html.gtg-app-light .section-head p,html.gtg-app-light .card p{color:#62515a!important}
html.gtg-app-light .grace-note small{color:#ed2f8b!important}
html.gtg-app-light .grace-note blockquote{color:#3e3037!important}
html.gtg-app-light .grace-note img{border-color:rgba(255,79,163,.38)!important;box-shadow:0 8px 20px rgba(63,28,46,.06)!important}
html.gtg-app-light .card-footer,html.gtg-app-light .money-row{border-color:rgba(25,19,22,.09)!important}
html.gtg-app-light .price,html.gtg-app-light .money-row b{color:#191316!important}
html.gtg-app-light .money-row span{color:#ed2f8b!important}

html.gtg-app-light .btn{background:#fff!important;color:#ed2f8b!important;border:1.25px solid rgba(255,79,163,.48)!important;box-shadow:0 7px 18px rgba(63,28,46,.045)!important}
html.gtg-app-light .btn.primary{background:#ff4fa3!important;color:#fff!important;border-color:#ff4fa3!important;box-shadow:0 10px 24px rgba(237,47,139,.18)!important}
html.gtg-app-light .btn.danger{background:#fff!important;color:#c64b5a!important;border-color:rgba(198,75,90,.42)!important}
html.gtg-app-light .btn:disabled{opacity:.48!important}

html.gtg-app-light .gallery .media{background:#fff5f9!important;border:1.5px solid rgba(255,79,163,.28)!important;box-shadow:0 10px 26px rgba(63,28,46,.055)!important}
html.gtg-app-light .media .media-tools button{background:rgba(255,255,255,.92)!important;color:#191316!important;border-color:rgba(255,79,163,.32)!important}
html.gtg-app-light .avatar{background:linear-gradient(145deg,#ff8fc6,#f04499)!important;color:#fff!important;border-color:rgba(255,79,163,.35)!important}
html.gtg-app-light .crew-id b{color:#191316!important}
html.gtg-app-light .crew-id small{color:#79636e!important}
html.gtg-app-light .pill{background:#fff!important;color:#66535d!important;border-color:rgba(255,79,163,.28)!important}
html.gtg-app-light .pill.ok{color:#278457!important;border-color:rgba(39,132,87,.28)!important;background:#f6fff9!important}
html.gtg-app-light .pill.warn{color:#9a6516!important;background:#fffaf0!important;border-color:rgba(154,101,22,.25)!important}
html.gtg-app-light .empty{background:#fffafd!important;border-color:rgba(255,79,163,.32)!important;color:#745f69!important}
html.gtg-app-light .progress{background:#f4dfe9!important}
html.gtg-app-light .progress i{background:#ff4fa3!important}

html.gtg-app-light .dock{background:rgba(255,255,255,.96)!important;border:1.5px solid rgba(255,79,163,.30)!important;box-shadow:0 16px 40px rgba(63,28,46,.13)!important}
html.gtg-app-light .dock button{color:#75636c!important}
html.gtg-app-light .dock button.active{background:#fff0f6!important;color:#ed2f8b!important}
html.gtg-app-light .dock button.active small,html.gtg-app-light .dock button.active span{color:#ed2f8b!important}

html.gtg-app-light .drawer-wrap,html.gtg-app-light .modal-wrap{background:rgba(22,13,18,.48)!important;backdrop-filter:blur(3px)!important}
html.gtg-app-light .drawer,html.gtg-app-light .modal{background:#fff!important;color:#191316!important;border-color:rgba(255,79,163,.32)!important;box-shadow:0 24px 60px rgba(36,18,27,.18)!important}
html.gtg-app-light .drawer-list button{color:#191316!important;border-bottom-color:rgba(25,19,22,.09)!important}
html.gtg-app-light .modal h2{color:#191316!important}
html.gtg-app-light .field label{color:#ed2f8b!important}
html.gtg-app-light .field input,html.gtg-app-light .field select,html.gtg-app-light .field textarea{background:#fff!important;color:#191316!important;border:1.25px solid rgba(255,79,163,.32)!important;box-shadow:inset 0 1px 2px rgba(50,20,35,.025)!important}
html.gtg-app-light .field input:focus,html.gtg-app-light .field select:focus,html.gtg-app-light .field textarea:focus{border-color:#ff4fa3!important;box-shadow:0 0 0 3px rgba(255,79,163,.10)!important}
html.gtg-app-light .field input::placeholder,html.gtg-app-light .field textarea::placeholder{color:#9a8790!important}

html.gtg-app-light .auth-screen{background:radial-gradient(circle at 50% 0,rgba(255,79,163,.09),transparent 34%),#fff!important;color:#191316!important}
html.gtg-app-light .auth-card{background:linear-gradient(180deg,#fff 0%,#fff8fb 100%)!important;color:#191316!important;border:1.5px solid rgba(255,79,163,.34)!important;box-shadow:0 22px 58px rgba(63,28,46,.10)!important}
html.gtg-app-light .auth-card p{color:#66535d!important}
html.gtg-app-light .auth-card img{background:transparent!important}
html.gtg-app-light .trip-option{color:#191316!important}
html.gtg-app-light .gal-option.active{background:#fff0f6!important;border-color:#ff4fa3!important}
html.gtg-app-light .gal-option small{color:#75636c!important}
html.gtg-app-light .upgrade{background:linear-gradient(135deg,#fff0f6,#fff)!important;border-color:rgba(255,79,163,.45)!important}
html.gtg-app-light .upgrade strong{color:#ed2f8b!important}
html.gtg-app-light .toast{background:#191316!important;color:#fff!important;box-shadow:0 12px 30px rgba(40,20,30,.18)!important}

@media(max-width:850px){html.gtg-app-light .brand img{height:58px!important;max-width:90px!important}}
@media(max-width:600px){
 html.gtg-app-light .appbar{background:rgba(255,255,255,.98)!important}
 html.gtg-app-light .brand img{height:52px!important;max-width:82px!important}
 html.gtg-app-light .hero-card{box-shadow:0 14px 32px rgba(63,28,46,.09)!important}
 html.gtg-app-light .stat,html.gtg-app-light .card{box-shadow:0 10px 24px rgba(63,28,46,.055)!important}
 html.gtg-app-light .dock{background:rgba(255,255,255,.98)!important}
}
`;
document.head.appendChild(style);
})();
