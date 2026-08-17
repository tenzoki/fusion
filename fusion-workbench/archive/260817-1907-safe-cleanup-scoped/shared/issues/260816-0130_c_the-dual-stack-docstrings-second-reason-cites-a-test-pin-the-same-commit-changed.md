The DualStackServer docstring's second reason cites a test pin the same commit changed to the opposite string

---
`bin/monitor:1310-1313` explains why the file prints `localhost` rather than `127.0.0.1`, and gives as its second reason that `hooks/lib/__tests__/monitor-warnings-panel.test.ts` "pins the launched URL to `http://localhost:${port}`", so binding both families "leaves the pin correct." At `3a0408a` that test pins `http://127.0.0.1:${port}` (`monitor-warnings-panel.test.ts:906-908`). The pin was changed by `a19c867`, the same commit that left the docstring standing. The paragraph's first sentence is false in the same direction: it says printing `127.0.0.1` "is not the one taken", and the file now takes exactly that on every path where the dual-stack bind did not happen.

---

**Verified, not inferred.** Read at `3a0408a` in a detached worktree:

- `bin/monitor:1307-1313` — *"Printing `127.0.0.1` instead would also close that gap, and it is the smaller edit. It is not the one taken, for two reasons. The URL is the thing a user copies, pastes and bookmarks, and `localhost` is what belongs in it. And `hooks/lib/__tests__/monitor-warnings-panel.test.ts` pins the launched URL to `http://localhost:${port}` — so the spelling change moves a defect out of this file and into a test's expectations, while binding both families makes the existing spelling true and leaves the pin correct."*
- `hooks/lib/__tests__/monitor-warnings-panel.test.ts:906-908` — `expect(readFileSync(marker, "utf8").trim()).toBe(\`http://127.0.0.1:${port}\`);`
- `bin/monitor:1395-1400` — the `local_host` block: `localhost` only when `dual_stack`, `127.0.0.1` on the OSError fallback and on both loopback spellings.

So the file now does, on three of its four bind paths, the thing this paragraph says was rejected — and the test that was cited as an argument against doing it was rewritten by the same change to assert it.

**Why this is worth a queue entry rather than a shrug.** The paragraph is a design rationale in a docstring a reader opens precisely when deciding whether to simplify the dual-stack bind away. Both of its two reasons are now wrong about the state of the tree, and the second one is checkable in ten seconds and will read as evidence that the reviewer of this area is not tracking the file. The *decision* it defends is still right — the wildcard should stay dual-stack, because that is what makes `localhost` true for the default bind — so the fix is a rewrite of the reasons, not a revisit of the choice.

**Fix direction.** Rewrite the two-reason paragraph to state what the file actually does: the wildcard binds dual-stack so the name it prints is true there, and every other path prints the address it bound. Drop the appeal to the test pin, or restate it as what the pin now is — `127.0.0.1` for the harness's loopback-pinned cases (`monitor-warnings-panel.test.ts:906`), `localhost` for the wildcard case (`monitor-warnings-panel.test.ts:1052-1069`), which together are the assertion that the printed name follows the socket.

**Related.** Closes nothing; `260815-2325_c_*` (the IPv4 fallback reinstates the defect) was closed by `a19c867` and the behaviour half of it did land correctly — this is the prose the same commit left behind.

**Found by:** coderev, reviewing `f4f01b0..3a0408a`.

---

**Resolved:** the two-reason paragraph in `DualStackServer`'s docstring (`bin/monitor`) is rewritten to describe the tree as it stands. Both false claims are gone:

- The paragraph no longer says printing `127.0.0.1` "is not the one taken". It says the file prints `127.0.0.1` on every non-wildcard path — the OSError fallback and an explicit loopback bind — and points at the `local_host` block as the place that choice is made.
- The test pin is restated as what it now is, both halves: `http://127.0.0.1:${port}` for the loopback-bound cases (`monitor-warnings-panel.test.ts:906`) and `http://localhost:${port}` answering on both families for the default wildcard (`:1052`). Read together the pins assert that the printed name follows the socket, which is the claim the docstring now makes.

The reasoning the record marked as still true is kept and is now the whole argument: `localhost` is the string a user bookmarks, so on the bind nobody asked for — the wildcard — making the name true beats routing around it. The decision to keep the wildcard dual-stack is unchanged.
