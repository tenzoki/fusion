# Coder — three reviewer-found closures in `agents/orchestrator.md` and `bin/monitor`

**Status:** Complete
**Agent:** coder
**Date:** 2026-08-16
**Dispatched by:** orchestrator

## What was asked

Three records filed by coderev against `f4f01b0..3a0408a`, each a closure from earlier
in the session that did not fully land:

- `shared/issues/260816-0134_c_*` — the net-negative-progress breaker's two counters
- `shared/issues/260816-0130_c_*` — the `DualStackServer` docstring arguing against its own code
- `shared/issues/260816-0131_c_*` — the port-clearing union's comment claiming more than its predicate

## What was done

**1. The counters are symmetric.** `agents/orchestrator.md:960` now reads "issues resolved
this session by **any** agent or the user", matching `:959`. Twelve bytes on the `agents`
surface. The sibling pair (`decisions_answered`, `decisions_implemented`) was checked
rather than assumed, as the record asked: both are worded as transition counts across
every store and name no author on either side, so they carry no asymmetry and were left
alone.

**2. The docstring describes the code.** The two-reason paragraph in `DualStackServer`
said printing `127.0.0.1` "is not the one taken" and cited a test pin on
`http://localhost:${port}`. The file does print `127.0.0.1` on three of four bind paths,
and the pin was rewritten to `http://127.0.0.1:${port}` by the same commit that left the
prose standing. The paragraph now says what the file does — the wildcard goes dual-stack
so the name it prints is true there, every other path prints the address it bound — and
restates the pins as the pair they now are (`:906` loopback, `:1052` wildcard), which
together assert that the printed name follows the socket. The reasoning that survived is
now the whole argument: `localhost` is what a user bookmarks, so making it true beats
routing around it.

**3. The predicate was tightened, not the comment weakened.** The dispatch asked me to
weigh the record's claim that the comment is the defect. Option 1 — narrowing the
predicate — is cheap here for a reason the record did not have to hand: the launch form is
fixed at `bin/monitor:1441` (`python3 "$TMPFILE" <args…>`), so the script sits in a known
position of the command line. `_runs_this_script` now walks the tokens after the
interpreter, skips interpreter options, and compares the basename of the first non-option
token. Basename rather than full path is deliberate: the wrapper writes the script into a
fresh `mktemp -d` each run, so a full-path test would match nothing.

The comment was corrected as well, so code and documentation make the same claim: "what a
process is *running*", "adds nothing" instead of "is inert", no "by construction", and a
pointer to the docstring, which names the two residuals the token test costs (a path
containing a space; an interpreter invoked as `-c`). Both lose a kill rather than gaining
a wrong one, and neither touches the listener kill.

## Measured

End-to-end on macOS 15.7.7, port 18825, reproducing the reviewer's setup:

```
listener      59851 DEAD    (prior monitor — intended, unchanged)
plain client  60765 ALIVE   (port holder, no string in argv)
naming client 60766 ALIVE   (port holder naming monitor-server.py — was DEAD before)
```

On the predicate directly: `python3 a/monitor-server.py alpha 1 2 3` → True;
`python3 b/client.py --note /tmp/somewhere/monitor-server.py` → False;
`python3 -u a/monitor-server.py` → True.

Syntax: the embedded python compiles (`py_compile`) and the wrapper parses (`bash -n`).

## Verification

`cd hooks && npm test` — **exit 1**, 763 of 764 tests passing. The single failure is
`surface-growth-bound.test.ts > matches the checked-in golden`, the per-file inventory the
dispatch excluded and told me not to regenerate. The bound assertion itself passes.

That attribution was measured, not assumed. A detached worktree at HEAD with no changes
fails the same single assertion, so it is stale at HEAD and not mine. An earlier run in
the working tree also failed `reference-resolution-lint` and `rules-emission-golden`;
applying only my two files onto the clean worktree passes both, so those came from other
agents' uncommitted edits to `rules/fusion-workbench-conventions.md` and `CLAUDE.md`, and
they are green in the tree as of the final run.

## Files changed

- `/Users/k1/Projects/productive/fusion/agents/orchestrator.md`
- `/Users/k1/Projects/productive/fusion/bin/monitor`

Records closed (`_o_` → `_c_`, each with a `Resolved:` note):
`shared/issues/260816-0134_c_*`, `260816-0130_c_*`, `260816-0131_c_*`.

Not committed — the orchestrator stages and commits.
