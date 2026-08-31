# The fabricated-name exemption keys on the literal `foo`, so every realistic probe fixture is read as a real citation

---
A record that quotes a probe fixture or a test fixture outside a fence produces a dangling
citation row. The grammar's `fabricated-name` exemption fires only when the token contains the
substring `foo`, and no fixture written to look like a real record ever does.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

## The defect

`hooks/lib/citation-scan.ts`, in the `consider()` exemption chain, exempts a token whose text
includes `foo` with the reason `fabricated-name`. That is the whole test. A fixture named to
exercise the grammar realistically carries a real-looking stamp and slug instead, so it is
judged like any other citation and reported `dangling`, because nothing on disk carries that
name and nothing ever will.

## Evidence: three instances in one session, by three different writers

Session `260830-1801-orchestrator-session.md`, all three found by the checker after the fact
rather than by the writer:

| writer | record | token |
|---|---|---|
| orchestrator | its own session history | the reproduction block for the unanchored store strip |
| analyst (P-5) | its decision-record history log | two record names spelled with a literal marker in inline backticks |
| coder (P-6) | the tripwire history log | the six-row fixture table's names, quoted in prose |

Each was repaired the same way, by fencing the verbatim form or restating it as a sentence, and
each cost a round of measure-notice-repair that the writer had no way to anticipate. The analyst's
instance additionally reddened `npm test` mid-run for the parallel coder, because a live decision
record is inside the blocking gate's corpus.

## Why the current exemption cannot cover it

`foo` is a marker of unseriousness, and a fixture that exercises a grammar has to be serious to
exercise it. The four rows above are exactly the fixtures that *do* their job: `pytorch/issues/`,
a bare Circle directory, an archive rooting. Widening the substring list (`bar`, `alpha`, `widget`)
would be the thicket `rules/critical-stance.md` §2 names, and it would still miss the next fixture.

## What the acceptance test is

A record may quote a probe or test fixture in running prose without producing a violation row, and
without the writer having to know that fencing is what makes it safe.

Note the two mechanisms that already work and are not in question: a fenced block and a blockquote
are exempt, and `rules/fusion-workbench-conventions.md` `## Marker globs` already instructs a
writer to name file and line or fence the verbatim form. The defect is that the instruction is
invisible at the moment of writing and the failure surfaces only in a later scan.

## Not proposed here

Whether the answer is a fifth exemption, a convention the prompts carry, or nothing at all is open.
An exemption that reads intent from a token is the undecidable shape §4 forbids, so any answer
naming one has to say what decidable property it keys on. This record states the defect and its
measurement and stops there.

---
Reconciliation evidence, 260831-0159 (reconciler, HEAD `6f3f7dd6`). Still open; marker unchanged,
and nothing in the tree answers the question this record leaves open.

**The evidence heading above reads three, and the session closed at six.** The heading counts what
had happened when this record was filed, mid-session, and it is left exactly as it stands. Later
instances are cited here rather than folded into its table, and each is labelled by how this pass
knows it.

- Instances one to three: the table above, read from this record.
- Instance five: the closure note of
  `260831-0038_*_the-answered-non-markdown-decision-carries-a-store-prefixed-token-that-reddens-the-citation-gate.md`,
  read from that record, which names itself the fifth and the second by the orchestrator. It is the
  harder half of the shape, a real pointer used as an exhibit, where the four before it were
  exhibits pointing at nothing.
- Instances four and six: reported by the orchestrator in the dispatch that ordered this pass, one of
  them the reconciler's own in `260830-2254-reconciliation.md`. Neither survives in the tree, both
  having been repaired in the working tree before commit, so this pass takes them on the
  orchestrator's report and did not verify them independently.

That totals six instances by four writers, the orchestrator twice and the reconciler once. Whoever
answers this record should read the count off the instances rather than off any one heading, this
line included.

**The acceptance test is unmet and no code moved toward it.** The exemption chain in
`hooks/lib/citation-scan.ts` still keys `fabricated-name` on the one substring, and the session that
filed this record shipped four commits into that file without touching it, deliberately: no plan step
named it and no decision proposed a keying property. The gate corpus is unchanged too, so the cost is
unchanged. A live record sits inside the blocking gate, so an instance in one still reddens
`npm test` for whoever pulls.
