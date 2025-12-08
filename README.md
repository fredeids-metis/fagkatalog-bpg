# Fagkatalog

Interaktiv fagkatalog for videregående skole. Viser alle programfag med beskrivelser, bilder og video.

## Innbygging (anbefalt)

Bruk den universelle embed-loaderen som henter alt dynamisk fra repoet:

```html
<div id="fagkatalog"></div>
<script src="https://fredeids-metis.github.io/fagkatalog-bpg/embed.js"></script>
```

**Fordeler:**
- Oppdateringer i repoet reflekteres automatisk
- Ingen behov for å endre innbyggingskoden ved endringer
- Cache-busting basert på dato

## Standalone

Åpne `index.html` direkte i nettleser for lokal testing.

## Datakilde

All fagdata hentes fra [school-data](https://github.com/fredeids-metis/school-data) API:

```
https://fredeids-metis.github.io/school-data/api/2025-01/skoler/bergen-private-gymnas/tilbud.json
```

## Filer

| Fil | Beskrivelse |
|-----|-------------|
| `embed.js` | **Universell embed-loader** - henter HTML/CSS/JS dynamisk |
| `index.html` | Standalone HTML med all markup |
| `app.js` | Hovedlogikk (filtrering, modal, API-kall) |
| `style.css` | Styling (scoped til #fagkatalog) |

## Filtrering

Filterknappene mapper API-kategorier til filterkategorier:

| Filter | API-kategorier |
|--------|----------------|
| Matematikk | `matematikk` |
| Realfag | `naturfag`, `teknologi` |
| Språk | `språk` |
| Samfunn/Økonomi | `samfunnsfag`, `økonomi`, `bedriftsledelse` |

## Fordypning (related)

"Fordypning med:"-badgen i modal viser fag som gir fordypning sammen:
- Standard: Fag med samme læreplan (f.eks. Biologi 1 og 2)
- Spesialtilfelle: POS-fagene (Politikk, Sosialkunnskap, Sosiologi) har ulike læreplaner men gir fordypning sammen per UDIR

## Lisens

MIT
