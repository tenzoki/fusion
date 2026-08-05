shared_of im Archive-Skill verliert unter zsh alle Shared-Stores, sobald ein Circle aktiv ist
---
`skills/archive/SKILL.md:48`:

```bash
shared_of() { for p in $1; do case "$p" in "${CIRCLE:-__no_active_circle__}"/*) continue ;; esac; printf '%s\n' "$p"; done; }
```

`for p in $1` setzt voraus, dass die Shell den Parameter in Wörter teilt. zsh tut das nicht. Die Schleife läuft also EINMAL über den ganzen Zwei-Pfad-String `"circles/<aktiv>/planning shared/planning"`, der als Ganzes auf `"$CIRCLE"/*` passt — der Rest samt Leerzeichen fällt unter das `*`. `continue` feuert, die Funktion gibt nichts aus.

Gemessen (Scratchpad, identischer Funktionsrumpf, echte Resolver-Werte dieses Circles):

    zsh  shared_of -> []
    bash shared_of -> [shared/planning]

Die Bash-Tool-Umgebung ist zsh (`ps -p $$ -o comm=` → `/bin/zsh`).

Folge: Mit aktivem Circle sind `SHARED_PLANS`, `SHARED_ISSUES`, `SHARED_DECISIONS`, `SHARED_REVIEWS` und `SHARED_HISTORY` alle leer. Tier 1–3 archivieren dann nur noch terminale Circles und überspringen jede geschlossene Datei im Shared-Store — still, ohne Fehlermeldung: der Vorschlag zeigt einfach 0 Treffer pro Bucket, was von „nichts zu archivieren" nicht zu unterscheiden ist. `/fusion:cleanup` Schritt 4 (`skills/cleanup/SKILL.md:115`) führt tier-1 autonom und ohne Gate aus und erbt den Defekt. Ohne aktiven Circle funktioniert es zufällig richtig — dann ist der Wert ein einziges Wort.
---
Schweregrad: Medium. Verifiziert (Messung oben). Befund des Skill-Workstreams (Analyst), von coderev unter zsh und bash nachgemessen. Kein Duplikat von 260731-2246 (empty-key-expansion): dieser Defekt schlägt auch bei korrekt eingesetzten Werten zu, weil die Wortteilung erst innerhalb der Funktion passiert. Fix-Richtung: die Zerlegung nicht der Shell überlassen — `set -- $1` mit explizitem IFS, eine `case`-Schleife über `${1%% *}`/`${1#* }`, oder die find-Form, die die Nachbar-Snippets bereits nutzen. Wert wäre außerdem eine Nicht-leer-Prüfung: ein leerer Shared-Store bei aktivem Circle ist nie ein legitimes Ergebnis und sollte melden statt schweigen.
