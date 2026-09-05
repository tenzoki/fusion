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

---
Resolved: the four filenames are keyed by the minted checkout identifier, the key `260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md` accepts and the one `shared/checkouts/` already uses, so R1's one-writer property holds by construction and no filename reads `$USER`. The name shape, the resolution call, the unresolved case and the adoption of a legacy login-keyed file are authored in `rules/fusion-workbench-conventions.md` `## Filename Patterns`; why the checkout and not the person is argued in `bin/fusion-identity`'s header, `## What the identifier keys, and why the person does not`. Consumers changed together: `skills/memo/SKILL.md`, `skills/cadence/SKILL.md`, `skills/log-activity/SKILL.md`, the two table rows in `## Filename Patterns`, `README.md`, `README-agents.md` and `docs/fusion-intro.md`. The activity log stays in the project root: the key was what was wrong, and a root file sits outside the four-class partition, so it takes its one-writer property from the key alone. An existing `memos-<login>.md` is renamed onto the new key by the skill that writes it, on its next run, when this checkout's `$USER` is the suffix and nothing stands at the new name — otherwise left in place and named in the report; nothing is merged and nothing is deleted. `260904-1058_*_cadence-names-its-report-after-one-person-and-reports-every-persons-work.md` is untouched: this moves the filename half only, and the gathering half of that record stays open.
