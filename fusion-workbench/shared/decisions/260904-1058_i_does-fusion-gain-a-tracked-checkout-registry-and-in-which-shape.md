# Does fusion gain a tracked checkout registry, and in which shape?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260904-1058-identity-per-instance-and-the-checkout-registry.md` (the analysis, `## Recommendations` for the option set and `### 7. Transport` for the shapes);
`260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md` (where the user proposed `fusionusers.jsonl` and withdrew it, with three stated costs);
`260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `## The state partition` (the one-file-wide property a second R2 member would spend);
`rules/workbench-tracking.md` `## The four classes`

---

## Question

The checkout identifier is eight hex characters minted from `/dev/urandom` and it describes nothing. One person's several git identities read as several people. Both are repaired by a table mapping the two existing keys to attributes a human wrote. The question is whether fusion gains that table, and if so in which of three file shapes, since the shape decides what conflicts and what can be corrected in place.

The user proposed such a registry on 260824 and withdrew it himself as too complex. He is reopening it now with a sharper structure and two stated purposes. The withdrawal's three costs are not all still standing: shape (a) below removes the first outright, and the fallback rule removes the second.

## Options

1. **One file per checkout, keyed by the eight hex** (`<8hex>.md` in a new store beside the memo store).
   - Pros: joins class R1 unchanged, no new class and no exception owed; one writer per file by construction, so two concurrent registrations produce two filenames and no conflict; in-place correction is an ordinary single-writer edit; nothing already written changes, because the key is the value already on disk.
   - Cons: a new store; a reader wanting the whole roster globs a directory rather than reading one file.
2. **One line per checkout in one file with `merge=union`**, the pattern the event log already uses.
   - Pros: one file; concurrent registrations both land with no conflict; the merge driver already exists in the project.
   - Cons: union merge cannot express replacement, so a changed git identity appends a second line for one checkout and nothing says which is current, unless every line is timestamped and readers take last-wins, at which point it is an append-only log rather than a registry. It also adds a second member to class R2, spending the stated "one file wide" property of the current design.
3. **One structured YAML or JSON file, ordinary text merge.**
   - Pros: one file, a real structure, a whole-roster read in one open.
   - Cons: two new checkouts both append at the end, same region, and git conflicts, which is the case measured against the Circle record's `## Turn log` in `260822-2219-what-two-checkouts-of-one-project-actually-share.md` §6. The registry then conflicts on the one event it exists to make easy, somebody new joining, in a machine-written file a person has to resolve by hand.
4. **No registry.** Repair the two defects narrowly: a small map from git identities to one person read only by `hooks/lib/events-query.ts`, and a local nickname beside `.checkout-id`, class L, rendered only for its own checkout.
   - Pros: by far the smallest; no new store, no Setup question, no privacy surface; gives the person-aggregation prerequisite in full.
   - Cons: nobody but a checkout's owner ever learns which instance a claim or a presence line names. A colleague still reads eight hex characters.

## Constraints

- Whatever is chosen must leave every record and event line already on disk readable with no migration. `rules/circle-records.md` states that records are not rewritten, and the event log is append-only under a union merge driver.
- Every consumer falls back to today's behaviour when no entry exists. A project that never registers anything is a project running today's fusion.
- The four-class partition in `rules/workbench-tracking.md` must still tile the layout tree after the change, with the new entry in exactly one class.
- `.checkout-id` stays class L. The rule's own reason for that classification is not weakened by any option here.
- No option may make a filing agent halt where it does not halt today.

## Recommendation

Option 1, on three grounds stated in the analysis: it reuses both keys rather than minting a third, it lands in R1 with no exception owed, and it is strictly additive so it can be adopted one checkout at a time.

Option 4 is the honest answer if the user's horizon is himself on two or three machines with no second person. The two differ only on whether somebody other than a checkout's owner ever needs to read the name, which is a fact about the user's working arrangement and not about fusion.

---
Answered:
Implemented:
Deferred:
Superseded by:

---
Answered: 260904-1050-orchestrator-session.md `## Turn 1 — the analysis, and what the user answered` — option 1, one tracked file per checkout keyed by the eight hex, class R1, chosen by the user in his own words.

---
Implemented: 0dcbf992 — `bin/fusion-checkout-name` writes and reads one file per checkout under `shared/checkouts/`, keyed by the eight hex; the store joined the layout tree and class R1 at `d5a27230`, and its consumers landed at `e9c14bdf` and `092a15dc`.

**Reconciled 260905-0610.** The `Implemented:` line above cited `4ff9d2e0`, which is no object in this repository (`git cat-file -t` fails on it); it was the pre-amend hash of the commit that carries the four consumer sites. Corrected to `e9c14bdf`, verified by `git show --stat e9c14bdf`, which lists `skills/setup/SKILL.md`, `skills/next/SKILL.md`, `bin/monitor` and `hooks/hooks.json`. Nothing else on the line moved.
