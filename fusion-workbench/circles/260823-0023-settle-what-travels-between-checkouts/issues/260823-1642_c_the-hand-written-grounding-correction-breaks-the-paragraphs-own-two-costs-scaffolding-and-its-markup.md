The hand-written Grounding correction breaks the paragraph's own "two costs" scaffolding, and drops the markup the rest of the section keeps

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, reviewing C2 Turn 4 (`a2a18f9..2ec2bc2`)
**Affects:** `circles/260823-0023-settle-what-travels-between-checkouts/_t_circle.md:29-31` (`## Grounding snapshot`)
**Cross-references:** `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1635_*_the-corrected-grounding-undercounts-setups-project-root-writes-and-omits-step-0f.md`, the factual defect in the same three lines; `circles/260823-0023-settle-what-travels-between-checkouts/issues/260823-1455_*_the-shapers-mode-3-has-no-scope-value-for-a-grounding-only-correction-and-halts-on-the-only-case-that-needs-one.md`, why this was written by hand

---

## What is wrong

Three separable residuals in the paragraph `2ec2bc2` rewrote. None is a factual error; the factual error is filed separately. They are here because the same edit window closes on all of them.

### 1. The paragraph promises two costs and now delivers one

`:29` still reads:

> Two costs were accepted. The first is bytes on the skill surface … The second is not a byte question and is recorded here as its own fact:

What follows the colon is no longer a cost. It is a correction saying that the thing formerly counted as a cost is not one — "The property worth naming here is therefore not that Setup begins reaching outside the workbench, but that Step 0g is a worked convention for doing so." The scaffolding was written for the claim that was removed and was left standing over the claim that replaced it.

The bolded opening sentence, "**The merge driver reaches other projects through Setup, and that is an expansion of what Setup touches**", survives on a narrower reading than it was written for: a new file is touched, so it holds, but the reason it was there — that Setup had never reached outside the workbench at all — is gone.

### 2. The markup is dropped

`:30` writes `/fusion:setup`, `fusion-workbench/`, `.claude/settings.local.json` and `.gitignore` as bare prose. Every other line of the `## Grounding snapshot`, `:29` and `:31` included, backticks its path and command literals. `:29` also carries one trailing space, left over from the split.

### 3. The convention list over-states the guarantee Step 0g gives

`:30` names Step 0g as "a worked convention" and spells it:

> read first, add only, never overwrite, never remove an existing entry, write only in the directory Setup ran in, and report the outcome either way.

`skills/setup/SKILL.md` §2 step 3 of Step 0g bounds that guarantee, and does so deliberately, in the same sentence:

> preserving every existing entry — **only add, never remove**; that guarantee is about the `allow` list and reaches no other field. Set `permissions.defaultMode` … only when the file carries no `defaultMode`, or when the question named the existing value the user agreed to replace — a scalar is replaced, not merged, so it is never set silently.

So Step 0g does replace a field, on consent, and its own text goes out of its way to say which parts of it the never-overwrite promise covers. The Grounding restates the promise unbounded.

Harmless for `.gitattributes`, which is pure append. It is not harmless as a *convention*, which is what the sentence offers it as: the next project-root write that reuses this list gets a guarantee its worked example does not actually give.

## Verified

Read `_t_circle.md:26-32` byte-for-byte, including trailing whitespace (`grep -n ' $'` returns line 29 and nothing else in the file). Read `skills/setup/SKILL.md` Step 0g `:270-313` in full at HEAD. Confirmed by `sed -n l` that `:29-31` are three consecutive lines with no blank between them, so they render as one paragraph.

## Direction, not a prescription

If `:30` is opened for the count correction that `260823-1635_*` asks for, take these in the same edit — they are the same three lines and the same deadline, and a second pass over a frozen Grounding is not available.

Recast `:29`'s promise to match what the paragraph now says: one accepted cost, plus the correction. Backtick the four literals and drop the trailing space. Either scope the convention list the way `skills/setup/SKILL.md` scopes it, or shorten it to the parts that hold unconditionally — read first, write only in the directory Setup ran in, report either way — and let the reader open Step 0g for the rest, which is what a worked convention is for.

---
Resolved: the clause now reads "never remove an existing entry from a list it merges into" and the sentence after it carries Step 0g's own scoping, to the `allow` list and no other field, together with the `defaultMode` scalar replacement and the question that names the value being replaced. Corrected in `_t_circle.md` `## Grounding snapshot` on 260823, before the closure rename.

Written by the orchestrator on the user's explicit instruction at the Phase 3 gate, which is the second such override in this Circle. `agents/orchestrator.md` `## Scope` does not permit it and the sanctioned writer, shaper mode 3, cannot reach this case; the structural reason is filed as `260823-1455_*_the-shapers-mode-3-has-no-scope-value-for-a-grounding-only-correction-and-halts-on-the-only-case-that-needs-one.md`. Both overrides are carried into the Closure note, because a Circle-scoped record does not survive closure in any agent's read set.
