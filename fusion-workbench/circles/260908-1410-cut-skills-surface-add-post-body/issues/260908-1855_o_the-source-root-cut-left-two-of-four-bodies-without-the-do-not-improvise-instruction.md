The source-root cut left two of the four bodies without the do-not-improvise instruction

---

Row 1 of the cut collapsed the source-root preamble in `skills/setup/SKILL.md`, `skills/cleanup/SKILL.md`, `skills/help/SKILL.md` and `skills/next/SKILL.md` onto one paragraph each, and the plan required each body to keep "its own consequence sentence". One sentence that all four carried before the cut survives in only two. `skills/cleanup/SKILL.md` kept "Do not improvise the content of a procedure you could not open." and `skills/help/SKILL.md` kept its equivalent, "**never** paraphrase a shipped doc you could not read". `skills/setup/SKILL.md` and `skills/next/SKILL.md` each carried "Do not improvise the content of a section you could not open." at `94a262b0` and neither carries it now.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

The row's stated purpose was to put four copies of one restatement onto one citation so they cannot diverge again. The restated half — the branch, the guard, `UNRESOLVED`, the read-versus-run split — was checked against `bin/fusion-source-root`'s own header and is genuinely there, including the "explicitly UNANSWERED" warning about part (c) of `260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`. That part of the cut is sound. What went with it in two bodies is the instruction that is not about resolution at all: what to do instead of reading, when the root did not resolve.

The two bodies that lost it are the two that need it differently, which is why this is not cosmetic:

- `skills/setup/SKILL.md` reads shipped text through `$FUSION_SRC` at several steps and now says only to "name it in the Setup-complete summary, say which steps citing a plugin file were not run". Naming a step as not-run is a report; not writing its content from memory is the behaviour, and it is now unstated.
- `skills/next/SKILL.md` now says to "name the step that could not open the file it cites". Same shape. Its cut also dropped the sentence tying the rule to `rules/fusion-workbench-conventions.md` `## Path Resolution` → *Where the call belongs*, which is where the general form of the instruction lives, so the body no longer points anywhere for it either.

Where it should land is a question worth asking rather than answering here: the instruction is the same in all four bodies, which is the signature of something that belongs in `bin/fusion-source-root`'s header beside the rest of the contract the four now cite. Its exit-2 paragraph already says a caller "reports the root as UNRESOLVED and reads NOTHING through it"; extending that to say what a caller writes instead of what it could not read would make all four bodies correct at once and cost the `skills/` surface nothing.

**Acceptance test:** all four bodies either carry the do-not-improvise instruction or cite one place that carries it; the four consequence paragraphs differ only in what each body reports and where, not in which rules they state.
