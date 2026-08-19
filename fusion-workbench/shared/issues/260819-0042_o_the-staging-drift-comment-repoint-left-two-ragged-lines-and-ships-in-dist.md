The staging-drift comment repoint left two ragged lines, and ships in `dist/`

---

`b200902` repointed two doc comments in `hooks/lib/staging-drift.ts` from the old conventions anchor
to `rules/workbench-tracking.md` by substituting the citation in place, without reflowing the
paragraphs the shorter citation left short.

---

`hooks/lib/staging-drift.ts:85-88`:

```
 *   - `in-flight` — the live-state surfaces `rules/workbench-tracking.md`
 *     groups as "do not track it",
 *     plus the two tracked-but-machine-written ones and the session's own
 *     history file. Never a fault.
```

`hooks/lib/staging-drift.ts:165-169`:

```
 * The first five are the "do not track it" group of
 * `rules/workbench-tracking.md`; this repository's own `.gitignore` applies
 * exactly that split, so in
 * a project that follows it they never reach `git status` at all.
```

Line 86 carries four words and line 167 carries three, in a file whose every other comment line runs
to the column. The content is correct — `LIVE_STATE`'s first five entries are all in the new file's
live-state group, checked at HEAD — and nothing behaves differently. It is cosmetic and it is the
kind of thing that is cheap now and never gets done later, in a header that
`README-hooks.md`'s `hooks/lib` table sends readers to.

It also reached `hooks/dist/lib/staging-drift.js`, which is committed and shipped in the installer
tarball, so the ragged form is in what a consuming project has on disk.

Verified at HEAD `b54ace5` by reading `hooks/lib/staging-drift.ts:78-92` and `:160-175`, and by
`git diff 52b1d95..b54ace5 -- hooks/lib/staging-drift.ts`, which shows both hunks as citation
substitutions with the surrounding lines untouched.

**Fix direction.** Reflow the two paragraphs and rebuild `dist/`. Nothing else in the file is
affected.

Found in the coderev pass over `52b1d95..b54ace5`, session `260818-2301`. No Circle active, so it is
filed in the shared store under the Origin Rule.
