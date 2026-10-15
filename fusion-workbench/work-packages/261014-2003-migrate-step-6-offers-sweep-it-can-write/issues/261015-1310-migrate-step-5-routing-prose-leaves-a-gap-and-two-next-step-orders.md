/fusion:migrate Step 5's routing prose leaves a git-mode exit unnamed and gives two next-step orders; line 18 overstates
---
Three small gaps in the routing text 13.1.2 wrote. (1) Step 5 ends a `MODE=git` run "that moved anything" and sends `MODE=plain` to Step 6; a git run that moved nothing (every entry a collision, or tracked-only with nothing tracked) has no named next step. (2) Step 5 now carries two next-step lists: "commit … and push it; tell the other checkouts to pull …; run `/fusion:setup`", then "commit the renames as one commit, then run `/fusion:migrate` again". `README.md` puts the push after the second run. (3) Line 18 says a v12-format workbench "renames nothing and asks only about citations the sweep still counts", but a Markdown-controlled one is then asked Step 7's repairs and its migrate question.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261015-1310-reviewer-closing-pass-over-the-migrate-step-6-package.md`

**Evidence.**

- `skills/migrate/SKILL.md` `## Step 5 — Report`, the last two paragraphs.
- `README.md`, "Upgrading from v11.11.2 or earlier v11?": "commit the renames as one commit, then run it again, push, and have the other checkouts pull".
- `skills/migrate/SKILL.md` line 18 (the intro paragraph beginning "Run it once after updating"), against `## Step 7`'s `**The question to migrate.**`.

**Fix direction.** Name the git-mode `moved=0` case (go to Step 6, or stop while collisions stand); fold Step 5 into one ordered list matching the README; say in line 18 that the run also offers the JSON migration while the workbench is Markdown-controlled.

**Acceptance.** Every Step 5 outcome names its next step, Step 5 and `README.md` give one order, and line 18 matches what Steps 6 and 7 ask.
