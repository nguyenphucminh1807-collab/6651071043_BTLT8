/* =====================================================================
   BÀI 2 – script.js (JavaScript thuần)
   Tailwind KHÔNG có sẵn hành vi JS như Bootstrap → mọi tương tác
   (menu mobile, nút lên đầu trang, kiểm tra form...) đều tự viết ở đây.
   ===================================================================== */
(function () {
  'use strict';

  var $ = function (sel, root) { return (root || document).querySelector(sel); };
  var $$ = function (sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); };

  /* ---------------------------------------------------------------
     1. MENU MOBILE: click hamburger → toggle class hidden / flex
     --------------------------------------------------------------- */
  var menuBtn = $('#menu-btn');
  var mobileMenu = $('#mobile-menu');
  var iconOpen = $('#icon-open');
  var iconClose = $('#icon-close');

  function setMenu(open) {
    // Đang đóng: có "hidden". Đang mở: bỏ "hidden", thêm "flex".
    mobileMenu.classList.toggle('hidden', !open);
    mobileMenu.classList.toggle('flex', open);
    iconOpen.classList.toggle('hidden', open);
    iconClose.classList.toggle('hidden', !open);
    menuBtn.setAttribute('aria-expanded', String(open));
    menuBtn.setAttribute('aria-label', open ? 'Đóng menu' : 'Mở menu');
  }

  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () {
      setMenu(mobileMenu.classList.contains('hidden'));
    });
    // Bấm vào một mục menu → tự đóng menu
    $$('.mobile-link').forEach(function (a) {
      a.addEventListener('click', function () { setMenu(false); });
    });
    // Nhấn Esc để đóng
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') setMenu(false);
    });
    // Phóng to màn hình tới desktop → reset trạng thái menu
    window.addEventListener('resize', function () {
      if (window.innerWidth >= 768) setMenu(false);
    });
  }

  /* ---------------------------------------------------------------
     2. NÚT "LÊN ĐẦU TRANG" + 3. ACTIVE LINK KHI CUỘN
     --------------------------------------------------------------- */
  var backBtn = $('#back-to-top');
  var SHOW_AFTER = 400; // px cuộn xuống quá mức này thì hiện nút

  var spyIds = ['trang-chu', 'menu-banh', 'cau-chuyen', 'lien-he'];
  var spyTargets = spyIds.map(function (id) { return document.getElementById(id); }).filter(Boolean);
  var navLinks = $$('.nav-link, .mobile-link');

  function setActive(id) {
    navLinks.forEach(function (a) {
      a.classList.toggle('active', a.getAttribute('href') === '#' + id);
    });
  }

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;
    if (backBtn) backBtn.classList.toggle('show', y > SHOW_AFTER);

    // Tìm section cuối cùng có đỉnh nằm phía trên "đường ngắm" (≈ 160px từ mép trên)
    var current = spyTargets[0] ? spyTargets[0].id : '';
    var line = 160;
    spyTargets.forEach(function (sec) {
      if (sec.getBoundingClientRect().top <= line) current = sec.id;
    });
    // Chạm đáy trang → coi như đang ở mục cuối (Liên hệ)
    if (window.innerHeight + y >= document.documentElement.scrollHeight - 4) current = 'lien-he';
    if (current) setActive(current);
  }

  var ticking = false;
  window.addEventListener('scroll', function () {
    if (ticking) return;
    ticking = true;
    window.requestAnimationFrame(function () { onScroll(); ticking = false; });
  }, { passive: true });
  onScroll();

  if (backBtn) {
    backBtn.addEventListener('click', function () {
      window.scrollTo({ top: 0, behavior: 'smooth' }); // cuộn mượt về đầu trang
    });
  }

  /* ---------------------------------------------------------------
     4. HIỆU ỨNG HIỆN DẦN (IntersectionObserver)
     --------------------------------------------------------------- */
  var revealEls = $$('main article, [data-reveal]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) {
          en.target.classList.add('is-visible');
          io.unobserve(en.target);
        }
      });
    }, { threshold: 0.12 });
    revealEls.forEach(function (el, i) {
      el.classList.add('reveal');
      el.style.transitionDelay = ((i % 3) * 90) + 'ms';
      io.observe(el);
    });
  }

  /* ---------------------------------------------------------------
     5. NÚT "ĐẶT BÁNH" TRÊN THẺ → chọn sẵn loại bánh trong form
     --------------------------------------------------------------- */
  var form = $('#order-form');
  var selectCake = $('#loaibanh');
  var inputName = $('#hoten');

  $$('.btn-order').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!form) return;
      selectCake.value = btn.getAttribute('data-order');
      selectCake.classList.remove('is-invalid');
      var err = $('[data-for="loaibanh"]');
      if (err) err.classList.add('hidden');
      form.scrollIntoView({ behavior: 'smooth', block: 'center' });
      window.setTimeout(function () { inputName.focus({ preventScroll: true }); }, 600);
    });
  });

  /* ---------------------------------------------------------------
     6. KIỂM TRA FORM ĐẶT BÁNH
     --------------------------------------------------------------- */
  var msg = $('#form-msg');
  var dateInput = $('#ngaynhan');
  if (dateInput) {
    var t = new Date();
    var pad = function (n) { return String(n).padStart(2, '0'); };
    dateInput.min = t.getFullYear() + '-' + pad(t.getMonth() + 1) + '-' + pad(t.getDate());
  }

  function setError(field, bad) {
    field.classList.toggle('is-invalid', bad);
    var err = $('[data-for="' + field.id + '"]');
    if (err) err.classList.toggle('hidden', !bad);
  }

  if (form) {
    // Gõ lại → bỏ trạng thái lỗi ngay
    ['hoten', 'sdt', 'loaibanh'].forEach(function (id) {
      var f = document.getElementById(id);
      f.addEventListener('input', function () { setError(f, false); });
      f.addEventListener('change', function () { setError(f, false); });
    });

    form.addEventListener('submit', function (e) {
      e.preventDefault(); // bài tập chạy tĩnh, chưa gửi lên máy chủ
      var name = inputName.value.trim();
      var phone = $('#sdt').value.replace(/[\s.\-]/g, '');
      var phoneOk = /^(0|\+84)(3|5|7|8|9)\d{8}$/.test(phone);

      setError(inputName, name.length < 2);
      setError($('#sdt'), !phoneOk);
      setError(selectCake, !selectCake.value);

      var firstBad = $('.is-invalid', form);
      if (firstBad) {
        msg.classList.add('hidden');
        firstBad.focus();
        return;
      }

      msg.textContent = 'Cảm ơn ' + name + '! Bếp Bánh đã nhận đơn "' + selectCake.value + '" và sẽ gọi lại cho bạn sớm nhất. 🧁';
      msg.classList.remove('hidden');
      form.reset();
      selectCake.selectedIndex = 0;
    });
  }

  /* ---------------------------------------------------------------
     7. NĂM BẢN QUYỀN TỰ CẬP NHẬT
     --------------------------------------------------------------- */
  var yr = $('#year');
  if (yr) yr.textContent = new Date().getFullYear();
})();
