# coder — the monitor header carries this checkout's name

**Date:** 2026-09-04
**Status:** Complete
**Agent:** coder
**Circle:** 260904-1619-tracked-checkout-registry-names-each-instance
**Plan:** `260904-1651_o_the-checkout-registry-names-each-instance-and-joins-one-persons-identities.md`, step 7
**Files changed:** `bin/monitor` (+67 lines, no deletions)

## What was implemented

A reader beside `_read_checkout_id()` in `bin/monitor`, `_read_checkout_label()`, plus
one module constant (`CHECKOUT_STORE_DIR`), one key in the `/api/dashboard` payload
(`checkout`), one span in the nav (`#checkout-label`) and five lines in the dashboard poll
that fill it. Nothing else moved.

## The three-branch reading, and why it is three

Step 7 states two things that only reconcile as three branches, so the reader returns three
answers and the docstring says so:

- an entry carrying an `**Alias:**` renders the alias beside the hex (`west-harbor · 5e8248d7`);
- a registry present but holding no entry for this checkout renders the hex alone, which is
  the plan's "the hex alone where none is";
- no registry at all returns `None` and the header renders exactly what it renders at HEAD,
  which is the plan's acceptance criterion for the store-absent case.

Read as two branches those two sentences contradict each other, because HEAD's header names
no checkout anywhere. Read as three they are both true, and the third branch is what keeps a
project with no registry unchanged.

An entry present but carrying no `**Alias:**` renders the hex alone as well: an absent field
is absent rather than empty, per the helper's grammar.

## What was deliberately not touched

The own-checkout filter in `_read_events()` still calls `_read_checkout_id()`. It decides
which event lines belong to this session, `.checkout-id` is class L and never travels, and a
registry entry is class R1 and arrives with a pull — so routing the filter through one would
make it answer differently before and after a fetch. The new docstring states this in its own
"WHAT THIS DELIBERATELY DOES NOT TOUCH" paragraph.

The entry is read directly rather than through `bin/fusion-checkout-name`, and the docstring
says why: monitor is copied verbatim into the workbench and served out of it, with no reliable
`$FUSION_PLUGIN_ROOT` at poll time, which is the same reason it already reads `.checkout-id`
directly. The grammar is not restated — the helper's own header is cited as its authoritative
home.

The value is read fresh on every request, exactly as the identifier is, so an alias registered
mid-session is honoured on the next poll.

## Verification

All four branches were exercised against the real script on four scratch workbenches, each
served on its own port and read through `GET /api/dashboard`:

| workbench | condition | `checkout` |
|---|---|---|
| A | entry with alias | `west-harbor · 5e8248d7` |
| B | no `shared/checkouts/` | `null` |
| C | store present, entry for another hex | `5e8248d7` |
| D | entry present, no `**Alias:**` field | `5e8248d7` |

For branch B the payload and the served HTML were diffed against the same two responses from
`git show HEAD:bin/monitor`. The payload differs by the one added `"checkout": null` key; the
HTML differs by the empty span and the five poll lines. The span carries `padding: 12px 0`
in a `display:flex; gap:0` nav, so with empty text it occupies no width: the rendered header
is unchanged.

`grep -n "_read_checkout_id" bin/monitor` shows the filter still calling it (line 1414).

`cd hooks && npm test` — exit 1. Four failures, none caused by this diff:

- `citation-sweep.test.ts` — expected red, stated in the dispatch, not this step's.
- `reference-resolution-lint.test.ts` — pinned `paths` 1567, measured 1569. Measured again
  with `git show HEAD:bin/monitor` written over the file: still 1569, so the two references
  come from the other steps landing beside this one. The lint reads the leading `#` comment
  block of a `bin/` script and not a Python docstring inside the served heredoc, so this
  diff's citations are outside its scope.
- `surface-growth-bound.test.ts` — `skills/setup/SKILL.md` 46639 → 47231, step 5's file. No
  `bin/` helper is inside any growth bound.
- `monitor-warnings-panel.test.ts` — failed once with `connect ECONNREFUSED ::1:<port>` in the
  dual-stack bind case, then passed in three isolated runs and in a repeat of the full suite.
  A load-dependent flake in the `::1` bind race; this diff touches nothing in the bind path.

Both pinned surfaces were left stale and named rather than regenerated, per the dispatch.
