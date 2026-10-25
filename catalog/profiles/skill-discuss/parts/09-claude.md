Those three are the whole switch set. There is no switch for resuming: within one session you carry the thread across operational interruptions yourself.

**One discussion is open per session**, and it is the one this session began — the path you held at Step 4. **Do not scan the store to find one.** A record another session left open is not this session's to take up; that is a new discussion citing the old one.

- `--begin` while one is open: one `AskUserQuestion` naming the open discussion's topic, with two options — close that one first and begin the new one, or keep it and begin nothing. Wait for the answer. Never begin a second silently, because two open discussions make `--infer` and `--close` ambiguous with no argument to disambiguate them.
