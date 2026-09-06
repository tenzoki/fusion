The write-time citation sentence carries a fusion record identifier into a consuming project's session

---
The write-time citation check added at loop 4 of session `260905-2008-orchestrator-session.md`
reports through the hook's `additionalContext` channel, and its sentence carries the grammar's
`fix` string verbatim. That string names a fusion decision record. So a consuming project's
session is shown an identifier that means nothing in that project and resolves to nothing in
its workbench.

---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**This class was closed once and is re-entered here.**
`260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md`
is `_c_` and sits in the `260829-1110` archive sweep. It is not reopened: a closed record
stays closed and the sweep would move it again anyway. This is a new instance, in new code, and
it belongs in a new record.

**It was disclosed rather than discovered.** The coder that built the check named it in its own
report and in the module header, gave its reason, and did not present the choice as free. The
reason is worth keeping: `bin/fusion-citation-check` already prints the same string into a
consuming project's terminal, so composing a different sentence here would put a second
statement of the storeless form into the tree, and this project has removed duplicated
statements of one rule more than once.

**What is nevertheless different, and why this is filed anyway.** The existing leak is on a
hand-run helper a person invokes deliberately. This one is on the PostToolUse path and fires by
itself, on every record write, in every consuming project that installs the plugin. Consistency
with the helper was the right call for the *wording*; it does not settle whether the automatic
channel should carry the identifier at all.

**A second, smaller thing the same design carries.** `sentence-identifier-containment.test.ts`
cannot see this. Its check is containment, and the identifier is authored into the hit rather
than composed at the sentence, so it is contained by construction. That file's own header names
this as a latent hole for a `why` field; it is now live rather than latent.

**Acceptance.** Either the sentence names the rule without naming a fusion record — a heading
anchor into the consuming project's own copy of the conventions is one route, since every
consuming project has that file — or a decision states that fusion identifiers are acceptable
on this channel and the containment gate is extended so a future one is not invisible. A green
suite is not acceptance: the suite is green now.

**Cross-references:**
`260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md`
(the closed record whose class this re-enters);
`260906-0115_*_three-agents-in-one-session-wrote-a-citation-the-always-on-rule-forbids-and-only-a-later-gate-caught-it.md`
(the record the new check was built to serve).

---
Reconciled 260906-0335 (reconciler, HEAD `b462d55d`): marker unchanged at `_o_`. Every claim holds,
and the leak was reproduced rather than read.

**Reproduced.** Replaying the orchestrator record as it stood at `cd623b6f` through
`measureCitationForm` and `citationFormSentence` produces the sentence a consuming project would be
handed, and it ends its `fix` clause with `(decision 260828-0904, the form)`. That stamp resolves to
nothing outside this workbench, and the channel that carries it is `additionalContext`, so a session
elsewhere reads it as context it is meant to act on.

**The two secondary claims check out.**
`260817-2110_*_the-hook-sentences-cite-fusions-own-workbench-ids-and-a-fusion-commit-hash-into-a-consuming-projects-session.md`
is `_c_` and sits under `archive/260829-1110-safe-cleanup-tier-1/shared/issues/`, so this record is
right not to reopen it. And `sentence-identifier-containment.test.ts` states the hole in its own
header at `:18-22` — the permitted set is taken from the whole input, so an identifier that travels
inside the input is contained by construction — and the file now carries a second note at `:201`
recording that the latent case has arrived live. The gate is blind to this by construction, not by
oversight, which is what makes the acceptance's second branch (extend the containment gate) a real
piece of work rather than a configuration change.

**One imprecision in the record's own wording, stated so a later reader does not over-read it.** "It
fires by itself, on every record write" is true of the *check* and not of the *sentence*: the check
runs on every workbench `.md` write, the sentence is emitted only on a reportable violation, and over
this repository's own corpus that is 17 files of 1865. The record's point is untouched — the channel
is automatic and the identifier is on it — but the frequency claim is a ceiling, not a rate.

---
Resolved: the two provenance parentheticals are deleted at the single site where the fix strings are authored, and nothing was composed to replace them. Verified against a scratch consuming root rather than against a test: the sentence the hook returns now ends its repair clause with the storeless form and carries no fusion identifier, and the only names left in it are the scratch project's own records. The route the acceptance suggested, a heading anchor into the consuming project's own copy of the conventions, was already present once per sentence in its closing clause, so adding one to the repair clause would have repeated it up to four times and restating the form would have been the duplication the original author correctly refused. Deleting a parenthetical restates nothing.
The reason originally given for carrying the identifiers turned out to be false, and that is the more useful half of this closure. The claim was that the hand-run checker already prints the same string into a consuming project's terminal, so a different sentence here would be a second statement of the form. It does not print it: that program prints the problem and stops, and its output over a scratch root is byte-identical before and after this change. The hook sentence was the only path by which such a string could reach anyone outside fusion. The correction is recorded in the module header rather than dropped.
Not covered: the dangling verdict keeps its parenthetical, deliberately, because it is not in the reported set and its only reader is the release gate's own failure text inside this repository, where a fusion identifier is meaningful. That exception and its expiry condition, namely that it goes if dangling ever joins the reported set, are written on the field's own documentation, and the pin now checks the absence of an identifier on the stale-marker repair clause rather than its presence. The containment gate still cannot see a fault of this shape, because an identifier authored into the hit is contained by construction; that hole is stated in its own header and is unchanged by this closure.
