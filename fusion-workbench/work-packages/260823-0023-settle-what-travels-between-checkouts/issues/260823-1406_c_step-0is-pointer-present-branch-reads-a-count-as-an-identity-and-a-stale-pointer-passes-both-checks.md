Step 0i's `pointer-present` branch reads a count as an identity, and a stale pointer passes both this check and the resolver's

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 3
**Affects:** `skills/setup/SKILL.md:359` (the first branch of the widened table)
**Cross-references:** `260823-1318_*_step-0i-detects-multiple-active-only-when-the-pointer-is-absent-while-naming-the-whole-condition.md`, the widening this text arrived with; `agents/playmaker.md:95`, which defines `MISSING-POINTER`

---

## What is wrong

The widened branch table reads:

> **No path, or one path with `pointer-present`** — no active record, or this checkout activated it. Report nothing, ask nothing.

The probe prints `pointer-present` when `./fusion-workbench/.active-circle` exists. It never reads what the pointer holds, so "this checkout activated it" is an inference from a count of one and a file's existence, not from the two naming the same Circle. Where the pointer names Circle A and the single `_t_` record is in Circle B, the checkout is in `MISSING-POINTER` for B, since `agents/playmaker.md:95` puts no pointer-identity condition on the definition, and Step 0i reports nothing.

**Nothing downstream catches it.** `bin/fusion-paths` validates the pointer for emptiness, path separators and directory existence (`bin/fusion-paths:255-278`) and never reads the record's marker, so a pointer naming an existing Circle whose record is terminal exits 0. The session then runs with a closed Circle as its `OUT_*` base while holding an unactivated active record it was never told about.

**The narrowing is inherited, the sentence is new.** The old probe short-circuited on the pointer and reported nothing in this state either. What `a2a18f9` added is the explicit claim about why, in a table that otherwise now matches its condition exactly. The step is one branch away from saying what it means.

## Verified

Ran the shipped block in six scratch trees. Two records with a pointer prints `pointer-present` and both paths, exit 0. That is the case this Turn fixed, and it works. One record plus a pointer naming a different directory prints `pointer-present` and the one path, which the table sends to the report-nothing branch. `bin/fusion-paths:255-278` read in full: three pointer checks, none of them about a marker.

Two notes that are **not** findings. The block exits 1 when `./fusion-workbench/circles` does not exist, pointer or not, because `find` is last and errors; Step 0's `mkdir -p ./fusion-workbench/circles` at `skills/setup/SKILL.md:80` runs first, so the state is unreachable in the ordinary flow. And the ordering claim in the commit message holds as written: with the two commands swapped the block exits 1 whenever no pointer is present, which is one of the two conditions the step reports.

## Direction, not a prescription

Read the pointer's content rather than its existence, and compare it against the directory the found record sits in. That is one `head -n 1` and one string test in a block that already computes both halves; the surface has 202 bytes left, which is the constraint to check first.

The cheaper alternative is to make the sentence true: say the branch reports nothing when a pointer is present, without claiming the pointer names the Circle that was found.

---
Resolved: fixed — the branch text says what it does, report nothing when a pointer is present whichever Circle it names, and no longer infers that this checkout activated the record (the cheaper form the record offered); `skills/setup/SKILL.md:356`
