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
  };

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
      if (!i.name || i.closest('[hidden]')) return;
      if (i.type === 'radio') { if (i.checked) out[i.name] = i.value; }
      else if (i.type === 'checkbox') out[i.name] = i.checked;
      else out[i.name] = i.value;
    });
    return out;
  }

  function nextUrl() {
    var m = /[?&]next=([a-z]+)/.exec(location.search);
    return m && m[1] === 'book' ? 'account.html#book' : 'account.html';
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
      if (u.role === 'seeker') seekerArea(); else proArea(u);
    }, function () { location.href = 'login.html' + (location.hash === '#book' ? '?next=book' : ''); });

    document.getElementById('logout').addEventListener('click', function () {
      api('POST', 'auth/logout', {}).then(function () { location.href = './'; });
    });
  }

  function seekerArea() {
    document.getElementById('seeker-area').hidden = false;
    var form = document.getElementById('book-form');
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

  // ---------- admin ----------
  function adminPage() {
    var errBox = document.getElementById('admin-error');
    var state = { bookings: [], users: [], pros: [] };
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

    summary();
    loadUsers().then(loadBookings);
  }

  SL.page = function (name) {
    ({ register: registerPage, login: loginPage, account: accountPage, admin: adminPage }[name] || function () {})();
  };
})();
