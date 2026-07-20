# Konditor-Rechner / Калькулятор кондитера

Web-App für Konditoren: Zutatenmengen eingeben, Kosten automatisch berechnen.
Zweisprachig (Deutsch / Українська). Enthält eine Rezepte-Ablage für hochgeladene Dateien vom Handy.

## Funktionen

- **Zutaten & Mengen**: Menge pro Zutat eingeben (g/ml/Stück) → Kosten werden live berechnet.
- **Preise aktualisieren**: Button ruft echte, community-gemeldete Preise aus Deutschland über die
  [Open Food Facts – Open Prices API](https://prices.openfoodfacts.org/api/docs) ab (kostenlos, keine Anmeldung nötig).
  Wird für eine Zutat kein Preis gefunden, wird **nichts erfunden** — es erscheint "Kein Preis gefunden"
  und du kannst den Preis manuell eintragen (deutlich als „manuell" gekennzeichnet).
  Am Ende erscheint eine klare Statusmeldung: ✅ OK, ⚠️ teilweise OK oder ❌ NICHT OK.
- **Rezepte**: Foto/PDF/Dokument vom Handy hochladen, mit Name + Notiz speichern. Wird lokal im
  Browser (IndexedDB) gespeichert — keine Cloud, kein Server, keine Kosten.
- Alles läuft rein im Browser (kein Backend nötig) → kostenlos hostbar, z. B. via GitHub Pages, Netlify oder Cloudflare Pages (kostenlose Tarife).

## Lokal ausführen

Kein Build-Schritt nötig, reines HTML/CSS/JS:

```bash
python3 -m http.server 8080
# dann im Browser: http://localhost:8080
```

## Wichtiger Hinweis zur Preis-API

Die Preisabfrage läuft direkt aus dem Browser des Nutzers gegen `prices.openfoodfacts.org`.
In der Entwicklungs-Sandbox, in der diese App gebaut wurde, ist der Zugriff auf externe Domains
netzwerkseitig eingeschränkt, daher konnte der Live-Abruf hier nicht End-to-End gegen die echte
API getestet werden (nur der Fehlerfall/Timeout-Pfad wurde geprüft und funktioniert korrekt).
Im normalen Browser eines Nutzers sollte der Abruf funktionieren, da die API öffentlich und
kostenlos ist. Bitte nach dem Deployment einmal auf "Preise aktualisieren" klicken und prüfen,
ob reale Treffer kommen — je nach Zutat kann die Datenmenge in Open Food Facts variieren
(Community-Daten, keine Garantie auf 100 % Abdeckung aller Zutaten).

## Projektstruktur

```
index.html          Seitenstruktur, beide Tabs (Zutaten / Rezepte)
css/style.css        Responsives, mobilfreundliches Design
js/i18n.js           Übersetzungen DE/UK + Sprachumschaltung
js/ingredients.js     Zutatenliste (Name, Basis-Einheit, Suchbegriff für die Preis-API)
js/priceApi.js        Anbindung an Open Food Facts Open Prices (DE-Filter, Normalisierung, Cache)
js/recipes.js          IndexedDB-Speicher für hochgeladene Rezepte
js/app.js              UI-Logik: Tabelle rendern, Kosten berechnen, Formulare, Tabs, Sprache
```
