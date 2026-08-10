# The activation pointer write in `/fusion:next` 6.3 exits non-zero when no queue exists

---

**Severity:** Low
**Domain:** code
**Filed by:** coderev, review of `8960e1a..HEAD` (session `260810-0241`, Turn 1)
**Affects:** `skills/next/SKILL.md:156-158`
**Cross-references:** commit `ff70d3a`

---

## The defect

```bash
printf '%s\n' "<candidate-dirname>" > "$WORKBENCH/.active-circle"
[ -f "$WORKBENCH/tasklist.md" ] && echo "queue: the work queue at the root predates this activation"
```

When no queue is at the root — the ordinary case for a fresh workbench — `[ -f ... ]` is false, the
`&&` short-circuits, and the block's exit status is **1**. The Bash tool reports that as a failed
command, and the failing command is the one that wrote `.active-circle`: the single most consequential
write in the whole skill.

An agent reading the non-zero status has no way to tell "the pointer write failed" from "there was no
queue to mention". The likely responses are both wrong — re-running the write, or reporting an
activation failure that did not happen.

## Second, smaller: the resolver key is bypassed

`fusion-paths orchestrator` emits `TASKLIST=tasklist.md`, and `rules/fusion-workbench-conventions.md`
`## Path Resolution` opens with *"No agent and no skill hard-codes a store path."* This site spells the
filename instead. It works, because `$WORKBENCH` is emitted to `/fusion:next` — but it works by
bypassing the resolver rather than by using it, and because the prompt never names `$TASKLIST`, the
resolver's key-set derivation will never emit that key to this consumer.

That is the same class `fb0a5c6` closed in three agent prompts four commits earlier in this range
("three prompts name the keys for the acts they already instruct"). Worth fixing together with it so
the pattern does not re-establish itself.

`skills/setup/SKILL.md:240` names `./fusion-workbench/tasklist.md` literally, which is permitted —
`setup` is one of the two `EXEMPT_SKILLS` in `hooks/lib/__tests__/path-literal-lint.test.ts:67`, and it
resolves under `orchestrator`, which does receive `$TASKLIST`. Only the `/fusion:next` site is at issue.

## Fix direction

Make the announcement unconditional in status terms:

```bash
printf '%s\n' "<candidate-dirname>" > "$WORKBENCH/.active-circle"
if [ -f "$WORKBENCH/$TASKLIST" ]; then
  echo "queue: the work queue at the root predates this activation"
fi
```

and add `$TASKLIST` to the prompt so the resolver emits it.
