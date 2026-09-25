# The stated exempt boundary is narrower than the implemented one for whole-subtree deletes

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing Turn 1 of `260801-1244-guard-rules-write` (`c7f117b..HEAD`)
**Affects:** `hooks/lib/rules-write-exemption.ts` docstring accuracy; the Bash surface behaviourally
**Cross-references:** `hooks/lib/rules-write-exemption.ts:105-115` (the claim),
`hooks/lib/bash-mutation-guard.ts:1247-1282` (passes 1 and 2, where `exempt` is consulted)

---

## What was found

`isProjectRulePath`'s docstring says:

> The bare rule directory itself is NOT one, in any spelling. The flag permits writing rule
> files; it does not permit deleting the rule directory.

The first sentence is true and well tested. The second reads as a statement about destructive
reach, and it is not one. Measured against the classifier with the predicate wired in:

```
rm -rf rules            flag off: DENY(rules)         flag on: DENY(rules)
rm -rf rules/           flag off: DENY(rules/)        flag on: DENY(rules/)
rm -rf rules/*          flag off: DENY(rules/*)       flag on: allow  exempt=[rules/*]
rm -rf rules/retired    flag off: DENY(rules/retired) flag on: allow  exempt=[rules/retired]
```

The directory node survives; everything in it does not. `rules/*` is exempt because glob
metacharacters are matched as literal text (`bash-mutation-guard.ts:1056-1058`) and the literal
string `rules/*` matches `^rules/.*$`. `rules/retired` is exempt because it is a path inside
`rules/`.

## Why it is worth a line rather than nothing

Both commands are arguably inside the flag's purpose — a curation job that clears out and
rewrites the rule set. I am not arguing they should deny. The defect is that the module's own
enumeration of what the flag does not permit is the document a later reader will trust, and it
currently implies a protection that is not there. `rm -rf rules/retired` in particular
destroys the retirement archive the flag exists to *populate*, which is the one outcome a
curator would least expect the flag to allow.

## Recommended fix

Documentation, one paragraph, in `rules-write-exemption.ts` at `:110-111`: state that the
exemption covers every path inside the rule directories including whole subtrees, that only the
bare directory node is out of reach, and that `rm -rf rules/*` and `rm -rf rules/retired`
therefore go through. If that reads as too much reach at the gate, it is a scope question for
the Circle, not a defect — but it should be a decided answer rather than an unstated one.

## Adjacent, for Turn 2 — not filed separately because it is not yet code

`RULE_DIR_PATTERNS` (`:84-87`) is a hardcoded constant, while Turn 2 makes `protectedPaths`
project-configurable through `fusion-guard.json`. Two consequences to settle there:

- A project whose rules do not live in `rules/` or `.claude/rules/` gets no exemption, and
  nothing tells it why.
- The exemption **outranks** a project's own protected entry. A project that deliberately adds
  `rules/immutable/**` to its `protectedPaths` finds the flag exempts it anyway, because
  `rules/immutable/x.md` matches `rules/**`. Whether a project can protect something inside its
  own rule directory against this flag is a real design question, and the self-protection floor
  C5b already contemplates is the natural place to answer it.

## Origin

Found in `260801-1244-guard-rules-write` while enumerating what the flag exempts.

---
Resolved: documentation, in `isProjectRulePath`'s docstring
(`hooks/lib/rules-write-exemption.ts`), under `## What the flag reaches, measured`. The
sentence that read as a statement about destructive reach is gone; what replaces it states
the reach, names the outcome a curator would least expect (`rm -rf rules/retired` destroys
the retirement archive), and says that only the bare directory node is out of reach.

**Re-measured first, on the real guard subprocess after gate 0 landed.** The issue's four
rows reproduce exactly; gate 0 changed the exempt set by one class, and the class it removed
is a spelling rather than a reach:

```
                                 flag off        flag on
  rm -rf rules                   DENY            DENY
  rm -rf rules/                  DENY            DENY
  rm -rf rules/*                 DENY            allow
  rm -rf rules/**                DENY            allow
  rm -rf rules/retired           DENY            allow
  rm -rf rules/retired/          DENY            allow
  rm -rf rules/retired/*         DENY            allow
  mv rules/retired /tmp/gone     DENY            allow
  cd rules && rm -rf retired     DENY            allow
  cd rules && rm -rf .           DENY            DENY
  rm -rf rules/a/../retired      DENY            DENY   <- gate 0, new since this issue
```

One correction to the issue's own text while confirming it: the bare-directory denial comes
from the classifier's FIRST pass, not the ancestor pass. `isProtected` retries a directory
operand with a trailing separator, and `rules/` matches `^rules/.*$` because `.*` matches the
empty string. The docstring says so, and the reach is now pinned by unit cases rather than by
prose alone (`rules/*`, `rules/**`, `rules/retired`, `rules/retired/*` exempt; the bare
spellings not).

The two adjacent questions — `RULE_DIR_PATTERNS` hardcoded while `protectedPaths` becomes
project-configurable, and the exemption outranking a project's own protected entry — are Step
6's and were not decided here. Filed as a decision record rather than answered in a docstring:
`260803-1314_*_may-a-project-protect-a-path-inside-its-own-rule-directory-against-the-rules-write-flag.md`

Session: `260803-1314-turn3-t3-2-exemption-prose-and-refusal-diagnostics.md`
