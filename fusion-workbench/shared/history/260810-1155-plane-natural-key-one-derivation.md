# The natural key gets one derivation, and the map records which entries have had it

**Agent:** coder
**Status:** Complete
**Source:** `fusion-workbench/shared/issues/260810-0458_o_the-natural-key-has-two-derivations-and-they-disagree-on-a-second-marker-shaped-segment.md`
**Verification:** `cd hooks && npm test` — exit 0 (39 files, 1040 tests)

## What was wrong

`stable_basename` (file side) and `stable_key` (map side) each strip the first
`_<letter>_` segment after the stamp. Applied once to a file's own name that is the
marker; applied to its own output it removes a slug segment. The sed ran once, on the
on-disk basename. The jq ran once per invocation over whatever the map already held,
including keys the sed had produced. For a name shaped `<stamp>_<m>_<letter>_<rest>.md`
the two sides settled on different keys, `map_get_id` missed, and every push planned a
create.

## Reproduced before the change

Scratch copy of the test fixture workbench, one extra artifact
(`<stamp>_o_a_b-thing.md`), the map written through the helper's own write path
(`seed --record-origin`, a pure map write):

| | result |
|---|---|
| key the file side builds | `…::issues/<stamp>_a_b-thing.md` |
| key the map side resolves the stored one to | `…::issues/<stamp>_b-thing.md` |
| three consecutive `push --plan` runs | `op=create`, `op=create`, `op=create` |
| a later, unrelated map write | silently re-keyed the entry and stranded its UUID |

The control (an ordinary name recorded the same way) planned `op=update`, so the
divergence is the shape of the name, not the fixture.

## The fix

`MAP_KEY_FORMAT=2`, stamped onto every entry as `key_format` at `map_put` — the single
place `.plane-map.json` is replaced, so no entry can reach the file without it. A new jq
definition `settled_key` reads that field first and derives only for an entry that
predates the stamp; the fold (`JQ_MIGRATE_MAP`) and the loser report (`JQ_FOLD_LOSERS`)
both go through it, so they cannot answer differently. The fold is thereby a one-shot
migration of the pre-stamp entries rather than a transform re-applied for the life of
the map.

"Has this key already been stripped?" is not decidable from the key text, which is why a
narrower regex was rejected: the mechanism changes to record the answer instead of
recomputing it.

`map_migrate` now branches on the recorded format rather than on "would folding change
any bytes". The old condition answered a different question and left a stable but
unstamped map unstamped, so every later read derived its keys again.

## After the change, same fixture

| | result |
|---|---|
| three consecutive `push --plan` runs | `op=update` × 3, same key, same UUID |
| legacy key `<stamp>_o_a_b-thing.md`, `map --migrate` × 3 | `migrated`, then `already at key format 2` twice, key unchanged |
| a later unrelated map write | leaves the migrated key in place |
| the migrated entry across a state transition | `op=update` on the same UUID |

## Residual, deliberate and documented

An entry written after the key went marker-free but before the format existed carries no
format, so it is indistinguishable from a legacy one and is folded once. For every
filename the naming convention produces that fold is the identity (all 348 issue and
decision names in this workbench were checked, per the source record). The pathological
shape costs one wrong key, once. Recorded in `bin/fusion-plane`'s `MAP_KEY_FORMAT`
comment and in `docs/plane-setup.md`.

## Tests

- The literal `sed`-spelling assertion is gone. It pinned the mechanism's text, so a
  correct change failed it for no behavioural reason, and it would have passed a
  derivation that stripped twice. Its replacement drives the helper over three
  filenames and asserts the key is the basename minus exactly one marker. Mutation-
  tested: a pass-through and a double strip each turn it red; the deleted assertion
  would have passed the double strip.
- New section 2b-bis: the three-run property, a negative control running the pre-fix
  text from `df75004` (create × 3), the one-shot migration, and that every writer
  stamps.
- Updated: `map --migrate` on a stable-but-unstamped map (now writes the stamp; second
  run writes nothing), and the rebuilt-entry placeholder shape (gains `key_format`).
- The four byte-identity spellings the suite already asserted are untouched and green.

## Files

- `bin/fusion-plane`
- `hooks/lib/__tests__/fusion-plane.test.ts`
- `docs/plane-setup.md`

## Not done here

The rebuild path (`JQ_REBUILD_MAP`) applies `stable_key` to a key read back out of a
Plane issue body, which carries no format, so the same ambiguity lives there for a
pathological name whose issue was POSTed after the key went marker-free. Out of the
source record's scope and out of the task's file list; reported to the user rather than
filed.
