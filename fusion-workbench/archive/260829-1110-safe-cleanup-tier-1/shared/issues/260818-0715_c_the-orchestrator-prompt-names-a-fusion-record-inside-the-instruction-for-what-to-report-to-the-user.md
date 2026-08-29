The orchestrator prompt names a fusion record inside the instruction for what to report to the user

---

`agents/orchestrator.md:866` is a bullet in the `### Report to the user` list. It reads:

> - **Which commits in the session's range no review opened** — the hashes, from the
>   `## Review coverage` section, not a count. `none` when the range is tiled. This is the
>   statement issue `260810-1205` was filed about; the session that filed it reported one
>   where there were seven.

`260810-1205` names three files in fusion's own workbench and nothing in any consuming
project. The bullet is an instruction about what to say to that project's user, and the
identifier sits inside it.

The same identifier appears twice more in the same prompt, at `:811` ("Three properties of
that section are the acceptance criteria of issue `260810-1205`") and at `:819`, both in
rationale rather than in an instruction.

---

## Why this is filed and what it is not

It is **not** the defect `260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md` closed. That one was a run-time-composed hook sentence,
where fusion's prose and the consuming project's own measurement shared a sentence and the
frame was the consumer's. A prompt is statically delivered text: the agent has just read a
block of fusion's own conventions and the frame is visibly fusion's. By that criterion this
site is on the safe side, and it has stood in every consuming project since the record was
filed with no reported misreading.

It is filed because `:866` is the shortest path from the static surface to a consuming
project's own documents. The bullet governs a sentence the orchestrator writes for its user
at session close, and the adjacent `## Review coverage` section it points at is written into
that project's workbench. An agent that carries the identifier across writes a local record
citing a foreign one, which is the incident's outcome reached by a different route.

**Calibration.** No measurement supports the risk. We hold one reported incident, and it came
through the hook, not through the prompt. Read the severity as an assessed exposure, not as an
observed failure.

## Options

1. **Leave all three.** The frame protects them, and `:811`/`:819` genuinely carry the
   rationale for three acceptance criteria that would otherwise read as arbitrary.
2. **Rewrite `:866` only**, dropping the identifier and keeping the correction it carries: the
   session that got this wrong reported one uncovered commit where there were seven. The fact is
   what instructs; the record number adds nothing an agent in a consuming project can use.
3. **Rewrite all three.** Costs the rationale at `:811`, which is the part that makes the three
   properties readable as measured requirements rather than as preferences.

Option 2 is the one this record recommends. It removes the identifier from the only sentence
that instructs an agent about what to tell a user, and leaves provenance where the reader is
being told why a rule exists.

## Scope

`agents/orchestrator.md:866`, and `:811`/`:819` if option 3 is taken. No other file.

**Severity:** Low
**Domain:** code
**Filed by:** analyst, analysis `260818-0715`
**Cross-references:** `260818-0715-preventing-fusion-internal-identifiers-from-reaching-a-consuming-project.md` finding 6 (the criterion this site is measured against), `260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md` (the incident, a different channel), `260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md` (the gate, which does not and should not reach this surface)

---
**Reconciliation 260818-0814** (reconciler, domain `code`, HEAD `f3a3565`). Still open, and re-read
rather than assumed. `agents/orchestrator.md:866` carries the bullet verbatim, and `:811` and `:819`
carry the two rationale occurrences, all three at the exact line numbers filed. No commit in this
session's range `1dc062d..f3a3565` touched `agents/`, so none of the three options was taken and
none was foreclosed. The three sites are the only occurrences of `260810-1205` in `agents/`;
`agents/coderev.md:95`, `agents/ontorev.md:88` and `agents/orchestrator.md:571`, `:742` name it too,
each in rationale rather than in an instruction about what to tell a user, which is the criterion
this record is cut on.

One citation in this record's own `**Cross-references:**` line (`:62`) no longer resolved when
this note was written: it named the comment-line gate record,
`260817-2131_*_nothing-stops-a-fusion-workbench-id-returning-to-an-emitted-hook-sentence-because-the-lint-reads-comment-lines-only.md`,
with a literal `_o_` marker, and that record closed this session and is now `_c_`. (A later repair
pass rewrote `:62` to the wildcard form, so the line reads differently today than it did here.)
It is an instance of the class `260812-1720_*_the-reference-resolution-lint-does-not-scan-the-workbench-where-citations-are-densest.md`
records — re-verified open at HEAD, the lint's `surface()` still walks the shipped tree only — and
decision `260816-0119_*_can-anything-carry-the-rename-to-citation-obligation-when-a-record-marker-moves.md`
answered that class option 1: nothing new carries the obligation. The body is left unedited on that
basis rather than silently repaired. Marker stays `_o_`.
Log: `260818-0814-reconciliation.md`.

---
Resolved: fixed — option 2: the record identifier leaves the report bullet and the correction it carried stays; the rationale sites keep it; agents/orchestrator.md:953
