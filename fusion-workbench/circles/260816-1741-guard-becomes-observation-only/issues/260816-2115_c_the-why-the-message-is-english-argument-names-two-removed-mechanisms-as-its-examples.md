# The "why the message is English" argument names two removed mechanisms as its examples

---
**Domain:** code
**Severity:** low
**Filed by:** coder, executing plan step 4
**Affects:** `hooks/session-start.ts` `## Why the message is English`, `rules/fusion-workbench-conventions.md` `## Project language`

---

## What is wrong

`hooks/session-start.ts` justifies emitting its warning in English by pointing at the
other English operator strings fusion's hooks emit:

> Every string fusion's hooks emit is English — this file's sibling banner, the guard's
> deny reasons, the halt notice. […] Localising one of fusion's operator strings and not
> the other fifteen is the inconsistency, not the fix.

Two of the three examples are gone. The guard emits no deny reason at this version — it
reaches no verdict at all after step 2 of this Circle — and there is no halt notice, the
halt and `clear-halt.ts` having gone with step 6. The count "fifteen" was a measurement of
a set that has shrunk at least three times since it was taken (2026-08-12, 2026-08-15,
and this Circle).

`rules/fusion-workbench-conventions.md` `## Project language` carries the same two
examples in its exempt-surfaces list ("banners, deny reasons, halt notices, helper usage
and error text") and cites this very section as its worked case. So the two files agree
with each other and both disagree with the tree.

## Why it was not fixed in place

Plan step 4 corrected this file's header for exactly this class of falsehood, and this
paragraph was corrected with it and then reverted. Correcting only the hook would leave it
diverging from a `rules/` file that quotes it, and `rules/` is out of scope for this
Circle by the Directive — it is the curator's gated path. One surface fixed and its
authoring home left stale is a worse state than both being consistently stale, because the
next reader has no way to tell which is current.

**The argument itself is untouched by this.** The rule that hook and CLI operator strings
are English holds whatever they say; only the illustrating examples and the count are
stale. Nothing derives from either. That is why this is low severity and not a correction
made under time pressure.

## What a fix looks like

Both files in one change, so they cannot diverge:

- `hooks/session-start.ts`: replace the two dead examples with live ones — the guard's
  configuration diagnostics and the tracker's review-coverage and staging-drift notices —
  and drop the count rather than re-measuring it, on the same reasoning `CLAUDE.md`
  applies to its always-on byte floor: a number written into prose about a set that keeps
  shrinking is stale before it is committed.
- `rules/fusion-workbench-conventions.md` `## Project language`: the exempt-surfaces
  bullet and the worked-case sentence that restates the count.

Whoever holds `rules/` holds this. If step 11 of this Circle's plan takes the hook's half,
it must take the rule's half in the same commit or leave both.

---
Resolved: Both halves landed in one change, as the record required. The curator's
gated pass took `rules/fusion-workbench-conventions.md` (run log
`circles/260816-1741-guard-becomes-observation-only/history/260817-0845-curator-run.md`,
ledger entries L17 and L18): the exempt-surfaces bullet now illustrates itself with
the configuration advisories and the measurement notices, and the worked-case
sentence drops the count instead of re-measuring it. `hooks/session-start.ts`
`## Why the message is English` was then brought into agreement with it — the
guard's deny reasons and the halt notice give way to the guard's configuration
advisories and the tracker's review-coverage and staging-drift notices, both
verified live (`hooks/lib/config.ts:326,394`, `hooks/tracker.ts:333,415`), and
"the other fifteen" becomes "the rest", with a sentence saying the count is
deliberately not restated. The argument itself is unchanged, as the record said it
should be. `hooks/dist/session-start.js` and its `.d.ts` were rebuilt, the compiled
copies carrying the comment verbatim.
