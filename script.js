/* ================================================
   PROJETO DE PORTFÓLIO — Desenvolvimento Front-End
   ================================================
   Arquivo  : script.js
   Projeto  : Flowly — Landing page de app fictício
   Técnicas : Cursor customizado com tracking suave,
              IntersectionObserver para scroll reveal,
              toggle de pricing com animação de valor,
              menu mobile, header scroll detection,
              scroll suave e highlight de link ativo.
   ================================================ */

(function () {
  'use strict';

  /* ── 1. CURSOR CUSTOMIZADO ─────────────────── */
  // Só ativa em dispositivos com mouse (hover: hover)
  const cursor    = document.getElementById('cursor');
  const cursorDot = document.getElementById('cursor-dot');

  // Posição alvo (mouse real) e posição atual (interpolada)
  let mouseX = 0, mouseY = 0;
  let curX   = 0, curY   = 0;

  const isHoverDevice = window.matchMedia('(hover: hover)').matches;

  if (isHoverDevice && cursor && cursorDot) {
    document.addEventListener('mousemove', e => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      // O dot segue o mouse diretamente
      cursorDot.style.left = mouseX + 'px';
      cursorDot.style.top  = mouseY + 'px';
    });

    // Cursor principal: interpolação suave (lerp)
    function animateCursor() {
      curX += (mouseX - curX) * 0.12;
      curY += (mouseY - curY) * 0.12;
      cursor.style.left = curX + 'px';
      cursor.style.top  = curY + 'px';
      requestAnimationFrame(animateCursor);
    }
    animateCursor();

    // Efeito hover em elementos interativos
    const hoverTargets = document.querySelectorAll('a, button, [role="switch"]');
    hoverTargets.forEach(el => {
      el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
      el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
    });
  }


  /* ── 2. HEADER AO ROLAR ────────────────────── */
  const header = document.getElementById('header');

  function updateHeader() {
    header.classList.toggle('scrolled', window.scrollY > 20);
  }

  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();


  /* ── 3. MENU HAMBÚRGUER MOBILE ─────────────── */
  const hamburger  = document.getElementById('hamburger');
  const mobileMenu = document.getElementById('mobile-menu');

  function toggleMenu(open) {
    hamburger.classList.toggle('open', open);
    mobileMenu.classList.toggle('open', open);
    hamburger.setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
  }

  hamburger.addEventListener('click', () => {
    toggleMenu(!mobileMenu.classList.contains('open'));
  });

  mobileMenu.querySelectorAll('a').forEach(link => {
    link.addEventListener('click', () => toggleMenu(false));
  });

  window.addEventListener('resize', () => {
    if (window.innerWidth > 768) toggleMenu(false);
  });

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') toggleMenu(false);
  });


  /* ── 4. SCROLL SUAVE ───────────────────────── */
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = header.offsetHeight;
      window.scrollTo({
        top: target.getBoundingClientRect().top + window.scrollY - offset,
        behavior: 'smooth'
      });
    });
  });


  /* ── 5. REVEAL AO ROLAR (IntersectionObserver) */
  const revealEls = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -30px 0px' });

    revealEls.forEach(el => observer.observe(el));
  } else {
    revealEls.forEach(el => el.classList.add('visible'));
  }


  /* ── 6. LINK ATIVO NO MENU ─────────────────── */
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  function updateActiveLink() {
    const scrollY = window.scrollY + header.offsetHeight + 60;

    sections.forEach(section => {
      const top    = section.offsetTop;
      const height = section.offsetHeight;
      const id     = section.getAttribute('id');

      if (scrollY >= top && scrollY < top + height) {
        navLinks.forEach(link => {
          link.classList.toggle('nav-active', link.getAttribute('href') === `#${id}`);
        });
      }
    });
  }

  window.addEventListener('scroll', updateActiveLink, { passive: true });


  /* ── 7. TOGGLE DE PRICING (Mensal / Anual) ─── */
  const billingToggle  = document.getElementById('billing-toggle');
  const labelMonthly   = document.getElementById('label-monthly');
  const labelAnnual    = document.getElementById('label-annual');
  const priceValues    = document.querySelectorAll('.price-value');

  let isAnnual = false;

  function updatePrices(animate = true) {
    priceValues.forEach(el => {
      const monthly = parseInt(el.dataset.monthly, 10);
      const annual  = parseInt(el.dataset.annual, 10);
      const target  = isAnnual ? annual : monthly;

      if (animate && monthly !== annual) {
        // Animação de contagem rápida
        const current  = parseInt(el.textContent, 10) || 0;
        const diff     = target - current;
        const steps    = 20;
        const interval = 12;
        let step = 0;

        const timer = setInterval(() => {
          step++;
          const progress = step / steps;
          // Easing: ease-out
          const eased = 1 - Math.pow(1 - progress, 3);
          el.textContent = Math.round(current + diff * eased);
          if (step >= steps) {
            clearInterval(timer);
            el.textContent = target;
          }
        }, interval);
      } else {
        el.textContent = target;
      }
    });

    // Atualiza labels e toggle
    billingToggle.setAttribute('aria-checked', String(isAnnual));
    labelMonthly.classList.toggle('active', !isAnnual);
    labelAnnual.classList.toggle('active', isAnnual);
  }

  if (billingToggle) {
    billingToggle.addEventListener('click', () => {
      isAnnual = !isAnnual;
      updatePrices(true);
    });
  }


  /* ── 8. INJEÇÃO DE ESTILOS DINÂMICOS ────────── */
  const style = document.createElement('style');
  style.textContent = `
    .nav-active {
      color: var(--white) !important;
      background: rgba(124,58,237,.15) !important;
    }
  `;
  document.head.appendChild(style);

})();
