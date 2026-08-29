The citation grammar cannot express a record inside `archive/`, so a corrected archive path still scans as `wrong-store`

---

Filed by `coder` during step 6 of
`260819-2016_*_four-constraints-on-deep-change.md`,
which repairs the `wrong-store` class. Measured at HEAD `ad7ffed`.

---

## What is wrong

`hooks/lib/__tests__/helpers/citation-scan.ts` resolves a store-prefixed citation by anchoring it
at the **live** workbench root. `REC_RE` captures an optional `circles/<dir>/` or `shared/`
segment immediately before the store, and `findRecord()` then requires the record's directory to
*start* with that segment:

```
if (opts.circleDir) return e.relDir.startsWith(`circles/${opts.circleDir}/${opts.store}`);
if (opts.shared)    return e.relDir.startsWith(`shared/${opts.store}`);
```

An archived record's directory does not start there. `/fusion:archive` moves a whole subtree under
`archive/<sweep>/`, preserving the store layout beneath it, so the record's workbench-relative
directory reads `archive/<sweep>/shared/<store>` — and `startsWith("shared/<store>")` is false.

The grammar has no way to say so either. `archive/` is not one of the two prefixes `REC_RE`
recognises and it is not a store, so the regex simply begins its match further along the path, at
the `shared/` segment. **The token the scanner sees is byte-identical whether or not the
`archive/<sweep>/` prefix is written in front of it.** Correcting such a citation to where the
record actually is therefore changes nothing the scanner reads: the hit stays `wrong-store`, with
the same token, the same match and the same fix text — which is the fix that was just applied.

## How it was measured

Over the repair corpus (186 files at HEAD `ad7ffed`), 48 hits carried status `wrong-store`. Of
those, **40 name a record that the `archive/260817-1907-safe-cleanup-scoped` sweep moved**, and all 40 are in this
class. Writing the true archive path on all 40 left the count at exactly 40, with the hit list
unchanged token for token. The five hits whose target is still in a live store did resolve, and
the count fell 48 → 43 (the remaining three are separate cases handed to step 7).

The behaviour reproduces on a synthetic line with no workbench edit at all: a citation carrying the
full, true archive path scans as `wrong-store`, and the same citation with the store segment alone
in front of it (`<store>/<stamp>_*_<slug>.md`, no `shared/`, no `circles/`) scans as `resolved` —
because the store-only branch of `findRecord()` uses `relDir.split("/").includes(store)`, which the
archive prefix does not defeat. So the one form the scanner accepts for an archived record is a
path that **does not exist on disk**, and the one form that exists on disk it rejects.

## Why it matters now

Step 9 of the same plan arms `scanRecordCitations` as a blocking gate in `npm test`. `wrong-store`
is one of the three statuses it raises as a violation. On the corpus as it stands, that gate opens
red on 40 citations that are already correct, and no edit to a record can turn them green.

It also inverts the incentive the repair is built on. A repair pass that is judged by the scanner
alone is pushed toward writing a path nobody can open, over a path a reader can `cat`. This pass
wrote the true path in all 40 places and accepted the red, which is the right way round but is not
a state anything can hold.

## Where the fix belongs

In the scanner, not in the records. Two shapes are available and this record does not choose
between them:

1. Let the two anchored branches of `findRecord()` accept an `archive/<sweep>/` prefix on the
   record's directory — that is, match either at the workbench root or under one archive sweep.
   The citation form stays exactly what the archive layout produces, and every one of the 40
   repaired citations resolves with no further edit.
2. Teach `REC_RE` an optional leading `archive/<sweep>/` segment, so the archive prefix becomes
   part of the token and the resolution is exact rather than prefix-tolerant. Stricter, and it
   distinguishes a citation of the archived copy from a citation of a live record that happens to
   share a basename.

Option 1 is the smaller change and the one that makes the already-written citations correct.
Option 2 is the one that can tell two records apart. Whichever lands, the accompanying question is
whether an archived record should be citable at all, or whether archiving is supposed to end a
record's life as a citation target — `skills/archive/SKILL.md` currently neither says nor checks.

## How to reproduce

```
cd hooks && npx tsx lib/__tests__/helpers/citation-scan.ts
```

then read any `wrong-store` hit whose reported match begins with `archive/`. Rewriting the citing
line to that reported path and rerunning leaves the hit unchanged.

---
**Answered by the user 2026-08-19, at the gate that step 6's report opened: fix shape 1.** The two
anchored branches of `findRecord()` accept an `archive/<sweep>/` prefix on the record's directory, so
a citation matches either at the workbench root or under one archive sweep. The citation form stays
exactly what the archive layout produces, and the 40 citations step 6 already wrote resolve with no
further edit.

The cost is stated rather than discovered later: resolution becomes prefix-tolerant instead of exact,
so a citation of an archived copy is not distinguishable from a citation of a live record sharing its
basename. Fix shape 2 was the one that could tell them apart and was not taken.

The deeper question this record raised alongside the two shapes — whether an archived record should be
a citation target at all, which `skills/archive/SKILL.md` neither says nor checks — is **not** answered
by this choice. Tolerating the prefix answers "can the grammar express it", not "should archiving end a
record's life as a target". That question stays open and wants a decision record of its own if anyone
wants it settled.

---
Resolved: fix shape 1, landed in `4aae336`. `anchoredUnder` and `unsweep` in `hooks/lib/__tests__/helpers/citation-scan.ts` let the two anchored branches of `findRecord()` resolve a record under exactly one archive sweep. Measured by joining every token before against after on file, line and token: forty-two citations moved from `wrong-store` to `resolved`, twenty-one from `dangling` to `stale-marker`, and nothing else moved. All forty this record was filed about resolve.

The prefix tolerance the answer accepted is stated at the branch rather than only here, and the second half of the twenty-one — citations of an archived record carrying a marker the archived copy does not have — became step 7's work rather than a residual.
