JoinerFacts claims a pessimism for the `|` row that the row itself does not carry
---
The `movesCallingShell` docstring in `hooks/lib/bash-mutation-guard.ts` says the classifier
"takes the pessimistic answer" where bash and zsh disagree about the last pipeline element.
The `|` row's value is `false`, which is bash's answer and the OPTIMISTIC one for zsh. The
pessimism the guard actually delivers comes from somewhere else in the walk, so a reader
checking the claim against the table finds it contradicted.
---
Measured (bash and zsh, throwaway project):

    echo hi | cd rules && rm x.md            bash: exit 1, nothing   zsh: removes rules/x.md
    echo hi | { cd rules; } && rm x.md       bash: exit 1, nothing   zsh: removes rules/x.md

Both DENY at HEAD `38c5123`, so there is no live hole — the behaviour is safe and only the
explanation is wrong. The deny comes from the walk's ordering, not from the row:
`applyDirEffect` runs unconditionally and moves the model, and only then does
`if (!joiner.movesCallingShell && state.moved) degradeUnprovenCd(state)` fire. So the `cd`
is applied and immediately doubted, which lands on "directory unknown" — the pessimistic
answer — rather than on "the cd did not happen", which is what `movesCallingShell: false`
reads as on its own.

Why it matters beyond tidiness: plan step 3 replaces `joinerFacts(segment.joiner)` with a
reach-keyed table. If the author of that table reads `movesCallingShell: false` as "the
mover is inert" and drops the unconditional `applyDirEffect`, the zsh rows above turn from
deny to allow with a protected write, and the docstring will have said the opposite was
guaranteed. The fix is a sentence in the docstring naming where the pessimism comes from,
and it should land with step 3's table rather than as a separate edit.

Found while measuring `hooks/lib/shell-reach.ts`'s `pipe-exit` boundary; a first
simulation of the prospective step 3 model reproduced exactly this mistake and reported a
hole that does not exist.

---
Resolved: Der beschriebene Code existiert nicht mehr. `JoinerFacts`, `joinerFacts()`, `movesCallingShell`, `applyDirEffect` und `degradeUnprovenCd` standen sämtlich in `hooks/lib/bash-mutation-guard.ts`, und diese Datei ist mit `ba7ccda` gelöscht (3.351 Zeilen), zusammen mit `hooks/lib/shell-reach.ts`, an dessen `pipe-exit`-Grenze der Befund gefunden wurde. Am Baum nachgeprüft am 260807-1202: `movesCallingShell`, `JoinerFacts` und `joinerFacts` kommen im gesamten Repository (ohne `node_modules`, `hooks/dist` und die Workbench) nicht mehr vor; der Docstring mit der falschen Behauptung ist mit seiner Datei gefallen. Die im Befund benannte Folgegefahr ist damit ebenfalls erledigt: die reach-gestützte Tabelle aus Plan-Schritt 3 des abgelösten Circles wird nicht mehr gebaut, weil der Klassifizierer als Mechanismus abgelöst ist. Bindende Entscheidung: `circles/260804-1205-shell-reachability-model/decisions/260807-0825_i_should-the-guard-predict-shell-writes-or-enforce-them.md`, Option 3.
