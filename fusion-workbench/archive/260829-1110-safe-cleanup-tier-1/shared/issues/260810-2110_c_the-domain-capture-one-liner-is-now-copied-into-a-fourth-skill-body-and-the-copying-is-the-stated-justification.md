The domain-capture one-liner is now copied into a fourth skill body, and the copying is the stated justification

---

`b3cc034` added the `agentstate.yaml` domain-read to `skills/cleanup/SKILL.md:65-71`. The same two
lines already stand in `skills/next/SKILL.md:74-76`, `skills/direct/SKILL.md:56-58` and
`skills/seed-from-plane/SKILL.md:78-80`. The commit's own reasoning is *"the same one-liner
`/fusion:next`, `/fusion:direct` and `/fusion:seed-from-plane` already use"* — three existing copies
cited as the ground for a fourth.

---

**The change is right; the mechanism is not.** Taking the domain from `agentstate.yaml` instead of
re-deciding it is exactly what the release-blocking finding asked for, and cleanup's version adds
`DOMAIN_SOURCE` so the fallback is reported rather than applied silently — a genuine improvement over
the three it was copied from, which are now three lines behind it.

That divergence, on the first copy, is the whole defect. The four sites are already not identical.

**Why this is the same class the same commit fixed.** `hooks/lib/domain-cascade.ts:33-45` now says it
in the module's own words: running the prompt's block *"keeps THIS file from being a second copy; it
says nothing about any other consumer."* A grep-shaped duplication of two shell lines across four
skill bodies is that arrangement one size down, and `rules/critical-stance.md` §2 names it:
*"A new mechanism that duplicates one already in the system is a defect, not a solution."*

**Fix direction.** The one-liner does three things — locate `agentstate.yaml`, read `session.domain`,
fall back to `code` and say which happened. All three belong in one place. Two candidates:

1. A `bin/` helper (`fusion-session-domain`) printing `domain=` and `source=`, called the way
   `bin/fusion-count-sources` is, with the `[ -x ]` guard convention decision `260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md` settled.
2. `bin/fusion-paths` gaining a `DOMAIN` key, since every consumer already calls it at its first step
   and the value is workbench state like the rest. This is the cheaper call site but stretches what
   the resolver is for — it resolves *paths*.

Whoever takes this should read
`archive/260817-1907-safe-cleanup-scoped/260810-2030_*_the-source-root-resolution-is-stated-in-two-skill-bodies-and-has-no-single-home.md`
first. That record proposes a `bin/` helper for a different duplicated criterion in the same skills,
and weighs the cost of adding one against a thin case. Two duplicated criteria make a thicker case
than either alone, and one design decision should cover both.

**Cross-references.** `skills/cleanup/SKILL.md:63-72`; `skills/next/SKILL.md:69-80`;
`skills/direct/SKILL.md:52-60`; `skills/seed-from-plane/SKILL.md:74-82`;
`260810-0921_*_how-should-a-prompt-call-a-bin-helper-that-the-installed-copy-may-not-have.md`.

**Filed by:** coderev, review of session `260810-1646-orchestrator-session.md` Turn 2, range `da8c9db..b3cc034`.

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`; log `260817-1836-reconciliation.md`). The count in the title is now wrong and the defect is not. `skills/seed-from-plane/` left with the Plane mirror on 2026-08-15, so three copies remain rather than four: `skills/next/SKILL.md:88`, `skills/direct/SKILL.md:57`, `skills/cleanup/SKILL.md:107`. No mechanism was introduced — there is no domain helper in `bin/` and no `DOMAIN` key in `bin/fusion-paths`. The reserved half of decision `260810-2145_*_should-a-repeated-skill-body-snippet-become-a-bin-helper-now-that-one-fact-lives-in-four-executable-copies.md` is what this record waits on, and that record is deliberately still answered rather than implemented for exactly this reason.

---
Resolved: fixed — the three inline reads are three guarded calls to `bin/fusion-session-domain` (step 7's helper), which prints `domain=` and `source=` so a fallback is reported and not applied silently; `skills/next/SKILL.md:76`, `skills/direct/SKILL.md:52`, `skills/cleanup/SKILL.md:106`
