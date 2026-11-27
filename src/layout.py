from html import escape
import json
from pathlib import Path


GLYPHS = {
    'sliders': 'f1de', 'folder': 'f07c', 'mail': 'f0e0', 'grid': 'f009',
    'pin': 'f3c5', 'camera': 'f030', 'close': 'f00d', 'menu': 'f0c9',
    'check': 'f00c', 'file': 'f15c', 'code': 'f121', 'game': 'f11b',
    'person': 'f508', 'book': 'f02d', 'git': 'f09b', 'in': 'f08c',
    'eye': 'f06e', 'snow': 'f2dc', 'film': 'f008', 'sound': 'f028',
    'play': 'f04b', 'image': 'f03e', 'adjust': 'f042', 'forest': 'f1bb',
    'road': 'f018', 'light': 'f0eb', 'route': 'f4d7', 'list': 'f03a',
}


def icon(name):
    kind = 'brand-symbol' if name in ('git', 'in') else 'symbol'
    return f'<span class="{kind}" aria-hidden="true">&#x{GLYPHS[name]};</span>'


def lamp_button(scene_id):
    return f'''<button class="lamp-control" type="button" data-lamp-control aria-label="Veldlamp" aria-controls="{scene_id}" aria-pressed="true" hidden>{icon('light')} Veldlamp <span data-lamp-state>Aan</span></button>'''


def header(active):
    links = [('Home', 'index.html'), ('Over mij', 'about.html'), ('Projecten', 'myprojects.html'), ('Contact', '#contact')]
    nav = '\n'.join(f'<a href="{url}"'+(' aria-current="page"' if label == active else '')+f'>{label}</a>' for label, url in links)
    return f'''<a class="skip" href="#inhoud">Naar de inhoud</a>
<header class="mast"><div class="mast-inner">
  <a class="identity" href="index.html" aria-label="Ilias Kamil, home"><span class="monogram" aria-hidden="true">IK</span><span class="identity-name">ILIAS KAMIL</span></a>
  <div class="power" role="meter" aria-label="Camerabatterij bij het scrollen" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" title="De camerabatterij loopt leeg tijdens het scrollen"><span class="battery" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i></span><span class="power-value" aria-hidden="true">100%</span></div>
  <nav class="site-nav" id="navigatie" aria-label="Hoofdnavigatie">{nav}</nav>
  <button class="scene-trigger" type="button" aria-haspopup="dialog" aria-controls="sfeerkeuze" data-scene-open>{icon('sliders')}<span>Sfeermodus</span></button>
  <button class="menu-trigger" type="button" aria-expanded="false" aria-controls="navigatie" aria-label="Menu openen">{icon('menu')}</button>
</div></header>'''


def footer():
    return f'''<footer id="contact" class="footer"><div class="wrap footer-inner"><div><p class="eyebrow"><span class="rule"></span>Contact</p><h2>Neem contact op<span class="accent-dot">.</span></h2><a class="email-link" href="mailto:iliask195@gmail.com">{icon('mail')} iliask195@gmail.com</a></div><div class="socials"><a href="https://github.com/ilias195" target="_blank" rel="noopener">{icon('git')} GitHub</a><a href="https://www.linkedin.com/in/ilias-kamil-03182b383/" target="_blank" rel="noopener">{icon('in')} LinkedIn</a><a href="Img/CV_Ilias_Kamil_Word.pdf" target="_blank" rel="noopener">{icon('file')} Mijn cv</a></div></div><div class="wrap footer-base"><span>Ilias Kamil · Game developer</span><span>{icon('pin')} Amsterdam, NL</span></div></footer>'''


def scene_dialog(home):
    target = '#wintermist' if home else 'index.html#wintermist'
    return f'''<dialog class="scene-dialog" id="sfeerkeuze" aria-labelledby="sfeer-titel">
      <div class="dialog-inner">
        <div class="dialog-top"><div>{label('Wintermist')}<h2 id="sfeer-titel">Sfeermodus<span class="accent-dot">.</span></h2></div>
          <button class="dialog-close" type="button" aria-label="Sfeermodus sluiten" data-scene-close>{icon('close')}</button></div>
        <div class="style-row"><h3>Kleuraccent</h3><span class="style-sample"><img src="assets/paletten/ijsblauw.png" alt="" width="54" height="12">IJsblauw</span></div>
        <div class="style-row"><div><h3>Veldlamp</h3><p>Schijn op het sneeuwpad naar de hut. De veldlamp is geïnspireerd op Metro Awakening.</p></div>{lamp_button('lamp-proef')}</div>
        <div class="lamp-preview lamp-on" id="lamp-proef" role="img" aria-label="Een besneeuwd pad naar een berghut in de wintermist" data-lamp-scene><span class="lamp-light" aria-hidden="true"></span></div>
        <div class="dialog-foot"><a href="{target}" data-view-lamp>Bekijk het sneeuwpad</a></div>
      </div></dialog>'''


def page(title, description, active, main, css=(), bodyclass=''):
    version = json.loads((Path(__file__).resolve().parent.parent / 'dist/preview-state.json').read_text())['version']
    styles = ''.join(f'<link rel="stylesheet" href="assets/{sheet}?v={version}">' for sheet in css)
    motion = '' if 'mechanics-view' in bodyclass.split() else (
        f'<link rel="stylesheet" href="assets/motion.css?v={version}">'
        f'<script src="assets/motion.js?v={version}" defer></script>'
    )
    return f'''<!doctype html>
<html lang="nl" data-scene="wintermist" data-palette="ijsblauw"><head>
<meta charset="utf-8"><meta name="portfolio-versie" content="{version}"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#11171d"><meta name="description" content="{escape(description, quote=True)}"><title>{escape(title)} · Ilias Kamil</title>
<link rel="icon" type="image/png" href="assets/ik.png"><link rel="preload" href="assets/fonts/display.woff" as="font" type="font/woff" crossorigin><link rel="stylesheet" href="assets/site.css?v={version}">{styles}<script src="assets/site.js?v={version}" defer></script>{motion}<script src="meekijken.js" defer></script></head>
<body class="{bodyclass}">{header(active)}<main id="inhoud" tabindex="-1">{main}</main>{footer()}{scene_dialog(active == "Home")}</body></html>'''


def label(text):
    return f'<p class="eyebrow"><span class="rule"></span>{text}</p>'


def photo(src='Img/ilias-foto.webp', caption='Ilias Kamil', alt='Ilias Kamil in een zwart pak met een wit overhemd', variant=''):
    return f'''<figure class="instant {variant}"><div class="print-frame"><span class="tape" aria-hidden="true"></span><div class="photo-window"><img src="{src}" alt="{alt}" fetchpriority="high"></div><figcaption><span>{caption}</span><span class="photo-cross" aria-hidden="true">×</span></figcaption></div></figure>'''


def card(project):
    return f'''<article class="project-card" data-group="{project['group']}"><a class="card-link" href="{project['id']}.html"><div class="card-photo"><img src="{project['image']}" alt="{escape(project['imageAlt'], quote=True)}" loading="lazy"><span class="platform-tag">{project['tag']}</span></div><div class="card-copy"><p class="card-kind">{project['genre']}</p><h3>{escape(project['name'])}</h3><p class="card-description">{project['summary']}</p><div class="card-meta"><span>{project['role']}</span><span>{project['duration']}</span></div></div></a></article>'''
