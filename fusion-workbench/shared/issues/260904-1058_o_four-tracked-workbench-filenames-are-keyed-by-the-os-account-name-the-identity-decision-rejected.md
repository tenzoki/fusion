Four tracked workbench filenames are keyed by the OS account name the identity decision rejected

---
`memos-$USER.md`, `tasks-$USER.md`, `cadence-$USER.md` and `activity-log-$USER.md` are named from `$USER`. Three of them live in the memo store, which is class R1 and travels. R1's defining property is one writer per file, and `$USER` cannot hold it.

---
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>

**Severity:** Medium. Latent in a single-checkout project, unavoidable in the multi-checkout arrangement fusion now supports.

**Cross-references:**
`260904-1058-identity-per-instance-and-the-checkout-registry.md` `### 3. A defect found on the way` (the measurement);
`260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md` (the answer whose reasoning this contradicts);
`rules/workbench-tracking.md` `## The four classes`.

## Evidence

- `skills/memo/SKILL.md:33-34`: `$WORKBENCH/$OUT_MEMO/memos-$USER.md` and `tasks-$USER.md`.
- `skills/cadence/SKILL.md:177`: `$WORKBENCH/$OUT_MEMO/cadence-$USER.md`.
- `skills/log-activity/SKILL.md:34`: `activity-log-$USER.md`, in the project root rather than the workbench.
- `rules/fusion-workbench-conventions.md` `## fusion-workbench Layout` places the memo store under `shared/`, and `git check-ignore -q fusion-workbench/shared/memos` in this tree exits non-zero, so the path is not ignored.
- `rules/workbench-tracking.md` `## The four classes` gives R1 as "Many files, one writer each".

## The defect

`$USER` is an OS account name. The identity decision rejected it as an identity source on exactly this ground: "`$USER` is not unique across several instances on one machine, and the git identity is not unique either when one person works from several checkouts or several computers."

Two failure directions follow, and both land on tracked files:

1. Two people whose machines both call them `ubuntu`, `dev` or `admin` write one tracked `memos-ubuntu.md` from two checkouts. Two writers, one R1 file, git conflicts on a personal log nobody expects to merge.
2. One person whose machines call him `k1` and `kai` gets two memo files, two task lists and two cadence digests, with nothing stating that they are one person's.

## Acceptance test

Either the four filenames are keyed by something the project's own identity decision accepts, or the memo store's classification states why R1's one-writer property does not bind it. A reader can then answer, from the text alone, what happens when two checkouts carry the same `$USER`.
