# ontocoder — the German chat profile forbids coining a term by translation

**Status:** Complete
**Date:** 2026-09-06
**Filed by:** ontocoder (Kai Stalmann <ks@qantr.com>, checkout 5e8248d7)
**Task:** add one blacklist entry to the German chat voice profile, ruled by the user directly in `260905-2008-orchestrator-session.md`, in both the shipped copy and this project's copy, which must end byte-identical.

## The entry

```
  - "L08 Keinen englischen Fachbegriff wörtlich eindeutschen: benenne, was die Sache tut. Nicht 'Zaun-Ausnahme aufs Formurteil anwenden', sondern 'Pfade in Code-Blöcken nicht mehr als Fehler melden'."
```

Placed directly after `L07` in `blacklist:`, in both files. No new section, no comment.

## Why L08

Ids are shared across the four `stilwerk/` profiles with stable semantics: `L02`, `L03`, `L04`,
`L06` and `L07` each mean the same thing in every file that carries them. The `L` family is the
lexicon family, which is where a rule about word choice belongs, and `L07` — no fusion-internal
vocabulary in chat — is the adjacent rule. `L08` is the next free number in that family.

`L01` is also free, and was rejected. `git log -S` over `stilwerk/` shows neither `L01` nor `L08`
was ever in the tree, so the shipped numbering simply starts at `L02`; a new rule filed at `L01`
would read as the oldest of the family rather than the newest. `L08` says when it arrived.

## Why it is not folded into L07

Two different mechanisms. `L07` bans a word that exists inside the tool — a marker letter, a
machine token, a framework noun — from reaching chat at all. `L08` bans manufacturing a German
word that exists nowhere, by rendering an English term of art word for word. A line can satisfy
`L07` completely and still produce `Zaun-Ausnahme`, which is the fault measured in the session
that ruled this: `Zaun` is a garden fence, and the user's verdict on the phrase was not jargon
but gibberish.

The repair the entry mandates is the one the user named: say what the thing does. The entry
deliberately does not offer "leave the English word standing" as the alternative, because for an
internal term that is exactly what `L07` forbids, and the two rules would then contradict.

## Files

- `/Users/k1/Projects/productive/fusion/stilwerk/chat-voice-de.yaml` (shipped copy)
- `/Users/k1/Projects/productive/fusion/fusion-workbench/stilwerk/chat-voice-de.yaml` (this project's copy)

Both end at sha256 `50fcba16c778f1e5e2d0fb1633d638877bc331b5a69b07511d6b37b425d58f48`, 2696 bytes,
up from 2493. `fusion-workbench/.asset-provenance` was not touched: `/fusion:setup` Step 0e owns
it, and the two copies being equal is what keeps that comparison quiet.

`stilwerk/chat-voice-en.yaml` was not touched. The mirrored case was not ruled on.

## Cost

The chat profile is emitted to every agent, so the entry sits on the always-on floor: 75 493
bytes before, 75 696 after, measured as `fusion-rules coder | xargs wc -c` in this repository,
where `coder` draws no conditional rule.

It moves no measured figure in `rules-emission-golden.test.ts` and no golden fixture. That test
excludes the stilwerk profiles by construction — it runs `bin/fusion-rules` with an empty temp
directory as its working directory, so there is nothing project-side for it to find (the test's
own header, `WHAT IT MEASURES`). The advisory the run prints is about the playmaker role's rule
text and predates this change.

`bin/fusion-prose-metric` reports the file unchanged at 5 em-dashes, all pre-existing; the rate
falls from 14.7 to 13.7 per 1000 prose words because the word count rose. The entry adds none.

## Verification

`npx vitest run lib/__tests__/rules-emission-golden.test.ts` from `hooks/` — exit 0, 12 tests
passed. Both files parse (`ruby -ryaml`, exit 0) and carry the same 13 blacklist entries.
