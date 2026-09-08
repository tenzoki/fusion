The read mark advances over entries that failed to render

---

`skills/news/SKILL.md` Step 5 runs `fusion-forum seen "$HEAD"` unconditionally after Step 4, and `$HEAD` covers **every** entry the delta listed. Step 4 carries no branch for `fusion-forum show` exiting 1 — the documented failure at `bin/fusion-forum:76`. An entry that could not be read is marked seen and is never listed again.

---

**Filed by:** coderev, Kai Stalmann <ks@qantr.com>

The skill states the marking-on-render cost deliberately and twice (`skills/news/SKILL.md:14`, `skills/news/SKILL.md:110`): a message seen and abandoned does not come back, and the file stays in the store. That argument rests on the message having been *shown*. It does not carry to one that was not.

The whole point of pinning `show` to `head=` is that "a concurrent fetch between the two calls cannot change what is shown" (`bin/fusion-forum:38-41`), so a `show` failure at that commit is not a race — it is a real fault (a corrupt object, a path the listing produced and the blob read cannot). Whatever the cause, the current body swallows it: Step 4 gives no instruction, so the run continues into Step 5.

`hooks/lib/__tests__/fusion-forum.test.ts:218` covers the helper's exit 1. Nothing covers the reader's response to it.

**Acceptance test:** `skills/news/SKILL.md` Step 4 says what to do when `show` exits 1, and Step 5 either does not advance past an entry that failed to render or states in one sentence that it does and why that is acceptable.
