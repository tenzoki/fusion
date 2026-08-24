The new layout row is misaligned and a cut left a line holding one space
---
`rules/fusion-workbench-conventions.md:55` puts the `.checkout-id` comment at column 43 where its six neighbours in the same block sit at 46, inside an ASCII tree that every agent loads on every dispatch. `skills/setup/SKILL.md:467` is a line holding a single space, left by the step-3 cut. Two one-line fixes, neither of them behaviour.
---
**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

Found reviewing `e209011..0f5889e`, the C3 Circle's full range.

**The tree row**, landed at `2b055a0` (plan step 6). Measured with `awk '{print index($0,"#")}'` over the block:

```
├── .active-circle                     # pointer to the active Circle directory      -> 46
├── .fusion-setup                      # setup marker (JSON: timestamp + plugin version) -> 46
├── .asset-provenance                  # what setup copied, checksummed ...          -> 46
├── .checkout-id                    # this checkout's identifier, minted once ...    -> 43
```

The block above it (`portfolio.md`, `monitor`, `archive/`, `stilwerk/`) is also at 46, so 46 is the column the diagram uses and the new row is the only one off it. The diagram is inside a fenced block in an always-on rule file, so the misalignment is visible to every reader of it — unlike the second item below, which is visible on no rendered surface.

**The stray line**, landed at `5b88eb9` (plan step 3). `grep -n '^ $' skills/setup/SKILL.md` returns `467`. The cut removed the sentence that stood there and left the leading space of its bullet continuation.

**Why both are in one record.** Each is a single character's worth of change in a file this Circle edited, with no behaviour and no citation attached to either, and neither is separately schedulable. Recorded together so the pair is one pass rather than two; split them if that turns out to be wrong.

Fix direction: pad the `.checkout-id` row to column 46; delete the whitespace on `skills/setup/SKILL.md:467`. Both files are byte-measured by growth bounds, so re-run `surface-growth-bound.test.ts` and `rules-emission-golden.test.ts` afterwards — the tree fix adds three bytes to an always-on file whose head-room stood at 1 181 after this Circle.
