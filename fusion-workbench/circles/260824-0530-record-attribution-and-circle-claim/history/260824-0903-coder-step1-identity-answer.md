# Step 1: the identity answer is recorded, superseding the option set

**Date:** 2026-08-24 09:03
**Agent:** coder
**Circle:** 260824-0530-record-attribution-and-circle-claim
**Plan:** `260824-0613_*_c3-attribution-on-records-and-a-claim-on-the-circle.md` step 1
**Status:** Complete

## What was done

Appended an `Answered:` annotation and an `## Answer (user, 260824)` section to
`260822-1136_*_which-identity-does-an-attributed-record-carry-when-the-transport-is-git.md`,
then renamed the marker `_o_` to `_a_` with `mv`.

The appended text states that the answer is not among the three options and why: the options
partition by which identity source to read, the answer partitions by which question is asked.
Attribution takes the git identity; the claim takes the git identity plus a checkout identifier
minted once at Setup in class L of `rules/workbench-tracking.md`. The registry the user proposed and
withdrew is recorded with its three costs, the accepted loss is stated (a stable alias surviving a
changed git address), and the no-identity case halts rather than substituting a value.

The section also carries the correction measured after the answer was given: the git identity
answers attribution across machines only where every machine carries the same git configuration. A
repository with no remote still resolves a full identity from `~/.gitconfig`, and two addresses for
one person already coexist in this environment (`ks@qantr.com` beside `kai@qantr.com`). The
consequence lands on the claim, where a differing configuration is read as somebody else and
`/fusion:next` refuses the person's own Circle. The mitigation is the stated precondition of one git
identity per person and no mechanism; step 6 writes it into the rule text.

## Marker choice

`_a_`, not `_i_`. The answer exists and is now recorded, but nothing realises it in code yet: no
helper reads a git identity, no template carries the field. `_i_` is reserved for the commit that
implements it, which is step 4 and later.

## Verification

`npm test` from `hooks/`, exit 0 (41 files, 724 tests). The record stays in the citation gate's
corpus after the rename, since that corpus takes `_o_` and `_a_` alike.

`bin/fusion-prose-metric` reports the file at 2 em-dashes over 1330 words against a permit of 1.
One of the two is pre-existing in the reconciler's note of 260822 and was not edited, per the
no-existing-line constraint. The other is the `Answered:` line, whose form
`rules/fusion-workbench-conventions.md` `## Inline State Tracking` spells with an em-dash. Reported,
not gated.

## Constraint held

No existing line of the record was edited: the file's first 4 146 bytes are byte-identical to the
committed version, verified by diff against `git show HEAD:`.
