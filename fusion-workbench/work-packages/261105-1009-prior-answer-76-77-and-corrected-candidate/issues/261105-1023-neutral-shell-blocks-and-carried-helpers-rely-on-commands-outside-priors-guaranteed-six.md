Neutral shell blocks and the carried `bin/` helpers rely on commands outside the six Prior guarantees
---
Prior's verdict on 76 question 6 lets a `prior` part rely on `bash`, `node`, `git`, `sed`, `head` and `od` alone. The rendered Prior profiles also run neutral shell blocks, and every Setup calls `bin/` helpers, and both use other commands. Correcting the `prior` parts does not make a run depend on the six only. Prior's `ProbeHelperRuntime` comment says those six are what "fusion's hooks and bin/ helpers start" (Prior `internal/supervisor/exec.go` at `52a2703`), which this measurement contradicts.
---
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261105-1023-plan-fusion-13-4-2-corrected-candidate.md

**Evidence (a text scan, so a floor and not an exact count).** At `6f9607b0`, over the supported profiles' parts and `bin/`:

- Fenced shell in neutral parts, 15 files: `date`, `cut`, `grep`, `mv`, `shasum`, `mkdir`, `sort`, `tail`, `touch`, `rm`, `find`, `python3`, `cp`, `wc`. For example `skill-check/parts/20-neutral.md`, `skill-migrate/parts/14-neutral.md`, `skill-post/parts/14-neutral.md`, `skill-setup/parts/06-neutral.md`, `orchestrator/parts/16-neutral.md`.
- The shell helpers in `bin/`: `dirname`, `cat`, `tr`, `date`, `grep`, `tail`, `cut`, `awk`, `basename`, `sort`, `mv`, `stat`, `rm`, `sleep`, `mktemp`, `wc`, `mkdir`, `ls`, `touch`, `python3`. `bin/fusion-workbench-root` uses `dirname` and `bin/fusion-rules` uses `awk` and `mktemp`, and an agent's Setup calls both.

Neutral parts are the same bytes in the Claude render and the helpers are the Claude install's, so changing either is not a corrected-candidate edit. Prior's image is `node:24-bookworm` pinned by digest (`exec.go:60`); that it carries these is inference until plan step 1 of `261105-1023-plan-fusion-13-4-2-corrected-candidate.md` measures it.

**Executor:** analyst for the measurement (plan step 1), data-implementer for the question in request 78. The fix depends on Prior's answer.

**Acceptance.** Prior's answer to the question in request 78 is recorded in `codec/fixtures/prior/REQUESTS.md`, and either Prior's guarantee names what the neutral blocks and helpers need, or the failing blocks are cut into `claude` and `prior` pairs with the Claude render byte-unchanged and the helpers named in a further issue.
