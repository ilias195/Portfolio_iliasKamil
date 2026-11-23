# Portfolio van Ilias Kamil

Een Nederlandstalig gameportfolio met projectpagina’s, speelbeelden en uitleg van de mechanics.

## Het portfolio aanpassen

| Onderdeel | Bestand of map |
| --- | --- |
| Projectnamen, samenvattingen en links | `src/projects.json` |
| Home, Over mij en favoriete games | `src/build.py` |
| Navigatie, Sfeermodus en projectkaarten | `src/layout.py` |
| Uitleg en code per mechanic | `src/mechanics/` |
| Vormgeving en interactie | `dist/assets/` |

Na een wijziging aan de bronbestanden maakt Python de HTML-pagina’s opnieuw. Voor een lokale preview voer je vanuit de projectmap deze twee opdrachten uit en open je `http://localhost:8000`.

```sh
python3 -B src/build.py
python3 -m http.server 8000 --directory dist
```

## Publiceren via Cloudflare

1. Open **Workers & Pages** in het Cloudflare-dashboard. Kies **Create application**, selecteer **GitHub** en geef de Cloudflare-app toegang tot `ilias195/Portfolio_iliasKamil`.
2. Selecteer die repository. Vul `portfolio-ilias-kamil` in als Worker-naam, kies de productiebranch `main` en laat de projectmap op de hoofdmap van de repository staan.
3. Vul bij **Build command** `python3 -B src/build.py` in en bij **Deploy command** `npx wrangler@4 deploy`. De build maakt de pagina’s opnieuw. Wrangler publiceert de bestanden uit `dist/`.
4. Kies **Save and Deploy**. Na de eerste geslaagde build kun je het portfolio openen via de getoonde `workers.dev`-link.

Na het koppelen publiceert Cloudflare wijzigingen die je naar de gekozen branch pusht. [Cloudflare-documentatie over GitHub](https://developers.cloudflare.com/workers/ci-cd/builds/git-integration/github-integration/)
