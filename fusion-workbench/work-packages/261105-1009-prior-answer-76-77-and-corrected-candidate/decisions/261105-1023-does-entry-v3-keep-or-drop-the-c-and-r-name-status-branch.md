# Does the v3 of the entry assets keep the `C`/`R` name-status branch for another host, or drop it?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md, 261105-1023-does-the-13-4-2-candidate-carry-the-v3-of-the-entry-assets.md

---

## Question

Prior's reading S59-2 asks this. `schemas/entry-result.v2.json` `$defs/name_status` defines `C` and `R` with a score and two paths. Prior admits and emits only `A`, `D`, `M` and `T`, because of its rule R and `--no-renames` (`entryNameStatus`, Prior `moduleapi/v1/entry_service_wire.go:225` at `52a2703`). This is the user's ruling.

## Options

1. **Keep the branch in v3.** A later host that reports renames fits the schema unchanged.
   - Pros: no new version when a second host appears.
   - Cons: a branch no host emits, and a `controlRecords` path only unit tests reach.
2. **Drop the branch in v3.** The schema and the module's pattern admit the four letters Prior emits.
   - Pros: the contract states what runs. The last-status rule loses its rename case.
   - Cons: a host that reports renames needs a further version or must flatten them.

## Constraints

No host other than Prior is planned in any record this planner found. The v2 bytes do not change either way.

## Recommendation

No recommendation from the planner: the value of keeping the branch depends on whether another host is intended, which is the user's knowledge. **Until ruled, nothing is decided by default:** this candidate writes no v3 (`261105-1023-does-the-13-4-2-candidate-carry-the-v3-of-the-entry-assets.md`, option 1), v2's branch stands frozen, and the module keeps parsing exactly v2's pattern, treating an `R` line's old path as removed for the last-status rule. Either ruling is then one line of the future v3 and touches no 13.4.2 byte.
