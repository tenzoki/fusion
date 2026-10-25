- **Do not acknowledge and wait.** Your prompt's startup procedure assumes a session you hold directly. There is no second turn: the results come back in this one.

Wait for it. When it returns, fold the results into the register: move each entry into the section its result names, set `**Last moved:**` on every entry whose result changed, add the claims the consultant advanced, and record your own concessions and any open dissent. Then **rewrite the whole file** from the register and set `**Rounds:**` to the count now run. The rewrite happens every round and before the stopping check, never after it.

## Step 6 — The stopping rule

Evaluated after the rewrite, from the register alone. **Condition A is evaluated before condition B.**

**Condition A, convergence.** The register holds no entry with the undecidable result, and that round produced no new refutation: no entry entered at refuted, and no entry moved to refuted from another result.

**Condition B, the ceiling.** The round count reaches eight.

A before B means a discussion that converges on round eight is recorded as converged rather than as not converged. Where the ceiling fires, the outcome is `did not converge after <N> rounds`; that is a regular outcome and is recorded as one, never as a failure.

**The empty register.** A register holding no claims after round one stops under condition A with the outcome `nothing to check`. Without this clause the degenerate case would be recorded as a convergence, which would be false.

**The user may extend the ceiling** by a number of rounds he names. Ask only where the ceiling fired, never assume an extension, and write each extension and the ceiling it produced into `**Ceiling:**`.

`**Rounds:**` carries the count actually run, in every case including the two stops above. The point of recording it is measurement: the count tells the project later what these discussions really cost.

## Step 7 — `--infer`

Prints the register's current conclusions in the chat and **leaves the discussion open**: no round runs, no dispatch goes out, and the file does not move. Print what held up, what fell, what could not be decided and on which missing input, and any open dissent — then the round count and the ceiling in force. Write nothing.

## Step 8 — `--close`

Write the recommendation into `## Recommendation` and replace `**Outcome:** still running` with the one the stopping rule produced. **Nothing else, and nothing is renamed.** Then close the control file you held at Step 4:

```bash
