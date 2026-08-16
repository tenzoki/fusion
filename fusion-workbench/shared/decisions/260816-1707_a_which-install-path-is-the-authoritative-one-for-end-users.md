# Which install path is the authoritative one for end users?

---
**Domain:** code
**Status:** answered
**Filed by:** orchestrator (on the user's answer, as a prerequisite to `260816-0719`)
**Cross-references:** `shared/decisions/260816-0719_a_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md` (the decision this unblocked); `install.sh`; `CLAUDE.md` `### HTTPS installer` and `## Release process` step 5

---

## Question

`install.sh` downloads `heads/main` by default and documents `FUSION_REF=tags/v<version>` as an
opt-in pin. Which of the two is the *policy* has never been written down, and
`260816-0719` was blocked on exactly that: whether a release-step check can suffice depends on
whether an intermediate commit is something a user can install.

The record refused to infer the answer from the default, on the ground that "today" is one line in
a script and a policy is not a default.

## Options

1. **`heads/main` is the standard.** Users get the latest state; a tag is an opt-in pin.
2. **Tags become the standard.** `install.sh` resolves the latest tag; `heads/main` becomes opt-in.

## Constraints

- Every release already tags (`CLAUDE.md` `## Release process` step 5), so option 2 is available
  without new process. What it would cost is a change to `install.sh` and to the four documented
  version surfaces.
- Whatever is chosen governs what a gate over `hooks/dist` has to cover.

## Recommendation

None was offered; this was put to the user directly as the prerequisite it is.

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 1: `heads/main` stays the default install path, tags remain an opt-in pin. Consequence: a release-step check over `hooks/dist` is insufficient by construction, which eliminated option 3 of `260816-0719`. User answered inline 2026-08-16.
Implemented:
Deferred:
Superseded by:
Retired:
