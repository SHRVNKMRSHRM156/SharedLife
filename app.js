/* SharedLife account pages: register, login, account, admin.
   All user-supplied text is inserted with textContent, never innerHTML. */
(function () {
  var SL = (window.SL = {});

  var LABELS = {
    role: { seeker: 'Client', counsellor: 'Counsellor', advocate: 'Advocate' },
    service: { consultation: 'Free consultation', premarital: 'Pre-marital counselling', marital: 'Marital counselling', prenup: 'Pre-Nuptial Agreement', course: 'The SharedLife Course', workshop: 'Workshop or talk' },
    slot: { morning: 'Morning', afternoon: 'Afternoon', evening: 'Evening' },
    mode: { online: 'Online', in_person: 'In person' },
    bstatus: { requested: 'Requested', confirmed: 'Confirmed', completed: 'Completed', cancelled: 'Cancelled' },
    ustatus: { active: 'Active', pending: 'Awaiting approval', approved: 'Approved', rejected: 'Not approved', suspended: 'Suspended' },
    relationship: { about_to_marry: 'About to marry', married: 'Married', other: 'Other' },
    estatus: { pending_payment: 'Awaiting payment', active: 'Active', cancelled: 'Cancelled' },
    method: { razorpay: 'Online', manual: 'UPI or bank transfer', complimentary: 'Complimentary or 100% coupon', '': '–' },
  };
  function rupees(n) { return '₹' + Number(n).toLocaleString('en-IN'); }

  function api(method, path, body) {
    return fetch('/api/' + path, {
      method: method,
      credentials: 'same-origin',
      headers: body ? { 'Content-Type': 'application/json' } : {},
      body: body ? JSON.stringify(body) : undefined,
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (data) {
        if (!r.ok) { var e = new Error(data.error || 'Something went wrong. Please try again.'); e.status = r.status; e.field = data.field; throw e; }
        return data;
      });
    }, function () { throw new Error('Could not reach SharedLife. Check your connection and try again.'); });
  }

  function h(tag, attrs, children) {
    var el = document.createElement(tag);
    for (var k in attrs || {}) {
      if (k === 'text') el.textContent = attrs[k];
      else if (k === 'class') el.className = attrs[k];
      else if (k.slice(0, 2) === 'on') el.addEventListener(k.slice(2), attrs[k]);
      else if (attrs[k] !== undefined && attrs[k] !== null && attrs[k] !== false) el.setAttribute(k, attrs[k]);
    }
    (children || []).forEach(function (c) { if (c) el.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return el;
  }

  function fmtDate(d) {
    if (!d) return '';
    var dt = new Date(String(d).length === 10 ? d + 'T00:00:00' : d);
    return dt.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function fmtDateTime(d) {
    if (!d) return '';
    return new Date(d).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', timeZone: 'Asia/Kolkata' });
  }
  function ymd(offsetDays) {
    var d = new Date(Date.now() + offsetDays * 86400000);
    return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0');
  }
  // "Dr Meera Shah" -> "Meera"; keep the full name if it is only a title
  function firstName(name) {
    var parts = name.split(/\s+/), titles = /^(dr|prof|adv|mr|mrs|ms|smt|shri)\.?$/i;
    while (parts.length > 1 && titles.test(parts[0])) parts.shift();
    return parts[0];
  }

  function pill(kind, value) {
    return h('span', { class: 'pill s-' + value, text: LABELS[kind][value] || value });
  }

  function showError(form, err) {
    var box = form.querySelector('.form-error');
    form.querySelectorAll('[aria-invalid]').forEach(function (i) { i.removeAttribute('aria-invalid'); });
    if (!err) { box.hidden = true; return; }
    box.textContent = err.message;
    box.hidden = false;
    if (err.field) {
      var input = Array.prototype.find.call(form.querySelectorAll('[name="' + err.field + '"]'), function (i) { return !i.closest('[hidden]'); });
      if (input) { input.setAttribute('aria-invalid', 'true'); input.focus(); }
    }
  }

  function busy(form, on) {
    var b = form.querySelector('button[type="submit"], button:not([type])');
    if (b) { b.disabled = on; b.dataset.label = b.dataset.label || b.textContent; b.textContent = on ? 'Please wait…' : b.dataset.label; }
  }

  function values(scope) {
    var out = {};
    scope.querySelectorAll('input, select, textarea').forEach(function (i) {
      if (!i.name || i.disabled || i.closest('[hidden]')) return;
      if (i.type === 'radio') { if (i.checked) out[i.name] = i.value; }
      else if (i.type === 'checkbox') out[i.name] = i.checked;
      else out[i.name] = i.value;
    });
    return out;
  }

  function nextUrl() {
    var m = /[?&]next=([a-z]+)/.exec(location.search);
    return { book: 'account.html#book', learn: 'learn.html#enrol' }[m && m[1]] || 'account.html';
  }

  // ---------- register ----------
  function registerPage() {
    var form = document.getElementById('register-form');
    function sync() {
      var role = form.querySelector('input[name="role"]:checked').value;
      form.querySelectorAll('[data-role]').forEach(function (s) { s.hidden = s.getAttribute('data-role') !== role; });
      form.querySelectorAll('[data-show-for]').forEach(function (s) { s.hidden = s.getAttribute('data-show-for').split(' ').indexOf(role) < 0; });
    }
    var pre = /[?&]as=(counsellor|advocate)/.exec(location.search);
    if (pre) form.querySelector('input[value="' + pre[1] + '"]').checked = true;
    form.addEventListener('change', function (e) { if (e.target.name === 'role') sync(); });
    sync();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showError(form, null);
      busy(form, true);
      api('POST', 'auth/register', values(form)).then(function () { location.href = nextUrl(); })
        .catch(function (err) { showError(form, err); busy(form, false); });
    });
  }

  // ---------- login ----------
  function loginPage() {
    var form = document.getElementById('login-form');
    api('GET', 'auth/me').then(function () { location.href = nextUrl(); }, function () {});
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showError(form, null);
      busy(form, true);
      api('POST', 'auth/login', values(form)).then(function (d) { location.href = d.user.is_admin && !/next=/.test(location.search) ? 'admin.html' : nextUrl(); })
        .catch(function (err) { showError(form, err); busy(form, false); });
    });
  }

  // ---------- account ----------
  function bookingCard(b, actions) {
    var when = b.scheduled_at ? 'Scheduled: ' + fmtDateTime(b.scheduled_at) : 'Preferred: ' + fmtDate(b.preferred_date) + ', ' + LABELS.slot[b.preferred_slot].toLowerCase();
    return h('article', { class: 'bk' }, [
      h('div', { class: 'bk-top' }, [h('h3', { text: LABELS.service[b.service] }), pill('bstatus', b.status)]),
      h('p', { text: when + ' · ' + LABELS.mode[b.mode] }),
      b.user_name ? h('p', { class: 'muted', text: 'Client: ' + b.user_name + ' · ' + b.user_phone + ' · ' + b.user_email }) : null,
      b.partner_name ? h('p', { class: 'muted', text: 'Partner: ' + b.partner_name }) : null,
      b.assigned_name && !b.user_name ? h('p', { class: 'muted', text: 'With: ' + b.assigned_name }) : null,
      b.notes ? h('p', { class: 'muted', text: 'Notes: ' + b.notes }) : null,
      actions ? h('div', { class: 'row' }, actions) : null,
    ]);
  }

  function accountPage() {
    api('GET', 'auth/me').then(function (d) {
      var u = d.user;
      document.getElementById('acct-hello').textContent = 'Hello, ' + firstName(u.name);
      document.getElementById('acct-role').textContent = LABELS.role[u.role] + ' account';
      document.getElementById('admin-link').hidden = !u.is_admin;
      detailsArea(u);
      if (u.role === 'seeker') seekerArea(u); else proArea(u);
    }, function () { location.href = 'login.html' + (location.hash === '#book' ? '?next=book' : ''); });

    document.getElementById('logout').addEventListener('click', function () {
      api('POST', 'auth/logout', {}).then(function () { location.href = './'; });
    });
  }

  // "My details": everyone can update their own name, phone, city and role details
  // Only details that were optional at sign-up can be changed; the rest are shown greyed out.
  var EDITABLE = {
    seeker: ['city', 'partner_name', 'wedding_date'],
    counsellor: ['registration_no', 'specialisation', 'languages'],
    advocate: ['practice_areas', 'languages'],
  };
  var MISSING = { seeker: { city: 'city', partner_name: "partner's name", wedding_date: 'wedding date' } };

  function detailsArea(u) {
    var box = document.getElementById('my-details'), form = document.getElementById('details-form');
    form.querySelectorAll('[data-role]').forEach(function (s) { s.hidden = s.getAttribute('data-role') !== u.role; });
    form.querySelectorAll('[data-show-for]').forEach(function (s) { s.hidden = s.getAttribute('data-show-for').split(' ').indexOf(u.role) < 0; });
    form.querySelectorAll('input[name], select[name]').forEach(function (i) {
      if (EDITABLE[u.role].indexOf(i.name) < 0) { i.disabled = true; i.readOnly = true; }
    });
    function fill(user) {
      var data = Object.assign({ name: user.name, phone: user.phone, city: user.city }, user.profile || {});
      document.getElementById('d-email').value = user.email;
      form.querySelectorAll('input[name], select[name]').forEach(function (i) {
        if (i.closest('[data-role][hidden]')) return;
        var val = data[i.name];
        if (val !== null && val !== undefined && val !== '') i.value = val;
      });
      var wanted = MISSING[user.role] || {}, gaps = [];
      Object.keys(wanted).forEach(function (k) { if (!data[k]) gaps.push(wanted[k]); });
      document.getElementById('details-hint').textContent = gaps.length ? 'Add your ' + gaps.join(', ').replace(/, ([^,]*)$/, ' and $1') : '';
    }
    fill(u);
    box.hidden = false;
    var ok = form.querySelector('.form-ok');
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showError(form, null);
      ok.hidden = true;
      busy(form, true);
      api('PATCH', 'auth/me', values(form)).then(function (d) {
        busy(form, false);
        fill(d.user);
        document.getElementById('acct-hello').textContent = 'Hello, ' + firstName(d.user.name);
        var partner = document.getElementById('b-partner');
        if (partner && !partner.value && d.user.profile && d.user.profile.partner_name) partner.value = d.user.profile.partner_name;
        ok.textContent = 'Your details are saved.';
        ok.hidden = false;
      }).catch(function (err) { showError(form, err); busy(form, false); });
    });
  }

  function seekerArea(u) {
    document.getElementById('seeker-area').hidden = false;
    courseCard();
    var form = document.getElementById('book-form');
    if (u.profile && u.profile.partner_name) document.getElementById('b-partner').value = u.profile.partner_name;
    var date = document.getElementById('b-date');
    date.min = ymd(1); date.max = ymd(120);
    var svc = /[?&]service=([a-z]+)/.exec(location.search);
    if (svc) form.service.value = svc[1];
    if (location.hash === '#book') setTimeout(function () { form.scrollIntoView({ block: 'start' }); form.service.focus(); }, 50);
    function load() {
      api('GET', 'bookings').then(function (d) {
        var list = document.getElementById('my-bookings');
        list.textContent = '';
        if (!d.bookings.length) list.appendChild(h('p', { class: 'empty', text: 'No bookings yet. Your requests will appear here.' }));
        d.bookings.forEach(function (b) {
          var cancel = ['requested', 'confirmed'].indexOf(b.status) >= 0 ? h('button', { class: 'btn ghost small', type: 'button', text: 'Cancel booking', onclick: function (e) {
            var btn = e.currentTarget;
            if (btn.dataset.sure !== '1') { btn.dataset.sure = '1'; btn.textContent = 'Tap again to cancel'; return; }
            api('PATCH', 'bookings/' + b.id, { status: 'cancelled' }).then(load);
          } }) : null;
          list.appendChild(bookingCard(b, cancel ? [cancel] : null));
        });
      });
    }
    load();
    form.addEventListener('submit', function (e) {
      e.preventDefault();
      showError(form, null);
      var ok = form.querySelector('.form-ok'); ok.hidden = true;
      busy(form, true);
      api('POST', 'bookings', values(form)).then(function () {
        form.reset();
        ok.textContent = 'Booking requested. We will call or email you to confirm the time.';
        ok.hidden = false;
        busy(form, false);
        load();
      }).catch(function (err) { showError(form, err); busy(form, false); });
    });
  }

  function proArea(u) {
    var banner = document.getElementById('pro-status');
    var msg = {
      pending: 'Thank you for applying. We are reviewing your details and will contact you soon.',
      approved: 'You are an approved member of the SharedLife panel.',
      rejected: 'We are unable to add you to the panel at this time. Please contact us if you have questions.',
    }[u.status];
    if (msg) { banner.textContent = msg; banner.className = 'banner s-' + u.status; banner.hidden = false; }
    document.getElementById('pro-area').hidden = u.status !== 'approved';
    if (u.status !== 'approved') return;
    function load() {
      api('GET', 'bookings').then(function (d) {
        var list = document.getElementById('pro-bookings');
        list.textContent = '';
        if (!d.bookings.length) list.appendChild(h('p', { class: 'empty', text: 'No sessions assigned yet. When we assign a client to you, the details appear here.' }));
        d.bookings.forEach(function (b) {
          var done = b.status === 'confirmed' ? h('button', { class: 'btn ghost small', type: 'button', text: 'Mark as completed', onclick: function () {
            api('PATCH', 'bookings/' + b.id, { status: 'completed' }).then(load);
          } }) : null;
          list.appendChild(bookingCard(b, done ? [done] : null));
        });
      });
    }
    load();
  }

  // ---------- course ----------
  function courseCard() {
    var box = document.getElementById('course-card');
    api('GET', 'course').then(function (d) {
      var e = d.enrolment, total = d.course.lesson_count, text, link;
      if (d.access) {
        var done = d.progress.length;
        text = done >= total ? 'You have completed all ' + total + ' lessons. Revisit them any time.' : done + ' of ' + total + ' lessons done.';
        link = h('a', { class: 'btn small', href: 'learn.html', text: done ? 'Continue the course' : 'Start the course' });
        box.className = 'banner course-banner s-approved';
      } else if (e && e.status === 'pending_payment') {
        text = d.payments === 'razorpay' ? 'Your place is reserved. Complete your payment to open all lessons.' : 'Your place is reserved. We will contact you with payment details, and your lessons open as soon as payment is confirmed.';
        link = h('a', { class: 'btn small', href: 'learn.html#enrol', text: d.payments === 'razorpay' ? 'Complete payment' : 'View the course' });
        box.className = 'banner course-banner s-pending';
      } else {
        text = total + ' lessons for couples, at your own pace. ' + rupees(d.course.price_inr) + ' for both partners.';
        link = h('a', { class: 'btn small ghost', href: 'course.html', text: 'See the course' });
      }
      box.textContent = '';
      box.appendChild(h('div', {}, [h('b', { text: 'The SharedLife Course' }), h('p', { class: 'muted', text: text })]));
      box.appendChild(link);
      box.hidden = false;
    }, function () {});
  }

  function loadScript(src) {
    return new Promise(function (resolve, reject) {
      if (document.querySelector('script[src="' + src + '"]')) return resolve();
      var s = document.createElement('script');
      s.src = src; s.onload = resolve; s.onerror = function () { reject(new Error('Could not load the payment window. Check your connection and try again.')); };
      document.head.appendChild(s);
    });
  }

  // Lesson text comes as { en, hi }; Hindi falls back to English while a lesson is still being translated.
  var UI = {
    en: { module: 'Module', lesson: 'Lesson', of: 'of', minutes: 'minutes', about: 'about', done: 'lessons done', story: 'Story', example: 'Example',
      talk: 'Talk about it together', try: 'Try this', takeaways: 'Key takeaways', checklist: 'Tick what is true for you', draft: 'This lesson is still a draft and is being rewritten.',
      hiSoon: '', mark: 'Mark as done', undo: '✓ Done (tap to undo)', prev: '← Previous', next: 'Next →', enrolNext: 'Enrol to continue', loading: 'Loading…',
      locked: 'This lesson opens when you enrol. The first lesson is free to read now.', enrol: 'Enrol', free: 'Read the free lesson',
      law: 'General information about the law in India, not legal advice. For your own situation, book a consultation from your account.' },
    hi: { module: 'मॉड्यूल', lesson: 'पाठ', of: 'में से', minutes: 'मिनट', about: 'लगभग', done: 'पाठ पूरे', story: 'कहानी', example: 'उदाहरण',
      talk: 'साथ बैठकर बात करें', try: 'यह करके देखें', takeaways: 'मुख्य बातें', checklist: 'जो आप पर लागू हो, उस पर निशान लगाएँ', draft: 'यह पाठ अभी ड्राफ़्ट है और दोबारा लिखा जा रहा है।',
      hiSoon: 'इस पाठ का हिंदी संस्करण जल्द आएगा। तब तक अंग्रेज़ी में पढ़ें।', mark: 'पूरा हुआ', undo: '✓ पूरा (हटाने के लिए दबाएँ)', prev: '← पिछला', next: 'अगला →', enrolNext: 'आगे पढ़ने के लिए एनरोल करें', loading: 'लोड हो रहा है…',
      locked: 'यह पाठ एनरोल करने पर खुलेगा। पहला पाठ अभी मुफ़्त में पढ़ें।', enrol: 'एनरोल करें', free: 'मुफ़्त पाठ पढ़ें',
      law: 'यह भारत के क़ानून की सामान्य जानकारी है, क़ानूनी सलाह नहीं। अपनी स्थिति के लिए अपने अकाउंट से परामर्श बुक करें।' },
  };
  function getLang() { try { return localStorage.getItem('sl-lang') === 'hi' ? 'hi' : 'en'; } catch (e) { return 'en'; } }
  function setLang(l) { try { localStorage.setItem('sl-lang', l); } catch (e) { /* private window */ } }

  function learnPage() {
    var state = { info: null, user: null, current: null, lang: getLang(), coupon: null };
    var box = document.getElementById('enrol'), toc = document.getElementById('toc'), view = document.getElementById('lesson');
    var lessons = [];
    function t(k) { return UI[state.lang][k]; }
    // Pick the reader's language from a { en, hi } value.
    function tr(v) { return v && typeof v === 'object' && !Array.isArray(v) ? (v[state.lang] || v.en) : v; }
    function hasHi(v) { return !v || typeof v !== 'object' || Boolean(v.hi); }

    function wanted() {
      var m = /[?&]lesson=(\d+)/.exec(location.search);
      return m ? Number(m[1]) : null;
    }
    function unlocked(l) { return state.info.access || l.preview; }

    document.querySelectorAll('.lang-switch [data-lang]').forEach(function (b) {
      b.addEventListener('click', function () {
        state.lang = b.dataset.lang;
        setLang(state.lang);
        paintLang();
        if (state.info) show(state.current, false);
      });
    });
    function paintLang() {
      document.querySelectorAll('.lang-switch [data-lang]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.dataset.lang === state.lang)); });
      view.setAttribute('lang', state.lang);
      toc.setAttribute('lang', state.lang);
    }
    paintLang();

    function renderEnrol() {
      var d = state.info, e = d.enrolment, title = document.getElementById('enrol-title'), text = document.getElementById('enrol-text'), actions = document.getElementById('enrol-actions');
      var c = state.coupon, price = rupees(d.course.price_inr), pay = c ? rupees(c.amount_inr) : price;
      actions.textContent = '';
      showError(box, null);
      box.hidden = d.access;
      if (d.access) return;
      box.className = 'banner enrol-box';
      if (!state.user) {
        title.textContent = 'Enrol to open all ' + d.course.lesson_count + ' lessons';
        text.textContent = price + ' for both partners, in English and Hindi. Create a free SharedLife account first, or log in if you have one.';
        actions.appendChild(h('a', { class: 'btn', href: 'register.html?next=learn', text: 'Create an account and enrol' }));
        actions.appendChild(h('a', { class: 'btn ghost', href: 'login.html?next=learn', text: 'Log in' }));
      } else if (!d.can_enrol) {
        title.textContent = 'The course is for couples and individuals';
        text.textContent = 'Please enrol from a couple or individual account. Counsellor and advocate accounts cannot enrol.';
      } else if (e && e.status === 'pending_payment' && d.payments === 'manual') {
        box.className = 'banner enrol-box s-pending';
        title.textContent = 'Your place is reserved';
        text.textContent = 'We will call or email you with UPI or bank transfer details for ' + rupees(e.amount_inr) + '. All lessons open as soon as your payment is confirmed.';
      } else {
        title.textContent = e && e.status === 'pending_payment' ? 'Complete your enrolment' : 'Enrol to open all ' + d.course.lesson_count + ' lessons';
        text.textContent = '';
        text.appendChild(c ? h('span', {}, [h('s', { text: price }), ' ', h('b', { text: pay }), ' for both partners with ' + c.code + ' (' + c.percent_off + '% off). '])
          : document.createTextNode(price + ' for both partners. '));
        text.appendChild(document.createTextNode(d.payments === 'razorpay' ? 'Pay securely by UPI, card or net banking.' : 'We will send you UPI or bank transfer details.'));
        var input = h('input', { id: 'coupon', name: 'coupon', placeholder: 'Coupon code', autocapitalize: 'characters', value: c ? c.code : '' });
        actions.appendChild(h('form', { class: 'coupon-form', novalidate: '', onsubmit: function (ev) {
          ev.preventDefault();
          var code = input.value.trim();
          showError(box, null);
          if (!code) { state.coupon = null; return renderEnrol(); }
          api('GET', 'course/coupon?code=' + encodeURIComponent(code)).then(function (r) { state.coupon = r.coupon; renderEnrol(); },
            function (err) { state.coupon = null; renderEnrol(); showError(box, err); });
        } }, [h('label', { class: 'sr', for: 'coupon', text: 'Coupon code' }), input, h('button', { class: 'btn ghost small', type: 'submit', text: c ? 'Applied ✓' : 'Apply' })]));
        actions.appendChild(h('button', { class: 'btn', type: 'button', text: d.payments === 'razorpay' ? 'Enrol and pay ' + pay : 'Enrol for ' + pay, onclick: enrol }));
      }
    }

    function enrol(ev) {
      var btn = ev.currentTarget;
      showError(box, null);
      btn.disabled = true;
      api('POST', 'course/enrol', state.coupon ? { coupon: state.coupon.code } : {}).then(function (r) {
        if (r.payment !== 'razorpay') { btn.disabled = false; return refresh(); }
        return loadScript('https://checkout.razorpay.com/v1/checkout.js').then(function () {
          var c = r.checkout;
          var rzp = new window.Razorpay({
            key: c.key, order_id: c.order_id, amount: c.amount, currency: c.currency, name: c.name, description: c.description,
            image: location.origin + '/img/logo.png', prefill: c.prefill, theme: { color: '#C2512F' },
            handler: function (resp) {
              api('POST', 'course/verify', resp).then(refresh, function (err) { showError(box, err); refresh(); });
            },
            modal: { ondismiss: function () { btn.disabled = false; } },
          });
          rzp.on('payment.failed', function (resp) {
            showError(box, new Error((resp.error && resp.error.description) || 'The payment did not go through. Please try again.'));
          });
          rzp.open();
        });
      }).catch(function (err) { btn.disabled = false; showError(box, err); });
    }

    function renderToc() {
      var d = state.info;
      toc.textContent = '';
      d.course.modules.forEach(function (m) {
        var list = h('ol', { class: 'toc-list' });
        m.lessons.forEach(function (l) {
          var done = d.progress.indexOf(l.id) >= 0, open = unlocked(l);
          var cls = 'toc-item' + (done ? ' done' : '') + (open ? '' : ' locked') + (state.current === l.id ? ' current' : '');
          list.appendChild(h('li', {}, [h('a', {
            class: cls, href: 'learn.html?lesson=' + l.id, 'aria-current': state.current === l.id ? 'page' : null,
            onclick: function (ev) { ev.preventDefault(); show(l.id, true); },
          }, [h('span', { class: 'mark', 'aria-hidden': 'true', text: done ? '✓' : open ? String(l.id) : '🔒' }), h('span', { text: tr(l.title) }), done ? h('span', { class: 'sr', text: ' (done)' }) : null, open ? null : h('span', { class: 'sr', text: ' (locked)' })])]));
        });
        toc.appendChild(h('div', { class: 'toc-module' }, [h('p', { class: 'toc-head', text: t('module') + ' ' + m.n + ' · ' + tr(m.title) }), list]));
      });
      var done = d.progress.length, total = d.course.lesson_count;
      document.getElementById('learn-progress').textContent = d.access ? done + ' / ' + total + ' ' + t('done') : '';
    }

    function paras(text) { return String(text || '').split(/\n\n+/).map(function (p) { return h('p', { text: p }); }); }
    function items(tag, list, cls) { return h(tag, { class: cls }, (list || []).map(function (x) { return h('li', { text: x }); })); }
    function arr(b) { return b[state.lang] && b[state.lang].length ? b[state.lang] : b.en || []; }

    // One lesson block. Everything is set with textContent.
    function block(b) {
      switch (b.type) {
        case 'p': return h('p', { text: tr(b) });
        case 'h': return h('h3', { class: 'h3', text: tr(b) });
        case 'note': return h('p', { class: 'note', text: tr(b) });
        case 'try': return h('section', { class: 'try' }, [h('h3', { text: t('try') }), h('p', { text: tr(b) })]);
        case 'story':
        case 'example':
          return h('aside', { class: 'tale ' + b.type }, [h('p', { class: 'tale-tag', text: t(b.type) }), b.title ? h('h3', { text: tr(b.title) }) : null].concat(paras(tr(b))));
        case 'list': return items('ul', arr(b), 'points');
        case 'takeaways': return h('section', { class: 'takeaways' }, [h('h3', { text: t('takeaways') }), items('ul', arr(b))]);
        case 'talk': return h('section', { class: 'talk' }, [h('h3', { text: t('talk') }), items('ul', arr(b))]);
        case 'checklist':
          return h('section', { class: 'checklist' }, [h('h3', { text: t('checklist') })].concat(arr(b).map(function (x) {
            return h('label', {}, [h('input', { type: 'checkbox' }), h('span', { text: x })]);
          })));
        case 'steps':
          return h('ol', { class: 'steps' }, arr(b).map(function (s) { return h('li', {}, [h('b', { text: s[0] }), h('span', { text: s[1] })]); }));
        case 'compare':
          return h('div', { class: 'compare' }, [b.left, b.right].map(function (side, i) {
            return h('div', { class: 'compare-col ' + (i ? 'right' : 'left') }, [h('h3', { text: tr(side.title) }), items('ul', arr(side))]);
          }));
        case 'figure':
          return h('figure', { class: 'fig' + (b.animated ? ' animated' : '') }, [h('img', { src: b.src, alt: tr(b.alt) || '', loading: 'lazy' }), b.caption ? h('figcaption', { text: tr(b.caption) }) : null]);
        default: return null;
      }
    }

    function scrollToEnrol(ev) { ev.preventDefault(); box.scrollIntoView({ behavior: 'smooth', block: 'center' }); }

    function show(id, scroll) {
      var meta = lessons.find(function (l) { return l.id === id; }) || lessons[0];
      state.current = meta.id;
      history.replaceState(null, '', 'learn.html?lesson=' + meta.id + (location.hash === '#enrol' && !state.info.access ? '#enrol' : ''));
      renderToc();
      if (!unlocked(meta)) {
        view.textContent = '';
        view.appendChild(h('p', { class: 'eyebrow', text: t('lesson') + ' ' + meta.id }));
        view.appendChild(h('h2', { class: 'h2', text: tr(meta.title) }));
        view.appendChild(h('p', { class: 'lede', text: t('locked') }));
        view.appendChild(h('div', { class: 'row' }, [
          h('a', { class: 'btn', href: '#enrol', text: t('enrol'), onclick: scrollToEnrol }),
          h('a', { class: 'btn ghost', href: 'learn.html?lesson=1', text: t('free'), onclick: function (ev) { ev.preventDefault(); show(1, true); } }),
        ]));
        return;
      }
      view.textContent = '';
      view.appendChild(h('p', { class: 'empty', text: t('loading') }));
      api('GET', 'course/lessons/' + meta.id).then(function (r) {
        var l = r.lesson, mod = state.info.course.modules[l.module - 1], done = state.info.progress.indexOf(l.id) >= 0;
        view.textContent = '';
        view.appendChild(h('p', { class: 'eyebrow', text: t('module') + ' ' + l.module + ' · ' + tr(mod.title) }));
        view.appendChild(h('h2', { class: 'h2', text: tr(l.title) }));
        view.appendChild(h('p', { class: 'muted', text: t('lesson') + ' ' + l.id + ' / ' + state.info.course.lesson_count + ' · ' + t('about') + ' ' + l.minutes + ' ' + t('minutes') }));
        if (state.lang === 'hi' && !hasHi(l.summary)) view.appendChild(h('p', { class: 'note', text: t('hiSoon') }));
        if (l.draft) view.appendChild(h('p', { class: 'note', text: t('draft') }));
        if (l.video) view.appendChild(h('div', { class: 'video' }, [h('iframe', { src: l.video, title: tr(l.title), allow: 'fullscreen; picture-in-picture', allowfullscreen: '', loading: 'lazy' })]));
        view.appendChild(h('p', { class: 'lede', text: tr(l.summary) }));
        (l.blocks || []).forEach(function (b) { var el = block(b); if (el) view.appendChild(el); });
        var nav = h('div', { class: 'row lesson-nav' });
        if (state.info.access) {
          nav.appendChild(h('button', { class: 'btn' + (done ? ' ghost' : ''), type: 'button', text: done ? t('undo') : t('mark'), onclick: function (ev) {
            ev.currentTarget.disabled = true;
            api('PUT', 'course/progress/' + l.id, { done: !done }).then(function (p) {
              state.info.progress = p.progress;
              if (!done && l.next) show(l.next, true); else show(l.id, false);
            });
          } }));
        } else if (l.preview) {
          nav.appendChild(h('a', { class: 'btn', href: '#enrol', text: t('enrolNext'), onclick: scrollToEnrol }));
        }
        if (l.prev) nav.appendChild(h('button', { class: 'btn ghost', type: 'button', text: t('prev'), onclick: function () { show(l.prev, true); } }));
        if (l.next) nav.appendChild(h('button', { class: 'btn ghost', type: 'button', text: t('next'), onclick: function () { show(l.next, true); } }));
        view.appendChild(nav);
        if (l.module === 7) view.appendChild(h('p', { class: 'note', text: t('law') }));
        if (scroll) view.scrollIntoView({ block: 'start' });
      }, function (err) {
        view.textContent = '';
        view.appendChild(h('p', { class: 'form-error', text: err.message }));
      });
    }

    function refresh() {
      return api('GET', 'course').then(function (d) {
        state.info = d;
        lessons = [];
        d.course.modules.forEach(function (m) { lessons = lessons.concat(m.lessons); });
        renderEnrol();
        var first = d.access ? (lessons.find(function (l) { return d.progress.indexOf(l.id) < 0; }) || lessons[0]).id : 1;
        show(state.current || wanted() || first, false);
        if (location.hash === '#enrol' && !d.access) setTimeout(function () { box.scrollIntoView({ block: 'center' }); }, 50);
      }, function (err) { view.textContent = ''; view.appendChild(h('p', { class: 'form-error', text: err.message })); });
    }

    api('GET', 'auth/me').then(function (d) {
      state.user = d.user;
      document.getElementById('learn-hello').textContent = 'Welcome, ' + firstName(d.user.name);
    }, function () {}).then(refresh);
  }

  // ---------- admin ----------
  function adminPage() {
    var errBox = document.getElementById('admin-error');
    var state = { bookings: [], users: [], pros: [], enrolments: [], lessons: 0 };
    function fail(err) {
      if (err.status === 401) { location.href = 'login.html'; return; }
      errBox.textContent = err.status === 403 ? 'This page is for SharedLife admins. Log in with the admin email.' : err.message;
      errBox.hidden = false;
    }

    document.querySelectorAll('[data-tab]').forEach(function (t) {
      t.addEventListener('click', function () {
        document.querySelectorAll('[data-tab]').forEach(function (x) { x.setAttribute('aria-selected', x === t ? 'true' : 'false'); });
        document.querySelectorAll('[data-panel]').forEach(function (p) { p.hidden = p.getAttribute('data-panel') !== t.getAttribute('data-tab'); });
      });
    });

    function summary() {
      api('GET', 'admin/summary').then(function (d) {
        var c = { seeker: 0, counsellor: 0, advocate: 0, pending: 0, requested: 0 };
        d.users.forEach(function (r) { c[r.role] += r.n; if (r.status === 'pending') c.pending += r.n; });
        d.bookings.forEach(function (r) { if (r.status === 'requested') c.requested += r.n; });
        document.getElementById('t-seekers').textContent = c.seeker;
        document.getElementById('t-counsellors').textContent = c.counsellor;
        document.getElementById('t-advocates').textContent = c.advocate;
        document.getElementById('t-pending').textContent = c.pending;
        document.getElementById('t-requested').textContent = c.requested;
        document.getElementById('t-week').textContent = d.last7days.new_users;
        document.getElementById('t-week-b').textContent = d.last7days.new_bookings;
        var en = { active: 0, pending_payment: 0 };
        (d.enrolments || []).forEach(function (r) { en[r.status] = r.n; });
        document.getElementById('t-learners').textContent = en.active || 0;
        document.getElementById('t-course-due').textContent = en.pending_payment || 0;
      }, fail);
    }

    function match(q, fields) {
      q = q.trim().toLowerCase();
      return !q || fields.some(function (f) { return String(f || '').toLowerCase().indexOf(q) >= 0; });
    }

    function renderBookings() {
      var tb = document.querySelector('#bookings-table tbody');
      var st = document.getElementById('f-bstatus').value, q = document.getElementById('f-bsearch').value;
      var rows = state.bookings.filter(function (b) { return (!st || b.status === st) && match(q, [b.user_name, b.user_email, b.user_phone, b.partner_name]); });
      tb.textContent = '';
      if (!rows.length) tb.appendChild(h('tr', {}, [h('td', { colspan: 8, class: 'empty', text: state.bookings.length ? 'No bookings match these filters.' : 'No bookings yet.' })]));
      rows.forEach(function (b) {
        tb.appendChild(h('tr', {}, [
          h('td', { text: String(b.id) }),
          h('td', {}, [h('b', { text: b.user_name }), h('br'), h('small', { text: b.user_phone + ' · ' + b.user_email })]),
          h('td', {}, [document.createTextNode(LABELS.service[b.service]), h('br'), h('small', { text: LABELS.mode[b.mode] + (b.notes ? ' · has notes' : '') })]),
          h('td', { text: fmtDate(b.preferred_date) + ', ' + LABELS.slot[b.preferred_slot].toLowerCase() }),
          h('td', {}, [pill('bstatus', b.status)]),
          h('td', { text: b.assigned_name || '–' }),
          h('td', { text: b.scheduled_at ? fmtDateTime(b.scheduled_at) : '–' }),
          h('td', {}, [h('button', { class: 'btn ghost small', type: 'button', text: 'Manage', onclick: function () { openBooking(b); } })]),
        ]));
      });
    }

    function profileText(u) {
      var p = u.profile || {};
      if (u.role === 'seeker') return [LABELS.relationship[p.relationship], p.partner_name && 'Partner: ' + p.partner_name, p.wedding_date && 'Wedding: ' + fmtDate(p.wedding_date)].filter(Boolean).join(' · ');
      if (u.role === 'counsellor') return [p.qualification, p.experience_years != null && p.experience_years + ' yrs', p.registration_no && 'Reg: ' + p.registration_no, p.specialisation, p.languages].filter(Boolean).join(' · ');
      return [p.enrolment_no && 'Enrolment: ' + p.enrolment_no, p.bar_council, p.experience_years != null && p.experience_years + ' yrs', p.practice_areas, p.languages].filter(Boolean).join(' · ');
    }

    function setUserStatus(u, status) {
      api('PATCH', 'admin/users/' + u.id, { status: status }).then(function () { loadUsers(); summary(); }, fail);
    }

    function renderUsers() {
      var tb = document.querySelector('#users-table tbody');
      var role = document.getElementById('f-role').value, st = document.getElementById('f-ustatus').value, q = document.getElementById('f-usearch').value;
      var rows = state.users.filter(function (u) { return (!role || u.role === role) && (!st || u.status === st) && match(q, [u.name, u.email, u.phone, u.city]); });
      tb.textContent = '';
      if (!rows.length) tb.appendChild(h('tr', {}, [h('td', { colspan: 7, class: 'empty', text: state.users.length ? 'No registrations match these filters.' : 'No registrations yet.' })]));
      rows.forEach(function (u) {
        var actions = [];
        if (u.role !== 'seeker') {
          if (u.status !== 'approved') actions.push(h('button', { class: 'btn small', type: 'button', text: 'Approve', onclick: function () { setUserStatus(u, 'approved'); } }));
          if (u.status === 'pending') actions.push(h('button', { class: 'btn ghost small', type: 'button', text: 'Decline', onclick: function () { setUserStatus(u, 'rejected'); } }));
        }
        if (!u.is_admin) {
          if (u.status === 'suspended') actions.push(h('button', { class: 'btn ghost small', type: 'button', text: 'Restore', onclick: function () { setUserStatus(u, u.role === 'seeker' ? 'active' : 'pending'); } }));
          else actions.push(h('button', { class: 'btn ghost small', type: 'button', text: 'Suspend', onclick: function (e) {
            var btn = e.currentTarget;
            if (btn.dataset.sure !== '1') { btn.dataset.sure = '1'; btn.textContent = 'Tap again to suspend'; return; }
            setUserStatus(u, 'suspended');
          } }));
        }
        tb.appendChild(h('tr', {}, [
          h('td', {}, [h('b', { text: u.name }), u.city ? h('br') : null, u.city ? h('small', { text: u.city }) : null]),
          h('td', { text: LABELS.role[u.role] + (u.is_admin ? ' (admin)' : '') }),
          h('td', {}, [document.createTextNode(u.phone), h('br'), h('small', { text: u.email })]),
          h('td', {}, [h('small', { text: profileText(u) + (u.role === 'seeker' ? ' · ' + u.booking_count + ' booking' + (u.booking_count === 1 ? '' : 's') : '') })]),
          h('td', { text: fmtDate(u.created_at) }),
          h('td', {}, [pill('ustatus', u.status)]),
          h('td', {}, [h('div', { class: 'row tight' }, actions)]),
        ]));
      });
    }

    function loadBookings() { return api('GET', 'bookings').then(function (d) { state.bookings = d.bookings; renderBookings(); }, fail); }
    function loadUsers() {
      return api('GET', 'admin/users').then(function (d) {
        state.users = d.users;
        state.pros = d.users.filter(function (u) { return u.role !== 'seeker' && u.status === 'approved'; });
        renderUsers();
      }, fail);
    }

    ['f-bstatus', 'f-bsearch'].forEach(function (id) { document.getElementById(id).addEventListener('input', renderBookings); });
    ['f-role', 'f-ustatus', 'f-usearch'].forEach(function (id) { document.getElementById(id).addEventListener('input', renderUsers); });

    // booking dialog
    var dlg = document.getElementById('booking-dialog'), editForm = document.getElementById('booking-edit'), current;
    function toLocalInput(iso) {
      if (!iso) return '';
      var d = new Date(new Date(iso).getTime() + 5.5 * 3600000);
      return d.toISOString().slice(0, 16);
    }
    function openBooking(b) {
      current = b;
      showError(editForm, null);
      document.getElementById('bd-id').textContent = '#' + b.id;
      var s = document.getElementById('bd-summary');
      s.textContent = '';
      [
        ['Client', b.user_name + ', ' + b.user_phone + ', ' + b.user_email + (b.user_city ? ', ' + b.user_city : '')],
        ['Partner', b.partner_name],
        ['Service', LABELS.service[b.service] + ' · ' + LABELS.mode[b.mode]],
        ['Preferred', fmtDate(b.preferred_date) + ', ' + LABELS.slot[b.preferred_slot].toLowerCase()],
        ['Notes', b.notes],
        ['Requested on', fmtDateTime(b.created_at)],
      ].forEach(function (r) { if (r[1]) s.appendChild(h('p', {}, [h('b', { text: r[0] + ': ' }), document.createTextNode(r[1])])); });
      document.getElementById('bd-status').value = b.status;
      document.getElementById('bd-when').value = toLocalInput(b.scheduled_at);
      document.getElementById('bd-note').value = b.admin_note || '';
      var sel = document.getElementById('bd-assign');
      sel.textContent = '';
      sel.appendChild(h('option', { value: '', text: 'Not assigned' }));
      state.pros.forEach(function (p) { sel.appendChild(h('option', { value: String(p.id), text: p.name + ' (' + LABELS.role[p.role] + ')' })); });
      sel.value = b.assigned_to ? String(b.assigned_to) : '';
      if (typeof dlg.showModal === 'function') dlg.showModal(); else dlg.setAttribute('open', '');
    }
    editForm.addEventListener('submit', function (e) {
      if (e.submitter && e.submitter.value !== 'save') return;
      e.preventDefault();
      var when = document.getElementById('bd-when').value;
      busy(editForm, true);
      api('PATCH', 'bookings/' + current.id, {
        status: document.getElementById('bd-status').value,
        scheduled_at: when ? when + ':00+05:30' : null,
        assigned_to: document.getElementById('bd-assign').value || null,
        admin_note: document.getElementById('bd-note').value,
      }).then(function () {
        busy(editForm, false);
        dlg.close();
        loadBookings(); summary();
      }).catch(function (err) { busy(editForm, false); showError(editForm, err); });
    });


    function setEnrolment(e, status) {
      api('PATCH', 'admin/enrolments/' + e.id, { status: status }).then(function () { loadEnrolments(); summary(); }, fail);
    }

    function renderEnrolments() {
      var tb = document.querySelector('#enrolments-table tbody');
      var st = document.getElementById('f-estatus').value, q = document.getElementById('f-esearch').value;
      var rows = state.enrolments.filter(function (e) { return (!st || e.status === st) && match(q, [e.user_name, e.user_email, e.user_phone]); });
      tb.textContent = '';
      if (!rows.length) tb.appendChild(h('tr', {}, [h('td', { colspan: 7, class: 'empty', text: state.enrolments.length ? 'No enrolments match these filters.' : 'No course enrolments yet.' })]));
      rows.forEach(function (e) {
        var actions = [];
        if (e.status !== 'active') actions.push(h('button', { class: 'btn small', type: 'button', text: e.status === 'pending_payment' ? 'Mark as paid' : 'Restore access', onclick: function () { setEnrolment(e, 'active'); } }));
        if (e.status !== 'cancelled') actions.push(h('button', { class: 'btn ghost small', type: 'button', text: 'Cancel', onclick: function (ev) {
          var btn = ev.currentTarget;
          if (btn.dataset.sure !== '1') { btn.dataset.sure = '1'; btn.textContent = 'Tap again to cancel'; return; }
          setEnrolment(e, 'cancelled');
        } }));
        tb.appendChild(h('tr', {}, [
          h('td', {}, [h('b', { text: e.user_name }), h('br'), h('small', { text: e.user_phone + ' · ' + e.user_email })]),
          h('td', { text: fmtDate(e.created_at) }),
          h('td', {}, [document.createTextNode(rupees(e.amount_inr)), e.coupon ? h('br') : null, e.coupon ? h('small', { text: e.coupon }) : null]),
          h('td', {}, [document.createTextNode(LABELS.method[e.method] || e.method), e.payment_id ? h('br') : null, e.payment_id ? h('small', { text: e.payment_id }) : null]),
          h('td', { text: e.lessons_done + ' / ' + state.lessons }),
          h('td', {}, [h('span', { class: 'pill s-' + (e.status === 'pending_payment' ? 'pending' : e.status), text: LABELS.estatus[e.status] })]),
          h('td', {}, [h('div', { class: 'row tight' }, actions)]),
        ]));
      });
    }

    function loadEnrolments() {
      return api('GET', 'admin/enrolments').then(function (d) { state.enrolments = d.enrolments; state.lessons = d.lesson_count; renderEnrolments(); }, fail);
    }
    ['f-estatus', 'f-esearch'].forEach(function (id) { document.getElementById(id).addEventListener('input', renderEnrolments); });
    api('GET', 'health').then(function (d) {
      document.getElementById('course-mode').textContent = d.course_payments === 'razorpay'
        ? 'Online payments are on (Razorpay). Paid enrolments open automatically.'
        : 'Online payments are off until Razorpay keys are added in Vercel. New enrolments wait as "Awaiting payment": collect payment by UPI or bank transfer, then tap Mark as paid.';
    }, function () {});
    var grant = document.getElementById('grant-form');
    grant.addEventListener('submit', function (ev) {
      ev.preventDefault();
      showError(grant, null);
      busy(grant, true);
      api('POST', 'admin/enrolments', values(grant)).then(function () { busy(grant, false); grant.reset(); loadEnrolments(); summary(); })
        .catch(function (err) { busy(grant, false); showError(grant, err); });
    });

    function loadCoupons() {
      return api('GET', 'admin/coupons').then(function (d) {
        var tb = document.querySelector('#coupons-table tbody');
        tb.textContent = '';
        if (!d.coupons.length) tb.appendChild(h('tr', {}, [h('td', { colspan: 6, class: 'empty', text: 'No coupon codes yet.' })]));
        d.coupons.forEach(function (c) {
          tb.appendChild(h('tr', {}, [
            h('td', {}, [h('b', { text: c.code })]),
            h('td', { text: c.percent_off + '%' }),
            h('td', { text: rupees(Math.round(d.price_inr * (100 - c.percent_off)) / 100) }),
            h('td', { text: String(c.used) }),
            h('td', {}, [h('span', { class: 'pill s-' + (c.active ? 'active' : 'cancelled'), text: c.active ? 'On' : 'Off' })]),
            h('td', {}, [h('button', { class: 'btn ghost small', type: 'button', text: c.active ? 'Switch off' : 'Switch on', onclick: function () {
              api('POST', 'admin/coupons', { code: c.code, percent_off: c.percent_off, active: !c.active }).then(loadCoupons, fail);
            } })]),
          ]));
        });
      }, fail);
    }
    var couponForm = document.getElementById('coupon-form');
    couponForm.addEventListener('submit', function (ev) {
      ev.preventDefault();
      showError(couponForm, null);
      var v = values(couponForm);
      busy(couponForm, true);
      api('POST', 'admin/coupons', { code: v.code, percent_off: Number(v.percent_off), active: true }).then(function () { busy(couponForm, false); couponForm.reset(); loadCoupons(); })
        .catch(function (err) { busy(couponForm, false); showError(couponForm, err); });
    });

    summary();
    loadUsers().then(loadBookings).then(loadEnrolments).then(loadCoupons);
  }

  SL.page = function (name) {
    ({ register: registerPage, login: loginPage, account: accountPage, admin: adminPage, learn: learnPage }[name] || function () {})();
  };
})();
