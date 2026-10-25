### 6. Hand the message over, and commit nothing

On Prior the confirmed message is this run's result, and nothing more is done
with it here. Write no message file: no scratch path outside the workspace is
known to survive between calls, and a file inside the workspace would be
captured with the run. Take no commit lock, and run no `git add`, no
`git commit` and no `git commit --amend`: the host captures the workspace when
the run ends and integrates it as the run's one commit. Whether the host takes
this message for that commit is Prior's to say (request 76, question 1); until
it does, report the message as the one this entry proposes.

### 7. Show result

- The selected paths and the confirmed message, verbatim
- No commit hash: this run made no commit

## Flags

- `--all`: Include all changes in the selection, without asking
- `--amend`: Refused on Prior. The host's integration adds a commit, so this run has no commit to amend: say so, and end the run
