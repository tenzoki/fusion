# Resolution-line form and the ruler field

**Status:** Complete
**Filed by:** coder, Kai Stalmann <ks@qantr.com>
**Domain:** code

---

## What was dispatched

Realise two decisions answered by the user on 2026-09-05 and the defect they unblock:

- `260905-1228_*_does-a-resolution-line-cite-path-line-or-a-heading-anchor.md`, option 1 — the heading anchor becomes the mandated form on a resolution line.
- `260905-1228_*_does-an-answered-record-carry-who-ruled-now-that-only-the-orchestrator-may-transition-it.md`, option 1 — the resolution line names who ruled, in `**Filed by:**`'s shape.
- `260905-1228_*_the-worked-example-teaches-a-store-prefixed-citation-and-a-section-suffix-the-rule-rejects.md` — both halves of the worked example's `Answered:` line.

## What changed

`rules/fusion-workbench-conventions.md`, four passages:

1. `## Filename Patterns` — the closing sentence of the citation paragraph. `path:line` on a resolution line is replaced by the same heading anchor living text already takes. The old argument is kept and bounded rather than inverted: point-in-time holds for a target frozen at the citing commit and fails for a session history the session goes on appending to. The 1-of-30 versus 11-of-30 measurement is quoted so a later reader sees the rule moved on evidence.
2. `## State Markers — decisions` — the `_a_`, `_i_`, `_d_` and `_s_` rows. `<path>:<line>` becomes `<citation>` throughout; `_a_` and `_d_` gain the ruler obligation and point at the two sections that define the forms.
3. `## Inline State Tracking` → `### Decision files` — the five annotation forms. `Answered:` and `Deferred:` gain `; ruled by <agent name or "user">, <person>`; `Implemented:` and `Superseded by:` lose the `:line` spelling.
4. The same section gains two paragraphs: one line pointing every citation at the anchor form, and one stating which lines carry a ruler and why.

`rules/decision-record-examples.md`, three passages: Example 1's `Answered:` line (store segment dropped, `§5` replaced by an anchor, ruler added), Example 3's `Deferred:` line (ad-hoc "Deferred per user 2026-05-12" replaced by the convention's field), and the anti-pattern on omitted citations, extended to the ruler.

## The cut over the five lines

`Answered:` and `Deferred:` carry the ruler; `Implemented:`, `Superseded by:` and `Retired:` do not. The line is between a claim only a person can make and a claim a reader can check on disk. The first two record a ruling nothing in the tree confirms. The other three each cite something verifiable without trusting anybody — code at a commit, a record carrying its own `**Filed by:**` and its own ruler, the plan or gate that removed the subject — so a name there either restates an attribution that already exists or attaches one to a fact that needs none. The reason is written into the rule so the next reader does not re-open it.

`Deferred:` was not named in the decision, which asked only about `Answered:`. It was taken because the `_d_` row already says the *user* explicitly pushed the decision out and Example 3 already carried a hand-rolled "Deferred per user" attribution — the convention replaces an ad-hoc form rather than adding a new obligation.

## Not done, deliberately

- No sweep of existing records. Both decisions rule it out; an absent `ruled by` means the record predates the rule.
- No gate. A check that an `_a_` record names a ruler would fail on thirty existing records, and "written after this change" is not decidable from the tree.
- The two answered records' own `Answered:` lines already match the format defined here, verbatim, so nothing was normalised.
- The emission golden is stale by design of the dispatch: it was left unregenerated and named in the report.
