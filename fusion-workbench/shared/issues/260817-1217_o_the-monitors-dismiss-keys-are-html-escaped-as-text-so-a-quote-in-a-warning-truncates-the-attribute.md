The monitor's dismiss keys are escaped as text, so a quote in a warning truncates the attribute and dismissal never sticks

---
**Domain:** code
**Filed by:** orchestrator
**Cross-references:** circles/260816-1741-guard-becomes-observation-only/planning/260816-1915_p_the-compliance-guard-becomes-observation-only.md (found during its step 15, off-repository verification)

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
