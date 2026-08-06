Im eigenen Repo laden alle Agenten die Regeln der installierten Vorversion, nicht die Quelle
---
Gemessen in dieser Session, im Plugin-Repo:

    FUSION_PLUGIN_ROOT=/Users/k1/.fusion
    ~/.fusion/.claude-plugin/plugin.json   → "version": "5.8.0"
    ./.claude-plugin/plugin.json           → "version": "5.9.1"

Jeder Agent führt in Setup Schritt 2 `"$FUSION_PLUGIN_ROOT/bin/fusion-rules" <self>` aus. Im Repo zeigt diese Variable auf die INSTALLIERTE Kopie (der `fusion`-Launcher setzt sie in `install.sh:152` fest auf `~/.fusion`). Also liest ein Agent, der die Regeln dieses Repos ändert, die Regeln einer anderen Version.

Die Differenz ist nicht klein — genau die fünf Shards dieses Circles fehlen der installierten Kopie vollständig:

    FEHLT: circle-records.md
    FEHLT: protected-path-internals.md
    FEHLT: rule-file-provenance.md
    FEHLT: workbench-path-resolution.md
    FEHLT: workbench-stash-and-lock.md

`wc -l` der Konventionsdatei: 698 (installiert, vor dem Sharding) gegen 449 (Quelle). Direktvergleich für `coder`:

    "$FUSION_PLUGIN_ROOT/bin/fusion-rules" coder            → 7 Regeln + chat-voice
    FUSION_PLUGIN_ROOT=<repo> bin/fusion-rules coder        → dieselben 7 + protected-path-internals.md

Der Guard-Interna-Shard, den dieser Circle für coder/coderev/bugfixer geschrieben hat, erreicht im Repo also keinen dieser Agenten. Auch mein eigenes coderev-Setup in dieser Session hat die 698-Zeilen-Version von 5.8.0 gelesen.
---
Schweregrad: High. Verifiziert (Kommandos und Ausgaben oben). Das ist der Mechanismus hinter der Frage „warum hat das niemand gemerkt": vier Tage Regelarbeit, und die Agenten, die sie ausführen sollten, haben sie nie zu Gesicht bekommen — jeder Shard, jede umgelenkte Zitatstelle, jede neue Konvention war für sie unsichtbar. Ein Agent, der eine Regel unter dem alten Stand liest und den neuen Stand editiert, produziert genau die Extraschleifen, die diesen Review ausgelöst haben.

`CLAUDE.md` dokumentiert den korrekten Entwicklungspfad (`claude --plugin-dir /path/to/this/repo`), aber nichts erzwingt oder meldet ihn, und der bequeme `fusion`-Launcher führt am Repo vorbei.

Fix-Richtung (Entscheidung nötig, daher Vorschläge statt Vorgabe): Die Maschinerie ist schon da — `hooks/lib/self-detect.ts` erkennt „cwd ist das fusion-Plugin-Repo". Am billigsten wäre eine Warnung: wenn Self-Detect zutrifft UND `FUSION_PLUGIN_ROOT` nicht auf dieses cwd zeigt, eine SessionStart-`systemMessage` („du entwickelst fusion, lädst aber Plugin-Version X aus ~/.fusion"). Radikaler und vielleicht richtiger: `bin/fusion-rules` und `bin/fusion-paths` bevorzugen die Repo-eigenen `rules/`, wenn sie im Plugin-Repo laufen. Zweitens sollte diese Prüfung Teil der Release-Prozedur in `CLAUDE.md` werden, denn sie ist wiederholbar und dauert eine Sekunde.

---
Korrektur (260806-0913, Circle 260805-2005-textschicht-gegen-code-nachziehen, per `_t_circle.md` „Die Korrektur am High-Befund"): Die Defekt-Behauptung dieses Befunds ist falsch. `FUSION_PLUGIN_ROOT` wird beim Session-Start aus dem installierten Plugin gesetzt — by design, kein Defekt. Die prüfende Sitzung lief vier Tage ohne Neustart und stand deshalb auf dem bei ihrem Start installierten Stand (v5.8.0); `fusion --update` plus Neustart löst das vollständig. Was vom Befund bleibt und real ist: das Stale-Rules-Fenster — im Plugin-Repo lasen Agenten Regeln einer anderen Version als der, die sie editierten. Dieser Rest ist als Entscheidung D3 getragen (`circles/260805-2005-textschicht-gegen-code-nachziehen/decisions/260806-0015_*_veraltete-regeln-im-eigenen-repo-melden-oder-umgehen.md`, Option (c)) und durch Plan-Schritt 16 realisiert: Commit c45fb44 — `bin/fusion-rules` und `bin/fusion-paths` bevorzugen im Plugin-Repo die Repo-eigenen `rules/` bzw. Prompts.

---
Resolved: Befundtext korrigiert (kein Defekt — Session-Start-Pinning by design); der reale Rest (Stale-Rules-Fenster) ist durch D3/Schritt 16 behoben, Commit c45fb44.
