Those three are the whole switch set. There is no switch for resuming, and on Prior no resuming either: no session spans entry runs, so one run carries a discussion from `--begin` to its stop, and a question that ends a turn resumes this same run with the reply.

**One discussion is open per run**, and it is the one this run began — the path you held at Step 4. **Do not scan the store to find one.** A record another run left open is not this run's to take up; that is a new discussion citing the old one. So `--infer` or `--close` started as an entry run of its own finds none open (request 76, question 2).

- `--begin` while one is open: one `host.question.v1` call naming the open discussion's topic, with two options — close that one first and begin the new one, or keep it and begin nothing. Wait for the answer. Never begin a second silently, because two open discussions make `--infer` and `--close` ambiguous with no argument to disambiguate them.
