- `--infer` or `--close` with none open: say in one line that none is running, write no file, and stop.

## Step 3 — The register is the record file

One structure carries the whole state of a discussion: it is the payload of every dispatch, what the stopping rule is evaluated against, what `--infer` prints, and at the end the record. **That structure is the file on disk.** There is no second file, no pointer file, and no state held only in the model.

So a round is three acts: read the file, build the dispatch from it, rewrite it whole. `--infer` and the stopping check read the same bytes. Killing the session after round three then leaves a record carrying three rounds by construction, not by your having remembered to project hidden state onto disk.

**The four claim sections carry the result.** The section an entry block sits in *is* its result, which is why no block carries a result field: written twice, the two copies have somewhere to drift. Every claim appears in exactly one of the four sections.

One entry-block shape, used in all four:

```markdown
### <identifier> — <claim, one sentence>

- **Advanced by:** <first partner | consultant>
- **Entered:** round <N>
- **Last moved:** round <N>
- **Evidence:** <citation, or, under "could not be decided", the missing input>
- **Conceded:** <partner>, round <N> — <citation>
- **Both positions:** <first partner's> / <consultant's>
```

`Conceded` appears only where a partner gave the claim up; `Both positions` only under open dissent. **A field with nothing to say is left out, not emptied.**

The identifier is short, stable and unique within the discussion (`C1`, `C2`, …), so a later round can name an earlier claim. **Never renumber**: an identifier that moves breaks every reference already written to it.

**The three result classes, and there is no fourth:**

1. **Checked.** The consultant opened the underlying source and the claim holds.
2. **Refuted.** The consultant opened the underlying source and the claim does not hold.
3. **Not decidable from the inputs at hand.** The entry names the input that would decide it.

Disagreement is not a fourth class. The result is the consultant's finding; open dissent records that you refuse it and neither side concedes. Keeping the two apart is what keeps the three classes exhaustive and the stopping rule's count unambiguous.

**Conceding is allowed and wanted.** A concession that does not name the claim that falls and the evidence that felled it is not recorded as one, because without those two the entry says only that somebody stopped arguing.

## Step 4 — `--begin`: the record exists before the first result

