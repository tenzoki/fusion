# `/fusion:commit`'s primary path stages at Step 2 and locks only the commit at Step 6 — the stage+commit pair the rule promises is split across a user confirmation

**Filed by:** coderev (incremental review of Turn 2, commits `c45fb44..81d4154`, lock retrofit of `81d4154`)
**Scope:** `skills/commit/SKILL.md` (primary), `rules/workbench-stash-and-lock.md:128` (the rule bullet overstates what the skill does)
**Severity:** Medium — the lock's own defended failure mode (commit absorption) stays open on the skill's most common path, with an unbounded interactive window

---

## The defect

The retrofit in `81d4154` wraps Step 6's commit in the lock, and adds a pair form "if staging is still pending at this point". But the skill's own flow makes the pair form the exception, not the rule:

- `skills/commit/SKILL.md:20` — Step 2 stages: the user picks "stage all, specific files, or cancel", and `--all` "stages all changes automatically". Staging happens **here**, unlocked.
- Steps 3–5 then read the staged diff, generate the message, and **wait for the user to confirm, edit, or cancel** — an unbounded interactive window with the index already populated.
- `skills/commit/SKILL.md:68` — Step 6's primary form locks the bare `git commit -m` only.
- `skills/commit/SKILL.md:71-74` — the held stage+commit pair applies only when "nothing was staged yet", which Step 2's flow makes rare.

Parallel sessions on one project share one `.git/index`. `git commit` commits the index — all of it. So during the Step 2→6 window, any parallel committer that correctly takes the lock (orchestrator Phase 2 Step 3b, `/fusion:cleanup`) runs `git add X && git commit` and **absorbs this session's staged files into its own commit**. That is precisely "commit absorption", the race named in `bin/fusion-commit-lock`'s header (lines 3–7) as the thing the lock exists to defend against. The lock cannot help when one party's stage sits outside it — the serialisation only works if stage+commit are atomic on **both** sides.

The updated rule bullet (`rules/workbench-stash-and-lock.md:128`) claims each committing skill "wraps every stage+commit pair in `with <skillname> --`". For `/fusion:commit`'s primary path this is not true as written: the pair is split.

## What is NOT wrong

- The tags (`commit`, `cleanup`) match the rule's tag conventions.
- No deadlock path: the lock is held only for the duration of a single Bash call (`with` releases on any exit via trap); no skill dispatches an agent while holding it.
- `/fusion:cleanup` Step 2 (`skills/cleanup/SKILL.md:93`) holds the pair correctly.

## Recommended fix

Defer staging to Step 6: Step 2 becomes selection only (record which paths the user picked; stage nothing), and Step 6 always uses the held-pair form `with commit -- bash -c 'git add <paths> && git commit -F <msg-file>'`. Step 3's `git diff --cached` becomes `git diff -- <paths>` for the message analysis. If pre-staging must stay (user may arrive with an already-staged index), Step 6 should at minimum re-verify `git diff --cached --stat` inside the lock before committing, and the rule bullet should state the residual honestly instead of claiming the pair. Update `rules/workbench-stash-and-lock.md:128` to match whichever behavior ships.

---

**Resolved:** 2026-08-06 (coder) — `skills/commit/SKILL.md` restructured so no path is ever staged outside the lock. Step 2 is now selection-only ("do NOT stage yet", with the absorption rationale inline); step 3 analyses `git diff --cached` (pre-existing staged) plus `git diff -- <selected paths>`; step 6 always writes the message to a scratch file and runs the held pair `fusion-commit-lock with commit -- bash -c 'git add <paths> && git commit -F <msg-file>'`, with the bare-commit form reserved for the case where everything was staged before the skill started (that residual is the user's own pre-staging, not the skill's). `--all` flag text aligned. The rule bullet `rules/workbench-stash-and-lock.md:128` ("wraps every stage+commit pair") is now true as written — no edit needed there. Verified by walking the skill text: the only `git add` occurrence sits inside the locked `bash -c` pair.
