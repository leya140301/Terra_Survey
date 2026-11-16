# Umfrage „Study Terra“: Einrichtung (ca. 10 Minuten)

Die Umfrage läuft als **Google-Apps-Script-Web-App**. Das ist kostenlos und braucht nur ein Google-Konto.
Teilnehmende brauchen **kein** Konto und keinen Login. Alle Antworten landen automatisch in einer Google-Tabelle.

> **Wichtig:** Der Vorschau-Link aus dem Chat (claude.ai/artifact/…) dient nur zum Anschauen und speichert **keine** Antworten.
> Gespeichert wird erst, wenn ihr die Umfrage wie unten beschrieben bei Google einrichtet. Dann gibt es zwei Links:
> - **Umfrage-Link** für die Teilnehmenden: `…/exec`
> - **Auswertungs-Link** nur für euch: `…/exec?auswertung` (mit Passwort)

## 1. Tabelle anlegen
1. Auf <https://sheets.google.com> eine neue, leere Tabelle erstellen, z. B. „Study Terra – Umfrage“.
2. Im Menü **Erweiterungen → Apps Script** öffnen.

## 2. Code einfügen
1. Im Apps-Script-Editor den Inhalt von `Code.gs` vollständig durch den Inhalt der Datei **`Code.gs`** aus diesem Ordner ersetzen.
2. Links neben „Dateien“ auf **+ → HTML** klicken und die Datei **`index`** nennen (ohne `.html`, das wird automatisch ergänzt).
3. Den Inhalt vollständig durch den Inhalt der Datei **`index.html`** aus diesem Ordner ersetzen.
4. In `Code.gs` ganz oben bei `ADMIN_PASSWORD` ein eigenes Passwort für die Auswertung eintragen, z. B.
   `var ADMIN_PASSWORD = 'terra-team-2026';`
   Teilnehmende sehen diese Datei nicht.
5. Speichern (Strg/Cmd + S).

## 3. Einmal einrichten
1. Oben in der Funktionsauswahl **`setup`** auswählen und auf **Ausführen** klicken.
2. Google fragt nach Berechtigungen → mit dem eigenen Konto zulassen.
   (Bei „Google hat diese App nicht überprüft“: **Erweitert → Weiter zu … (unsicher)**. Das ist bei eigenen Skripten normal.)

## 4. Als Website veröffentlichen
1. Oben rechts **Bereitstellen → Neue Bereitstellung**.
2. Zahnrad → Typ **Web-App** wählen.
3. **Ausführen als:** *Ich*
4. **Zugriff:** *Jeder* (wichtig, sonst müssen sich Teilnehmende anmelden)
5. **Bereitstellen** → die angezeigte **Web-App-URL** (endet auf `/exec`) kopieren.

Diesen Link schickt ihr an die Teilnehmenden. Fertig.

> Hinweis: Google blendet oben einen kleinen Hinweis ein („Diese Anwendung wurde von einem Google Apps Script-Nutzer erstellt“). Das lässt sich bei kostenlosen Konten nicht ausblenden.
> Bei einem Schul- oder Firmenkonto (Google Workspace) kann „Jeder“ gesperrt sein. Dann ein privates Gmail-Konto verwenden.

## 5. Bild der App (Teil D) einfügen
In `index.html` ganz oben im Skript steht:

```js
var APP_IMAGE_URL = '';
```

Dort den Link zu einem öffentlich erreichbaren Bild eintragen (z. B. ein Bild auf eurer Website oder bei einem Bild-Hoster, der direkte Links auf `.png`/`.jpg` erlaubt).
Solange das Feld leer ist, zeigt die Umfrage einen Platzhalter.

**Nach jeder Änderung am Code:** Bereitstellen → **Bereitstellungen verwalten** → Stift-Symbol → Version **„Neue Version“** → Bereitstellen.
So bleibt der Link gleich und die Änderung ist live.

## 6. Auswerten

### Variante A: Auswertungsseite (am einfachsten)
Den Web-App-Link mit `?auswertung` am Ende öffnen, z. B.
`https://script.google.com/macros/s/ABC…/exec?auswertung`
und das Passwort eingeben. Ihr seht dann:
- wie viele Personen teilgenommen haben, aufgeteilt in Schüler/innen, Studierende und Eltern
- für jede Frage Balken mit Anzahl und Prozent, bei 1–5-Skalen den Durchschnitt
- alle Freitext-Antworten und „Anderes“-Angaben
- einen Filter nach Gruppe (z. B. nur Eltern)

Alle im Team, die das Passwort kennen, können diese Seite öffnen. Ein Google-Konto braucht ihr dafür nicht.

### Variante B: Google-Tabelle (Rohdaten)
Teilt die Tabelle über **Freigeben** mit euren Teammitgliedern, dann haben alle Zugriff auf die Rohdaten. In der Tabelle gibt es zwei Blätter:

- **Antworten**: eine Zeile pro ausgefüllter Umfrage. Jede Frage hat eine eigene Spalte. Bei Mehrfachauswahl sind die Antworten mit ` | ` getrennt. Freitext-Spalten sind mit `[Text]` markiert. Fragen, die jemand nicht gesehen hat (z. B. Eltern-Fragen bei Schüler/innen), bleiben leer.
- **Auswertung**: wird nach jeder neuen Antwort automatisch aktualisiert. Für jede Auswahl-Frage stehen dort die Anzahl je Antwort, der Anteil in Prozent und bei 1–5-Skalen der Durchschnitt. Manuell aktualisieren geht über das Menü **Study Terra → Auswertung aktualisieren**.

Tipps:
- Nach Gruppen filtern (z. B. nur Eltern): im Blatt „Antworten“ **Daten → Filter erstellen** und in Spalte „Q1 Wer bist du?“ filtern.
- Diagramme: Bereich im Blatt „Auswertung“ markieren → **Einfügen → Diagramm**.
- Export für Excel/SPSS: **Datei → Herunterladen → .xlsx / .csv**.
- Mitbesitzer: Die Tabelle über **Freigeben** mit dem restlichen Team teilen.

## So funktioniert die Verzweigung
| Antwort bei Frage 1 | Danach |
|---|---|
| **Elternteil** | sofort Teil F (Fragen 23–30), dann Ende |
| **Schüler/in** | Fragen 2–3 (nur Schulformen, keine Hochschulen), Teile B–D, dann Teil E passend zur Schule |
| **Student/in** | Fragen 2–3 (nur Uni/FH), Teile B–D, dann Teil E für Uni/FH (Fragen 20–22) |

Teil E: Mittelschule → Frage 17 · AHS/BHS → Fragen 18–19 · Uni/FH → Fragen 20–22 · „Anderes“ → Block für Schüler/innen bzw. Studierende je nach Rolle.

Die Umfrage gibt es auf Deutsch und Englisch (Umschalter oben rechts). In der Tabelle stehen die Antworten immer auf Deutsch, damit die Auswertung einheitlich bleibt. Die Spalte „Sprache“ zeigt, in welcher Sprache ausgefüllt wurde.
Die Umfrage ist anonym: Es werden keine Namen, E-Mail-Adressen oder IP-Adressen gespeichert. Ein angefangener Fragebogen bleibt im Browser der Person erhalten, falls sie die Seite versehentlich schließt.
