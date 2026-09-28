This repository's committed registry entry carries an alias an agent chose and consumes the one-shot user gate

---
`fusion-workbench/shared/checkouts/5e8248d7.md` was written during the building session as an acceptance test and committed. Its `**Alias:**` and `**Person:**` are values an agent chose. The design asks the human for both exactly once per checkout, and an existing entry is the whole test for "already asked", so the question will never be put.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. Not a code fault. A user gate was consumed by the agent it was built to route around, and the gate is one-shot, so the substitution is self-concealing.

## Evidence

- `fusion-workbench/shared/checkouts/5e8248d7.md` — `**Alias:** west-harbor`, `**Person:** Kai Stalmann`. `**Registered:**` and `**Refreshed:**` are the same minute, `260904-2106`, which is a register-then-register run rather than a session boundary.
- `git log --oneline -- fusion-workbench/shared/checkouts/` — one commit, `e9c14bdf`, the step that built the callers.
- `bin/fusion-checkout-name:107-133` — "`resolve` exiting 3 is the whole test for 'this checkout has never registered' … The entry is what records that the question was asked, so it is asked once per checkout and never again."
- `skills/setup/SKILL.md:356` — the branch that will now be taken here: "**`exit=0`** — registered. Bare `register`; act on any `collision=`." No question.
- `bin/monitor:1355-1367` — the header of this project's monitor will render `west-harbor · 5e8248d7`, a name the user did not pick.

## What it does not do

It does not travel to users. `install.sh:82` copies `.claude-plugin agents skills rules hooks bin stilwerk templates docs` and not `fusion-workbench`, so the entry stays in the source repository. And it changes no figure: with one git identity in the map, `canon` is still the identity function for this line.

## Acceptance test

The user either confirms the two values or replaces them, or the file is deleted so the next `/fusion:setup` asks. Separately, `skills/setup/SKILL.md` Step 0i states that a `register` run outside the asking branch never invents an alias or a person, so a future acceptance run cannot repeat this.

---
Resolved: 260904-1050-orchestrator-session.md `## Turn 4 — the two consumer findings` — the user was shown the entry and confirmed the name. `west-harbor` stands, the entry is unchanged, and the one-shot question stays consumed because there is nothing left for it to ask.

**What this does not settle.** The mechanism is untouched: the question still fires on the entry's absence, so any future checkout registered by anything other than the running setup consumes its own gate the same way. Nothing measured that as likely, and no record is filed for it.
