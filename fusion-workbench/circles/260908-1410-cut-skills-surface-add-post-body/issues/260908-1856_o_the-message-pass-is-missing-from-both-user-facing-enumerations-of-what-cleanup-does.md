The message pass is missing from both user-facing enumerations of what cleanup does, while its selector is listed in each

---

`skills/cleanup/SKILL.md` `## Step 8 — Report` enumerates one line per step — issues, commits, push, reconcile, archive, normative surfaces, activity log, citations, normative-surface sizes — and carries no line for the message half, although `## Step 7 — Commit the housekeeping artifacts, then push` lists `chore(workbench): leave a message for the other checkout` among its splits. `skills/help/SKILL.md` `### 2. Daily practice — *how to use it once installed*`, item 6, describes the pipeline as "files issues …, commits and pushes …, reconciles, archives, regenerates the activity log, then reconciles `CLAUDE.md` at the one gate …, and commits the housekeeping after your answer" and then offers `--only forum` in the very next clause.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Two sites, one shape: the selector is advertised and the step it selects is absent from the prose beside it. In `skills/help/SKILL.md` the two are eleven words apart.

The Step 8 gap is the one with a behavioural cost. `skills/post/SKILL.md` `## Step 6: report` produces "two lines at most: the path written, or that nothing was written and which of Step 3's two conditions or Step 5's unresolved identity is why" — and on the inline path that report has nowhere to go, because Step 8's list has no slot for it. Every other reason a message goes unwritten is silent for the same reason: `## Step 3: nothing to say is an answer`, the `UNRESOLVED` identity stop in `## Step 5: write the entry`, and the missing-gate cases recorded separately at `260908-1852_*_a-survey-that-proposes-nothing-leaves-the-message-draft-with-no-question-to-ride-on.md`. An unattended run is exactly the case Step 4 says the pipeline is built for, and it is the case where nobody watches the intermediate output.

Step 12 of the plan added `--only forum` to the help selector list on the reading that the list is an enumeration, and the plan recorded that reading as an open question worth nothing either way. It turns out to cost something: adding the selector without touching the sentence above it is what put the two out of step.

Both edits are a clause each and neither touches a byte budget that matters — Step 8 gains one bullet, help item 6 gains three words in a sentence it already has.

**Acceptance test:** `skills/cleanup/SKILL.md` `## Step 8 — Report` carries a line saying whether a message was written, its path, or why not; `skills/help/SKILL.md`'s pipeline sentence names the message pass among the steps it lists.
