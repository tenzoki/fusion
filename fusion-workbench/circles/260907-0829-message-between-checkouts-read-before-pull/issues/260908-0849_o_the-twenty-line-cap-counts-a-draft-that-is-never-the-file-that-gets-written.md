The twenty-line cap counts a draft, and the draft is not the bytes that get written

---

`skills/post/SKILL.md` `## Step 2: compose the draft` says "**Count the lines with `wc -l` before the draft is put**, never after", over a block that pipes `$DRAFT`. Nothing exists for `wc -l` to read at that point: `$DRAFT` is assigned by no step, and the file is written only "On yes, and only then" (`## Step 5: write the entry`), after the gate. The draft is *printed as ordinary output* (`## Step 4: the two invocation shapes`) and the write is a separate act with nothing binding the two. The cap therefore bounds a rendering, not the artifact.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

The count is the one mechanism in this body with nothing behind it: the block is executable, but its input is a variable no step assigns. Three distinct gaps, all in the same step:

1. **No file to count.** Either the body says to write a scratch file and count that (and where it goes — a scratch inside `$WORKBENCH` is what `/fusion:cleanup` Step 7 would then commit), or the count is not `wc -l`.

2. **The counted text and the written text are two generations.** The instruction to re-compose "On yes" is what makes the cap unenforced in the case it exists for: a long message. Nothing re-counts at write time.

3. **`wc -l` counts newlines.** A twenty-one-line draft whose last line has no trailing newline counts as twenty and passes.

Separately, the cap's arithmetic is stated two ways in one sentence. "Twenty lines in the file" reads as an exact count; "subject, blank, ≤ 8 …, blank, ≤ 9" sums to twenty only when both halves are at their maximum, and "over the cap, cut and recount" reads as a ceiling. A shorter message is under twenty lines and violates nothing. Say which it is.

The one entry written so far, `260907-2354-1d05b0e4-read-before-pull.md`, is exactly twenty lines, so the shipped body has been followed once by hand successfully. That is evidence the shape is writable, not that it is bounded.

**Acceptance test:** the body names, executably, what is counted and when; a run that composes a twenty-five-line message cannot write a file of more than the cap; the ceiling-versus-exact-count question has one answer in the text.

---
Reconciled 260908-1814 (reconciler, HEAD `ee99a578`): still open, and **the text this record cites has
moved**. Circle `260908-1410-cut-skills-surface-add-post-body` relocated the message half out of
`skills/cleanup/SKILL.md` and into `skills/post/SKILL.md` without change of substance, so all five
`skills/cleanup/SKILL.md:NNN` citations above now name other text. The defect survives verbatim in the new
home: `skills/post/SKILL.md` `## Step 2: compose the draft` carries "twenty lines in the file" beside the
1/blank/≤8/blank/≤9 split, so the exact-count-versus-ceiling ambiguity is unchanged; the same section says
to count with `wc -l` before the draft is put; and `## Step 5: write the entry` still writes "On yes, and
only then", so nothing binds the counted text to the written bytes and nothing re-counts at write time. All
three gaps and the arithmetic question stand. Read this record against `skills/post/SKILL.md` and not
against the file it names.

---
Citations re-pointed 260908 (coder, Kai Stalmann <ks@qantr.com>): the body above now cites
`skills/post/SKILL.md` by heading anchor, so the reconciler's instruction to read elsewhere is discharged
and the record names its own subject again. **No line number is written back**, per
`rules/fusion-workbench-conventions.md` `## Filename Patterns`: living text cites by heading anchor, because
an edit above the line moves it silently and no gate resolves `path:N` — which is exactly how these five
citations came to name other text. Two quoted strings were refitted to the moved wording (the `wc -l`
sentence and "On yes, and only then"), and the framing sentence about the step carrying no executable block
was corrected: the new home does carry one, and what it lacks is an assignment to `$DRAFT`. **The defect is
untouched and the marker stays `_o_`** — all three gaps and the exact-count-versus-ceiling question are open
for whoever takes them.
