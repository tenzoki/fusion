The retired staging-drift example survives at two authoring sites and the closure note names one

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 1
**Affects:** `hooks/staging-drift.ts:23`, `bin/fusion-staging-drift:14`, `hooks/dist/staging-drift.js:23`
**Cross-references:** `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-0800_c_two-further-surfaces-classify-portfolio-md-as-an-authored-record.md`, whose closure note names the first of these

---

## What is wrong

Commit `cc5abd7` moved `portfolio.md` from `ROOT_RECORDS` to `LIVE_STATE`, so `classify` can no longer return `record` for that path. Two worked-output examples still print exactly that row:

```
hooks/staging-drift.ts:23
 *     record          M portfolio.md  UNSTAGED  (the Circle portfolio briefing — …)

bin/fusion-staging-drift:14
#     record          M portfolio.md  UNSTAGED  (the Circle portfolio briefing — …)
```

`hooks/dist/staging-drift.js:23` carries the first as compiled output and moves with it.

The closure note on `260823-0800_c_…` names `hooks/staging-drift.ts:23` and calls it "a third site this record did not name". It is the third and the fourth: `bin/fusion-staging-drift` is a separate authoring surface, and `CLAUDE.md`'s layout table makes that script's own header the authoritative documentation for the wrapper, with the row deliberately not restating it. So the header a reader is sent to demonstrates a classification the code cannot produce.

## Verified

Read at HEAD `2f1e3a6`. `grep -n portfolio hooks/staging-drift.ts bin/fusion-staging-drift hooks/dist/staging-drift.js` returns one hit each, all the same line. `classify` at `hooks/lib/staging-drift.ts:404` tests `LIVE_STATE` before `ROOT_RECORDS`, and `portfolio.md` is now in the former, so the row is unreachable.

## Direction, not a prescription

Replace `portfolio.md` in both examples with a path the classifier does return `record` for. The suite already made that substitution for its own fixtures and chose a Circle record; using the same one keeps the examples and the tests illustrating one thing. `hooks/dist/` follows from `npm run build`.

---

Resolved: 2026-08-23 by coder. Both authoring sites now print a row the classifier can produce.
`hooks/staging-drift.ts:23` and `bin/fusion-staging-drift:14` read
`record M circles/<dir>/_t_circle.md UNSTAGED (a Circle record)`, which is the
`segments[0] === "circles" && name.endsWith("_circle.md")` branch at `hooks/lib/staging-drift.ts`
and the same class the suite's `CIRCLE_RECORD` fixture exercises. `hooks/dist/staging-drift.js`
follows from `npm run build`.

**Why a placeholder and not the fixture's literal path.** The suite uses
`circles/260811-0100-close-the-findings/_t_circle.md`, which exists only as a scratch fixture. A
literal Circle-record spelling in shipped text is a citation to both gates that read this repository:
`reference-resolution-lint` scans `bin/*` comments and `hooks/*.ts` comment lines, and a Circle
record that does not exist in the workbench does not resolve. `<dir>` makes the token a placeholder
under `isPlaceholder()`, which is what the surrounding example already does for `stilwerk/…`. The
class illustrated is identical, which is what the record asked for.

**Measured.** Neither file is on a bounded surface; `hooks/staging-drift.ts` is a CLI entrypoint, not
a `hooks/lib/__tests__` line. The citation pin did not move for this edit: `portfolio.md` was never a
counted token and the replacement is exempt.

**Files:** `hooks/staging-drift.ts`, `bin/fusion-staging-drift`, `hooks/dist/staging-drift.js`,
`hooks/dist/staging-drift.d.ts`. Uncommitted at the time of writing; the orchestrator commits.
