# The churn leaves were removed without a retirement entry, and the retirement table could not have held one

---

Step 5 deleted the `churn` block from `hooks/config.json` and `hooks/config.example.json` and added no
entry to `RETIRED_CONTAINER_LEAVES`. A consuming project whose `fusion-guard.json` still declares
`churn` now has it silently carried through as an unknown key — the exact outcome the retirement
mechanism exists to prevent, and which the seeded template promises in writing does not happen.
Separately: an entry for `churn` in that table would never be read, because the retirement lookup sits
behind a branch a removed container can no longer enter.

---

**Severity:** Medium — the configuration surface makes a promise it no longer keeps, and the mechanism
that would keep it cannot express this case. Nothing is broken at runtime; what is lost is the one notice
a consuming project would have received.
**Domain:** data
**Filed by:** `ontorev`, reviewing `7c12d6a..5d29b6d` (`260815-1247-ontorev-turn-2-structured-data.md`)
**Owner:** `ontocoder` for the configuration surface and the template notes; the loader half is `coder`'s
and is also reachable by `coderev`, which reviewed `hooks/lib/config.ts` in parallel — see *Overlap* below.
**Affects:**
`hooks/lib/config.ts:42-44` (the justification), `:503-508` (the table), `:569-572` and `:599` (the
unreachable branch);
`fusion-guard.json` `_what` / `_override`; `templates/fusion-guard.json` `_what` / `_override`

**Verified 2026-08-15 at HEAD `5d29b6d`.**

## What the shipped template promises

`templates/fusion-guard.json`, `_what`, seeded into every consuming project by `/fusion:setup`:

> The one exception is a key fusion has RETIRED — a key that used to configure something and no longer
> does. A retired key is reported on every guarded call until you delete the line, **because a key that
> is inert AND silent would leave you believing a setting is in force when the mechanism behind it is
> gone.**

`churn` is now precisely a key that used to configure something and no longer does, and it is inert and
silent. The template's next sentence — *"See `_override` for the one that exists today"* — and `_override`'s
*"ONE KEY IS RETIRED: guard.protectedPaths"* are both still literally true of the code, so the file is
internally consistent. What it is not consistent with is its own stated reason.

## The justification, and what it rests on

`hooks/lib/config.ts:42-44`:

> and `churn` with the heatmap on 2026-08-15, removed outright rather than retired, **because no project
> ever set it.**

That is a claim about the contents of other people's repositories, and no measurement is cited for it.
It is also the opposite of the argument the same file makes twenty lines further down for
`protectedPaths` (`:120-124`): *"a project that declared a protected list declared it on purpose"* — an
argument about intent, not about frequency, and one that applies to `churn` unchanged.

Two facts bear on the likelihood, and they point in opposite directions:

- **Against a project having it:** `templates/fusion-guard.json` has never contained a `"churn"` key.
  `git log -p --follow` over the template returns no match for the token; the six historical hits are
  the word inside the `_gitTracked` prose note, which `04ea182` removed.
- **For a project having it:** the plugin's own `hooks/config.json` shipped the block until `04ea182`,
  and `_override` tells a project to copy from exactly there — *"add the key you want to change, **in the
  same shape the plugin's `hooks/config.json` uses for it**"*. Anyone who wanted a louder churn warning
  had one documented place to look and found the block in it.

The honest form of the claim is "no project is known to have set it", which does not carry the same
conclusion.

## The structural half: a container cannot be retired

`RETIRED_CONTAINER_LEAVES` is keyed `<container>.<leaf>` and is consulted at `:599`, inside the loop over
a container's leaves. That loop is only entered when the container itself is still known:

```
569:    if (leafRules === undefined) {
570:      // An unknown key, carried through untouched and undiagnosed. …
572:      raw[key] = value;      continue;          <- churn exits here
…
599:      const retired = RETIRED_CONTAINER_LEAVES[key]?.[leafKey];
```

`protectedPaths` is diagnosed because `guard` is still in `CONTAINER_LEAF_RULES` with four live leaves.
`churn` is no longer in it at all, so writing

```ts
churn: { changesPerSessionWarning: "…", changesPerSessionCritical: "…" },
```

into the table would compile, read as a promise, and never fire. The same hole opens the day the **last**
live leaf of any container is retired. The table's own docstring says *"Retire a leaf by moving it from
the table above into this one"* — a procedure that is silently a no-op for the whole-container case.

## Overlap with the parallel `coderev` pass

`hooks/lib/config.ts` is TypeScript and `coderev` reviewed the same range. This record is filed from the
configuration surface — what a consuming project's `fusion-guard.json` is told and what it now gets — and
the loader lines are cited as the evidence for it. If `coderev` filed the unreachable-branch half
independently, merge the two rather than fixing them twice; the configuration-surface half stands either way.

## What the fix has to establish

Three things, and they are separable:

1. Decide whether `churn` is retired or removed, on a stated basis rather than on an unverifiable count.
   This is a decision record, not an executor's call — it is the same question `260804-1630_*_what-does-a-project-guard-object-inherit-for-a-key-it-does-not-supply.md`'s successor
   answered for `protectedPaths`.
2. If retired, the lookup has to reach a container `CONTAINER_LEAF_RULES` no longer knows, and the
   template's `_what` / `_override` notes stop saying "the one that exists today" and "ONE KEY IS RETIRED".
3. If removed, `hooks/lib/config.ts:42-44` says so on a basis it can support, and the docstring at
   `:503-522` gains the sentence that a whole container cannot be retired by this table — so the next
   person to try does not write an entry that never fires.

## Related

- `260815-1206_*_three-churn-references-survive-step-4-in-files-the-step-does-not-name.md` — the
  other three surfaces step 4's and step 5's lists did not name.
- `260812-0843_*_the-guard-and-its-configuration-must-be-simplified-project-settable-and-defaulted-to-fit-or-not-shipped-to-consumers-at-all.md`
  — the standing question about the whole configuration surface.


---

**Reconciliation 260819-1453 (reconciler, Domain `code`, Circle-store pass) — STAYS `_o_`. Re-measured at HEAD `e435f03` (v10.3.0). Narrowed to one of three items; two are discharged.**

**Discharged.** The unsupportable "no project ever set it" claim is gone from `hooks/lib/config.ts` (`fab8a4b`). The structural impossibility is gone too: `RETIRED_TOP_LEVEL_KEYS` now retires at *container* scope — `guard`, `decisions`, `escalation` — so the table can hold an entry for a whole removed section, which it could not when it keyed on leaves.

**Standing.** `churn` is still not an entry in it. `grep -n 'churn' hooks/lib/config.ts` returns one hit, at `:56`, and it is history prose in the module header, not a retirement entry. So a project whose configuration still declares `churn` is carried through silently — no advisory, no drop notice — which is exactly what `templates/fusion.json`'s `_what` note promises does not happen. One entry in the table closes it.

---
Resolved: fixed — `churn` joins `RETIRED_TOP_LEVEL_KEYS` in `hooks/lib/config.ts` with a reason naming the heatmap and the date, so a project still declaring it gets one advisory per guarded call; the four-key advisory case in `config.test.ts` covers it and fails with the entry removed; `hooks/dist/` rebuilt; `cd hooks && npx vitest run lib/__tests__/config.test.ts lib/__tests__/committed-dist.test.ts`
