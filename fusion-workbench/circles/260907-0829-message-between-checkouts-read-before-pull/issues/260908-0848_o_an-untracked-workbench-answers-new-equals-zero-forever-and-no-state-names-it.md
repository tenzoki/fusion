A project that does not track its workbench gets `new=0` forever, and no state or note says why

---

`bin/fusion-forum new` computes its delta from two `git ls-tree` listings of the store path. In a project whose `fusion-workbench/` is not tracked by git the store is in no tree, both listings are empty, and the answer is `state=ok new=0` on exit 0 — permanently, whatever anybody wrote. `skills/news/SKILL.md` Step 3 then renders *Nothing new on `<ref>` since the last time you looked.* every time.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Whether a project tracks its workbench is that project's own decision and fusion ships no rule for it (`rules/fusion-workbench-conventions.md` `### Which of them a tracked workbench tracks`, first sentence). So the untracked configuration is supported, and in it the whole feature is inert and silent.

Measured, not inferred. Scratch fixture: bare origin, an author checkout with `fusion-workbench/` in `.gitignore` and one conforming entry in `shared/forum`, a reader clone. `bin/fusion-forum new shared/forum` printed:

```
state=ok
branch=main
ref=origin/main
head=f149f159…
mark=none
new=0
```

The same fixture with the workbench tracked returns `new=2`.

`bin/fusion-forum:99-114` presents the state vocabulary as total — each non-`ok` value "names why there is nothing to read against". This case falls through into `ok`, which is the overlap `rules/critical-stance.md` §4 rules out: a real answer and an unanswerable question share one value. The three `note=` degradations at `bin/fusion-forum:52-58` do not cover it either.

Related, and the same root: the header's *Why the no-mark case needs no rule of its own* (`bin/fusion-forum:168-175`) bounds a first run by the archive step pruning the store by age *and the pruning commit travelling*. Both halves need a tracked workbench, and the archive step is skippable (`--skip archive`).

**Acceptance test:** in the untracked fixture above, `bin/fusion-forum new shared/forum` either names the condition (a `state=` value of its own, or a `note=`) or exits non-zero; in the tracked fixture it still returns `new=2` with no new note. `skills/news/SKILL.md` says what the user should do about it.
