# The token-for-token case restates `GATE_KINDS` as a literal, and nothing catches the next drift

---

`hooks/lib/__tests__/reference-resolution-lint.test.ts:1197-1209` holds a second copy of the gate's
kind list, and says so on purpose:

> Deliberately a literal restatement of the helper's own GATE_KINDS rather than an import: the point
> of this case is that the two views agree about WHICH kinds the gate reads, and a shared constant
> would make them agree by construction.

The reasoning is sound and the copy has already failed once. The step-9 history records it: the
literal "listed three kinds and had never learned `circle-record` from step 8b, passing only because
the shipped surface carries no such token". So the copy was wrong for two steps and the case that
exists to catch a divergence between the two views was itself the divergence.

Nothing prevents the recurrence. The case compares the gate's verdict against the scan's over the
shipped surface, and the shipped surface carries **one** token outside the three original kinds: a
single `circle-record`, and it is exempt (`skills/migrate/SKILL.md:96`, a record-example file). So a
kind added to `GATE_KINDS` and forgotten here is invisible for exactly the same reason it was
invisible the first time — the corpus this case runs over has no instance of it.

---

**Severity:** Low — the gate's behaviour is correct; what is weakened is a cross-check, and it was
weakened silently for two steps.
**Domain:** code
**Filed by:** `coderev`, reviewing `b91c01c..bbfc912`
**Owner:** `coder`
**Affects:** `hooks/lib/__tests__/reference-resolution-lint.test.ts:1197-1209`;
`hooks/lib/__tests__/helpers/citation-scan.ts:443-449` (`GATE_KINDS`, currently not exported)

**Verified 2026-08-20 at HEAD `bbfc912`.** Scanning the 81-file shipped surface with
`scanCitationTokens` returns 266 tokens, of which exactly one is `circle-record` and it is exempt;
eleven are `stamp-name`, of which three resolve and eight are exempt. Removing a kind from the
literal today would go unnoticed for `circle-record` and would be caught for `stamp-name`.

## Fix direction

Keep the literal and the independent walk, and add one assertion beside them: that the literal's set
equals the helper's `GATE_KINDS`. That needs `GATE_KINDS` exported, which it is not today. The two
views stay independent for the token-for-token comparison, which is what the comment is protecting,
and the list itself stops being a copy nobody compares.

---
**Reconciliation 260820-0830** (reconciler, domain `code`, HEAD `04db0b0`) — **still open,
reproduces; the two are in agreement today and nothing holds them there.**
`hooks/lib/__tests__/reference-resolution-lint.test.ts:1203-1210` declares a five-element literal,
and `GATE_KINDS` at `hooks/lib/__tests__/helpers/citation-scan.ts:443-449` carries the same five in
the same order. The comment at `:1199-1202` states the restatement is deliberate and gives the
reason. So the defect is not a present divergence but the absence of anything that would report the
next one — which is precisely the condition under which it was already stale for two steps. Marker
unchanged.
