"""Account pages: register, login, account dashboard, admin. Their behaviour is in /app.js."""

APP_PAGES = {}

APP_PAGES["register"] = ("Create an account · SharedLife", "Create a SharedLife account as a couple, counsellor or advocate.", """
<section class="auth-wrap">
  <div class="wrap narrow">
    <div class="head">
      <p class="eyebrow">Create an account</p>
      <h1 class="h2">Join SharedLife</h1>
      <p class="lede">Already have an account? <a href="login.html" class="link">Log in</a></p>
    </div>
    <form id="register-form" class="form" novalidate>
      <fieldset class="role-pick">
        <legend>I am joining as</legend>
        <label class="role-card"><input type="radio" name="role" value="seeker" checked><span><b>A couple or individual</b><small>Seeking counselling, a prenup, the course or a workshop</small></span></label>
        <label class="role-card"><input type="radio" name="role" value="counsellor"><span><b>A marriage counsellor</b><small>Join our counselling panel</small></span></label>
        <label class="role-card"><input type="radio" name="role" value="advocate"><span><b>An advocate</b><small>Join our panel of family-law advocates</small></span></label>
      </fieldset>

      <div class="grid-2 fields">
        <label class="field"><span>Full name</span><input name="name" id="r-name" autocomplete="name" required></label>
        <label class="field"><span>Email</span><input name="email" id="r-email" type="email" autocomplete="email" required></label>
        <label class="field"><span>Mobile number</span><input name="phone" id="r-phone" type="tel" autocomplete="tel" inputmode="tel" placeholder="98765 43210" required></label>
        <label class="field"><span>City <em data-show-for="seeker">(optional)</em></span><input name="city" id="r-city" autocomplete="address-level2"></label>
        <label class="field"><span>Password</span><input name="password" id="r-password" type="password" autocomplete="new-password" minlength="8" required><small>At least 8 characters</small></label>
      </div>

      <div class="grid-2 fields" data-role="seeker">
        <label class="field"><span>Where are you in your journey?</span>
          <select name="relationship" id="r-relationship"><option value="about_to_marry">About to marry</option><option value="married">Married</option><option value="other">Something else</option></select></label>
        <label class="field"><span>Partner's name <em>(optional)</em></span><input name="partner_name" id="r-partner"></label>
        <label class="field"><span>Wedding date <em>(optional)</em></span><input name="wedding_date" id="r-wedding" type="date"></label>
      </div>

      <div class="grid-2 fields" data-role="counsellor" hidden>
        <label class="field"><span>Highest qualification</span><input name="qualification" id="r-qualification" placeholder="e.g. MA Clinical Psychology"></label>
        <label class="field"><span>Years of experience</span><input name="experience_years" id="r-exp-c" type="number" min="0" max="80"></label>
        <label class="field"><span>RCI or other registration no. <em>(optional)</em></span><input name="registration_no" id="r-reg"></label>
        <label class="field"><span>Languages <em>(optional)</em></span><input name="languages" id="r-lang-c" placeholder="Hindi, English"></label>
        <label class="field wide"><span>Areas of focus <em>(optional)</em></span><input name="specialisation" id="r-spec" placeholder="Pre-marital, couples therapy, family systems"></label>
      </div>

      <div class="grid-2 fields" data-role="advocate" hidden>
        <label class="field"><span>Bar Council enrolment number</span><input name="enrolment_no" id="r-enrol"></label>
        <label class="field"><span>State Bar Council</span><input name="bar_council" id="r-bar" placeholder="e.g. Bar Council of Delhi"></label>
        <label class="field"><span>Years of practice</span><input name="experience_years" id="r-exp-a" type="number" min="0" max="80"></label>
        <label class="field"><span>Languages <em>(optional)</em></span><input name="languages" id="r-lang-a" placeholder="Hindi, English"></label>
        <label class="field wide"><span>Practice areas <em>(optional)</em></span><input name="practice_areas" id="r-areas" placeholder="Family law, matrimonial disputes"></label>
      </div>

      <p class="note" data-show-for="counsellor advocate" hidden>We review every professional application before you join the panel. You can log in straight away and see your status.</p>

      <label class="check"><input type="checkbox" name="consent" id="r-consent"><span>I agree that SharedLife may store these details to provide its services and contact me. My information is kept confidential and never sold.</span></label>

      <p class="form-error" role="alert" hidden></p>
      <button class="btn" type="submit">Create account</button>
    </form>
  </div>
</section>""")

APP_PAGES["login"] = ("Log in · SharedLife", "Log in to your SharedLife account.", """
<section class="auth-wrap">
  <div class="wrap narrow">
    <div class="head">
      <p class="eyebrow">Welcome back</p>
      <h1 class="h2">Log in</h1>
      <p class="lede">New here? <a href="register.html" class="link">Create a free account</a></p>
    </div>
    <form id="login-form" class="form card" novalidate>
      <label class="field"><span>Email</span><input name="email" id="l-email" type="email" autocomplete="email" required></label>
      <label class="field"><span>Password</span><input name="password" id="l-password" type="password" autocomplete="current-password" required></label>
      <p class="form-error" role="alert" hidden></p>
      <button class="btn" type="submit">Log in</button>
      <p class="note">Forgot your password? Email us from the <a class="link" href="contact.html">contact page</a> and we will reset it.</p>
    </form>
  </div>
</section>""")

APP_PAGES["account"] = ("My account · SharedLife", "Your SharedLife bookings.", """
<section class="dash">
  <div class="wrap">
    <div class="dash-head">
      <div>
        <p class="eyebrow" id="acct-role">My account</p>
        <h1 class="h2" id="acct-hello">Loading your account…</h1>
      </div>
      <div class="row">
        <a class="btn ghost" href="admin.html" id="admin-link" hidden>Admin dashboard</a>
        <button class="btn ghost" type="button" id="logout">Log out</button>
      </div>
    </div>

    <div id="pro-status" class="banner" hidden></div>

    <div id="seeker-area" hidden>
      <div class="split">
        <form id="book-form" class="form card" novalidate>
          <h2 class="h3" id="book">Book an appointment</h2>
          <label class="field"><span>Service</span>
            <select name="service" id="b-service">
              <option value="consultation">Free first consultation</option>
              <option value="premarital">Pre-marital counselling</option>
              <option value="marital">Marital counselling</option>
              <option value="prenup">Pre-Nuptial Agreement</option>
              <option value="course">The SharedLife Course</option>
              <option value="workshop">Workshop or talk</option>
            </select></label>
          <div class="grid-2">
            <label class="field"><span>Preferred date</span><input type="date" name="preferred_date" id="b-date" required></label>
            <label class="field"><span>Time of day</span>
              <select name="preferred_slot" id="b-slot"><option value="morning">Morning (10am to 1pm)</option><option value="afternoon">Afternoon (1pm to 5pm)</option><option value="evening">Evening (5pm to 8pm)</option></select></label>
          </div>
          <fieldset class="seg"><legend>How would you like to meet?</legend>
            <label><input type="radio" name="mode" value="online" checked><span>Online</span></label>
            <label><input type="radio" name="mode" value="in_person"><span>In person</span></label>
          </fieldset>
          <label class="field"><span>Partner's name <em>(optional)</em></span><input name="partner_name" id="b-partner"></label>
          <label class="field"><span>Anything we should know? <em>(optional)</em></span><textarea name="notes" id="b-notes" rows="3" maxlength="2000"></textarea></label>
          <p class="form-error" role="alert" hidden></p>
          <p class="form-ok" role="status" hidden></p>
          <button class="btn" type="submit">Request booking</button>
          <p class="note">We confirm the exact time with you by phone or email.</p>
        </form>
        <div>
          <h2 class="h3">My bookings</h2>
          <div id="my-bookings" class="list"><p class="empty">No bookings yet. Your requests will appear here.</p></div>
        </div>
      </div>
    </div>

    <div id="pro-area" hidden>
      <h2 class="h3">Sessions assigned to you</h2>
      <div id="pro-bookings" class="list"><p class="empty">No sessions assigned yet. When we assign a client to you, the details appear here.</p></div>
    </div>
  </div>
</section>""")

APP_PAGES["admin"] = ("Admin · SharedLife", "SharedLife admin dashboard.", """
<section class="dash">
  <div class="wrap">
    <div class="dash-head">
      <div>
        <p class="eyebrow">Admin</p>
        <h1 class="h2">SharedLife dashboard</h1>
      </div>
      <div class="row">
        <a class="btn ghost" href="/api/admin/export?type=users">Download registrations (CSV)</a>
        <a class="btn ghost" href="/api/admin/export?type=bookings">Download bookings (CSV)</a>
      </div>
    </div>
    <p class="form-error" id="admin-error" role="alert" hidden></p>

    <div class="tiles" id="tiles">
      <div class="tile"><b id="t-seekers">–</b><span>Clients</span></div>
      <div class="tile"><b id="t-counsellors">–</b><span>Counsellors</span></div>
      <div class="tile"><b id="t-advocates">–</b><span>Advocates</span></div>
      <div class="tile warn"><b id="t-pending">–</b><span>Awaiting approval</span></div>
      <div class="tile"><b id="t-requested">–</b><span>Bookings to confirm</span></div>
      <div class="tile"><b id="t-week">–</b><span>New sign-ups this week</span></div>
      <div class="tile"><b id="t-week-b">–</b><span>New bookings this week</span></div>
    </div>

    <div class="tabs" role="tablist">
      <button role="tab" aria-selected="true" data-tab="bookings">Bookings</button>
      <button role="tab" aria-selected="false" data-tab="users">Registrations</button>
    </div>

    <div data-panel="bookings">
      <div class="filters">
        <label class="field inline"><span>Status</span><select id="f-bstatus"><option value="">All</option><option value="requested">Requested</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
        <label class="field inline"><span>Search</span><input id="f-bsearch" placeholder="Name, email or phone"></label>
      </div>
      <div class="table-wrap"><table class="data" id="bookings-table">
        <thead><tr><th>#</th><th>Client</th><th>Service</th><th>Preferred</th><th>Status</th><th>Assigned to</th><th>Scheduled</th><th></th></tr></thead>
        <tbody><tr><td colspan="8" class="empty">Loading…</td></tr></tbody>
      </table></div>
    </div>

    <div data-panel="users" hidden>
      <div class="filters">
        <label class="field inline"><span>Type</span><select id="f-role"><option value="">All</option><option value="seeker">Clients</option><option value="counsellor">Counsellors</option><option value="advocate">Advocates</option></select></label>
        <label class="field inline"><span>Status</span><select id="f-ustatus"><option value="">All</option><option value="pending">Awaiting approval</option><option value="approved">Approved</option><option value="active">Active</option><option value="rejected">Rejected</option><option value="suspended">Suspended</option></select></label>
        <label class="field inline"><span>Search</span><input id="f-usearch" placeholder="Name, email or phone"></label>
      </div>
      <div class="table-wrap"><table class="data" id="users-table">
        <thead><tr><th>Name</th><th>Type</th><th>Contact</th><th>Details</th><th>Joined</th><th>Status</th><th></th></tr></thead>
        <tbody><tr><td colspan="7" class="empty">Loading…</td></tr></tbody>
      </table></div>
    </div>
  </div>
</section>

<dialog id="booking-dialog" class="dialog">
  <form method="dialog" id="booking-edit" class="form">
    <h2 class="h3">Booking <span id="bd-id"></span></h2>
    <div id="bd-summary" class="summary"></div>
    <div class="grid-2">
      <label class="field"><span>Status</span><select id="bd-status"><option value="requested">Requested</option><option value="confirmed">Confirmed</option><option value="completed">Completed</option><option value="cancelled">Cancelled</option></select></label>
      <label class="field"><span>Scheduled date and time</span><input type="datetime-local" id="bd-when"></label>
    </div>
    <label class="field"><span>Assign to</span><select id="bd-assign"><option value="">Not assigned</option></select></label>
    <label class="field"><span>Internal note</span><textarea id="bd-note" rows="3" maxlength="2000"></textarea></label>
    <p class="form-error" role="alert" hidden></p>
    <div class="row"><button class="btn" value="save" id="bd-save">Save</button><button class="btn ghost" value="cancel" formnovalidate>Close</button></div>
  </form>
</dialog>""")
