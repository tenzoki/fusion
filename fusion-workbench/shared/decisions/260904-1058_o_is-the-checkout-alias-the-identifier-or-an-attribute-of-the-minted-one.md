# Is the checkout alias the identifier, or an attribute of the minted one?

---
**Domain:** code
**Filed by:** analyst, Kai Stalmann <ks@qantr.com>
**Cross-references:**
`260904-1058-identity-per-instance-and-the-checkout-registry.md` `### 6. The proposed structure, field by field`;
`260904-1058_*_does-fusion-gain-a-tracked-checkout-registry-and-in-which-shape.md` (this question only arises if that one answers yes);
`rules/circle-records.md` `### The claim field` (the records-are-not-rewritten rule);
`bin/fusion-identity` (why the identifier is minted rather than derived)

---

## Question

The user's structure opens with a petname or alias, generated arbitrarily. Whether that name is the checkout's **identifier** or an **attribute** of the identifier that already exists decides three things at once: what a record and an event line carry, whether uniqueness must be enforced, and whether anything already written stops resolving.

## Options

1. **Attribute.** The eight hex stays the key and stays the value written into `**Claim:**` and into `checkout:` on every event line. The alias is a display name resolved through the registry at render time.
   - Pros: nothing already written changes, so there is no migration and no dangling reference; uniqueness is cosmetic, so a collision is reportable and needs no enforcement; every comparison in the tree stays on a value that is unique by construction.
   - Cons: a reader with no registry entry sees eight hex characters; three renderers gain a lookup.
2. **Identifier.** New records and event lines carry `checkout: brave-otter`. The registry maps the alias to everything and keeps the retired hex for legacy joins.
   - Pros: every surface is legible with no lookup; the value on the line means something to a reader who has no registry at all.
   - Cons: `isOurs` in `hooks/lib/events-query.ts` compares strings, so every line written before the switch reads as another checkout's, silently shortening `bin/fusion-events turns`, the monitor's window and `/fusion:cadence` Step 7b. Repairing that means making all three readers registry-aware, which pays option 1's lookup cost as well. And uniqueness becomes mandatory in an eventually-consistent tracked file, which is exactly the enforcement problem a minted random value was chosen to escape.
3. **Both, written together** (`checkout: 5e8248d7 (brave-otter)`).
   - Pros: legible with no lookup and joinable with no migration.
   - Cons: two copies of one fact on every event line and in every claim, where one copy can go stale against the other; the duplication `rules/critical-stance.md` §2 rules out. A parser now has to split a field that was one token.

## Constraints

- Records are not rewritten and the event log is append-only under a union merge driver, so no option may require either.
- Uniqueness, if required, must be enforceable from what a checkout can see, and a checkout that has not pulled cannot see an entry that has not been pushed.
- The claim's two-half comparison must not come to depend on a pulled file: it would then answer differently before and after a fetch.

## Recommendation

Option 1. The argument is backward compatibility rather than taste: 280 event lines and every claim in the workbench carry the hex, and option 2 makes each of them read as a stranger's from the switch point backward. The legibility option 2 buys is available to option 1 by lookup, at a cost option 2 also pays once its readers are corrected.

A generated default the user may replace at Setup is better than pure generation. A human naming his own checkout produces a name he recognises, and a collision surfaces at the moment of naming rather than at a later read.
