/* BestComKZ — интерактив
   Чистые обработчики: submit формы и делегированные клики tel:/wa.me
   оставлены отдельными функциями — на них позже вешаются gtag-конверсии. */
(function () {
  'use strict';

  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- шапка: фон + прогресс-луч ---------- */
  var hdr = document.getElementById('hdr');
  var beam = document.getElementById('beam');
  function onScroll() {
    var y = window.scrollY || 0;
    if (hdr) hdr.classList.toggle('scrolled', y > 30);
    if (beam) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      beam.style.width = (h > 0 ? Math.min(100, (y / h) * 100) : 0) + '%';
    }
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---------- мобильное меню ---------- */
  var burger = document.getElementById('burger');
  var nav = document.getElementById('nav');
  if (burger && nav) {
    burger.addEventListener('click', function () {
      var open = nav.classList.toggle('mopen');
      burger.classList.toggle('open', open);
      burger.setAttribute('aria-expanded', open ? 'true' : 'false');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) {
        nav.classList.remove('mopen');
        burger.classList.remove('open');
        burger.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /* ---------- reveal при скролле ---------- */
  var revEls = document.querySelectorAll('[data-rev]');
  if (reduced || !('IntersectionObserver' in window)) {
    revEls.forEach(function (el) { el.classList.add('in'); });
  } else {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('in');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    revEls.forEach(function (el, i) {
      el.style.transitionDelay = Math.min(i % 4 * 70, 220) + 'ms';
      io.observe(el);
    });
  }

  /* ---------- счётчики с easing ---------- */
  function animateCount(el) {
    var target = parseInt(el.getAttribute('data-count'), 10) || 0;
    var dur = 1800;
    var t0 = null;
    function fmt(n) {
      return n.toLocaleString('ru-RU').replace(/ /g, ' ');
    }
    if (reduced) { el.textContent = fmt(target); return; }
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / dur);
      var eased = 1 - Math.pow(1 - p, 4); /* easeOutQuart */
      el.textContent = fmt(Math.round(target * eased));
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  var counters = document.querySelectorAll('[data-count]');
  if ('IntersectionObserver' in window && !reduced) {
    var cio = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          animateCount(en.target);
          cio.unobserve(en.target);
        }
      });
    }, { threshold: 0.5 });
    counters.forEach(function (el) { cio.observe(el); });
  } else {
    counters.forEach(animateCount);
  }

  /* ---------- форма: собрать сообщение → WhatsApp ----------
     Чистый обработчик submit: сюда позже добавится gtag-конверсия. */
  var WA_MAIN = '77000969967'; /* Айнагуль */
  var form = document.getElementById('auditForm');
  var done = document.getElementById('formDone');

  function handleAuditFormSubmit(e) {
    e.preventDefault();
    var f = e.target;
    var name = (f.elements.name.value || '').trim();
    var phone = (f.elements.phone.value || '').trim();
    var task = (f.elements.task.value || '').trim();
    if (!name || !phone) {
      f.reportValidity();
      return;
    }
    var msg = 'Здравствуйте! Хочу бесплатный аудит безопасности объекта.\n' +
      'Имя: ' + name + '\n' +
      'Телефон: ' + phone +
      (task ? '\nОбъект/задача: ' + task : '');
    var url = 'https://wa.me/' + WA_MAIN + '?text=' + encodeURIComponent(msg);
    if (done) done.hidden = false;
    window.open(url, '_blank', 'noopener');
  }
  if (form) form.addEventListener('submit', handleAuditFormSubmit);

  /* ---------- делегированные клики tel: / WhatsApp ----------
     Чистый обработчик: сюда позже добавятся gtag-конверсии. */
  function handleContactClick(e) {
    var a = e.target.closest('a[href^="tel:"], a[href*="wa.me"]');
    if (!a) return;
    /* точка подключения аналитики:
       a.href содержит канал (tel / wa.me), контекст — ближайшая секция с id */
  }
  document.addEventListener('click', handleContactClick);

  /* ---------- год в подвале ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();
