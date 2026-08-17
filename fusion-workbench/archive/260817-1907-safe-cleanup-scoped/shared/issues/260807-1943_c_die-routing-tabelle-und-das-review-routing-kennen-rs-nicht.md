Die Routing-Tabelle und das Review-Routing des Orchestrators kennen `.rs` nicht, obwohl coder, ontocoder und planner es führen

---

**Severity:** Medium
**Domain:** code
**Filed by:** consultant, gefunden beim Nachprüfen einer Meldung aus dem konsumierenden Projekt KRK
**Affects:** `agents/orchestrator.md:290` (Agent Routing Table), `agents/orchestrator.md:380` (Phase 2, Step 3c, Review-Routing)
**Cross-references:** `fusion-workbench/shared/issues/260807-1942_*_die-domaenenerkennung-entscheidet-vor-der-codezaehlung-und-erreicht-code-nie.md` — aus derselben Prüfung, der Befund zur gemeldeten Ursache

---

## Der Defekt

Vier Prompts führen dieselbe Liste der Codeendungen, und zwei davon sind kürzer als die anderen
zwei. Die vollständige Liste steht bei den Agenten, die den Code tatsächlich anfassen:

```
agents/coder.md:19        .go, .ts, .tsx, .py, .js, .rs, .java
agents/ontocoder.md:30    .go, .ts, .tsx, .py, .js, .rs, .java  (als "nicht meins")
agents/planner.md:31      .go, .ts, .tsx, .py, .js, .rs, .java, Makefile, package.json, go.mod
```

Beim Orchestrator fehlen `.rs` und `.java` an zwei Stellen:

```
agents/orchestrator.md:290
  | Task touches `.go`, `.ts`, `.tsx`, `.py`, `.js`, `Makefile`, `go.mod`,
    `package.json`, build scripts, test files | `coder` |

agents/orchestrator.md:380
  - Code files changed (`.go`, `.ts`, `.tsx`, `.py`, `.js`, build files)
    → emit `review_start`, invoke `coderev` …
```

Die Domänenerkennung in Zeile 123 desselben Prompts führt `.rs` dagegen. Innerhalb einer Datei
sagt die eine Liste, Rust sei Code, und zwei weitere Listen kennen es nicht.

## Die beiden Stellen wiegen verschieden schwer

**Zeile 290, Routing-Tabelle.** Hier gibt es einen Auffangsatz direkt unter der Tabelle
(`agents/orchestrator.md:302`): "When in doubt, prefer the agent whose primary domain matches
the file's role in the system, not just its extension." Eine Rust-Aufgabe trifft keine Zeile
der Tabelle, landet aber über diesen Satz und über `agents/planner.md:31` mit hoher
Wahrscheinlichkeit trotzdem beim `coder`. Der Schaden ist eine Unsicherheit im Urteil, kein
sicherer Fehlschlag.

**Zeile 380, Review-Routing.** Hier gibt es keinen Auffangsatz. Die Liste hat drei Zweige, und
der dritte lautet "No changes → skip review" (`agents/orchestrator.md:382`). Ein Turn, der
ausschließlich `.rs`-Dateien geändert hat, trifft weder den Codezweig noch den Ontologiezweig.
Was dann passiert, hängt vom Urteil des Modells im Lauf ab und ist nicht festgelegt: entweder
das Review entfällt still, oder es läuft trotzdem. Beides ist möglich, und genau das ist der
Defekt. Ein still entfallenes Review sieht in Dashboard und Sessionakte aus wie ein Turn ohne
Prüfbedarf.

## Reproduktion

```
# In einem Rust-Projekt mit fusion-Workbench einen Turn laufen lassen,
# der nur .rs-Dateien ändert, dann in der Ereignisdatei nachsehen:
grep -c 'review_start' fusion-workbench/orchestrator-events.jsonl
```

Fehlt das Ereignis zu diesem Turn, ist das Review ausgefallen. Ein zweiter Lauf mit einer
zusätzlich geänderten `.ts`-Datei zeigt den Unterschied.

## Warum das nicht durch eine Prüfung gefallen ist

Die Endungslisten sind Prosa in Prompts, keine Konfiguration. Es gibt keine Stelle, an der sie
zusammenlaufen, und keinen Test, der ihre Deckungsgleichheit prüft. `hooks/lib/__tests__/`
enthält Prüfungen für Pfadliterale und für Provenance-Kopfzeilen, aber keine für diese Listen.
Solange die Liste an fünf Stellen von Hand gepflegt wird, driftet sie weiter; die nächste neue
Sprache erzeugt denselben Befund erneut.

Das ist die Beobachtung, nicht die Korrektur. Ob die Liste zusammengezogen wird, an welchen Ort,
und ob eine Prüfung dazukommt, ist eine Entwurfsentscheidung. Das Minimum, das den gemeldeten
Ausgang beseitigt, ist `.rs` und `.java` an beiden Stellen nachzutragen.

## Herkunft dieses Befunds

Aus derselben KRK-Meldung wie die Schwesterakte. Die Meldung behauptete, `.rs` fehle in der
Dateiliste der Domänenerkennung; dort steht es. Zwei Zeilen weiter im selben Prompt fehlt es
tatsächlich, an zwei Stellen. Die Meldung war in der Sache richtig und im Ort falsch.

---
Resolved: `.rs` and `.java` added, in the order the other three prompts use. The fix went to **four**
sites, not the two this record counted. The coder executing it found the list twice more in the same
file: Setup Step 5's `code_files` line carried `.rs` but not `.java`, and the `## Scope` "You may NOT
edit code" list carried neither.

That fourth site is why the scope was widened rather than held at the stated minimum. Read literally,
the orchestrator's own prohibition did not forbid it from editing Rust or Java files, which is the
opposite of what that section exists to say. Leaving one prompt asserting in three lists that Rust is
code and in a fourth that it is not is the drift this record complains about, arrived at from inside.

What this record scopes out stays scoped out: the list is still maintained by hand at five sites
across four prompts, and no test checks that they agree. Consolidating it, choosing where it would
live, and adding that check remain a design decision nobody has taken.
