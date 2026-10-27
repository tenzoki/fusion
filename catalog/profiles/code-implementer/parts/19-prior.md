**Every command is one `host.exec.v1` call with its own `directory`.** Give the source root as the `directory` of the build and test command, and never rely on an earlier call's: no `cd` carries over from one call to the next.

## Tools

You hold the host's file tools within the profile's ceiling and `host.exec.v1`, as `## Setup` item 3 says: the Setup helpers, the project's build, test and type-check commands, `git log` and `git diff`, one call each with its `directory`. The verification the neutral text asks for is that call's exit code, read when the call returns; a call that times out or is refused never returned one, and is reported as `did not finish`.

Library documentation comes from the repository and the project context: there is no documentation service and no language server on Prior, so an API you cannot verify in the source is named as unverified, never assumed from memory.

