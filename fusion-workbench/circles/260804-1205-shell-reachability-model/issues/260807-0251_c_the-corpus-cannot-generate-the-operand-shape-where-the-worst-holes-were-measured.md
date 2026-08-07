The corpus cannot generate the operand shape where the worst holes were measured
---
`TARGETS` in `hooks/lib/__tests__/helpers/reachability-corpus.ts` has four values. None of
them is a relative operand that is PROTECTED where the shell actually stands and HARMLESS
where the model thinks it stands. That is exactly the shape in which the compound-in-a-
pipeline defect produces a protected write, so the instrument cannot generate the rows
that motivated the fix.
---
The four targets pair a directory with an operand:

| target | dir | operand | protected when moved | protected when still |
|---|---|---|---|---|
| `protected-relative` | `rules` | `x.md` | yes | no |
| `protected-absolute` | `build` | `{{ROOT}}/rules/x.md` | yes | yes |
| `unprotected-relative` | `build` | `out.js` | no | no |
| `unprotected-absolute` | `build` | `{{ROOT}}/build/out.js` | no | no |

A relative operand is protected only when the model believes the shell MOVED. The
dangerous direction for a subshelled mover is the reverse: the model believes the shell
moved into a harmless directory and therefore allows, while the shell never moved and the
operand is protected where it really stands. The missing row is `dir: build`,
`operand: rules/x.md` — protected when still, harmless when moved.

Measured, by hand, outside the corpus (bash and zsh, throwaway project, both shells
identical). Each of these deletes `rules/x.md`, and with the pre-fix reach layer fed
through the guard's two-column model each resolves the write to `build/rules/x.md` and
allows:

    { cd build; } | cat && rm rules/x.md
    if cd build; then echo y; fi | cat && rm rules/x.md
    while cd build; do break; done | cat && rm rules/x.md
    for f in x; do cd build; done | cat && rm rules/x.md
    { { cd build; }; } | cat && rm rules/x.md

The corpus's own `pipe-head` rows come out "clean" in the witness for the opposite reason:
with `protected-relative` the mover is `cd rules` and the write is `rm x.md`, which finds
nothing at the root and exits 1. So the family the instrument does cover is the one where
the failure is invisible.

Deliberately NOT fixed in the same pass as the POSITION dimension. Adding a fifth target
regenerates the committed baseline a third time, and the docstring's licence for
regenerating it before the step 5 gate should be spent one axis at a time, with a reviewer
seeing each. It must land BEFORE plan step 3 all the same — after the classifier moves
there is no before-image to add the rows to.

Cost if taken: corpus 93 744 → 117 180 rows, committed subcorpus 1008 → 1260. The two
conditions the previous two regenerations were checked against (every recorded row
reproduces its verdict byte for byte and keeps its relative order; the file only grows)
hold trivially while the classifier is still unwired.

---
Resolved: Der beschriebene Code existiert nicht mehr. Der Korpus ist mit `436d78c` gelöscht — `hooks/lib/__tests__/helpers/reachability-corpus.ts` (mit der `TARGETS`-Tabelle), `hooks/lib/__tests__/reachability-corpus.test.ts`, `hooks/lib/__tests__/helpers/shell-witness.ts` und `hooks/lib/__tests__/fixtures/mutation-verdicts-head.json`. Am Baum nachgeprüft am 260807-1202: keine der vier Dateien liegt noch da, und `TARGETS`/`reachability-corpus` kommen in `hooks/` nirgends mehr vor. Die fehlende Zeile (`dir: build`, `operand: rules/x.md`) kann nicht mehr nachgetragen werden und muss es auch nicht: das Instrument maß Urteile eines Klassifizierers, den `ba7ccda` entfernt hat. Der Guard entscheidet seither nicht mehr, welche Datei ein Befehl schreiben wird, sondern misst nach dem Aufruf, welche geschützte Datei sich verändert hat — die Operandenform, an der der Befund hing, ist für diese Frage bedeutungslos. Bindende Entscheidung: `circles/260804-1205-shell-reachability-model/decisions/260807-0825_i_should-the-guard-predict-shell-writes-or-enforce-them.md`, Option 3.
