The churn map is keyed by the session's working directory and never pruned, so the
orchestrator's Setup read ranks paths that no longer exist

---

`fusion-workbench/.guard-state/churn.json` holds 535 entries. 297 of them (56%)
resolve to no file on disk under any reading of the key, and the keys come in
several incompatible spellings of the same file, because a key is derived from
wherever the session happened to start rather than from the file itself.
`thrashingScore` is dominated by the lifetime count, so the ranking the
orchestrator consults at Setup is led by dead keys.

---

Measured at HEAD on 2026-08-09, over this repository's own `churn.json`
(535 entries, `sessionStart` 2026-08-09T15:59Z).

**1. Three key spellings for one file.** `trackChurn`
(`hooks/tracker.ts:617-629`) normalises an absolute path to a cwd-relative one
only when the resolved path starts with `process.cwd() + "/"`, and stores the raw
absolute path otherwise. Nothing anchors the key to the workbench root. The map
therefore holds:

| Key shape | Count | Example |
|---|---:|---|
| relative to `fusion-workbench/`, not the repo root | 229 | `tasklist.md`, `260719-1632-orchestrator-session.md` |
| absolute, this checkout | 149 | `/Users/k1/Projects/productive/fusion/hooks/lib/churn.ts` |
| absolute, a session scratchpad or `/tmp` | 120 | `/private/tmp/claude-502/-Users-k1-…/…`, `/tmp/fusion-commit-msg-p5.txt` |
| absolute, another root entirely | 37 | `/Users/kai/Dropbox/qboot/projects/F04-FUSION/codebase/fusion/bin/fusion-plane`, `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins/…` |
| relative to the repo root | 0 | — |

The last row is the point: the spelling every consumer would assume does not
occur once in 535 entries. The 229 relative keys are relative to
`fusion-workbench/`, which is where those sessions started.

Resolving each key under the only reading that could work for it — the relative
ones against `fusion-workbench/`, the absolute ones as written — 238 of the 535
name a file that exists (96 of 229 relative, 142 of 306 absolute). The other 297
name nothing.

A file edited from the repo root, from `fusion-workbench/`, and from a second
clone accumulates three independent counters, each of which under-reports.

**2. Nothing prunes.** `recordChange` (`hooks/lib/churn.ts`) only ever adds
entries; `resetSession` clears `changesThisSession` and deliberately keeps
`totalChanges` and the key. There is no delete path anywhere in the module, so a
key survives the deletion, rename or move of the file it names, for the life of
the project.

**3. The ranking the orchestrator reads.** `agents/orchestrator.md:113` and
`skills/setup/SKILL.md:226` read `churn.json` at Setup "to note high-thrash
files". `thrashingScore` is `rapidChangePenalty + floor(totalChanges / 3)`
(`hooks/lib/churn.ts`), and `rapidChangePenalty` is 0 for every stale entry
because their session counts are 0. So the score of a dead key is purely its
lifetime total, which never decays. Today's top six:

Every key below is stored absolute; the paths are abbreviated at `<repo>` =
`/Users/k1/Projects/productive/fusion` for reading.

    70  total= 32  session=0  /Users/kai/Dropbox/…/F04-FUSION/codebase/fusion/bin/fusion-plane   (gone)
    53  total=147  session=0  <repo>/hooks/lib/bash-mutation-guard.ts   (gone, deleted in v6.0.0)
    51  total= 51  session=0  <repo>/hooks/lib/__tests__/rules-emission-golden.test.ts
    31  total= 15  session=0  /Users/kai/Dropbox/…/F04-FUSION/codebase/fusion/docs/plane-setup.md  (gone)
    25  total= 28  session=0  <repo>/hooks/lib/rules-write-exemption.ts
    24  total= 12  session=0  <repo>/hooks/lib/__tests__/provenance-header-lint.test.ts

Three of the top four name files that are not there, and the top one names a
path on a machine this checkout is not on. Note also that every one of the six
carries `session=0`: the ranking is entirely lifetime, with nothing from the
session the reader is asking about.

---

Not caused by, and not fixed by, the latching-thresholds work. Decision
`260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md` removed the lifetime *threshold comparison* from `analyzeChurn`;
`totalChanges` and `thrashingScore` are untouched by that change, by design,
because the Setup read wants the lifetime number. This record is about what the
lifetime number is computed over, which is a separate question the decision's
recommendation flagged ("prune or clear the accumulated state") and the answer
did not settle.

A one-off hand-prune of `churn.json` was deliberately NOT done while fixing the
thresholds. It would clear today's ranking and regrow within days, and it would
remove the evidence at the one surface where the defect is visible.

---

Severity: Medium. Nothing is enforced off this file — churn is observation-only
by construction (`README-hooks.md`). The cost is that a shipped Setup surface
reports a ranking of mostly-nonexistent files, and that per-file counts are split
across spellings and are all lower than the truth.

Fix direction: a decision precedes the fix, and it has at least three parts.
(a) The key: anchor it to the workbench root rather than to `process.cwd()`, so
one file has one key from any working directory. `hooks/lib/workbench-root.ts`
already resolves that root and `hooks/lib/project-relative.ts` already does this
shape of work for the guard. (b) The existing 535 entries: migrate the ones whose
keys can be rewritten to the new spelling, or clear the map, or drop entries
whose file is absent — a migration and a prune are different answers with
different costs. (c) Whether an entry should be dropped when its file disappears
at all: a deleted file's churn history is arguably worth keeping until the map is
cleared, and an existence check on every record is a stat per entry per write.
Do not settle (c) by adding the check and seeing whether anyone complains.

Cross-references:
`260809-2004_*_should-the-latching-churn-and-cross-file-criticals-be-bounded-or-dropped.md`
(measurement 7 names the `bash-mutation-guard.ts` entry and calls it "the same
missing boundary seen from the reader's side"; this record measures the rest of
it and finds a second cause, the cwd-dependent key, that measurement 7 did not
see);
`260809-1101_*_churn-and-cross-file-criticals-latch-permanently-and-never-reset.md`
(the thresholds defect, resolved separately);
`agents/orchestrator.md:113`, `skills/setup/SKILL.md:226` (the reader);
`hooks/tracker.ts` (the normalisation), `hooks/lib/churn.ts` (the map).

---
Decision filed: `260810-0920_*_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md` — this record states that a decision precedes the fix and names three parts. They are now on the record as an open question with options and constraints. No code change until it is answered.

---
Resolved 260810-1526-churn-key-anchored-to-workbench-root.md (coder, task `I:260809-2023-churn-key`, session `260810-1402`) — **all three parts of the answer are in code; the marker is the orchestrator's to move after the commit lands.**

Decision `260810-0920_*_what-should-a-churn-key-be-anchored-to-and-what-happens-to-the-535-entries-already-recorded.md`, realised part by part:

**(a) The key is anchored to the workbench root.** `churnKey()` in `hooks/lib/churn.ts` runs `resolve(cwd, raw)` and then `projectRelative(absolute, root)` — the same two steps `narrowingTarget` in `hooks/tracker.ts` already ran for the protected-path measurement, using the two helpers the answer named (`workbench-root.ts`, `project-relative.ts`). The heatmap and the guard now read one path the same way. A path landing outside the root is **not tracked** rather than stored absolute: storing it is what produced the second spelling, and a file outside the project is not evidence about churn in it. It is still observed — the `tracker_record` event says `not tracked`.

**(b) Migrated, with the merge rule stated.** `migrateChurnKeys()` runs on load, once per state file (a `keyAnchor: "workbench-root"` stamp is written on save and skips it afterwards), and is idempotent independently of the stamp. The rule reads no count: an absolute key inside the root becomes root-relative and outside it is dropped; a relative key is probed against the root and then against `fusion-workbench/`, the two directories that can have been the unrecorded cwd, and the reading that names a file on disk wins; a relative key that resolves under neither is left as written, since it cannot be re-anchored from the key alone and the ranking excludes it anyway. **Merge rule for two spellings of one file: the counters are summed** (each spelling is an independent counter under-reporting the same file, so the sum is what would have been recorded had the anchor been right); `lastChange` is the later of the two; `thrashingScore` is **recomputed** from the merged counters rather than combined, because it is derived and any arithmetic over two derived values invents a number the formula could not produce.

**(c) Every entry kept, absent files excluded from the ranking.** `rankThrashing()` is the read path, called by `hooks/churn-rank.ts` through the new `bin/fusion-churn-rank`, which `agents/orchestrator.md` Setup Step 5 and `skills/setup/SKILL.md` Step 3 now run instead of reading `churn.json` by eye. Nothing deletes from the map; the helper reports `entries=` and `absent=` alongside the ranking, and is read-only — it does not persist the migration it may have run in memory.

The call site carries the same `[ -x ]` guard as `bin/fusion-count-sources` one block above it, per `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` option (a1) — this helper is new, so every session running against an older install would otherwise take exit 127 at Setup. Churn is advisory and has no substitute value to print, so the absent branch reports the reason on stderr and says nothing about high-thrash files.

Measured against this repository's own live map, which the ranking reads without rewriting: 590 entries in, 414 after re-anchoring (171 naming other roots dropped, 5 pairs merged), 191 of those absent from disk and excluded, and the top ten are files that all exist. Before the change the top four were led by three files that were not there and one path on a machine this checkout is not on. The live `churn.json` is unchanged on disk: the tracker's churn half stands down when cwd is this repository, so the first save that persists the migration will come from a session working below the root or from a consuming project.

Nothing is enforced off `churn.json` and nothing here changes that — `analyzeChurn` is untouched, and no new caller reads the map for a decision.

History: `260810-1526-churn-key-anchored-to-workbench-root.md`
