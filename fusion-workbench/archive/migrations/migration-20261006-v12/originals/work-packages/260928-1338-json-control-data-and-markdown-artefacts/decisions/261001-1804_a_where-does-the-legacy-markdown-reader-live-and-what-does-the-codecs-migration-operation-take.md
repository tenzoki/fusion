# Where does the legacy Markdown reader live, and what does the codec's `migration` operation take?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md, 260929-1810_*_which-write-creates-the-manifest-of-a-new-json-controlled-workbench.md, 261001-1030_*_how-does-the-host-hold-maintenance-exclusivity-over-codec-writers-while-it-moves-pairs.md

---

## Question

Section 6 of the specification (Prior `590465d`) lists `migration survey/plan/apply/verify` as a codec operation, "separater Modus mit eingefrorenem Plan, Sicherung und Wiederaufnahme", deferred in the bundle (`inspect` names it; the protocol schema's branch takes `phase` and `plan` and no `operation_id`). Section 8 asks of the survey things the codec cannot see (untracked and ignored files are git facts) and things only a reader of fusion's v12 Markdown grammar can extract (head fields, Circle markers, step marks, `Answered:` lines). Section 6 also says every write path uses the same operations and that the codec is the one implementation of the transitions. Someone has to parse the Markdown and someone has to write the pairs; the texts do not say whether that is one party.

## Options

1. **Host reads, codec writes.** The host (`hooks/lib/`, behind `bin/fusion-migrate`) reads the Markdown and composes a mapping proposal: target control objects, UUIDs, rewritten live narratives, findings. The codec's `migration` takes the proposal by file path (a frozen plan of 1 000 records exceeds the 1 MiB request bound), and alone writes: `survey` is its byte inventory (paths, sizes, sha256, links, `.json-state/`, `archive/` as history), `plan` validates every target against the schemas and the closure and freezes the plan with expected after-hashes, `apply` writes under its fence in one journaled intent, `verify` checks and activates the manifest as the last write, `rollback` restores before activation.
   - Pros: no fusion JSON is written outside the codec; the kernel's journal gives resumption at every write cut; Prior qualifies a format-agnostic operation and no Markdown grammar it never reads; the v12 grammar stays in the one place that wrote it.
   - Cons: the codec cannot judge a mapping's meaning, only its form, hashes and closure; the mapping's correctness rests on host tests and the proof on copies.
2. **The codec reads the Markdown too.** `survey` and `plan` parse v12 Markdown inside the bundle.
   - Pros: one party does all of it; Prior's host could migrate without fusion's helpers.
   - Cons: the v12 grammar enters the shared bundle and Prior's qualification for a format Prior never holds; git facts still need a host; every grammar fix moves the digest.
3. **No codec operation; the host writes pairs through `create`, then `initialize`.**
   - Pros: no protocol change.
   - Cons: `create` refuses a legacy store and `initialize` a non-empty one (request 27); no frozen plan, no single journal, no atomic activation; §8 is not met.

## Constraints

- The kernel stays the only writer of fusion JSON; the manifest is activated last (§8.3.5).
- Requests stay under 1 MiB; answers under 16 MiB (request 31).
- A codec change is a revision qualified by Prior's re-pin, like the earlier ones.

## Recommendation

Option 1, put to Prior as request 45 of the FJ04 plan with the request and answer shapes. The single journaled intent is the reason: atomicity and resumption come from a mechanism already qualified, not from a new one.

---
Answered: plan `261001-1804_*_plan-fj04-the-migration-of-a-legacy-workbench-proven-on-copies.md` — option 1 — the host reads the v12 Markdown, only the codec writes; put to the Prior side as request 45; the user approved it with the FJ04 plan on 2026-10-01, the requests to be sent after the measurement part; ruled by user, Kai Stalmann <ks@qantr.com>
