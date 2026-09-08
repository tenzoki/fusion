The twenty-line cap counts a draft, and the draft is not the bytes that get written

---

`skills/cleanup/SKILL.md:200` says "Count it with `wc -l` **before** you put it; over the cap, cut and recount, never put and trim." Nothing exists for `wc -l` to read at that point: the file is written only "**On yes**" (`skills/cleanup/SKILL.md:208`), after the gate. The draft is *printed as ordinary output* (`skills/cleanup/SKILL.md:206`) and the write is a separate act with nothing binding the two. The cap therefore bounds a rendering, not the artifact.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

The message half is the only step in this skill that carries no executable block; every other step's mechanism is a shell block or a named body. Three distinct gaps, all in the same paragraph:

1. **No file to count.** Either the body says to write a scratch file and count that (and where it goes — a scratch inside `$WORKBENCH` is what Step 7 would then commit), or the count is not `wc -l`.

2. **The counted text and the written text are two generations.** The instruction to re-compose "On yes" is what makes the cap unenforced in the case it exists for: a long message. Nothing re-counts at write time.

3. **`wc -l` counts newlines.** A twenty-one-line draft whose last line has no trailing newline counts as twenty and passes.

Separately, the cap's arithmetic is stated two ways in one sentence. "Twenty lines in the file" reads as an exact count; "subject, blank, ≤ 8 …, blank, ≤ 9" sums to twenty only when both halves are at their maximum, and "over the cap, cut and recount" reads as a ceiling. A shorter message is under twenty lines and violates nothing. Say which it is.

The one entry written so far, `260907-2354-1d05b0e4-read-before-pull.md`, is exactly twenty lines, so the shipped body has been followed once by hand successfully. That is evidence the shape is writable, not that it is bounded.

**Acceptance test:** the body names, executably, what is counted and when; a run that composes a twenty-five-line message cannot write a file of more than the cap; the ceiling-versus-exact-count question has one answer in the text.
