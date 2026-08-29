The provenance record is verified with a command whose answer depends on a working directory nobody states

---

Three surfaces landed this Turn describing `.asset-provenance` as self-checking. `skills/setup/SKILL.md:173`:

> `./fusion-workbench/.asset-provenance` holds one line per asset in the shape `shasum -a 256` prints — the checksum, two spaces, the asset's path relative to the workbench — **so the file reads and re-checks with one command.**

`rules/fusion-workbench-conventions.md:84` and `rules/workbench-tracking.md:11` repeat the shape without naming the command.

**The command is `shasum -c`, and its paths resolve against the caller's working directory, not against the file's.** The record stores workbench-relative paths, so the sentence holds from `fusion-workbench/` and from nowhere else. Neither the skill body nor either rule file says so.

**In this repository the wrong working directory produces a confident wrong answer rather than an error**, because a `stilwerk/` directory exists at the project root as well as inside the workbench. Measured at HEAD `7832553`:

```
$ shasum -a 256 -c fusion-workbench/.asset-provenance        # from the project root
stilwerk/default-voice-en.yaml: OK
stilwerk/default-voice-de.yaml: OK
stilwerk/chat-voice-en.yaml: OK
stilwerk/chat-voice-de.yaml: OK
```

Four `OK` lines about four files the command never opened. It read `./stilwerk/*.yaml`, the shipped copies, and they happen to be byte-identical to the workbench copies today because commit `7832553` just made them so. The moment they diverge — which is the entire condition the record exists to detect — the same command reports a failure attributed to the shipped file, which is not at fault. Reproduced on a scratch tree with a deliberately stale workbench copy:

```
$ (cd scratch && shasum -a 256 -c fusion-workbench/.asset-provenance)
stilwerk/chat-voice-en.yaml: FAILED
$ (cd scratch/fusion-workbench && shasum -a 256 -c .asset-provenance)
stilwerk/chat-voice-en.yaml: OK
```

Same file, same checksums, opposite verdicts.

**Step 0e itself is not affected.** `skills/setup/SKILL.md:190-191` computes each checksum with an explicit path (`shasum -a 256 "$d"`) and never calls `shasum -c`. The defect is in what the three surfaces claim a reader can do with the file, not in what the step does.

**Verified at HEAD `7832553`** by running both forms as shown, and by reading `skills/setup/SKILL.md:173`, `rules/fusion-workbench-conventions.md:84`, `rules/workbench-tracking.md:11`.

---
**Found by:** coderev, review of `7135a19..7832553`, review file `260821-0145-coderev-turn-1-prose-metric-setup-step-0e-and-the-repunctuation.md`.
**Owner:** `coder` for `skills/setup/SKILL.md`, and the same author for the two rule files — this is one sentence in three places and it should move once.
**Severity:** Medium. Nothing executes wrongly today. The cost is that a reader following the shipped instruction from the natural working directory gets a verdict that is silently about other files.
**Direction, not a prescription.** The minimum is to name the working directory in the sentence that promises the one command. Whether the promise is worth keeping at all is a fair question: `.asset-provenance` has exactly one reader by design (`rules/fusion-workbench-conventions.md:84`: "`/fusion:setup` is its only writer and its only reader"), so a hand-check convenience nobody is asked to perform may not need a documented command.

---
Resolved: fixed — verified at HEAD that the skill body no longer promises a one-command re-check (`grep -n 'one command' skills/setup/SKILL.md` is empty; the sentence states the line shape only); the two rule-file copies are plan step 13's; `skills/setup/SKILL.md:170`
