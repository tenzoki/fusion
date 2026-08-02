The "runs to line 8" rationale for the ten-line window is false in the commit that states it

---

**Severity: Low.** Documentation only. A reader who checks the stated bound gets a
different number and cannot reproduce the "one line to spare" arithmetic.

**Evidence.**

Two sites make the same claim about the same file.

`rules/fusion-workbench-conventions.md:573`:

> Ten was chosen to clear the longest opening blockquote in the corpus, which runs to
> line 8 in `context-manifest.md`, with one line to spare.

`hooks/lib/__tests__/provenance-header-lint.test.ts:47-49`:

> Ten clears the longest opening blockquote in the corpus (line 8 in `context-manifest.md`)
> with one line to spare.

Both use the present tense. Both were true at `e8988d9` and false at the commit that
wrote them, because Step 1 of the same plan inserted two lines at line 3 of every rule
file, including that one:

```
$ grep -n '^>' rules/context-manifest.md | tail -1
10:> output (`HYG-NO-REGRESS`). The manifest is purely additive.
```

The blockquote runs to line **10**, not 8. Under the current file the "one line to spare"
margin reads as zero.

The underlying reasoning is still sound. The window was sized against the pre-header
corpus, and placing the header above the blockquote (which the plan chose, uniformly, at
line 3) is what the spec itself sanctions. Only the arithmetic as printed is
unverifiable.

**Fix.** Put the claim in the past tense at both sites and say against what it was
measured. For example:

> Ten was chosen against the pre-header corpus, where the longest opening blockquote ran
> to line 8 in `context-manifest.md`, leaving one line to spare for a header placed after
> the lede. All ten files now carry the header above the lede instead, at line 3.

Also mentioned as a residual: `rules/fusion-workbench-conventions.md:571` says the window
is "wide enough that a file whose lede is a blockquote can carry the header after the
lede instead". That remains true for `context-manifest.md` only if you mentally remove
the header first (blockquote back to 3-8, header lands at 10). Worth a clause saying so,
or the sentence invites a reader to try it and land at line 12.
