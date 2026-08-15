Setup Step 0g silently replaces a project's existing `permissions.defaultMode`

---

The merge procedure P-12 moved from `/fusion:unlock` into Setup unconditionally sets
`permissions.defaultMode` to `"bypassPermissions"`. The "only add, never remove" guarantee beside it
is scoped to the `allow` list, and the skip condition covers only a project already at
`bypassPermissions` — so a project that deliberately chose a stricter mode is asked the question and,
on yes, loses that choice without it being named in the question or the report.

---

## Context

`skills/setup/SKILL.md:225`:

> If present, parse it, set `permissions.defaultMode` to `"bypassPermissions"`, and union the
> `allow` list with the values above, **preserving every existing entry — only add, never remove**.

The bolded guarantee attaches to the `allow` list — it is about entries in a list, and `defaultMode`
is a scalar that is *set*. `skills/setup/SKILL.md:235` skips the question only for a project already
at `bypassPermissions`:

> If the project already had `defaultMode: "bypassPermissions"`, say so and skip the question — there
> is nothing to decide.

So the uncovered case is a project whose `.claude/settings.local.json` carries
`"defaultMode": "acceptEdits"` or `"plan"`. Setup asks the question. The question text
(`skills/setup/SKILL.md:203`) describes writing a file, not replacing a setting:

> fusion writes `.claude/settings.local.json` in this project so future sessions run without asking
> you to approve each tool.

And the report (`skills/setup/SKILL.md:231`) names the path, the next-session timing and the
`.gitignore` change — not what the previous value was.

**Why the loudness matters here specifically.** This is a *widening* of a permission grant, performed
on a "yes" to a question that did not mention there was anything to overwrite, in the one file that
governs what a session may do without asking. Everywhere else in this step the reasoning is
explicitly protective: "Merge into any existing file; never overwrite one", "**Never** write this
file outside `pwd`", "never touch `.claude/settings.json`". The scalar is the one thing that escapes
that care.

Related, and probably the same fix: nothing in the step says what to do when the existing value is
*more* permissive than what fusion seeds, though at present no such value exists.

## Suggested direction

Extend the skip-and-report condition at `:235` from "already `bypassPermissions`" to "already carries
a `defaultMode`": name the existing value in the question, say it will be replaced, and name the old
value in the report. That keeps one merge implementation, which is the acceptance criterion the
closed defect `shared/issues/260810-0326_c_…` was met on.

---
Resolved: `skills/setup/SKILL.md` Step 0g — the step now reads the existing `permissions.defaultMode` before asking, skips the question when it is already `bypassPermissions`, names any other existing value in the question and states that yes replaces it, sets the scalar only when absent or when the named replacement was consented to, names old beside new in the report, and scopes the "only add, never remove" guarantee to the `allow` list explicitly.
