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

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`). Answer recorded, not yet realised — marker stays `_a_`. The chosen policy is still not written down, which is precisely what this record said a default is not a substitute for. `install.sh:34` reads `REF="${FUSION_REF:-heads/main}"` and its header at `:25-27` documents the tag pin as an option, exactly as before the answer. No sentence in `README.md`, `CLAUDE.md` or `docs/` states that `heads/main` is the standard and the tag an opt-in pin.

---
**Reconciliation 260819-1400 (reconciler, domain `code`, HEAD `e435f03` / `v10.3.0`) — marker
unchanged at `_a_`; re-verified after 260817-1836, including against an `install.sh` that was edited
in the meantime.**

`install.sh` is one of the files `2552586..HEAD` touched, so this was re-read rather than inherited.
`install.sh:34` still reads `REF="${FUSION_REF:-heads/main}"` and its header at `:25` still
documents the tag pin as an option. `CLAUDE.md:110` states "The default ref is `heads/main`" — which
is a description of the script, and describing the default is precisely what this record refused to
accept as a statement of policy. No sentence in `README.md`, `CLAUDE.md` or `docs/` says that
`heads/main` is the standard and the tag an opt-in pin.

One thing worth separating. The answer's **consequence** is already consumed and recorded: it
eliminated option 3 of
`shared/decisions/260816-0719_a_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md`,
whose own `Answered:` line names this record for it. So the decision has done its work as a
prerequisite; what is unrealised is only the sentence that makes the policy readable by someone who
was not in the session.

**What binds a deep change.** Every commit on `main` is installable by an end user running the
documented default. There is no release boundary protecting an intermediate state, so "it will be
fixed before the tag" is not available as a mitigation for anything a deep change breaks on the
default path.
