# `/fusion:next`'s Status guard and its `sed` action ask different questions, so a valueless field is skipped silently

---

**Severity:** Low — narrow input, but the guard and the act are not the same predicate, and the branch designed to be loud about the miss cannot fire
**Domain:** code
**Filed by:** coderev (Turn 4 review, range `b261d83..951c809`)
**Affects:** `skills/next/SKILL.md:186-193`
**Cross-references:**
`agents/orchestrator.md:254-292` (`## Circle head fields`, the definition this act implements);
`rules/critical-stance.md` §4 (a case split is disjoint and complete)

---

## What is wrong

`282ef42` gave `/fusion:next` the `**Status:**` write at activation, guarded so a record lacking the field says so rather than failing quietly:

```bash
mv "$CDIR/_a_circle.md" "$CDIR/_t_circle.md"
REC="$CDIR/_t_circle.md"
if grep -qE '^\*\*Status:\*\*' "$REC"; then
  sed -E 's|^\*\*Status:\*\*[[:space:]].*$|**Status:** active|' "$REC" > "$REC.tmp" && mv "$REC.tmp" "$REC"
else
  echo "note: $REC carries no **Status:** field, so none was set; the marker on the filename is the state" >&2
fi
```

The guard matches `^\*\*Status:\*\*`. The action matches `^\*\*Status:\*\*[[:space:]].*$` — one character more, and the character is mandatory. A line reading exactly `**Status:**` (no value, no trailing space) satisfies the guard and not the action: the `sed` copies the file through unchanged, `mv` succeeds, the `else` branch never runs, and the record keeps its valueless field with nothing said.

**Measured** with the exact snippet against two fixtures:

```
--- a.md  (line reads `**Status:**`)
grep matched; result:
4:**Status:**              <- unchanged, and no note printed
--- b.md  (line reads `**Status:** anticipated`)
grep matched; result:
4:**Status:** active
```

## Why it is worth fixing even at this width

The `else` branch exists specifically so a missing field is *audible*. A field present-but-empty is the same user-visible outcome — no status was set — and it is the one case the loudness does not cover. That is the disjointness property in `rules/critical-stance.md` §4: the guard's predicate and the action's predicate must be the same predicate, or there is a gap between them, and the gap here is exactly where the reporting was supposed to be.

The prose beside it also overstates what the shape buys: "`**Status:**` becomes `active` — the command above, in the same call as the rename, so **a rename cannot land without it**" (`skills/next/SKILL.md:200`). The `mv` and the rewrite are two commands in one block, not one atomic act; the rename can and does land alone in this case, and would also land alone if the block were interrupted between them.

## Second, smaller point

`$REC.tmp` is written inside the Circle directory. If the `mv` fails the `&&` prevents the clobber but leaves `_t_circle.md.tmp` sitting in the Circle, untracked and unmentioned. It does not collide with the `*_circle.md` glob at `skills/next/SKILL.md:176` (that requires the name to end in `_circle.md`), so nothing misreads it — it is litter, not a hazard. A `mktemp` outside the store, or an `rm -f "$REC.tmp"` on the failure path, removes it.

## Fix direction

Make the guard and the action one predicate. The simplest form asks the action whether it changed anything, rather than asking `grep` an approximate question first:

```bash
sed -E 's|^\*\*Status:\*\*.*$|**Status:** active|' "$REC" > "$REC.tmp" && mv "$REC.tmp" "$REC"
grep -qE '^\*\*Status:\*\* active$' "$REC" ||
  echo "note: $REC carries no **Status:** field, so none was set; the marker on the filename is the state" >&2
```

Dropping `[[:space:]]` from the pattern makes it cover the valueless line; asking the *result* rather than the input makes the note fire for every reason the write can miss, including ones nobody enumerated.

Correct `skills/next/SKILL.md:200` to say the write rides the rename in the same call, not that the rename cannot land without it.

## Acceptance criteria

- A record whose `**Status:**` line carries no value either gets `active` written or produces the note — never neither.
- No `.tmp` remains in the Circle directory on any path.
- `skills/next/SKILL.md:200` states what the shape actually guarantees.

---
Resolved: `skills/next/SKILL.md` Step 6.2 drops the `grep` pre-guard. The `sed` runs unconditionally with `[[:space:]]` removed from its pattern, so a valueless `**Status:**` line is rewritten, and the note is decided from the result (`grep -qE '^\*\*Status:\*\* active$'`) rather than from a separate test of the input — a field absent and a field present-but-empty both reach it. A failed write clears its own `.tmp` via `|| rm -f`. Verified against the record's three fixtures: valueless and valued lines both become `**Status:** active` with no note, an absent field produces the note, and no `.tmp` survives either the success or the `sed`-failure path. The prose beside the block now says the write rides the rename in the same call and that the two commands are not atomic, replacing the claim that a rename cannot land without the write.
