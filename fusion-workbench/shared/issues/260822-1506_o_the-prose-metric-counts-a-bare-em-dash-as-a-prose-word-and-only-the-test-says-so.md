The prose metric counts a bare em-dash as a prose word, and only the test says so

---

`bin/fusion-prose-metric`'s header documents its second output column as:

>   words    prose words, excluding the same regions

It does not say what a word is. The script counts whitespace-separated tokens outside the four
excluded regions, so an em-dash standing between spaces is itself counted as a word. The new test
pins that and says so in a comment, but the header does not.

---

**The instance.** `hooks/lib/__tests__/fusion-prose-metric.test.ts:63-70`:

```
// 3 em-dashes; 19 whitespace-separated tokens, the em-dashes among them.
const row = measure("prose.md", [
  "The gate stops the run — that is the point.",
  "A second clause — also prose — counts twice.",
]);
expect(row).toEqual({ em: 3, words: 19, rate: 157.9, permit: 0, verdict: "over" });
```

Sixteen words and three dashes. The assertion is `19`, and it is correct about the script. Confirmed
independently here by re-deriving the row from the header's four-region rule: nothing in the two lines
falls in an excluded region, so the count is whatever the tokeniser does with the dashes, and the
header does not say.

**Why it is worth a record rather than a shrug.** Three reasons, in order of weight.

The header is declared authoritative documentation for this program — `CLAUDE.md`'s `bin/fusion-prose-metric`
row says so in those words, and defers the usage block, the exit table and the four regions to it. A
behaviour that only the test states is a behaviour the declared authoring home does not hold, which is
the same class of defect as `260822-1421`, filed and repaired two commits earlier in this range.

It is self-inflating in the direction that matters. The denominator of the rate is the thing the
ceiling is read against, and every em-dash a file carries adds one to it. On a file at the ceiling the
effect is under a tenth of a percent and nobody will ever see it; the point is that the direction is
toward permitting more, not fewer.

And the test's own preamble claims it pins the header rather than the awk. For this one assertion it
pins the awk, because there is nothing in the header to pin.

---

**Found by:** coderev, reviewing `c2ad89c..6781814`, review file
`shared/reviews/260822-1506-coderev-the-guard-rationale-repair-and-the-capped-help-topic.md`.
**Owner:** `coder`.
**Severity:** Low.
**Affects:** `bin/fusion-prose-metric` (the output-column table in its header),
`hooks/lib/__tests__/fusion-prose-metric.test.ts:63-70`.
**Filed in the shared store:** no Circle is active.

**The fix, and it is a choice of two.** Either state the tokeniser in the header — one clause on the
`words` line saying a word is a whitespace-separated token outside the four regions, and that a bare
em-dash therefore counts as one — which costs nothing, since `bin/` is on no bounded surface and the
test then pins a documented fact. Or change the script to drop tokens carrying no word character,
which changes the denominator on every file the program has ever measured and would need the test's
`19` re-derived to `16`. The first is the cheaper and, given that the metric reports and never gates,
almost certainly the right one; the second should not be taken without saying what it does to any
figure already quoted in a record.
