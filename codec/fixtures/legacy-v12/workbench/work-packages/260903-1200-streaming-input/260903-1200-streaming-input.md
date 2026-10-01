# Input is read as a stream instead of a whole-file buffer

---
**Domain:** code
**Status:** paused
**Active spec/plan:** 260903-1230_*_plan-streaming-input-first-cut.md (plan, closed before the pause)
**Depends-on:** 260901-0900-tokenizer-handles-unicode.md
**Filed by:** user, Fixture Person <fixture@example.invalid>

---

## Directive

The front end reads its input in fixed-size chunks, so a file larger than memory parses. Reached when a generated 4 GiB source file parses with a resident set under 64 MiB.

## Paused

Waiting for the tokenizer's Unicode work, the package named under Depends-on: the chunk reader splits at byte boundaries, and the current tokenizer cannot resume inside a multi-byte sequence.
