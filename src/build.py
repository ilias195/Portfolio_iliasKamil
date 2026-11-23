"""Build the portfolio's static pages. Run with python src/build.py."""
import json
from html import escape
from pathlib import Path
from layout import card, icon, label, lamp_button, page, photo

SRC = Path(__file__).resolve().parent
DIST = SRC.parent / 'dist'
PROJECTS = json.loads((SRC / 'projects.json').read_text())
STEPS = [
    ('Nu', 'Opleiding & stage', 'Ik volg de opleiding Game Development aan het Mediacollege Amsterdam. Mijn grootste interesse ligt bij C# en Unity. Tijdens mijn stage wil ik meer ervaring opdoen en leren hoe het werken binnen een gamebedrijf gaat.'),
    ('Na mijn stage', 'Gameplay bij Abbey Games', 'Na mijn stage wil ik solliciteren bij Abbey Games om mijn kennis van gameplay-programmeren te verbeteren en meer ervaring op te doen.'),
    ('Na 2–4 jaar ervaring', 'Doorgroeien naar Guerrilla Games', 'Na ongeveer twee tot vier jaar werkervaring wil ik solliciteren bij Guerrilla Games. Hier wil ik mezelf verder ontwikkelen als programmeur en ervaring opdoen binnen een grotere gamestudio.'),
    ('Mijn doel', 'Mijn eigen horrorstudio', 'Mijn uiteindelijke droom is om een eigen gamebedrijf te beginnen dat first-person survival-horrorgames maakt voor PlayStation, pc en VR. Tijdens mijn loopbaan wil ik alvast ideeën voor mijn eigen studio uitwerken.'),
]
INSPIRATION = [
    ('Outlast', 'outlast', 'De camera met een batterij die leeg kan raken, zorgt voor extra spanning. Ook vind ik het spannend dat je moet vluchten en je verstoppen.', 'https://redbarrelsgames.com/games/outlast/'),
    ('MADiSON', 'madison', 'De psychologische horror, spannende puzzels en onverwachte gebeurtenissen maken deze game voor mij bijzonder.', 'https://madisongame.com/'),
    ('Metro Awakening VR', 'metro-awakening', 'Door VR voelt het alsof je echt in de game zit. Vooral de donkere omgevingen en geluiden maken het spannend.', 'https://www.vertigo-games.com/games/metro-awakening/'),
    ('Until Dawn', 'until-dawn', 'Het verhaal en de keuzes die je maakt spreken mij aan. Elke beslissing kan gevolgen hebben voor de personages.', 'https://www.playstation.com/nl-nl/games/until-dawn/'),
    ('Little Hope', 'little-hope', 'De mysterieuze sfeer en het verhaal vind ik interessant. Vooral dat je langzaam ontdekt wat er aan de hand is.', 'https://www.thedarkpictures.com/games/little-hope'),
]


def homepage():
    featured = ''.join(card(project) for project in PROJECTS[:3])
    return f'''<section class="hero lamp-on" id="wintermist" data-lamp-scene aria-labelledby="hero-name"><div class="scene-backdrop" aria-hidden="true"></div><div class="lamp-light" aria-hidden="true"></div><div class="finder" aria-hidden="true"><i></i><i></i><i></i><i></i></div>
    <div class="hero-instruments top"><span class="rec" title="Cameravormgeving"><i></i> REC</span><span class="time" aria-hidden="true">TC <span data-clock>00:00:00</span></span></div>
    <div class="wrap hero-body"><div class="hero-copy">{label('Game developer')}<h1 id="hero-name" class="printed"><span>Ilias</span> <span>Kamil</span></h1><p class="hero-intro">Ik bouw games in Unity en C#. Mijn doel is een eigen horrorstudio voor PlayStation, pc en VR.</p><div class="actions"><a class="button primary" href="myprojects.html">{icon('folder')} Bekijk projecten</a><a class="button secondary" href="about.html">Over mij</a></div></div>
    <div class="hero-portrait">{photo()}</div></div>
    <div class="hero-instruments bottom"><a class="scroll-cue" href="#uitgelicht"><span class="mouse" aria-hidden="true"></span>Scroll om te verkennen</a><span class="camera-tools">{lamp_button('wintermist')}<span class="scene-readout"><span class="mode-icon" aria-hidden="true"></span>Wintermist</span></span></div></section>
    <section class="work wrap" id="uitgelicht" aria-labelledby="work-heading"><div class="section-head"><div>{label('Projectarchief')}<h2 id="work-heading">Geselecteerd werk<span class="accent-dot">.</span></h2></div><a class="archive-link" href="myprojects.html">{icon('grid')} Alle projecten <span>(5)</span></a></div><div class="project-grid">{featured}</div></section>
    <section class="route-preview"><div class="wrap route-inner"><div>{label('Over mij')}<h2>Naar mijn eigen<br><em>horrorstudio.</em></h2></div><div><p>Ik studeer Game Development in Amsterdam. Tussen mijn eerste Unity-project en een eigen studio liggen de stappen die ik wil zetten.</p><a class="text-link" href="about.html#route">{icon('route')} Bekijk mijn stappenplan</a></div></div></section>'''


def inspiration_card(name, slug, note, url):
    anchor = ' id="veldlamp"' if slug == 'metro-awakening' else ''
    return f'''<article{anchor}><a class="inspiration-card" href="{url}" target="_blank" rel="noopener">
      <div class="inspire-pic"><img src="assets/inspiratie/{slug}-cover.webp" loading="lazy" alt="Cover van {name}"></div>
      <h3>{name}</h3><p>{note}</p></a></article>'''


def about():
    milestones = ''.join(f'''<li id="halte-{i}"><span class="route-marker" aria-hidden="true"></span><div class="time-label">{stage}</div><div><h3>{title}</h3><p>{body}</p></div></li>''' for i, (stage, title, body) in enumerate(STEPS))
    games = ''.join(inspiration_card(*game) for game in INSPIRATION)
    return f'''<section class="bio-intro scene-surface"><div class="wrap bio-grid"><div>{label('Persoonlijk dossier')}<h1>Over mij<span class="accent-dot">.</span></h1><p class="lead">Ik ben Ilias Kamil, een 17-jarige game developer uit Amsterdam.</p><p>Als kind wilde ik weten hoe de games die ik speelde in elkaar zaten. Nu studeer ik Game Development aan het Mediacollege Amsterdam en leer ik hoe ik zelf games kan ontwikkelen.</p><p>Op school werk ik met UI, animatie en Shader Graph. Mijn grootste interesse ligt bij het programmeren in C# met Unity. Ik vind het vooral leuk om problemen op te lossen, nieuwe dingen te leren en te zien hoe mijn code uiteindelijk werkt in een game.</p><div class="bio-foot"><span>{icon('pin')} Amsterdam, NL</span><a href="Img/CV_Ilias_Kamil_Word.pdf" target="_blank" rel="noopener">{icon('file')} Bekijk mijn cv</a></div></div>{photo('Img/portfoliofoto2.webp', 'Ilias Kamil', 'Portret van Ilias in een zwart pak', 'cutout')}</div></section>
    <section class="wrap journey" id="route">{label('Mijn stappenplan')}<h2>Van opleiding naar<br><em>eigen horrorstudio.</em></h2><ol class="milestones">{milestones}</ol></section>
    <section class="inspiration" id="inspiratie"><div class="wrap">{label('Mijn inspiratie')}<h2>Games die mij inspireren<span class="accent-dot">.</span></h2><p class="section-intro">Wat ik zo leuk vind aan horrorgames, is dat ze je helemaal kunnen meenemen in hun wereld. Vooral de spanning, onverwachte momenten, geluiden en sterke verhalen spreken mij aan. Deze vijf games laten voor mij zien hoe je op verschillende manieren een spannende ervaring kunt maken.</p><div class="inspiration-grid">{games}</div></div></section>'''


def projects_index():
    buttons = ''.join(f'<button type="button" data-project-filter="{key}" aria-pressed="{str(key == "all").lower()}">{name} <span>{count}</span></button>' for key, name, count in [('all','Alle projecten',5),('solo','Solo',2),('team','Team',3)])
    return f'''<section class="archive-top scene-surface"><div class="wrap">{label('Projectarchief')}<h1>Mijn projecten<span class="accent-dot">.</span></h1><p class="lead">Van een VR-boog tot een gamejam in Kopenhagen.</p><p>Bekijk mijn games, speelbeelden en de code achter de mechanics.</p></div></section><section class="archive-list wrap" aria-label="Projectoverzicht"><div class="filter-row"><div class="filter-buttons" role="group" aria-label="Projecten filteren">{buttons}</div><span class="archive-count" role="status" data-project-count>5 projecten</span></div><div class="project-grid">{''.join(card(project) for project in PROJECTS)}</div></section>'''


def project_page(project):
    name = escape(project['name'])
    facts = [('Rol',project['role']),('Engine','Unity 6 · C#'),('Platform',project['platform']),('Duur',project['duration']),('Context',project['type']),('Periode',project['period'])]
    facts_html = ''.join(f'<div><dt>{key}</dt><dd>{value}</dd></div>' for key,value in facts)
    play = f'<a class="button secondary" target="_blank" rel="noopener" href="{project["play"]}">{icon("game")} Speel op itch.io</a>' if 'play' in project else ''
    if 'video' in project:
        media = f'<video controls playsinline preload="none" poster="{project["gameplay"]}" aria-label="Trailer van {name}"><source src="{project["video"]}" type="video/mp4"></video>'
        media_label = 'Trailer'
    else:
        media = f'<img src="{project["gameplay"]}" loading="lazy" alt="{escape(project["gameplayAlt"], quote=True)}">'
        media_label = 'Projectbeeld'
    team = '<figure class="team-photo"><img src="Img/TeamPhotoKopenHagen.webp" loading="lazy" alt="Ons team op de gamejam in Kopenhagen"><figcaption>Met mijn team tijdens de gamejam in Kopenhagen.</figcaption></figure>' if project['id'] == 'nirvana' else ''
    return f'''<section class="case-head"><div class="wrap"><a class="breadcrumb" href="myprojects.html">{icon('folder')} Projectarchief</a><div class="case-head-grid"><div>{label(project['genre'])}<h1>{name}<span class="accent-dot">.</span></h1><p class="lead">{project['summary']}</p><div class="actions"><a class="button primary" href="{project['info']}.html">{icon('code')} Mijn bijdrage</a>{play}</div></div><div class="case-cover"><img src="{project['image']}" alt="{escape(project['imageAlt'],quote=True)}"></div></div></div></section>
    <div class="wrap case-body"><aside><h2>Projectgegevens</h2><dl>{facts_html}</dl><a class="text-link" target="_blank" rel="noopener" href="{project['repo']}">{icon('git')} GitHub-repository</a></aside><div class="case-article">{label('Ontwikkeling')}<h2>Over het project<span class="accent-dot">.</span></h2><p>{project['story']}</p><div class="case-media"><span class="media-label">{icon('film' if 'video' in project else 'image')} {media_label}</span>{media}</div>{team}<h2>Mijn bijdrage<span class="accent-dot">.</span></h2><p>{project['contribution']}</p><div class="tags">{''.join(f'<span>{tag}</span>' for tag in project['mechanics'])}</div><a class="button secondary" href="{project['info']}.html">{icon('code')} Bekijk de mechanics</a></div></div>'''


def write(filename, html):
    (DIST / filename).write_text(html)


def build():
    write('index.html', page('Game developer', 'Het portfolio van Ilias Kamil. Gameprojecten in Unity en C# en mijn route naar een eigen horrorstudio.', 'Home', homepage(), bodyclass='home-page'))
    write('about.html', page('Over mij', 'Mijn opleiding, favoriete horrorgames en mijn stappen naar een eigen horrorstudio.', 'Over mij', about()))
    write('myprojects.html', page('Mijn projecten', 'Vijf projecten van Ilias Kamil, met gameplay, bijdragen en programmeerwerk.', 'Projecten', projects_index()))
    for project in PROJECTS:
        write(project['id'] + '.html', page(project['name'], project['summary'], 'Projecten', project_page(project)))
        contents = SRC / 'mechanics' / (project['info'] + '.html')
        if contents.exists():
            main = f'<div class="wrap technical"><a class="breadcrumb" href="{project["id"]}.html">{icon("folder")} {escape(project["name"])}</a>{contents.read_text()}</div>'
            write(project['info'] + '.html', page(project['name'] + ' · Mijn bijdrage', project['contribution'], 'Projecten', main, ['mechanics.css', 'mechanics-scenes.css'], bodyclass=f'mechanics-view {project["id"]}'))


if __name__ == '__main__':
    build()
