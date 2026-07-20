# CORS-Proxy für die Live-Preissuche (Cloudflare Worker)

Dieser Worker wird **separat** von der GitHub-Pages-App bei Cloudflare
deployed (kostenloser Tarif). Er wird nur für die Live-Preissuche bei
**manuell hinzugefügten Zutaten** benötigt — die 33 eingebauten Zutaten
funktionieren weiterhin über den täglichen GitHub-Actions-Sync, unabhängig
davon.

## Warum ein eigener Worker?

Open Food Facts und Open Prices unterstützen kein CORS für Anfragen direkt
aus dem Browser. Dieser Worker leitet Anfragen serverseitig weiter (dort
gibt es kein CORS-Problem) und fügt die passenden Header hinzu, bevor er
die Antwort an den Browser zurückgibt. Er speichert und verändert nichts.

## Einmalige Einrichtung (kostenlos, ca. 5 Minuten)

1. Kostenloses Konto anlegen: https://dash.cloudflare.com/sign-up
2. Im Dashboard: **Workers & Pages** → **Create** → **Create Worker**
3. Einen Namen vergeben (z. B. `konditor-proxy`) und **Deploy** klicken
4. Danach **Edit code** öffnen, den kompletten Inhalt von `worker.js` aus
   diesem Ordner einfügen (bestehenden Beispielcode ersetzen) und erneut
   **Deploy** klicken
5. Die resultierende URL kopieren, z. B.:
   `https://konditor-proxy.<dein-name>.workers.dev`
6. Diese URL in der App unter **Zutaten → Einstellungen → Proxy-URL**
   einfügen und speichern — fertig.

## Sicherheit

- Nur `GET`-Anfragen werden durchgelassen.
- Nur die zwei Domains `world.openfoodfacts.org` und
  `prices.openfoodfacts.org` können als Ziel erreicht werden — der Worker
  ist kein offener Proxy für beliebige Seiten.
- `Access-Control-Allow-Origin` ist auf die GitHub-Pages-Domain (und lokale
  Testserver) beschränkt.

## Kosten

Der kostenlose Cloudflare-Workers-Tarif erlaubt 100.000 Anfragen pro Tag —
für den privaten Gebrauch dieser App weit mehr als genug, dauerhaft
kostenlos ohne Kreditkarte.
