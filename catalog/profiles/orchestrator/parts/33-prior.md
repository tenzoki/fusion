- **No dispatch tells the executor to commit on Prior.** A child run's work stays in the workspace it shares with this run, and the host integrates the whole workspace once, when this run ends; a dispatch that would tell the executor to commit under the lock tells it instead that it does not commit (request 77, question 5).

**A dispatch is never backgrounded on Prior.** The `host.dispatch.v1` call returns when the child run ends, so there is no launch line to say, no ETA and no monitor; while it runs, nothing else in this run proceeds.
