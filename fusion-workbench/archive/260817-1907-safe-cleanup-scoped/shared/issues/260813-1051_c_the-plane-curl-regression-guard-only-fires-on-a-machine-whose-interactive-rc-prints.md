# The `plane_curl` regression guard only fires on a machine whose interactive rc prints

---

**Severity:** Medium — the defect that killed the whole Plane bridge is now fixed with no test that reproduces its trigger; on a quiet rc the suite is green either way.
**Domain:** code
**Filed by:** coderev, reviewing `7342fdd` (`shared/reviews/260813-1051-coderev-plane-curl-response-via-temp-file.md`)
**Affects:** `hooks/lib/__tests__/fusion-plane.test.ts:1494` (the `describe` block), `:1603-1620` (`runLive`)
**Cross-references:** `shared/issues/260813-0828_c_three-tests-fail-at-head-in-two-files-and-no-open-record-names-them.md` (records the environment dependency explicitly)

---

## The gap

The two live-rebuild cases are genuine end-to-end coverage — `fusion-plane.test.ts:1489-1491`
states that nothing is stubbed and `plane_curl`'s whole chain runs, `zsh -ic` included. That is
why they caught this defect at all.

But they caught it *because this developer's Terminal writes a session-restore line*. The
resolution record proves the dependency from the other side: `SHELL_SESSION_DID_INIT=1 npx
vitest run … -t "the live rebuild"` was **green at the broken HEAD**, because that variable
suppresses the banner. A CI runner, a container, or any operator with a quiet `~/.zshrc` gets
the same green from the same broken code.

So the fix has landed with no test that would fail if it were reverted on such a machine — for
a defect the record itself describes as "the Plane bridge was dead for any operator whose rc
prints anything".

## Why it is cheap to close

`runLive` (`:1603-1620`) already constructs the child environment:

```ts
const child = spawn(fusionPlane, args, {
  env: { ...process.env, FUSION_PLANE_WORKBENCH: workbench, PLANE_API_KEY: "mock-key-not-a-secret" },
});
```

Adding `ZDOTDIR` pointing at a fixture directory whose `.zshrc` prints a banner makes the noise
deterministic and machine-independent — `zsh -i` reads `$ZDOTDIR/.zshrc`, so the fixture
replaces whatever the developer has. One such case ("the operator's rc greets them and the
rebuild still parses") pins the whole design decision: it fails against the pre-`7342fdd`
stdout read and passes against the temp-file read, on every machine.

A second fixture line — a `zshexit` hook — would pin the residual filed as
`260813-1051_o_the-http-code-is-still-read-from-the-noisy-channel-…`, and should be added with
whatever fix that issue receives, not before.

## Note on scope

This is a coverage finding, not a defect in `7342fdd`'s change. The change is correct; what is
missing is the test that keeps it correct.

---
Resolved: moot, not fixed. Both cited ranges are inside `hooks/lib/__tests__/fusion-plane.test.ts`, deleted in `d0ddabb`, so the guard this record asked for cannot be added. Verified at HEAD `9306f0a` by the reconciliation pass of 260815-1913.
