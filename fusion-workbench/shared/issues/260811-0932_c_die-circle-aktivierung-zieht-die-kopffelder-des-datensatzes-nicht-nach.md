Die Circle-Aktivierung zieht die Kopffelder des Datensatzes nicht nach

---

Beim Aktivieren eines Circles (`_a_` → `_t_`) benennt der Orchestrator den Datensatz um und
schreibt `.active-circle`. **Drei Kopffelder desselben Datensatzes bleiben dabei stehen, und
niemandes Prompt beauftragt sie:** `**Status:**` behält `anticipated`, `**Active spec/plan:**`
und `**Active session history:**` behalten `(none yet)`.

Gemessen am 260811 beim Aktivieren von
`circles/260809-2040-tastenbelegung-als-markdown-in-downloads`: der Datensatz trug den Marker
`_t_` und im Kopf `**Status:** anticipated`. Marker und Feld widersprachen sich, und zwei
Verweisfelder zeigten ins Leere, obwohl Spec, Plan und Sitzung längst existierten.

---

**Schwere:** Niedrig
**Gefunden:** ontocoder beim Nachziehen der zwei Verweisfelder, dann vom Orchestrator um den
Statusbefund erweitert
**Betroffen:** fusion, nicht KRK — `agents/orchestrator.md`, `rules/circle-records.md`
**Domain:** code

## Warum das niemandes Arbeit ist, und genau das ist der Defekt

Die Zuständigkeiten sind an dieser Stelle vollständig verteilt und decken die Kopffelder
trotzdem nicht ab:

- **Der Orchestrator** darf laut seinem Prompt am Circle-Datensatz genau **eine** inhaltliche
  Änderung vornehmen: die `## Closure note` bei Phase 4. Wörtlich: „the only Circle-record
  content write the orchestrator performs; full-content edits remain off-limits". Ein Kopffeld
  zu setzen fällt nicht darunter.
- **Der shaper** füllt den Grounding-Snapshot in seiner `portfolio-activation`-Betriebsart. Die
  ist aber ausdrücklich **nicht von einem Agenten aufrufbar**: „reachable only by the user
  running shaper directly with the mode contract — no skill or agent dispatches it". Ein
  Orchestrator, der einen Circle aktiviert, kann sie nicht anstoßen.
- **`/fusion:next`** führt die Aktivierungsschreibvorgänge selbst aus, ohne den shaper zu rufen —
  und schreibt dabei ebenfalls nur Marker und Zeiger.
- **Der playmaker** liest die Felder für `portfolio.md`, schreibt sie aber nicht.

Es bleibt also niemand übrig. Der Ausweg im gemessenen Fall war ein eigens beauftragter
`ontocoder`, und das ist ein Umweg und keine Zuständigkeit.

## Was es kostet

`rules/circle-records.md` begründet die Verweisfelder ausdrücklich damit, dass die Konsumenten
sich ohne sie **stillschweigend verschlechtern**: die Suche von `/fusion:circle-stash`, das
Rendern des Portfolios durch den playmaker, die Wiederaufnahme durch den Orchestrator. Ein
`(none yet)` ist dabei nicht besser als ein falscher Pfad, sondern nur leiser.

Beim Statusfeld kommt hinzu, dass es dem Marker **widerspricht**, statt bloß zu fehlen. Wer den
Datensatz liest, findet zwei Aussagen über denselben Zustand, und die Regel sagt an anderer
Stelle, dass der Marker die Wahrheit trägt.

## Denkbare Wege

1. **Der Orchestrator darf die Kopffelder setzen.** Die Ausnahmeliste in `agents/orchestrator.md`
   wird von „nur die Closure note" auf „die Closure note und die Kopffelder" erweitert. Billigste
   Änderung, und der Orchestrator ist ohnehin die Stelle, die Marker und Zeiger schreibt.
2. **Die Aktivierung ruft den shaper**, und dessen `portfolio-activation`-Betriebsart wird für
   Agenten aufrufbar. Sauberer im Sinne der Rollenteilung, aber sie hebt eine ausdrückliche
   Festlegung auf.
3. **Ein `bin/`-Helfer setzt die Felder**, so wie `bin/fusion-paths` die Pfade auflöst. Dann
   hängt es an keinem Prompt und wird nicht unter Aufgabendruck übersprungen — dieselbe
   Überlegung, die der Orchestrator-Prompt selbst für den Drift-Check anstellt.

## Was daran allgemein ist

Es ist dieselbe Form wie bei den zwei Befunden über die eigene Buchführung vom 260810
(`shared/issues/260810-1945_*_der-orchestrator-hat-in-drei-turns-keine-aufgabenereignisse-emittiert.md`):
eine Pflege, die neben der eigentlichen Handlung steht statt an ihr zu hängen, wird
übersprungen. Hier ist sie nicht einmal übersprungen worden, sondern nie jemandem zugeteilt.

---

## Transfer note (260811-2025)

Filed in the KRK project's workbench, where the defect was met, and transferred here by the user
because the fix is in the plugin's own sources and cannot be made from a consuming project. The
body above is the original record, unedited: its `**Betroffen:**` and `**Zuständig:**` lines
describe the reporting project's position, and the paths it cites under `circles/` and
`shared/history/` are KRK's, not this workbench's — read them as evidence from there, not as
records to open here.

The record enters this queue at its original stamp rather than at the transfer time, so its age
is the age of the finding.

---

## Resolved (260811-2115) — option 1, the orchestrator owns the head fields

Decided by the user at a gate on 260811-2050: option 1 of **Denkbare Wege**. Options 2 and 3
were not implemented and the shaper's `portfolio-activation` mode stays unreachable by an
agent.

**The permission.** `agents/orchestrator.md` `## Scope` no longer says the Closure note is the
only Circle-record content write. It enumerates three: the Closure note, the `## Turn log`
entry, and the three head fields. The Turn-log entry was already required elsewhere in the
same prompt (`### Drift check` measures the orchestrator against it, and queue entry 60 names
the same write), so the word "only" was false before this change as well as after it.

**Where the permission is exercised** — a new section `## Circle head fields` in
`agents/orchestrator.md` states when each field is written and defers the field semantics to
`rules/circle-records.md` `## Circle record template` rather than restating them. Four acts
carry the write, each in the same command as the act rather than beside it: the `_a_`→`_t_`
activation, Setup step 6 (the session-history file it creates), Step 0b.2 step 3 (the plan the
planner returns), and Phase 4 step 3 (`**Status:**` to match the closing marker).

**`/fusion:next` cites rather than restates.** Its Step 6.2 sets `**Status:** active` in the
same shell call as the rename and points at the orchestrator section for everything else. It
leaves `**Active session history:**` at `(none yet)` — no session is running the Circle at
that moment, and Setup step 6 of the session that follows fills it — and leaves
`**Active spec/plan:**` untouched, because the skill has no way to find the right file and a
wrong path is worse than an empty one. Its `## Boundaries` paragraph was corrected in the same
change; it claimed the skill "never writes Circle *content*".

**On the `**Status:**` field.** Nothing about queue entry 58 is decided here and the field is
not deleted. It is now set at both ends of a Circle's life instead of one, which is what keeps
this change from producing the inverse contradiction the entry already measured (a record
reading `active` under a `_c_` marker). The live specimens were not hand-corrected.

Marker `_o_` → `_c_`. Verification: `cd hooks && npm test` — exit 0, 52 files, 1335 tests.
History: `shared/history/260811-2115-coder-circle-head-fields-at-activation.md`.
