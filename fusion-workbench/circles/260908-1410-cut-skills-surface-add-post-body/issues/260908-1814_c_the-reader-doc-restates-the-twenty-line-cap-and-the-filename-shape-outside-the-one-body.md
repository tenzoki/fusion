The reader doc restates the twenty-line cap and the filename shape, outside the one body that now owns them

---

`docs/messages-between-checkouts.md` states the composition contract's two numeric facts in its own words: the twenty-line shape with both halves, and the entry filename. Circle `260908-1410-cut-skills-surface-add-post-body` moved that contract into `skills/post/SKILL.md` so it would exist once; it exists once in the executable text and twice in the tree.

---
**Filed by:** reconciler, Kai Stalmann <ks@qantr.com>

**Evidence.** `docs/messages-between-checkouts.md` says "Twenty lines in the file: a subject, a blank line, up to eight lines addressed to a person, a blank line, up to nine lines of pointer block", and a few lines below, "Each entry is one file per session, named `YYMMDD-HHMM-<checkout>-<slug>.md`, with a single writer." `skills/post/SKILL.md` `## Step 2: compose the draft` and `## Step 5: write the entry` state the same two facts as the procedure. Grepping the four contract elements over `skills/`, `docs/`, `README*.md` and `CLAUDE.md` at HEAD `ee99a578` finds no third site.

**What is and is not claimed here.** The Circle's own stopping condition reads "the contract exists in exactly one file", and on the whole tree it does not. The severity is lower than the drift the inverted shape was built to prevent: a doc writes nothing, so a later change to the cap cannot make two entry points write different files — it can only make the doc describe a mechanism the shipped body no longer has. The doc predates this Circle (commit `bf1e16f5`) and no plan step named it, so this is a residual the Circle inherited rather than one it created.

**The decision the record wants.** Whether a reader-facing doc may carry a numeric restatement of a contract that a body owns. Both readings are defensible — a doc that gives no number cannot explain the shape to a reader, and a doc that gives one is a second copy — and this project has already answered the same question one way for `bin/` helper headers, which are named as authoritative and cited rather than restated in `CLAUDE.md`.

**Acceptance test.** Either the doc cites `skills/post/SKILL.md` for the cap and the filename instead of restating them, or a written-down reading says that a reader doc may restate a contract and what happens when the two disagree.

---
Resolved: the doc cites instead of restating — the first branch of the acceptance test. `docs/messages-between-checkouts.md`
`## What a message looks like` now names the parts in order and says a line cap exists, and sends the cap, its
arithmetic and the blank lines to `skills/post/SKILL.md` `## Step 2: compose the draft`; the filename sentence
keeps what a reader uses (one file per session, one writer, the name carrying stamp, checkout and slug) and
sends the pattern to `rules/fusion-workbench-conventions.md` `## Filename Patterns`, which is its authoring
home. A stale pointer in the same file went with it: `## Where the mechanism is written down` named "the
message half of `skills/cleanup/SKILL.md`" and now names `skills/post/SKILL.md`.

**Why cut rather than leave.** Three reasons, in increasing weight. First, the doc had already ruled this
question for itself, two sections below the restatement: `## Where the mechanism is written down` says of
`bin/fusion-forum`'s header that "None of it is copied here, deliberately: a second copy drifts from the
first, and the first is the one the program obeys." A page that states that policy and then restates another
body's numbers is inconsistent with itself inside one file, and the inconsistency is not a close call about
which reading is better — one half of the page is already the project's answer. Second, the copy did not
merely risk going stale; it replicated an open defect verbatim. `260908-0849_*_the-twenty-line-cap-counts-a-draft-that-is-never-the-file-that-gets-written.md`
holds that "twenty lines in the file" beside "up to eight ... up to nine" states the arithmetic two ways, exact
count and ceiling, and the doc's sentence carried the same construction. Resolving that defect in the body
would therefore have left a second page asserting the retired reading, with nothing to make anyone look at it.
The page even exhibited both readings at once: its own worked example is ten lines. Third, this session filed
two defects that are exactly the second-statement failure, so leaving a third instance standing on the
argument that this one is harmless would be a judgement the same day's evidence contradicts.

**What the counter-argument bought, and where it landed.** The case for leaving it is real: a doc writes
nothing, so it cannot make two entry points write different files, and a reader-facing page that refuses to
say how long a message may be is worse for its reader. The second half is answered rather than overruled —
the page still says there is a cap, still names the three parts in order, and still shows a worked example, so
a reader learns the shape and that the message is short. What was removed is the arithmetic, which only the
writing procedure needs and which the writing procedure already owns. The first half is why this is a cut and
not a defect: the severity was low, and the fix is correspondingly cheap.
