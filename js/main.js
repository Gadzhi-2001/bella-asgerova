/* ============================================================
   BELLA ASGEROVA — site scripts
   ============================================================ */

/* ---------- Navbar: solid background after scrolling past the top ---------- */
const navbar = document.getElementById('navbar');
const mobileCta = document.querySelector('.mobile-cta');
const onScroll = () => {
    const y = window.scrollY;
    navbar.classList.toggle('scrolled', y > 40);
    // Show the sticky phone CTA once the hero is scrolled past
    if (mobileCta) mobileCta.classList.toggle('show', y > window.innerHeight * 0.8);
};
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Mobile menu ---------- */
const burger = document.getElementById('hamburger');
const menu = document.getElementById('mobile-menu');
const setMenu = (open) => {
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Закрыть меню' : 'Открыть меню');
    menu.hidden = !open;
    document.body.style.overflow = open ? 'hidden' : '';
};
burger.addEventListener('click', () => setMenu(menu.hidden));
menu.querySelectorAll('.mobile-link').forEach((a) => a.addEventListener('click', () => setMenu(false)));
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) setMenu(false); });

/* ---------- Fade-in on scroll ---------- */
const fadeEls = document.querySelectorAll('.fade-in');
if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
        entries.forEach((en) => {
            if (en.isIntersecting) { en.target.classList.add('visible'); io.unobserve(en.target); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    fadeEls.forEach((el) => io.observe(el));
} else {
    fadeEls.forEach((el) => el.classList.add('visible'));
}

/* ---------- Portfolio: filter + "show more" ---------- */
const PAGE = 12;
const items = Array.from(document.querySelectorAll('.portfolio-item'));
const filterBtns = document.querySelectorAll('.filter-btn');
const moreBtn = document.getElementById('show-more');
let currentFilter = 'all';
let limit = PAGE;

const renderPortfolio = () => {
    const matching = items.filter((it) => currentFilter === 'all' || it.dataset.category === currentFilter);
    items.forEach((it) => it.classList.add('is-hidden'));
    matching.slice(0, limit).forEach((it) => it.classList.remove('is-hidden'));
    moreBtn.hidden = matching.length <= limit;
};
filterBtns.forEach((btn) => btn.addEventListener('click', () => {
    filterBtns.forEach((b) => { b.classList.remove('active'); b.setAttribute('aria-pressed', 'false'); });
    btn.classList.add('active');
    btn.setAttribute('aria-pressed', 'true');
    currentFilter = btn.dataset.filter;
    limit = PAGE;
    renderPortfolio();
}));
moreBtn.addEventListener('click', () => { limit += PAGE; renderPortfolio(); });
renderPortfolio();

/* ---------- Lightbox (only visible photos, in current order) ---------- */
const lb = document.getElementById('lightbox');
const lbImg = lb.querySelector('.lb-img');
let lbList = [];
let lbIndex = 0;
let lastFocus = null;

const showLb = (i) => {
    lbIndex = (i + lbList.length) % lbList.length;
    const img = lbList[lbIndex].querySelector('img');
    lbImg.src = img.src;
    lbImg.alt = img.alt;
};
const openLb = (item) => {
    lbList = items.filter((it) => !it.classList.contains('is-hidden'));
    lastFocus = item;
    lb.hidden = false;
    document.body.style.overflow = 'hidden';
    showLb(lbList.indexOf(item));
    lb.querySelector('.lb-close').focus();
};
const closeLb = () => {
    lb.hidden = true;
    document.body.style.overflow = '';
    if (lastFocus) lastFocus.focus();
};
items.forEach((it) => it.addEventListener('click', () => openLb(it)));
lb.querySelector('.lb-close').addEventListener('click', closeLb);
lb.querySelector('.lb-prev').addEventListener('click', () => showLb(lbIndex - 1));
lb.querySelector('.lb-next').addEventListener('click', () => showLb(lbIndex + 1));
lb.addEventListener('click', (e) => { if (e.target === lb) closeLb(); });
document.addEventListener('keydown', (e) => {
    if (lb.hidden) return;
    if (e.key === 'Escape') closeLb();
    if (e.key === 'ArrowLeft') showLb(lbIndex - 1);
    if (e.key === 'ArrowRight') showLb(lbIndex + 1);
});
let touchX = 0;
lb.addEventListener('touchstart', (e) => { touchX = e.changedTouches[0].clientX; }, { passive: true });
lb.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 50) showLb(lbIndex + (dx < 0 ? 1 : -1));
});

/* ---------- Pricing buttons preselect the shoot type in the form ---------- */
const typeSelect = document.getElementById('shoot-type');
document.querySelectorAll('[data-type]').forEach((a) => a.addEventListener('click', () => {
    const opt = Array.from(typeSelect.options).find((o) => o.text === a.dataset.type);
    if (opt) typeSelect.value = opt.value || opt.text;
}));

/* ---------- Contact form → prefilled Telegram message ---------- */
const form = document.getElementById('contact-form');
form.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('name');
    const phone = document.getElementById('phone');
    const type = document.getElementById('shoot-type');
    const date = document.getElementById('date');
    const msg = document.getElementById('message');

    [name, phone, type].forEach((f) => f.classList.remove('error'));
    let valid = true;
    if (!name.value.trim()) { name.classList.add('error'); valid = false; }
    if (phone.value.replace(/\D/g, '').length < 7) { phone.classList.add('error'); valid = false; }
    if (!type.value) { type.classList.add('error'); valid = false; }
    if (!valid) { form.querySelector('.error').focus(); return; }

    const lines = [
        'Здравствуйте! Заявка с сайта',
        '',
        `Имя: ${name.value.trim()}`,
        `Телефон: ${phone.value.trim()}`,
        `Съёмка: ${type.options[type.selectedIndex].text}`,
    ];
    if (date.value.trim()) lines.push(`Дата: ${date.value.trim()}`);
    if (msg.value.trim()) lines.push(`Пожелания: ${msg.value.trim()}`);

    window.open(`https://t.me/asgrrvva?text=${encodeURIComponent(lines.join('\n'))}`, '_blank', 'noopener');
    form.innerHTML = `
        <div class="form-success">
            <h3>Почти готово</h3>
            <p>В Telegram уже готово сообщение с вашей заявкой — нажмите «Отправить». Если Telegram не открылся, напишите напрямую: <a href="https://t.me/asgrrvva" target="_blank" rel="noopener">@asgrrvva</a> или позвоните: <a href="tel:+79618323117">8 (961) 832-31-17</a>.</p>
        </div>`;
});

document.getElementById('year').textContent = new Date().getFullYear();
