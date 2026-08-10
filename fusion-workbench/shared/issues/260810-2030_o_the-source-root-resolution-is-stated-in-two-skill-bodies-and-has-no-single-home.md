The source-root resolution is stated in two skill bodies and has no single home

---

`skills/setup/SKILL.md` and `skills/next/SKILL.md` each carry the same two-line branch:

```bash
if "$FUSION_PLUGIN_ROOT/bin/fusion-plugin-cwd" 2>/dev/null; then FUSION_SRC="$PWD"; else FUSION_SRC="$FUSION_PLUGIN_ROOT"; fi
```

The executor that wrote it kept the surrounding paragraph byte-identical in both files, deliberately,
so a diff between them shows drift. That is a good mitigation and it is not a gate: nothing fails
when the two diverge, and the same snippet is re-resolved inline at two further sites within those
files, because each shell call is a fresh shell.

The proposal from that executor: a `bin/` helper that prints the source root, giving the resolution
one home instead of a branch in every consumer. `bin/` was read-only for that task.

---

**Why this is worth a record and not just a nice-to-have.** It is the same class as the
release-blocking finding this Turn is fixing. `skills/cleanup/SKILL.md` carried a second copy of the
domain cascade, in the order from before a fix, and no gate read it, so the two copies diverged
behaviourally in a way nobody could see. The source-root branch is a smaller instance of the same
arrangement: one criterion, several statements of it, no mechanism keeping them equal.

There is also a precedent for exactly this criterion having one home. `bin/fusion-plugin-cwd` exists
so the "is this the plugin's own repo" question has a single implementation, and `CLAUDE.md` records
that its shell half and `hooks/lib/self-detect.ts` are a matched pair to be changed together. The
branch above consumes that helper and then re-derives what to *do* with the answer, four times.

**What a helper would have to preserve**, and none of it is optional:

- The check is at the working directory with **no upward walk**. From a subdirectory of the plugin's
  own repository the answer must be the install, matching the TypeScript half by construction.
- It must be usable from a skill body, which is where the four call sites are.
- The `queue-check: UNAVAILABLE` path must still fire when the resolved copy lacks the section, and
  it must name the copy it resolved to, so a user knows which one was read.

**Weigh it against the cost.** A third `bin/` helper is a real addition to a surface that agents and
skills both call at Setup, and two call sites is a thin case for one on its own. The argument for it
is not the count but the class: this is the second duplicated-criterion finding in one session, and
the first one shipped a false claim that no second copy could exist.

**Filed by:** orchestrator, session `260810-1646`, on the rooted-citations executor's proposal.
