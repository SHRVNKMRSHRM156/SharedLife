"""Builds the static HTML pages of www.sharedlife.in into the repository root.

Run from anywhere:  python3 tools/site/build.py
Page content lives in pages.py (marketing pages) and app_pages.py (account, booking, admin).
styles.css, site.js, app.js and img/ at the repository root are edited by hand and are not touched here.
"""
import os, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from pages import PAGES
from app_pages import APP_PAGES

ROOT = os.path.abspath(os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", ".."))

NAV = [("index", "./", "Home"), ("counselling", "counselling.html", "Counselling"), ("prenup", "prenup.html", "Pre-Nuptial Agreement"),
       ("course", "course.html", "Course"), ("workshops", "workshops.html", "Workshops"), ("about", "about.html", "About")]

FONTS = ('<link rel="preconnect" href="https://fonts.googleapis.com">\n<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>\n'
         '<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&family=Nunito+Sans:wght@400;600;700;800&family=Noto+Sans+Devanagari:wght@400;600;700&family=Noto+Serif+Devanagari:wght@400&display=swap">\n'
         '<link rel="stylesheet" href="styles.css">\n<link rel="icon" href="img/logo.png">')


def header(key):
    if key == "learn":  # the lesson player sits under Course in the menu
        key = "course"
    items = "".join(f'<li><a href="{href}"{" aria-current=\"page\"" if k == key else ""}>{label}</a></li>' for k, href, label in NAV)
    acct = ' aria-current="page"' if key in ("login", "register", "account", "admin") else ""
    return f"""<nav class="nav" aria-label="Main">
  <div class="wrap">
    <a class="brand" href="./"><img src="img/logo.png" alt="">SharedLife</a>
    <ul class="menu">{items}<li class="m-only"><a href="contact.html"{" aria-current=\"page\"" if key == "contact" else ""}>Contact</a></li><li><a href="login.html" data-account-link{acct}>Log in</a></li></ul>
    <a class="btn cta" href="account.html#book">Book a consultation</a>
    <button class="toggle" type="button" aria-expanded="false">Menu</button>
  </div>
</nav>"""


FOOTER = """<footer>
  <div class="wrap">
    <div class="cols">
      <div style="display:flex;flex-direction:column;gap:12px">
        <a class="brand" href="./"><img src="img/logo.png" alt="">SharedLife</a>
        <p>Designing a Shared Life. Counselling, courses and Pre-Nuptial Agreements for couples.</p>
      </div>
      <div><h4>Services</h4><ul><li><a href="counselling.html">Couples counselling</a></li><li><a href="prenup.html">Pre-Nuptial Agreement</a></li><li><a href="course.html">The SharedLife Course</a></li><li><a href="workshops.html">Workshops and talks</a></li></ul></div>
      <div><h4>SharedLife</h4><ul><li><a href="about.html">About us</a></li><li><a href="contact.html">Contact</a></li><li><a href="contact.html">FAQ</a></li><li><a href="register.html">Join as a counsellor or advocate</a></li><li><a href="terms.html">Terms of use</a></li><li><a href="privacy.html">Privacy policy</a></li><li><a href="refunds.html">Refunds and cancellations</a></li></ul></div>
    </div>
    <p class="legal">Agreements are drafted by independent advocates. Information on this website is general and is not legal advice.</p>
  </div>
</footer>
<script src="site.js"></script>"""


def page(key, title, desc, main, extra_head="", scripts=""):
    return (f'<!doctype html>\n<html lang="en">\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n'
            f'<title>{title}</title>\n<meta name="description" content="{desc}">\n{extra_head}{FONTS}\n</head>\n<body>\n'
            f'{header(key)}\n<main>{main}\n</main>\n{FOOTER}\n{scripts}</body>\n</html>\n')


def main():
    for key, (title, desc, main) in PAGES.items():
        name = "index.html" if key == "index" else key + ".html"
        with open(os.path.join(ROOT, name), "w") as f:
            f.write(page(key, title, desc, main))
    for key, (title, desc, main) in APP_PAGES.items():
        with open(os.path.join(ROOT, key + ".html"), "w") as f:
            f.write(page(key, title, desc, main, extra_head='<meta name="robots" content="noindex">\n',
                         scripts=f'<script src="app.js"></script>\n<script>SL.page({key!r});</script>\n'))
    print("built", list(PAGES) + list(APP_PAGES))


if __name__ == "__main__":
    main()
