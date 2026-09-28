No test pins the repeat-to-the-user mandate that already shipped narrow once

---

`01932d6` widened the only mandate that carries a configuration diagnostic into the user's chat,
from dropped keys to every diagnostic the loader returns (`agents/orchestrator.md:132`,
`skills/setup/SKILL.md:292`). Nothing in the suite holds it there.

`hooks/lib/__tests__/turn-budget-lint.test.ts` is the lint that exists for this prompt block. It
pins a great deal of the block and not this:

- no Turn-budget literal in either surface (`:160`, `:168`), the placeholder in place of the number
  (`:179`)
- the helper is called at Setup behind the `[ -x ]` guard (`:194`)
- the unresolved branch is decided rather than left open (`:209`), carries no bound without the
  answer that removes it (`:411`), and places the check-in off the Turn boundary (`:425`)
- the setup skill *cites* the orchestrator's call rather than copying it (`:260`)
- the default is defined once, in `DEFAULTS` (`:283`, `:295`, `:315`)

`grep -n 'diagnostic\|stderr\|repeat'` over that file returns nothing. `guard-project-config-integration.test.ts`
covers the loader's side end to end — unparseable file, retired key, retired file, each on every
guarded call — but it exercises the hook's event channel, not the prompt's obligation to speak.

**Why this is worth a test rather than a note.** The defect being fixed is not "someone wrote the
wrong sentence". It is that a mandate written to one member of a set silently excludes the members
added later — the reasoning `01932d6`'s own message gives for making the rule the antecedent and the
four an example list. That failure mode recurs by construction every time the loader gains a
diagnostic class, and the surface it recurs on is prose in two files that must agree with each other.

**A concrete shape.** Both surfaces carry a universal quantifier over the loader's diagnostics, and
neither carries an enumeration that stands in for one. Two assertions:

1. `agents/orchestrator.md`'s Turn-budget block states the obligation over *every* diagnostic — not
   over a named subset — and `skills/setup/SKILL.md`'s Step 2 defers to it without narrowing.
2. Neither surface's obligation sentence is scoped by a word that names one class (`drop`, `dropped`,
   `key`) without the universal in front of it.

Assertion 2 is the one that would have failed before `01932d6` and passes after it.

**Severity:** Low, and it is a preventive rather than a defect. The text at HEAD is correct.

**One thing a test would also have caught, filed here rather than on its own.** The example list in
`agents/orchestrator.md:132` names four diagnostic classes; the loader produces five distinct message
templates once the two `readLayer` refusals are folded together — the fifth is the container-shape
drop at `hooks/lib/config.ts:409`, reproduced with `{"orchestrator": 5}` in a scratch project:

```
fusion configuration at <root>/fusion.json: "orchestrator" must be a JSON object, got number.
```

The mandate is universal, so behaviour is right and the missing example costs nothing today. It is
recorded because `01932d6`'s message asserts "four diagnostic producers, not two" as a measured fact,
and cites `:322` and `:341`, which are the two retirement tables' declaration lines rather than the
`push` sites at `:469` and `:393`.

**Cross-references:**
- `agents/orchestrator.md:132`, `skills/setup/SKILL.md:292`
- `hooks/lib/__tests__/turn-budget-lint.test.ts:159-330`
- `hooks/lib/config.ts:239`, `:252`, `:393`, `:409`, `:423`, `:469`
- `260816-2318_*_the-retired-file-diagnostics-one-chat-visible-channel-is-a-repeat-mandate-scoped-to-dropped-keys.md`

---
Reconciliation 2026-08-17, second Phase-3 pass. **Left OPEN by explicit user decision. Re-measured
at HEAD `d0f13fa`:** the suite is 35 files and 653 tests, the same count as before `01932d6`, so no
test was added with the fix. The nearest case,
`hooks/lib/__tests__/guard-project-config-integration.test.ts:284` ("repeats it on every guarded
call, write tool and Bash alike"), pins the per-call advisory channel and not the orchestrator's
Setup-summary repeat, which is prompt text in `agents/orchestrator.md:132` and
`skills/setup/SKILL.md:292`. The mandate that already shipped narrow once is still pinned by
nothing.

---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass, third pass) — STAYS `_o_`. Re-measured at HEAD `e435f03`; still pinned by nothing.**

```
grep -c 'diagnostic\|stderr\|repeat' hooks/lib/__tests__/turn-budget-lint.test.ts   → 0
```

The lint that exists for this prompt block still says nothing about the obligation to repeat a configuration diagnostic to the user. One test file was added to the suite between the closure and HEAD — `hooks/lib/__tests__/sentence-identifier-containment.test.ts`, on the unrelated question of whether an emitted sentence may carry an identifier its input did not supply — so the surface grew and this gap was not among what the growth bought.

`agents/orchestrator.md` was rewritten substantially in the same range (105 lines) and the widened wording at `:132` survived it, which is the good outcome and also the reason the record is preventive rather than urgent: the text at HEAD is still correct. What is unpinned is that it stays correct.

**Live obligation, lowest priority of the eight, and the honest reason to keep it open is the one the record gives.** The failure mode is not "someone wrote the wrong sentence" but "a mandate written to one member of a set silently excludes the members added later", and the loader is the kind of thing that gains diagnostic classes. Two assertions would hold it — a universal quantifier in both surfaces, and no scoping word (`drop`, `dropped`, `key`) without the universal in front of it — and assertion 2 is the one that would have failed before `01932d6` and passes after.

The record's parenthetical finding also stands unchanged: `agents/orchestrator.md:132` names four diagnostic classes and the loader produces five distinct message templates, the fifth being the container-shape drop at `hooks/lib/config.ts:409`. Behaviour is right because the mandate is universal; the example list is one short.

---
Resolved: moot — declined: a lint pinning a universal quantifier in prose is the gate class this project removed for its alarm rate, and the text is correct at HEAD; `agents/orchestrator.md`, the Turn-budget block.
