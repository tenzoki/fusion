**Every command of an entry run is one `host.exec.v1` call with its own `directory`.** Give the source root as the `directory` of the build and test command, and never rely on an earlier call's: no `cd` carries over from one call to the next.

## Tools

On a repair run the host grants tool classes within the profile's ceiling and runs them under its own policy (`execution_policy.prior` is `prior-enforced`): a class the grant omits is absent, not to be emulated. A `process` grant is `process.check` by check name, as `## Setup` item 3 says: the project's build and test command the neutral text names is run as the frozen check that carries it, and a command the checks do not carry is one you cannot run and say so. Without a `process` grant you cannot run the verification the neutral text asks for: each verification entry then reads `none` with that reason rather than claiming a run, and the result is `blocked`, never `done`; the host relaxes nothing on it.

On an entry run you hold the host's file tools within the same ceiling and `host.exec.v1`, as `### Setup of an entry run` item 3 says: the Setup helpers, the project's build, test and type-check commands, `git log` and `git diff`, one call each with its `directory`. The verification the neutral text asks for is that call's exit code, read when the call returns; a call that times out or is refused never returned one, and is reported as `did not finish`.

On both, library documentation comes from the repository and the project context: there is no documentation service and no language server on Prior, so an API you cannot verify in the source is named as unverified, never assumed from memory.

