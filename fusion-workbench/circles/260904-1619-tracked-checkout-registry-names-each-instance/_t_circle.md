# A tracked checkout registry names each instance and joins one person's identities

---
**Domain:** code
**Filed by:** shaper (anticipated-circle mode), Kai Stalmann <ks@qantr.com>
**Claim:** Claimed 260904-1640: Kai Stalmann <ks@qantr.com>, checkout 5e8248d7.
**Active spec/plan:** (none yet)
**Active session history:** 260904-1050-orchestrator-session.md

---

## Directive

After this work, a checkout that has registered carries a name a reader recognises instead of eight opaque hex characters, and one person's several git identities count as one person wherever fusion reports presence. The registry is one tracked file per checkout under a new store, `shared/checkouts/`, sibling of the memo store, named `<8hex>.md` and classified R1, written by the checkout it describes at `/fusion:setup` and by no other; it carries the minted identifier as its key, an alias with a generated default the user may replace, the person the human claims, and the git identity as read. Nothing already on disk changes: the hex stays the value written into `**Claim:**` and into `checkout:` on every event line, every comparison keeps reading it, and every consumer falls back to today's behaviour when no entry exists, so the registry ships without a migration and is adopted one checkout at a time. Resolution from hex to alias is display only, reaching `/fusion:next`'s claim message, `/fusion:setup`'s report, the monitor header and a `FUSION_ALIAS` export beside the three identity values SessionStart already exports, while the monitor's own-checkout filter and the claim's two-half comparison keep reading the local file. `bin/fusion-events presence` carries the one changed comparison, so two registered git identities of one person aggregate to that person while an unregistered pair still compares as strings and counts as today. A first Setup run offers the person names the registry already holds and still accepts a newly typed one; a second run in the same checkout refreshes a changed git identity silently, leaves person and alias standing, and reports an alias collision with a rename offered rather than enforced. The defect where `git clean -xdf` deletes `.checkout-id` and the next read mints a replacement in silence is repaired here, because it orphans exactly what this Circle creates. Two questions are answered inside this Circle rather than assumed by it: whether an entry carries the optional worker note of hostname, account name and folder path, and whether `bin/fusion-identity`'s exit-1 halt survives a registry that can name the person. The `/fusion:cadence` per-person grouping is out of scope and belongs to its own Circle, being new capability rather than a repair.

## Grounding snapshot

**The whole Circle rests on one analysis and two decisions the user has already answered.** `260904-1058-identity-per-instance-and-the-checkout-registry.md` measured the current model at HEAD `cda72f71` and found the defect narrower than the request implied: the parallel-checkout arrangement works and has worked since 2026-08-22, so what is broken is legibility of the identifier and attribution across identities, not the identity model. `260904-1058_*_does-fusion-gain-a-tracked-checkout-registry-and-in-which-shape.md` was answered option 1, one tracked file per checkout keyed by the eight hex, class R1. `260904-1058_*_is-the-checkout-alias-the-identifier-or-an-attribute-of-the-minted-one.md` was answered option 1, attribute: the minted hex stays the key and stays the written value. Both answers are recorded against `260904-1050-orchestrator-session.md` `## Turn 1`.

**Two decisions are open and belong inside this Circle.** `260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md` asks whether the `worker` field is written at all, and under which default; the analysis states what it exposes, measured in this checkout (hostname `k1i9`, account `k1`, path `/Users/k1/Projects/productive/fusion`), and settles two things ahead of the options: the field is not a key, because `bin/fusion-identity` rejected the hostname-plus-path derivation by name, and it is mutable, so it goes stale with nothing noticing. `260904-1058_*_does-the-identity-helpers-exit-1-halt-survive-a-registry-that-can-name-the-person.md` asks what the exit-1 halt rests on once a registry can name the person, since the second of the helper's two stated clauses dissolves. Neither is pre-empted by this Directive.

**The defect in scope, and the one deliberately left out.** `260904-1058_*_git-clean-deletes-the-checkout-identifier-and-the-next-read-mints-a-new-one-in-silence.md` is in scope: `.checkout-id` is ignored, `git clean -xdf` removes ignored files, and the helper mints a replacement on the next read, so the sweep orphans every event line and every claim that checkout has written, and it would orphan a tracked registry entry as well. Its acceptance test is stated in the record: either the identifier survives a sweep, or the helper distinguishes a first mint from a re-mint and says which happened. `260904-1058_*_four-tracked-workbench-filenames-are-keyed-by-the-os-account-name-the-identity-decision-rejected.md` stays out, an open shared issue, uncited as in-scope; it is not caused by this Directive and no option here repairs it. `260904-1058_*_cadence-names-its-report-after-one-person-and-reports-every-persons-work.md` sits with the excluded cadence work.

**What must not move, and each has a stated reason.** `.checkout-id` stays class L and never travels, because a checkout that pulled another's copy would carry that other one's identifier, which is the reason the registry can have a durable key at all (`rules/workbench-tracking.md` `## The four classes`). The claim's two-half comparison stays on values both sides hold locally: routing it through a pulled file would make it answer differently before and after a fetch (`rules/circle-records.md` `### The claim field`). The monitor's own-checkout filter (`bin/monitor:1350-1357`) stays on the local file for the same reason. No alias is written onto an event line: that would put a resolvable value on 2638 lines and duplicate a fact that can go stale, which `rules/critical-stance.md` §2 rules out. And no option may make a filing agent halt where it does not halt today.

**Where the change actually lands.** The one changed comparison is `presenceReport`'s person classification in `hooks/lib/events-query.ts:260-266`, whose `Set` of other people is keyed today by string equality on the git identity. The renderers that resolve the hex for display are `/fusion:next`'s claim message (`skills/next/SKILL.md:202`), `/fusion:setup`'s report (`skills/setup/SKILL.md:336-345` for the mint, `:152-155` for the presence line) and the monitor header. The write site is `/fusion:setup` Step 0i, one added act. The SessionStart export gains a fourth value beside `FUSION_PERSON`, `FUSION_CHECKOUT` and `FUSION_SESSION_ID` (`hooks/hooks.json`). `bin/fusion-identity` is where the checkout half is read and where the exit-1 question lands.

**One compatibility cost is not free and should be stated at the site rather than smoothed over.** A person who registers two git identities changes what `other_people` counted the day before, so a presence report run over the same window before and after registration gives different numbers. That is the correction landing, not a regression.

**Two operating constraints of this repository bear on how the Circle can be proved.** A `bin/` helper added in a session is absent from `$FUSION_PLUGIN_ROOT` until `fusion --update`, so every `[ -x ]` call site takes its miss branch for the rest of that session and the helper is proven in the next one (`260825-1329_*_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`). And four shipped surfaces carry growth bounds that can turn `npm test` red on addition alone; `skills/` and the always-on rule set are the two this Circle is most likely to touch.

**The multi-checkout arrangement has never been exercised in this repository.** The event log carries one distinct `person` value and one distinct `checkout` value across all 280 identified lines of 2638. Every claim about two checkouts rests on the C1 measurement of 260822 against scratch trees, not on operating experience. That is a limit on the evidence rather than a reason to distrust it.

## Dependencies

No anticipated or active Circle blocks this one. Three terminal Circles bind it and are cited rather than copied, per the Origin Rule:

- `260824-0530-record-attribution-and-circle-claim`. Where the identity model was answered: attribution takes the git identity, the claim takes the git identity plus the locally minted checkout identifier. This Circle inherits that answer and introduces no second identity source.
- `260823-0023-settle-what-travels-between-checkouts`. Where the four-class state partition and the union merge driver on the event log were settled. The new store joins class R1 with no exception owed, which is one of the three grounds the recommended shape was chosen on.
- `260825-2023-presence-travels-monitor-filters-own-checkout`. Where presence reporting and the monitor's own-checkout filter were built. Its `_b_` marker records a Bounded Closure whose Directive was nonetheless reached; the surfaces this Circle changes are the ones it built.

## Activation proposal

Proposed activation timestamp: 260904-1636. Run identifier: playmaker session
`260904-1636-playmaker-direct-dispatch`.

Rationale: this is the only anticipated Circle in the portfolio, so it ranks first by
construction. Its Grounding snapshot cites two open decisions,
`260904-1058_*_does-a-registry-entry-carry-hostname-account-name-and-folder-path.md` and
`260904-1058_*_does-the-identity-helpers-exit-1-halt-survive-a-registry-that-can-name-the-person.md`,
both scoped in the Directive as work to answer inside the Circle rather than as blockers to
activation. Its `## Dependencies` cites three terminal Circles: two carry `_c_`
(`260824-0530-record-attribution-and-circle-claim`, `260823-0023-settle-what-travels-between-checkouts`)
and one carries `_b_` (`260825-2023-presence-travels-monitor-filters-own-checkout`), so the
Dependencies-closed flag is set — that dependency reached Bounded Closure rather than
Closed-coherent, though the record's own citation states its Directive was nonetheless
reached. Of the eight marker-carrying records the Grounding snapshot cites, one is terminal
(`260825-1329_c_every-session-runs-one-release-behind-on-a-bin-helper-the-same-repository-just-added.md`),
well under the half-of-cited threshold this run checks, so the Grounding is current rather
than stale.

## Turn log
