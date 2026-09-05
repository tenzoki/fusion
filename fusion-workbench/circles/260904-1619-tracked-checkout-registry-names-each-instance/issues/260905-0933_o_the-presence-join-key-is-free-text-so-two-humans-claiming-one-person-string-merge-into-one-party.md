The presence join key is free text, so two humans claiming one Person string merge into one party

---
`presence` canonicalises a git identity to the registry's `**Person:**` value and counts distinct canonical persons. That field is free text with no uniqueness constraint, so two different humans who both type "Kai" are counted as one person and one of them is reclassified as a further checkout of the reader's own. The helper's header reasons at length about alias collisions and never mentions this one.

---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

**Severity:** Low today (it needs two humans and a colliding string), and it is the asymmetry that is worth recording rather than the likelihood.

## Evidence

- `hooks/events-query.ts:210-238` — `readRoster` builds `identityMap[gitIdentity] = person` from the roster's third field, with no check that one person string is claimed by one human.
- `hooks/lib/events-query.ts:277-281, 325-336` — `canon` maps a git identity to that string, `me = canon(identity.person)`, and the `people` set is a set of those strings. A collision on the string merges two parties.
- `bin/fusion-checkout-name:147-161` — the header's collision section is about the alias, and its argument is that a collision there is harmless "because the hex stays the key, so every lookup, comparison and claim goes on answering exactly as it did". That argument does not carry to `**Person:**`, which is the one registry value that *does* enter a comparison.
- `bin/fusion-checkout-name:96-97` — "`**Person:**` is the human's claim and is free text". No uniqueness is claimed and none is checked.
- The reverse conflict *is* handled: one git identity claimed by two persons warns on stderr (`hooks/events-query.ts:229-234`). One person claimed by two humans does not.

## Acceptance test

Either `register` reports a `**Person:**` already held by an entry whose git identity is not this checkout's, the way it reports an alias collision, or the helper's header states that a person collision merges two parties and that this is accepted. Silence is what should stop.
