// ============================================================
// THE SHEDBANGERS — main.js
// ============================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- AOS (scroll animations) ----------------------------
    AOS.init({
        once: true,        // animate once only
        offset: 80,        // trigger 80px before element
        duration: 700,
        easing: 'ease-out-cubic'
    });

    // --- GLightbox (photo gallery) --------------------------
    const lightbox = GLightbox({
        touchNavigation: true,
        loop: true,
        autoplayVideos: false
    });

    // --- Navbar: add .scrolled class on scroll --------------
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
        navbar.classList.toggle('scrolled', window.scrollY > 60);
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll(); // run once on load

    // --- Mobile nav toggle ----------------------------------
    const navToggle = document.getElementById('navToggle');
    const navLinks  = document.getElementById('navLinks');

    navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        // Animate hamburger → X
        navToggle.classList.toggle('active');
    });

    // Close mobile nav when a link is clicked
    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            navLinks.classList.remove('open');
            navToggle.classList.remove('active');
        });
    });

    // --- Footer year ----------------------------------------
    const yearEl = document.getElementById('year');
    if (yearEl) yearEl.textContent = new Date().getFullYear();

    // --- Active nav link on scroll --------------------------
    const sections  = document.querySelectorAll('section[id]');
    const navAnchors = document.querySelectorAll('.nav-links a');

    const highlightNav = () => {
        let current = '';
        sections.forEach(section => {
            const top = section.offsetTop - 100;
            if (window.scrollY >= top) current = section.getAttribute('id');
        });
        navAnchors.forEach(a => {
            a.classList.remove('active');
            if (a.getAttribute('href') === `#${current}`) {
                a.classList.add('active');
            }
        });
    };

    window.addEventListener('scroll', highlightNav, { passive: true });

});
