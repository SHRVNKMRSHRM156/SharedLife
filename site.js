(function () {
  var reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Mobile menu
  var nav = document.querySelector('.nav'), toggle = document.querySelector('.toggle');
  if (nav && toggle) {
    toggle.addEventListener('click', function () {
      var open = nav.classList.toggle('open');
      toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
      toggle.textContent = open ? 'Close' : 'Menu';
    });
  }

  // Rotating audience line on the home page
  var word = document.getElementById('rotate');
  if (word && !reduce) {
    var words = JSON.parse(word.getAttribute('data-words')), i = 0;
    setInterval(function () {
      word.classList.add('out');
      setTimeout(function () {
        i = (i + 1) % words.length;
        word.textContent = words[i];
        word.classList.remove('out');
      }, 350);
    }, 2600);
  }

  // Count-up numbers: the final value is in the HTML; animate to it when scrolled into view
  var nums = document.querySelectorAll('[data-count]');
  if (nums.length && 'IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (e) {
        if (!e.isIntersecting) return;
        io.unobserve(e.target);
        var el = e.target, end = parseInt(el.getAttribute('data-count'), 10), pre = el.getAttribute('data-prefix') || '', t0 = null;
        function step(t) {
          if (!t0) t0 = t;
          var p = Math.min((t - t0) / 900, 1);
          el.textContent = pre + Math.round(end * (1 - Math.pow(1 - p, 3)));
          if (p < 1) requestAnimationFrame(step);
        }
        requestAnimationFrame(step);
      });
    }, { threshold: 0.6 });
    nums.forEach(function (n) { io.observe(n); });
  }

  // Copy email address
  var copy = document.getElementById('copy');
  if (copy) {
    copy.addEventListener('click', function () {
      var el = document.getElementById('addr'), ok = document.getElementById('ok');
      function fallback() {
        var r = document.createRange(); r.selectNodeContents(el);
        var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
        ok.textContent = 'Selected. Press Ctrl+C to copy.';
      }
      try { navigator.clipboard.writeText(el.textContent).then(function () { ok.textContent = 'Copied.'; }, fallback); }
      catch (e) { fallback(); }
    });
  }
})();
