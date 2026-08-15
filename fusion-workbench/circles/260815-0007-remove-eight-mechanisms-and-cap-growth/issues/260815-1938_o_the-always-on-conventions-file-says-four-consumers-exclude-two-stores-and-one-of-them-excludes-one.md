The always-on conventions file says four consumers exclude two stores, and one of them excludes one
---
The curator's applied entry L12 widened a measured claim about one store into an asserted claim about two. `rules/fusion-workbench-conventions.md:64` states that four named consumers exclude both `stashes/` and `.migration-v2-backup/`. Three of the four do. `skills/archive/SKILL.md` excludes `stashes/` and never mentions `.migration-v2-backup/` at all. The sentence sits in the one rule file every agent loads on every dispatch.
---
**Severity:** High, and the severity comes from the location rather than the size of the error. `rules/fusion-workbench-conventions.md` is an always-on emission: `bin/fusion-rules <any-agent>` emits it, so all fifteen agents read this sentence every time they run.

**The claim**, `rules/fusion-workbench-conventions.md:64`:

> **Two legacy stores are absent from this tree on purpose, and four shipped consumers still exclude them.** … The exclusions stay all the same — `skills/setup/SKILL.md:67`, `skills/log-activity/SKILL.md:82`, `skills/archive/SKILL.md:96` and `agents/playmaker.md:61` — on the principle that frozen content is not live content.

**Measured at HEAD (`9306f0a`):**

```
$ for f in skills/setup/SKILL.md skills/log-activity/SKILL.md skills/archive/SKILL.md agents/playmaker.md; do
    echo "$f stashes=$(grep -c stashes $f) migration-v2=$(grep -c migration-v2 $f)"; done
skills/setup/SKILL.md         stashes=3  migration-v2=2
skills/log-activity/SKILL.md  stashes=2  migration-v2=2
skills/archive/SKILL.md       stashes=1  migration-v2=0
agents/playmaker.md           stashes=1  migration-v2=1
```

`skills/archive/SKILL.md:96` is the never-archive list and reads:

```
   - `$WORKBENCH/monitor`, `$WORKBENCH/stilwerk/`, `$WORKBENCH/stashes/`
```

No `.migration-v2-backup/`. Four consumers exclude `stashes/`; three of them also exclude `.migration-v2-backup/`.

**How the widening happened, which is the part worth keeping.** The change ledger's own citation for entry L12 (`history/260815-1706-curator-run.md`, §5) reads "Four shipped consumers still exclude **it**" — singular, naming the `stashes/` store, which is what was measured. The After text generalised "it" to "them" across two stores, and the second store was never measured against the four consumers. The user approved the After text; the measurement behind it only ever covered half of what the text asserts.

**Two ways to make it true, and they are not equivalent.**

1. Correct the sentence to the measured split: four exclude `stashes/`, three of those also exclude `.migration-v2-backup/`. Cheapest, and it keeps the file describing what is rather than what should be.
2. Add `.migration-v2-backup/` to `skills/archive/SKILL.md:96`, making the existing sentence true. This changes shipped behaviour — a workbench carrying that directory would stop being archived — so it is a decision, not a correction, and it should not be taken as the cheap way to make a sentence pass.

Option 1 unless somebody argues option 2 on its merits.

**Related, and deliberately not folded in.** The same entry shifted `rules/fusion-workbench-conventions.md` by two lines, which stales the ledger's own L07 citation of `:294` (the line is `:296` at HEAD). That is inside a workbench record rather than a shipped surface and is filed separately if at all.

**Found by:** coderev, review of `1e29572..9306f0a`, commit `e8052e7`.
