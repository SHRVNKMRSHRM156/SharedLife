import os

EMAIL = "advocateshravansharma@gmail.com"

CTA = """
<section class="cta-band">
  <div class="wrap">
    <div>
      <h2>{h}</h2>
      <p>{p}</p>
    </div>
    <a class="btn gold" href="account.html#book">Book a free consultation</a>
  </div>
</section>"""

def cta(h="Start with one honest conversation", p="Book a free consultation. We'll understand where you are and suggest the right next step."):
    return CTA.format(h=h, p=p)

def hero(eyebrow, title, sub, tone=""):
    return f"""
<header class="page-hero {tone}">
  <span class="ring"></span><span class="ring two"></span>
  <div class="wrap">
    <p class="eyebrow rise">{eyebrow}</p>
    <h1 class="rise d1">{title}</h1>
    <p class="sub rise d2">{sub}</p>
  </div>
</header>"""

PAGES = {}

# ---------------- HOME ----------------
PAGES["index"] = ("SharedLife", "Counselling, courses and Pre-Nuptial Agreements for couples about to marry and couples already married.", f"""
<header class="hero">
  <span class="blob a"></span><span class="blob b"></span><span class="blob c"></span>
  <div class="wrap">
    <div>
      <p class="eyebrow rise">Counselling · Courses · Pre-Nuptial Agreements</p>
      <h1 class="rise d1">Designing a <em>Shared</em> Life</h1>
      <p class="rotator rise d2">For couples <b id="rotate" data-words='["about to marry", "newly married", "building a family", "facing a big change", "planning their future"]'>about to marry</b></p>
      <p class="lede rise d2">We help you talk through what matters, understand each other's expectations, and put your shared plan in writing.</p>
      <div class="ctas rise d3">
        <a class="btn" href="account.html#book">Book a free consultation</a>
        <a class="btn ghost" href="#services">Explore our services</a>
      </div>
      <p class="reassure rise d3"><span>Private and confidential</span><span>Experienced counsellors</span><span>Agreements drafted with advocates</span></p>
    </div>
    <div class="logo-plate"><img src="img/logo.png" alt="SharedLife logo: two cranes bowing towards each other above a heart woven with an infinity knot. Courses, Counselling, Agreements."></div>
  </div>
</header>

<div class="marquee" aria-hidden="true"><div class="track">
  <span>Money and savings</span><span>Careers and relocation</span><span>In-laws and family</span><span>Roles at home</span><span>Children</span><span>Handling conflict</span><span>Property and assets</span><span>Shared goals</span>
  <span>Money and savings</span><span>Careers and relocation</span><span>In-laws and family</span><span>Roles at home</span><span>Children</span><span>Handling conflict</span><span>Property and assets</span><span>Shared goals</span>
</div></div>

<section>
  <div class="wrap">
    <div class="head center">
      <p class="eyebrow">Who we help</p>
      <h2 class="h2">Wherever you are in your journey together</h2>
    </div>
    <div class="grid-3">
      <a class="card top-terra" href="prenup.html">
        <span class="icon i-blush">1</span>
        <h3>About to marry</h3>
        <p>Settle money, careers, family and roles before the wedding, while the conversation is still easy.</p>
        <span class="go">Pre-marital counselling and prenups →</span>
      </a>
      <a class="card top-gold" href="course.html">
        <span class="icon i-gold">2</span>
        <h3>Newly married</h3>
        <p>Build habits for decisions and disagreements early, as two lives become one household.</p>
        <span class="go">Counselling and the course →</span>
      </a>
      <a class="card top-green" href="counselling.html">
        <span class="icon i-sage">3</span>
        <h3>Married and facing change</h3>
        <p>A new job, a move, a child or a strained patch. Work through it together, with guidance.</p>
        <span class="go">Marital counselling →</span>
      </a>
    </div>
  </div>
</section>

<section class="belief">
  <div class="wrap">
    <p class="eyebrow">Our philosophy</p>
    <p class="old">Find someone who will make you happy.</p>
    <p class="new">Bring your own happiness, and build a life where it is shared.</p>
    <p class="more">A strong marriage is not one partner keeping the other happy. It is two people who each own their happiness, and agree openly on what matters.</p>
    <a class="btn gold" href="about.html">Read our approach</a>
  </div>
</section>

<section id="services">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Our services</p>
      <h2 class="h2">Four ways we work with you</h2>
    </div>
    <div class="grid-2">
      <a class="card" href="counselling.html">
        <span class="for">Before and after marriage</span>
        <h3>Couples counselling</h3>
        <p>Pre-marital and marital counselling with experienced counsellors who share one approach.</p>
        <span class="go">Explore counselling →</span>
      </a>
      <a class="card dark" href="prenup.html">
        <span class="for">Before marriage</span>
        <h3>Pre-Nuptial Agreement</h3>
        <p>Your shared expectations, drafted with advocates, kept safely on record, and reviewed as life changes.</p>
        <span class="go">See what's included →</span>
      </a>
      <a class="card" href="course.html">
        <span class="for">For individuals and couples</span>
        <h3>The SharedLife Course</h3>
        <p>A self-paced online course for couples, from choosing each other to designing your shared life.</p>
        <span class="go">View the course →</span>
      </a>
      <a class="card" href="workshops.html">
        <span class="for">For groups and organisations</span>
        <h3>Workshops and talks</h3>
        <p>Sessions for couples, colleges and workplaces on communication, money, family and the law.</p>
        <span class="go">Invite us →</span>
      </a>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">How it works</p>
      <h2 class="h2">From first conversation to lasting support</h2>
    </div>
    <ol class="steps">
      <li><span class="n">1</span><h3>Free consultation</h3><p>Tell us where you are. We suggest the right service for you.</p></li>
      <li><span class="n">2</span><h3>Counselling</h3><p>Guided sessions on money, roles, family and conflict.</p></li>
      <li><span class="n">3</span><h3>Your agreement</h3><p>If you choose a prenup, an advocate drafts it and you both review it.</p></li>
      <li><span class="n">4</span><h3>Ongoing support</h3><p>Safekeeping, reviews at life events, and mediation if you need it.</p></li>
    </ol>
  </div>
</section>
{cta()}
""")

# ---------------- COUNSELLING ----------------
PAGES["counselling"] = ("Couples Counselling · SharedLife", "Pre-marital and marital counselling with SharedLife.", hero(
    "Couples counselling", "Talk it through, before it becomes a problem",
    "Pre-marital and marital counselling with experienced counsellors who share one approach: two people, each owning their happiness, building one life.") + f"""
<section>
  <div class="wrap">
    <div class="grid-2">
      <article class="card top-terra lift">
        <span class="for">Before the wedding</span>
        <h3>Pre-marital counselling</h3>
        <p>Guided conversations that bring hidden expectations into the open while they are still easy to discuss.</p>
        <ul>
          <li>Money, savings, debts and spending habits</li>
          <li>Careers, relocation and ambitions</li>
          <li>Roles at home and with both families</li>
          <li>Children and family planning</li>
          <li>How you will handle disagreements</li>
        </ul>
      </article>
      <article class="card top-green lift">
        <span class="for">After the wedding</span>
        <h3>Marital counselling</h3>
        <p>Support for married couples at any stage, whether things are going well or feel strained.</p>
        <ul>
          <li>Communication and recurring arguments</li>
          <li>Adjusting to a new home or joint family</li>
          <li>Becoming parents</li>
          <li>Career changes and financial pressure</li>
          <li>Rebuilding trust and closeness</li>
        </ul>
      </article>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap split">
    <div class="head" style="margin:0">
      <p class="eyebrow">How sessions work</p>
      <h2 class="h2">Simple to start, built around you</h2>
      <p class="lede">Start with a free consultation. We match you with a counsellor and agree a plan: single sessions, or a package for deeper work.</p>
    </div>
    <ul class="checklist">
      <li>Book per session, or as a package of sessions</li>
      <li>Every counsellor is qualified, experienced with couples, and trained in the SharedLife approach</li>
      <li>Everything you share stays confidential</li>
      <li>Two counselling sessions are included with every Pre-Nuptial Agreement</li>
    </ul>
  </div>
</section>
{cta("Ready to talk?", "Book a free consultation and we'll match you with the right counsellor.")}
""")

# ---------------- PRENUP ----------------
PAGES["prenup"] = ("Pre-Nuptial Agreement · SharedLife", "The SharedLife Pre-Nuptial Agreement: drafted with advocates, kept on record, reviewed as life changes.", hero(
    "Pre-Nuptial Agreement", "Agree before you marry, and keep that agreement alive",
    "A SharedLife Pre-Nuptial Agreement records what the two of you have decided together. It is drafted with advocates, reviewed by both of you, and revisited when your life changes.", "terra") + f"""
<section>
  <div class="wrap split">
    <div class="head" style="margin:0">
      <p class="eyebrow">Why a prenup</p>
      <h2 class="h2">The conversation is the real gift</h2>
      <p class="lede">A prenup is not a sign of mistrust. It is two people deciding, calmly and in advance, how they will handle the big questions of married life.</p>
    </div>
    <div class="flex-col" style="display:flex;flex-direction:column;gap:18px">
      <p class="eyebrow" style="color:var(--muted)">What your agreement can cover</p>
      <div class="pills alt">
        <span>Money and savings</span><span>Property and assets</span><span>Careers and relocation</span><span>Roles at home</span><span>Family and in-laws</span><span>Children</span><span>Resolving disagreements</span><span>Reviewing the agreement</span>
      </div>
    </div>
  </div>
</section>

<section class="dark-band">
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Our three-part method</p>
      <h2 class="h2">More than a document</h2>
    </div>
    <div class="phases">
      <div class="phase"><span class="k">Design &amp; Draft</span><h3>Agree on the terms</h3><p>Guided counselling turns your expectations into clear terms, which an advocate drafts into your agreement.</p></div>
      <div class="phase"><span class="k">Custody &amp; Monitor</span><h3>Keep it current</h3><p>We hold the record securely and prompt a review at life events: a new job, a home, a child.</p></div>
      <div class="phase"><span class="k">Trigger &amp; Resolve</span><h3>A calm way through</h3><p>If you disagree later, structured mediation comes first, before any courtroom.</p></div>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head">
      <p class="eyebrow">Pricing</p>
      <h2 class="h2">Clear, all-inclusive packages</h2>
    </div>
    <div class="tiers">
      <div class="tier pop">
        <span class="badge">Most couples</span>
        <span class="name">Standard</span>
        <span class="price">Rs 24,999</span>
        <ul><li>Two guided counselling sessions</li><li>Drafting with an advocate</li><li>Stamp paper and notarisation</li><li>Secure safekeeping and review reminders</li></ul>
        <a class="btn" href="account.html#book">Get started</a>
      </div>
      <div class="tier">
        <span class="name">Premium</span>
        <span class="price">Rs 44,999</span>
        <ul><li>Everything in Standard</li><li>For couples with Rs 1 crore or more in assets, or business property</li></ul>
        <a class="btn ghost" href="contact.html">Talk to us</a>
      </div>
    </div>
    <p class="fine">Prices include GST.</p>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head"><p class="eyebrow">Common questions</p><h2 class="h2">About prenups in India</h2></div>
    <div class="faq">
      <details open><summary>Are Pre-Nuptial Agreements valid in India?</summary><p>India has no specific law on prenups, except in Goa, where they are part of the civil code. Elsewhere, a well-drafted agreement is a clear written record of what both partners agreed, freely and in advance. We draft every agreement with advocates so that it is clear, fair to both of you, and properly executed.</p></details>
      <details><summary>Does asking for a prenup mean we don't trust each other?</summary><p>No. It means you are talking openly about the things couples usually avoid until they become problems. Settling these questions early lets you start married life on the same page.</p></details>
      <details><summary>How long does it take?</summary><p>It depends on how much you want to cover. We agree a timeline with you at the free consultation, well ahead of your wedding date.</p></details>
    </div>
  </div>
</section>
{cta("Start your agreement", "Book a free consultation to talk through what you'd like your agreement to cover.")}
""")

# ---------------- COURSE ----------------
def _course_outline():
    """Module and lesson titles come from the lesson file the API serves, so the page and the course never drift apart."""
    import json, subprocess
    root = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))
    js = "import { outline } from './lib/course.js'; process.stdout.write(JSON.stringify(outline()));"
    out = subprocess.run(["node", "--input-type=module", "-e", js], cwd=root, capture_output=True, text=True, check=True)
    return json.loads(out.stdout)

COURSE = _course_outline()
COURSE_HOURS = round(COURSE["minutes"] / 60)
COURSE_PRICE = f"₹{COURSE['price_inr']:,}"

def _curriculum():
    rows = []
    for m in COURSE["modules"]:
        lessons = "".join(
            f'<li><span>{l["title"]["en"]}</span><small lang="hi">{l["title"]["hi"]}</small><small>{l["minutes"]} min{" · free preview" if l["preview"] else ""}</small></li>'
            for l in m["lessons"])
        rows.append(f'<details{" open" if m["n"] == 1 else ""}><summary><b>Module {m["n"]}</b> {m["title"]["en"]}</summary>'
                    f'<p>{m["blurb"]["en"]}</p><ol class="lessons" start="{m["lessons"][0]["id"]}">{lessons}</ol></details>')
    return "\n        ".join(rows)

PAGES["course"] = ("The SharedLife Course", f"A self-paced online course in English and Hindi for couples about to marry or newly married: {len(COURSE['modules'])} modules, {COURSE['lesson_count']} lessons, ending with your own Shared Life Plan.", hero(
    "The SharedLife Course", "Learn the skills of a lasting marriage",
    f"A self-paced online course for couples about to marry or newly married, in English and Hindi. {COURSE['lesson_count']} lessons full of real-life stories and exercises you do together, ending with your own Shared Life Plan.", "gold") + f"""
<section>
  <div class="wrap split">
    <div style="display:flex;flex-direction:column;gap:28px">
      <div class="stats">
        <div><b data-count="{len(COURSE['modules'])}">{len(COURSE['modules'])}</b><span>modules</span></div>
        <div><b data-count="{COURSE['lesson_count']}">{COURSE['lesson_count']}</b><span>lessons</span></div>
        <div><b data-count="{COURSE_HOURS}" data-prefix="~">~{COURSE_HOURS}</b><span>hours, at your pace</span></div>
      </div>
      <p class="lede">Created by SharedLife's founder, a family-law scholar, with guidance from our mentor, an economist, so the course covers feelings, money and the law in one place. Every lesson is told through stories and examples from Indian homes, with illustrations, and you can switch between English and Hindi at any time.</p>
      <div class="tier pop price-card">
        <span class="badge">For both partners</span>
        <span class="name">The SharedLife Course</span>
        <span class="price">{COURSE_PRICE}</span>
        <ul>
          <li>All {COURSE['lesson_count']} lessons, open as soon as you enrol</li>
          <li>In English and हिंदी, switch any time</li>
          <li>Questions and exercises to do together after every lesson</li>
          <li>Your own Shared Life Plan by the end</li>
          <li>Progress saved in your SharedLife account</li>
          <li>One enrolment covers you both</li>
        </ul>
        <div class="row">
          <a class="btn" href="learn.html#enrol">Enrol now</a>
          <a class="btn ghost" href="learn.html?lesson=1">Try the first lesson free</a>
        </div>
      </div>
      <div class="card top-gold">
        <span class="for">Capstone</span>
        <h3>Your Shared Life Plan</h3>
        <p>In the final module, you write a plan for your own marriage in your own words: your vision, how you talk and repair, money, home and family, and how you will plan for life's turns.</p>
      </div>
    </div>
    <div class="curriculum">
      <h2 class="h3">What you will learn</h2>
      <div class="faq modules">
        {_curriculum()}
      </div>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head"><p class="eyebrow">Who it's for</p><h2 class="h2">Couples at the start of a shared life</h2></div>
    <div class="grid-3">
      <article class="card lift"><span class="icon i-blush">A</span><h3>About to marry</h3><p>Talk through expectations, money and family before the wedding, and arrive with a shared plan.</p></article>
      <article class="card lift"><span class="icon i-sage">B</span><h3>Newly married</h3><p>Settle into the first year together: new routines, new family and your first differences.</p></article>
      <article class="card lift"><span class="icon i-gold">C</span><h3>Learning on your own</h3><p>Partner busy or far away? The exercises work as personal reflection too.</p></article>
    </div>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head"><p class="eyebrow">Questions</p><h2 class="h2">About the course</h2></div>
    <div class="faq">
      <details><summary>Which languages is it in?</summary><p>English and Hindi. Switch between them with one tap on any lesson, so each partner can read in the language they prefer.</p></details>
      <details><summary>Do we both need to enrol?</summary><p>No. One enrolment covers a couple. Sit together and learn from one account, or share the account between you.</p></details>
      <details><summary>How do we pay?</summary><p>By UPI, card, net banking or bank transfer when you enrol. All lessons open as soon as your payment is confirmed.</p></details>
      <details><summary>Can we get a refund?</summary><p>Yes, within 7 days of enrolling if you have completed no more than 2 lessons. See our <a class="link" href="refunds.html">refund policy</a>.</p></details>
      <details><summary>How long does it take?</summary><p>About {COURSE_HOURS} hours in all. Most couples take one or two lessons a week, and each lesson ends with a short exercise to do together.</p></details>
      <details><summary>Can I take it on my own?</summary><p>Yes. Many lessons are about knowing yourself first, and the exercises work as personal reflection too.</p></details>
      <details><summary>Is the law module legal advice?</summary><p>No. It explains how marriage law and Pre-Nuptial Agreements work in India in general terms. For advice on your situation, book a consultation and we will connect you with an independent advocate.</p></details>
      <details><summary>Can we talk to someone as we go?</summary><p>Yes. You can book counselling or a consultation from your account at any point in the course.</p></details>
    </div>
  </div>
</section>
{cta("Start with the first lesson, free", "Read the opening lesson on sharing happiness, then enrol when you are ready.").replace('href="account.html#book">Book a free consultation', 'href="learn.html?lesson=1">Try the first lesson')}
"""
)

# ---------------- WORKSHOPS ----------------
PAGES["workshops"] = ("Workshops and Talks · SharedLife", "SharedLife workshops and talks for couples, colleges and workplaces.", hero(
    "Workshops and talks", "Bring the conversation to your community",
    "Interactive sessions for couples, colleges and workplaces on communication, money, family and the law of marriage.") + f"""
<section>
  <div class="wrap">
    <div class="grid-3">
      <article class="card top-terra lift">
        <span class="for">For couples</span>
        <h3>Couples workshops</h3>
        <p>Small-group sessions where couples practise the conversations that matter, guided by our counsellors.</p>
      </article>
      <article class="card top-gold lift">
        <span class="for">For colleges</span>
        <h3>Talks and guest lectures</h3>
        <p>Talks for students on relationships, choosing a partner, and marriage and the law.</p>
      </article>
      <article class="card top-green lift">
        <span class="for">For workplaces</span>
        <h3>Employee wellbeing sessions</h3>
        <p>Sessions for HR wellness programmes on balancing two careers, money at home, and family life.</p>
      </article>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap split">
    <div class="head" style="margin:0">
      <p class="eyebrow">Popular topics</p>
      <h2 class="h2">Sessions we run</h2>
      <p class="lede">Each session can be shaped to your audience, from a one-hour talk to a half-day workshop. Panels can include family-law advocates and counsellors.</p>
    </div>
    <div class="pills alt">
      <span>Sharing happiness in marriage</span><span>The money talk before marriage</span><span>Two careers, one home</span><span>In-laws and boundaries</span><span>How to disagree well</span><span>Marriage and the law in India</span><span>Prenups, plainly explained</span>
    </div>
  </div>
</section>
{cta("Invite us to speak", "Tell us about your audience and the date you have in mind.")}
""")

# ---------------- ABOUT ----------------
PAGES["about"] = ("About Us · SharedLife", "The philosophy and people behind SharedLife.", hero(
    "About us", "Marriage is about sharing happiness",
    "SharedLife brings together family law, economics and counselling to help couples design marriages that last.") + f"""
<section class="belief">
  <div class="wrap">
    <p class="eyebrow">Our philosophy</p>
    <p class="old">Find someone who will make you happy.</p>
    <p class="new">Bring your own happiness, and build a life where it is shared.</p>
    <p class="more">When one partner is expected to keep the other happy, disappointment follows. We help two people each own their happiness, agree openly on money, roles, family and conflict, and write down what they decide.</p>
  </div>
</section>

<section>
  <div class="wrap">
    <div class="head"><p class="eyebrow">What we stand for</p><h2 class="h2">Our values</h2></div>
    <div class="grid-3">
      <article class="card lift"><span class="icon i-terra">⚖</span><h3>Fair to both</h3><p>Every conversation and every agreement is balanced. We work for the couple, not for one side.</p></article>
      <article class="card lift"><span class="icon i-gold">✦</span><h3>Confidential</h3><p>What you share with us stays with us. Your agreement is held securely.</p></article>
      <article class="card lift"><span class="icon i-sage">↻</span><h3>Built to last</h3><p>Marriages change, so our support continues: reviews at life events and mediation when needed.</p></article>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head"><p class="eyebrow">Founder &amp; Mentor</p><h2 class="h2">Family law and economics, in one team</h2></div>
    <div class="grid-2">
      <article class="card founder">
        <img src="img/shravan.jpg" alt="Shravan Kumar Sharma">
        <div>
          <span class="role">Founder</span>
          <h3>Shravan Kumar Sharma</h3>
          <p>Advocate and PhD Scholar at the School of Law, Bennett University.</p>
        </div>
      </article>
      <article class="card founder">
        <img src="img/sanjeev.jpg" alt="Prof. (Dr.) Sanjeev Kumar">
        <div>
          <span class="role">Mentor &amp; Advisor</span>
          <h3>Prof. (Dr.) Sanjeev Kumar</h3>
          <p>Professor, School of Liberal Arts, Bennett University. PhD in Economics, with postdoctoral training at Yale, where he later taught.</p>
        </div>
      </article>
    </div>
    <p class="lede" style="margin-top:28px">Our counselling is delivered by a panel of qualified counsellors trained in the SharedLife approach, and every agreement is drafted with experienced family-law advocates.</p>
  </div>
</section>
{cta()}
""")

# ---------------- CONTACT ----------------
PAGES["contact"] = ("Contact · SharedLife", "Book a free consultation with SharedLife.", hero(
    "Contact", "Book your free consultation",
    "Book online in two minutes, or write to us and we will reply to arrange a time.", "terra") + f"""
<section>
  <div class="wrap split">
    <div style="display:flex;flex-direction:column;gap:20px">
    <div class="mailbox">
      <span class="eyebrow">Book online</span>
      <p style="color:var(--ink-soft)">Create a free account, choose a service and a time that suits you. We confirm every booking personally.</p>
      <div class="row"><a class="btn" href="account.html#book">Book a consultation</a><a class="btn ghost" href="login.html">Log in</a></div>
    </div>
    <div class="mailbox" style="border-color:var(--line)">
      <span class="eyebrow">Email us</span>
      <span class="addr" id="addr">{EMAIL}</span>
      <div class="row">
        <button class="btn" id="copy" type="button">Copy address</button>
        <span class="ok" id="ok" role="status"></span>
      </div>
    </div>
    </div>
    <div style="display:flex;flex-direction:column;gap:18px">
      <h2 class="h2" style="font-size:28px">What to include in your email</h2>
      <ul class="checklist">
        <li>Your names, and whether you are engaged or married</li>
        <li>What you are interested in: counselling, a Pre-Nuptial Agreement, the course, or a workshop</li>
        <li>Your wedding date, if you are planning one</li>
        <li>A few times that suit you for a first call</li>
      </ul>
    </div>
  </div>
</section>

<section class="band">
  <div class="wrap">
    <div class="head"><p class="eyebrow">Questions couples ask</p><h2 class="h2">Frequently asked questions</h2></div>
    <div class="faq">
      <details><summary>Do we have to be having problems to come for counselling?</summary><p>Not at all. Counselling works best before problems appear. Pre-marital counselling is about understanding each other's expectations early.</p></details>
      <details><summary>We are already married. Can you help us?</summary><p>Yes. Our marital counselling, course and workshops are open to married couples at any stage.</p></details>
      <details><summary>Is everything we share kept confidential?</summary><p>Yes. What you share in counselling and the details of your agreement stay private between you and SharedLife.</p></details>
      <details><summary>Are Pre-Nuptial Agreements valid in India?</summary><p>India has no specific law on prenups, except in Goa, where they are part of the civil code. Elsewhere, a well-drafted agreement is a clear written record of what both partners agreed, freely and in advance. We draft every agreement with advocates so that it is clear, fair to both of you, and properly executed.</p></details>
      <details><summary>What happens in the free consultation?</summary><p>A short call where we understand your situation, answer your questions, and suggest the right next step. There is no obligation.</p></details>
    </div>
  </div>
</section>
""")

# ---------------- POLICIES ----------------
# Plain-language policies (needed by payment providers). Draft for Shravan to review before relying on them.
POLICY_UPDATED = "17 October 2026"

def policy(key, title, desc, intro, body):
    PAGES[key] = (f"{title} · SharedLife", desc, hero("Policies", title, intro) + f"""
<section>
  <div class="wrap narrow prose">
    <p class="note">Last updated {POLICY_UPDATED}</p>
    {body}
    <h2 class="h3">Contact</h2>
    <p>Questions about this policy: write to <a class="link" href="mailto:{EMAIL}">{EMAIL}</a> or use the <a class="link" href="contact.html">contact page</a>.</p>
  </div>
</section>
""")

policy("terms", "Terms of use", "The terms for using SharedLife's website, account, course and services.",
       "The terms for using this website, your SharedLife account, The SharedLife Course and our services.", f"""
    <h2 class="h3">About these terms</h2>
    <p>SharedLife (“we”, “us”) offers couples counselling, The SharedLife Course, workshops and help with Pre-Nuptial Agreements through www.sharedlife.in. By creating an account, booking a service or enrolling in the course, you agree to these terms.</p>
    <h2 class="h3">Your account</h2>
    <ul>
      <li>Give accurate details and keep your password private. You are responsible for activity on your account.</li>
      <li>You must be 18 or older to create an account.</li>
      <li>We may suspend an account that is misused, for example to harass others or to share course material publicly.</li>
    </ul>
    <h2 class="h3">The SharedLife Course</h2>
    <ul>
      <li>One enrolment is for one couple or individual, using one account. The price is shown on the <a class="link" href="course.html">course page</a> and at checkout, and includes applicable taxes.</li>
      <li>Delivery is online: all lessons open in your account as soon as your payment is confirmed. Nothing is shipped.</li>
      <li>Course material is for your personal use. Please do not copy, resell or publish it.</li>
      <li>Refunds are covered by our <a class="link" href="refunds.html">refund and cancellation policy</a>.</li>
    </ul>
    <h2 class="h3">Counselling, workshops and Pre-Nuptial Agreements</h2>
    <ul>
      <li>Bookings are requests until we confirm a time with you. Fees for each service are agreed with you before the service begins.</li>
      <li>Counselling is not a substitute for medical or psychiatric care. If you or someone else is in danger, contact emergency services (112) straight away.</li>
      <li>Pre-Nuptial Agreements are drafted by independent advocates. Course lessons and website content are general information, not legal advice.</li>
    </ul>
    <h2 class="h3">Payments</h2>
    <p>Online payments are processed by our payment partner (Razorpay). We do not see or store your card, UPI or bank details.</p>
    <h2 class="h3">Limits</h2>
    <p>We work hard to keep the website and course available and accurate, but cannot promise they will always be uninterrupted or error-free. To the extent the law allows, our liability for any claim is limited to the amount you paid us for the service concerned.</p>
    <h2 class="h3">Changes and governing law</h2>
    <p>We may update these terms and will show the date of the latest version on this page. These terms are governed by the laws of India, and courts in Delhi have jurisdiction.</p>
""")

policy("privacy", "Privacy policy", "How SharedLife collects, uses and looks after your personal information.",
       "What we collect, why we collect it, and how we look after it.", f"""
    <h2 class="h3">What we collect</h2>
    <ul>
      <li><b>Account details:</b> your name, email, mobile number and city, and anything optional you add, such as your partner's name or wedding date. For counsellors and advocates, professional details such as qualifications and registration numbers.</li>
      <li><b>Bookings and course activity:</b> the services you request, preferred times, notes you choose to share, your course enrolment and which lessons you have completed.</li>
      <li><b>Payments:</b> the amount, date and payment reference. Card, UPI and bank details are handled by our payment partner, Razorpay, and never reach us.</li>
    </ul>
    <h2 class="h3">How we use it</h2>
    <ul>
      <li>To run your account, confirm bookings, give you course access and contact you about the services you asked for.</li>
      <li>To match you with a counsellor or advocate on our panel, who sees only what they need for your session.</li>
      <li>We do not sell your information or use it for third-party advertising.</li>
    </ul>
    <h2 class="h3">Where it is kept</h2>
    <p>Your information is stored in a secure database hosted in Singapore by our hosting providers (Vercel and Neon). Passwords are stored only in encrypted (hashed) form.</p>
    <h2 class="h3">Your choices</h2>
    <ul>
      <li>You can update your optional details from your account page.</li>
      <li>You can ask us for a copy of your information, ask us to correct it, or ask us to delete your account by writing to us. We may keep payment records where the law requires.</li>
    </ul>
    <h2 class="h3">Cookies</h2>
    <p>We use one essential cookie to keep you logged in. We do not use advertising or tracking cookies.</p>
""")

policy("refunds", "Refund and cancellation policy", "Refunds and cancellations for The SharedLife Course and SharedLife services.",
       "How cancellations and refunds work for the course and our services.", f"""
    <h2 class="h3">The SharedLife Course</h2>
    <ul>
      <li>If the course is not right for you, ask for a full refund within <b>7 days</b> of enrolling, as long as you have completed no more than 2 lessons.</li>
      <li>After that, the course is non-refundable, because all lessons open as soon as you enrol.</li>
      <li>If you were charged twice or paid but your lessons did not open, write to us and we will fix it or refund the extra payment in full.</li>
    </ul>
    <h2 class="h3">Counselling and consultations</h2>
    <ul>
      <li>You can cancel a booking from your account at any time before it is confirmed, at no cost.</li>
      <li>For a paid, confirmed session, cancel at least 24 hours before for a full refund or a free reschedule.</li>
    </ul>
    <h2 class="h3">Pre-Nuptial Agreements and workshops</h2>
    <p>Fees and refund terms for Pre-Nuptial Agreements and workshops are agreed in writing before work begins.</p>
    <h2 class="h3">How refunds are paid</h2>
    <p>Approved refunds go back to the original payment method within 5 to 7 working days. Payments made by UPI or bank transfer are refunded to the same account.</p>
""")
