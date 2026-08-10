The cascade reach gate only sees a domain name in backticks or double quotes, and that hole is not named

---

`hooks/lib/domain-cascade.ts:647-656` (`domainLiteralsIn`) extracts domain names with
`/`\`([^\`]+)\`|"([^"]+)"/g` — a domain counts only when it is inside a backtick span or a double-quoted
string. A paraphrase that writes the four domain names as plain words is invisible to
`findCascadeStatements()`, and the header at `:616-645` does not list this among the holes it names.

---

**Measured** against the shipped `hooks/dist/lib/domain-cascade.js`:

| Probe | Verdict |
|---|---|
| `Detect the workbench domain: strategic if decisions dominate, knowledge if analyses exist with no code, data if data files dominate, else code.` | **passes** |
| `Pick 'strategic' when decisions outnumber issues, otherwise 'code'.` | **passes** |
| `Pick **strategic** when open decisions outnumber open issues, otherwise **code**.` | **passes** |

Each names two or more outcomes and two or more inputs, which is the gate's own definition of a
statement of the cascade. Only the markup is missing.

**Why this is the likeliest spelling and not an exotic one.** The plugin's own prose writes domain
names unmarked in several places already — `agents/taskplanner.md:127` (`**Domain:** code | data |
strategic | knowledge`), the decision-record template in
`rules/fusion-workbench-conventions.md`. Nothing in the project's authoring conventions requires a
domain name to be backticked, and the copy this gate was built for
(`skills/cleanup/SKILL.md`, pre-fix) happened to backtick its four only because that author did.
Bold is the other spelling a real author reaches for, and it also passes.

**The three holes the header does name** are: a paraphrase spread across a table's rows, a paraphrase
naming no input, and anything outside `agents/` and `skills/`. The markup requirement is a fourth,
and it is the one that admits the plainest possible restatement.

**A second, related gap in the input side.** `INPUT_PROSE` (`:664-671`) carries six spellings.
A paraphrase naming its evidence in other words passes even fully backticked:
`` `strategic` when open questions outnumber defects, otherwise `code` `` — **passes**, because
"questions" and "defects" are not in the list. The header names "a paraphrase naming no input" as a
hole; this one names two inputs in words the list does not carry, which is a different case and is
not named.

**Fix direction.** Two options, and the second is the one `rules/critical-stance.md` §4 points at:

1. Widen `domainLiteralsIn` to match bare words (`\b(code|data|strategic|knowledge)\b`) and re-measure
   the false-positive cost over the consumer set. The cost is real: `code` and `data` are ordinary
   English words in these files, so a bare-word matcher probably needs the two-input requirement to
   carry the whole discrimination.
2. Accept that "does this prose restate the decision?" is not decidable from the inputs the gate has,
   and pin the decision-bearing lines of `agents/orchestrator.md` Setup Step 5 against an approved
   baseline instead — the same move `state-drift-detection-lint.test.ts:70-88` already proposes for
   its own blacklist, and the same move the write guard made when it stopped classifying commands.

Whichever is taken, the header's list of named holes must gain this one — the value of that list is
that it is complete about what is *not* checked.

**Cross-references.** `hooks/lib/domain-cascade.ts:616-645, 647-708`;
`hooks/lib/__tests__/domain-cascade.test.ts:498-702`; `README-hooks.md:179`;
`shared/issues/260810-1918_c_the-cleanup-skill-carries-a-second-domain-cascade-in-the-pre-fix-order-and-no-gate-reads-it.md`.

**Filed by:** coderev, review of session `260810-1646` Turn 2, range `da8c9db..b3cc034`.

---
Resolved: partly by widening, partly by naming — and the split is the honest part.

`domainLiteralsIn` (`hooks/lib/domain-cascade.ts`) now matches a domain name bracketed by any of
four inline markups: backticks, double quotes, single quotes, asterisk bold. Measured against the
pre-change build, two of this record's three probes changed verdict: the single-quoted spelling and
the bold spelling both went from **passes** to **caught**. Over the whole scanned set the widening
costs nothing — the gate still selects exactly `agents/orchestrator.md:168,170,172` and no other
line in 45 files.

The bracketing is deliberate and is not the "span whose content is a domain" it replaced. A generic
span rule was measured first and rejected: in a corpus this full of `code_files` and `_o_` markers,
`_..._` and `'...'` spans swallow the rest of the line, and that variant LOST the definition site's
own `counted_by` line (3 selections down to 2).

**The bare-word probe is not closed, and is now named rather than left silent.** Matching
`\b(code|data|strategic|knowledge)\b` was measured over the scanned set: 14 lines of honest
consumer prose select, in `agents/coder.md`, `agents/editor.md`, `agents/planner.md` (3),
`agents/playmaker.md` (3), `agents/reconciler.md` (3), `skills/cleanup/SKILL.md` and
`rules/fusion-workbench-conventions.md` (2). `code` and `data` are ordinary English in these files
and `code files` is both a domain name and an input phrase, so the two-input rule does not carry the
discrimination. It is `REACH.holes[0]`, with the probe from this record and both cost numbers, and
the suite re-measures the numbers on every run.

The input-side gap this record raised second — inputs named in words `INPUT_PROSE` does not carry,
"open questions outnumber defects" — is also not closed and is now `REACH.holes[3]` with its probe.

The record's own requirement is met: the list of named holes is complete about what is not checked,
and it is no longer a list — it is `REACH` in `hooks/lib/domain-cascade.ts`, every line carrying
probes the suite runs, rendered into `README-hooks.md` and compared byte-for-byte.
