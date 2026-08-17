# Should anything assert that the committed `hooks/dist` is the compilation of the committed source?

---
**Domain:** code
**Status:** answered
**Filed by:** reconciler
**Cross-references:** `shared/issues/260816-0709_c_the-review-coverage-fix-ships-only-as-typescript-because-no-commit-since-f45f76a-carries-hooks-dist.md` (fix-direction item 2, carried out of that record so it does not close inside it); `hooks/scripts/run-tests.mjs`; `hooks/scripts/build.mjs`; `CLAUDE.md` `### HTTPS installer`

---

## Question

`hooks/dist/*.js` is the artifact the installer ships. `CLAUDE.md` states the invariant — *"Compiled
hooks must be committed"* — and nothing enforces it. Between `f45f76a` and `71e97f4` the committed
`hooks/dist` was the compilation of an older source, and every release path in that window would have
shipped a fix that was closed in the repository and absent from the tarball. It was caught by a
reconciliation pass and a review, both after the fact and both by accident of what they happened to
grep.

`npm test` compiles — `hooks/scripts/run-tests.mjs:2` — but into a staging tree, deliberately, so
that concurrent runs in one checkout do not share build output. So a green suite says nothing about
whether the committed artifact matches the committed source, and by design it never will.

## Options

1. **Nothing. The invariant stays a sentence in `CLAUDE.md`.**
   - Pros: no new mechanism. The window was one session long and two independent passes found it.
   - Cons: both passes found it by accident. The failure is silent, survives a green suite, and its
     blast radius is every consuming project rather than this repository — which is the one property
     that distinguishes it from the documentation defects this project fixes routinely.
2. **A test that compiles the committed source and compares byte-for-byte with committed `dist`.**
   - Pros: decides the question rather than approximating it. Fails loudly, in the suite, at the
     commit that opened the gap.
   - Cons: it must compile inside the test run, which is a different and slower shape from the four
     existing bounds. And byte-identity depends on the compiler version, so the gate would fail on a
     `typescript` bump for a reason that is not a defect — the assertion has to be over emitted
     semantics or over a pinned toolchain, and neither is free.
3. **A pre-commit or release-step check rather than a test.** Add it to the release process in
   `CLAUDE.md` step 0, beside `claude plugin validate .`.
   - Pros: fires exactly where it matters — the only moment the staleness can reach a user is a
     release — and costs nothing on every other commit.
   - Cons: a release-step check is a written obligation, and this project has measured what those are
     worth: the four version surfaces drifted for months under exactly such a step. It also leaves
     every intermediate commit shipping a stale artifact to anyone installing from `heads/main`,
     which `install.sh` does by default.

## Constraints

- Whatever is chosen must not make `hooks/dist` a merge-conflict surface on every branch; it already
  is one, and a check that forces a rebuild per commit makes it worse.
- It must survive concurrent suite runs in one checkout. That constraint is why the build stages
  rather than writing `hooks/dist` directly (`hooks/scripts/build.mjs`), and any gate that reads the
  shared tree during a run reintroduces the problem that design solved.
- Option 2 must not assert byte-identity against an unpinned compiler, or the first `typescript`
  upgrade reddens the suite for no defect.

## Recommendation

None from the filing agent, and deliberately: the choice turns on whether the default install path is
`heads/main` or a tag, which is a release-policy fact rather than a technical one. If most users
install from `heads/main`, option 3 is insufficient by construction and the question is between 1 and
2. `install.sh` defaults to `heads/main` today, which argues against 3 — but "today" is one line in a
script and the policy behind it is not written down anywhere, so it should be settled before the gate
is chosen rather than inferred from a default.

---
Answered: shared/history/260816-1500-orchestrator-session.md `## Decisions answered by the user` — option 2: a test that compiles the committed source and compares with committed dist; requires a pinned toolchain and must not read the shared tree during a run. Install-path policy settled as heads/main, which eliminated option 3. User answered inline 2026-08-16.
Implemented:
Deferred:
Superseded by:
Retired:

---
**Reconciliation 260817-1836** (reconciler, domain `code`, HEAD `2552586`). Answer recorded, not yet realised — marker stays `_a_`. No such test exists. `hooks/lib/__tests__/` holds 37 entries at HEAD and none compiles the committed source for comparison against the committed `dist`. The pinned-toolchain and no-shared-tree conditions the answer attached to it are therefore also unbuilt.
