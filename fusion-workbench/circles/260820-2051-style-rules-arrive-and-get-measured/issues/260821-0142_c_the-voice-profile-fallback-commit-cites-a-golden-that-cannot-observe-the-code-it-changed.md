The voice-profile fallback commit cites a golden fixture that cannot observe the code it changed

---

Commit `1c1178d` states its evidence twice, in the commit message and in the code:

> Standard output is byte-identical in every case, and that is what the untouched `rules-emission.golden` proves. A regenerated golden there would have meant the change was wrong.

and `bin/fusion-rules:327-329`:

> Stdout is untouched in every case — the emission contract and the byte identity `hooks/lib/__tests__/rules-emission-golden.test.ts` holds are why the signal goes to the other stream rather than into a new line format.

**`rules-emission.golden` cannot see `emit_voice_profile` at all.** `hooks/lib/__tests__/rules-emission-golden.test.ts:700` sets the working directory to a fresh empty temp directory (`neutralCwd = mkdtempSync(...)`), and the file's own header says so deliberately at `:39-47`: "the stilwerk voice profiles are deliberately out of scope … They are excluded by CONSTRUCTION, not by a filter: the script runs with an empty temp directory as its working directory."

`emit_voice_profile` resolves `./fusion-workbench/stilwerk/…` (`bin/fusion-rules:332`). In an empty cwd both `[ -f ]` guards fail and the function emits nothing on either stream, so the golden's byte totals are identical whatever the function does.

**Measured, not inferred.** From an empty temp cwd with `FUSION_PLUGIN_ROOT` pointed at this repository:

```
$ (cd "$(mktemp -d)" && FUSION_PLUGIN_ROOT=<repo> <repo>/bin/fusion-rules orchestrator | grep -c stilwerk)
0
```

stderr was empty. `grep -n "stilwerk\|voice" hooks/lib/__tests__/fixtures/rules-emission.golden` returns one line, `:13`, and it is the header comment saying the profiles are excluded. The fixture carries no profile row to move.

**The change itself is right and it is properly covered.** `hooks/lib/__tests__/rules-voice-profile.test.ts:331-348`, added in the same commit, drives the real script in a fixture project with `de` declared and `chat-voice-de.yaml` removed, asserts stdout is exactly `[CHAT_EN, WRITE_DE]` and stderr is exactly the one notice line, and a second case asserts stderr is empty when `en` resolved directly. That is the evidence the claim needed, and it was written. The defect is that the record names a different artefact, one whose falsifier is unreachable.

**Why it matters beyond this commit.** The stated rule — "golden unchanged, therefore stdout unchanged" — is false for every future change to `emit_voice_profile`, and the golden will stay green through a change that does move stdout in a real project. A reviewer who trusts the sentence at `bin/fusion-rules:327-329` will look at the wrong gate. That sentence sits in the always-on emission path's own source, where it will be read again.

**Verified at HEAD `7832553`** by reading `hooks/lib/__tests__/rules-emission-golden.test.ts:39-47` and `:700-720`, `bin/fusion-rules:300-347`, and by running the script from an empty temp cwd as shown above.

---
**Found by:** coderev, review of `7135a19..7832553`, review file `circles/260820-2051-style-rules-arrive-and-get-measured/reviews/260821-0145-coderev-turn-1-prose-metric-setup-step-0e-and-the-repunctuation.md`.
**Owner:** `coder`. No behaviour changes: the correction is to the four comment lines at `bin/fusion-rules:327-330`, which should name `rules-voice-profile.test.ts` and the two cases that actually hold the stdout identity.
**Severity:** Medium. Nothing is broken now. The cost is a false falsifier written into the source of the one script every agent's Setup runs.
**Cross-references:** `circles/260820-2051-style-rules-arrive-and-get-measured/issues/260821-0042_o_the-always-on-rule-states-two-things-about-the-voice-profile-fallback-that-stopped-being-true.md` — the other standing defect on the same paragraph, from the same step.

---
Resolved: fixed — the comment names `hooks/lib/__tests__/rules-voice-profile.test.ts` and its two cases as the gate that holds the stdout identity, and says why the golden cannot observe the function; `bin/fusion-rules` `emit_voice_profile` header comment
