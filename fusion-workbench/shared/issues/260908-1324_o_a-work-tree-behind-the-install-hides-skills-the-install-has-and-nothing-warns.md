A work tree behind the install hides skills the install has, and nothing warns

---

`bin/fusion-paths` and `bin/fusion-rules` prefer this repository's work tree over
`$FUSION_PLUGIN_ROOT` when the working directory is fusion's own plugin repo. When that work tree
is *behind* the installed copy, the preference hides what the install has: a skill added after the
work tree's last pull does not resolve, `fusion-paths <name>` exits 2 on it, and every key that
skill would have named is unvalued. Nothing says the cause is the work tree's age.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Measured, on this machine, 260908.** A second fusion session in a checkout 21 commits behind
`origin/main` ran `/fusion:news`. Install v10.25.0, work tree v10.24.0, and both
`skills/news/SKILL.md` and `bin/fusion-forum` landed in the gap. `fusion-paths news` exited 2 with
`unknown name 'news'`, so `SCAN_FORUM` had no value and the run stopped rather than improvising a
store path. The session diagnosed it correctly and unaided, which is the only reason it is written
down here rather than lost.

**The known residual runs the other way, and this is its inverse.**
`260806-0015_*_veraltete-regeln-im-eigenen-repo-melden-oder-umgehen.md` chose the work-tree
preference to fix a stale *install* shadowing fresh *sources*, and `CLAUDE.md` records the leftover
cost in that same direction: the hooks always run from the installed copy, so a stale install still
means stale hook behaviour while you edit hook sources. The direction measured here is not written
anywhere: a fresh install shadowed by a stale work tree, where the symptom is not wrong behaviour
but an absent capability.

**Why it is sharper than it looks.** The two directions have opposite remedies. The recorded one is
fixed by `fusion --update`; this one is fixed by `git pull`, and `fusion --update` does nothing for
it. A person who has read the documented residual will reach for exactly the wrong command, and the
error message names neither.

**What exists nearby and does not cover it.** `hooks/session-start.ts` warns when the workbench root
sits above the working directory, which is the *subdirectory* case and a different condition. The
`[ -x ]` guard convention covers a helper absent from the install
(`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`),
which is again the opposite direction. Neither fires here.

**Acceptance.** A session whose work tree is behind the installed plugin either learns so at a
point where the information is still cheap, or the resolver's exit-2 message names the work-tree
preference as a possible cause. Whichever is chosen, `git pull` and `fusion --update` are
distinguishable from the message alone.
