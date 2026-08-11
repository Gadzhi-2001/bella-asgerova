'use strict';

/* ============================================================
   NAVIGATION — scroll state & hamburger
   ============================================================ */

const navbar     = document.getElementById('navbar');
const hamburger  = document.getElementById('hamburger');
const mobileMenu = document.getElementById('mobile-menu');

// Apply scrolled state immediately if page loads mid-scroll
if (window.scrollY > 60) navbar.classList.add('scrolled');

window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
}, { passive: true });

hamburger.addEventListener('click', () => {
    const open = hamburger.classList.toggle('active');
    mobileMenu.classList.toggle('active', open);
    mobileMenu.setAttribute('aria-hidden', String(!open));
    document.body.style.overflow = open ? 'hidden' : '';
});

document.querySelectorAll('.mobile-link').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        mobileMenu.classList.remove('active');
        mobileMenu.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = '';
    });
});


/* ============================================================
   FADE-IN — Intersection Observer
   ============================================================ */

const fadeObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            fadeObserver.unobserve(entry.target);
        }
    });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.fade-in').forEach(el => fadeObserver.observe(el));

// Hero fires right away (it's already in view)
const heroContent = document.querySelector('#hero .fade-in');
if (heroContent) setTimeout(() => heroContent.classList.add('visible'), 180);


/* ============================================================
   PORTFOLIO FILTERS
   ============================================================ */

const filterBtns     = document.querySelectorAll('.filter-btn');
const portfolioItems = document.querySelectorAll('.portfolio-item');

filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        filterBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        const filter = btn.dataset.filter;

        portfolioItems.forEach(item => {
            const match = filter === 'all' || item.dataset.category === filter;
            item.classList.toggle('hidden', !match);
        });
    });
});


/* ============================================================
   LIGHTBOX
   ============================================================ */

const lightbox      = document.getElementById('lightbox');
const lightboxImg   = document.getElementById('lightbox-img');
const lightboxClose = document.getElementById('lightbox-close');
const lightboxPrev  = document.getElementById('lightbox-prev');
const lightboxNext  = document.getElementById('lightbox-next');

let currentIndex  = 0;
let visibleItems  = [];

function getVisible() {
    return Array.from(document.querySelectorAll('.portfolio-item:not(.hidden)'));
}

function openLightbox(index) {
    visibleItems  = getVisible();
    currentIndex  = index;
    showImage(currentIndex);
    lightbox.classList.add('active');
    lightbox.removeAttribute('aria-hidden');
    document.body.style.overflow = 'hidden';
    lightboxClose.focus();
}

function closeLightbox() {
    lightbox.classList.remove('active');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
}

function showImage(index) {
    const img = visibleItems[index].querySelector('img');
    lightboxImg.src = img.src;
    lightboxImg.alt = img.alt;
}

function prevImage() {
    currentIndex = (currentIndex - 1 + visibleItems.length) % visibleItems.length;
    showImage(currentIndex);
}

function nextImage() {
    currentIndex = (currentIndex + 1) % visibleItems.length;
    showImage(currentIndex);
}

portfolioItems.forEach(item => {
    item.addEventListener('click', () => {
        visibleItems = getVisible();
        const idx    = visibleItems.indexOf(item);
        if (idx !== -1) openLightbox(idx);
    });
});

lightboxClose.addEventListener('click', closeLightbox);
lightboxPrev.addEventListener('click', prevImage);
lightboxNext.addEventListener('click', nextImage);

lightbox.addEventListener('click', e => {
    if (e.target === lightbox) closeLightbox();
});

document.addEventListener('keydown', e => {
    if (!lightbox.classList.contains('active')) return;
    if (e.key === 'Escape')      closeLightbox();
    if (e.key === 'ArrowLeft')   prevImage();
    if (e.key === 'ArrowRight')  nextImage();
});

// Touch swipe support
let touchStartX = 0;
lightbox.addEventListener('touchstart', e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) dx < 0 ? nextImage() : prevImage();
});


/* ============================================================
   CONTACT FORM — validation & submission
   ============================================================ */

const form = document.getElementById('contact-form');
if (form) {
    form.addEventListener('submit', e => {
        e.preventDefault();

        const name  = document.getElementById('name');
        const phone = document.getElementById('phone');
        const type  = document.getElementById('shoot-type');

        // Clear previous errors
        [name, phone, type].forEach(f => f.classList.remove('error'));

        let valid = true;
        if (!name.value.trim())                        { name.classList.add('error');  valid = false; }
        if (phone.value.trim().replace(/\D/g, '').length < 7) { phone.classList.add('error'); valid = false; }
        if (!type.value)                               { type.classList.add('error');  valid = false; }
        if (!valid) {
            // Focus first invalid field
            form.querySelector('.error').focus();
            return;
        }

        const btn = form.querySelector('.btn-submit');
        btn.classList.add('loading');
        btn.textContent = 'Открываем Telegram…';

        const shootType = type.options[type.selectedIndex].text;
        const msg = document.getElementById('message').value.trim();
        const text = encodeURIComponent(
            `Новая заявка с сайта\n\n` +
            `Имя: ${name.value.trim()}\n` +
            `Телефон: ${phone.value.trim()}\n` +
            `Тип съёмки: ${shootType}` +
            (msg ? `\nСообщение: ${msg}` : '')
        );

        setTimeout(() => {
            window.open(`https://t.me/asgrrvva?text=${text}`, '_blank');
            form.innerHTML = `
                <div class="form-success">
                    <h3>Telegram открыт</h3>
                    <p>Проверьте вкладку — там уже готово сообщение. Просто нажмите «Отправить».</p>
                </div>
            `;
        }, 600);
    });
}
