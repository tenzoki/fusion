The monitor's dismiss keys are escaped as text, so a quote in a warning truncates the attribute and dismissal never sticks

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** 260816-1915_*_the-compliance-guard-becomes-observation-only.md (found during its step 15, off-repository verification)

---

## What happens

"Dismiss All" in the monitor's warnings panel appears to do nothing. The rows clear,
and the next poll brings them back. Per-row `dismiss` fails the same way on the same
rows.

## Why

`bin/monitor:527-531` escapes with a DOM round-trip:

```js
function escapeHtml(t) {
  var d = document.createElement('div');
  d.appendChild(document.createTextNode(t));
  return d.innerHTML;
}
```

Serialising a **text node** escapes `&`, `<`, `>` and nbsp. It does **not** escape `"`,
because a quote is not special in text. The result is then used inside an **attribute**
at `bin/monitor:621`:

```js
'<button class="warning-dismiss" data-key="' + escapeHtml(key) + '">dismiss</button>'
```

`warningKey()` (`:559-562`) builds the key from `event`, `file` and `detail`. When any
of the three contains a double quote, the attribute terminates early:

```html
data-key="fusion-mon-dismissed:guard_block:"$CDIR/_a_circle.md":Protected path"
```

`getAttribute('data-key')` then returns the truncated prefix, `localStorage` stores that,
and the next `renderWarnings()` computes the full key, matches nothing, and re-renders the
row. Both the per-row handler (`:626-635`) and Dismiss All (`:639-647`) read the same
attribute, so both are affected identically.

## Measured

In the consuming project `/Users/k1/Projects/productive/krk`, **33 of 106** warning-class
rows in `fusion-workbench/.guard-state/events.jsonl` carry a double quote in `file` or
`detail`. Example row:

```json
{"ts":"2026-08-02T08:13:37.326Z","event":"guard_block","tool":"Bash","file":"\"$CDIR/_a_circle.md\"","detail":"Protected path"}
```

The quotes come from the retired protected-path classifier recording a quoted shell
argument as the file it predicted would be written.

## Age, and why it is newly worth fixing

The defect dates from `b05b423`, fusion's first public release; `git log -S "dismiss-all-btn"`
returns that commit alone. Circle `260816-1741-guard-becomes-observation-only` did not
cause it and touched only a comment in this file.

It becomes **more reachable** through that Circle. The retired-file advisory introduced in
`fab8a4b` tells a project to copy `{"orchestrator": {"maxTurns": <n>}}` into `fusion.json`,
and emits once per guarded tool call until the old file is deleted. That detail string
contains double quotes, so every project that has not yet migrated gets an advisory it
cannot dismiss, on every call.

## Fix

Escape for the attribute context rather than the text context. Either add `"` (and `'`)
to the escaping, or stop putting the key in the DOM at all: keep an array of visible
warnings in JS and pass the index, which removes the escaping question rather than
answering it.

Prefer the second. `rules/critical-stance.md` §4 applies: the first answer keeps a
context-sensitive escape that must be right at every future call site, and there are two
call sites for this attribute today.

## Note on scope

Filed in the shared store rather than the Circle's under the Origin Rule: the defect
predates the Directive, affects every consuming project, and outlives this Circle. It was
found by the Circle's verification step, which is discovery rather than origin.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: `bin/monitor:527-531` still escapes through a text-node round trip, which does not escape the double quote, and `:621` still interpolates the result into a `data-key` attribute. Marker stays open. Log: `260817-1836-reconciliation.md`.

---
Resolved: the key no longer travels through the markup at all.

**What changed.** `renderWarnings()` collects the dismissal keys into an array as it builds the rows,
and assigns each one to its button as a JS property after `innerHTML` is set. The button element is
emitted with no `data-key` attribute, and both handlers, the per-row one and Dismiss All, read
`btn.fusionDismissKey`. No escaping is involved anywhere on the path, so no character in a warning
can affect the key.

**Why this rather than fixing the escaper.** Adding `"` to `escapeHtml` would have repaired the
observed failure and left the design that caused it: a key is data, and routing data through an HTML
attribute means every future character class is a fresh chance to truncate it. The class is now
closed by construction rather than by an escape list that has to stay complete. That is the same
move `rules/critical-stance.md` §4 describes for a question a mechanism cannot decide: change the
mechanism instead of widening the approximation.

**How the failure was confirmed as real rather than inferred.** A user's guard log carried three
advisories whose detail embedded a `SyntaxError` and a JSON fragment, both full of double quotes.
Their report was that Dismiss All did nothing and the rows returned on every poll, over days, which
is precisely the symptom this record predicts.

**No regression test was added, and the reason is a budget rather than a judgement that none is
owed.** `hooks/lib/__tests__/monitor-warnings-panel.test.ts` covers this panel and touches dismissal
nowhere. The hook-test growth bound stands at 15 lines of head-room, which is the residual the Circle
`260821-1042-reply-bounded-whole-question-answered` closed over and named in its closure note. A pin
asserting that the warnings markup emits no `data-key` would cost most of what is left of that bound,
and spending it is a call for the user rather than for the agent that happened to be here. **Filed as
the open half:** whether that pin is worth its lines, and what gets cut to pay for it.

**One thing this fix does not reach.** A consuming project runs `fusion-workbench/monitor`, copied
from `$FUSION_PLUGIN_ROOT` at Setup, and that install copy is the released plugin. Until a release is
cut, no consuming project gets this. The release gap is
`260822-0035_*_two-installed-copies-report-the-same-version-and-differ-in-which-bin-helpers-they-carry.md`.
