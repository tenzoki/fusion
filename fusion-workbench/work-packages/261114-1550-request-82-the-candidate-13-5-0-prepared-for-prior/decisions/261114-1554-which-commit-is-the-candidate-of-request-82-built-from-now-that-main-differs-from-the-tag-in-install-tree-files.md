# Which commit is the candidate of request 82 built from, now that `main` differs from the tag `v13.5.0` in install-tree files and a Go change is ruled to follow?

---
**Domain:** code
**Filed by:** implementation-planner, Kai Stalmann <ks@qantr.com>
**Cross-references:** 261114-1550-request-82-the-candidate-13-5-0-prepared-for-prior.md, 261113-1320-does-the-tag-v13-4-4-stand-as-covered-by-priors-accepted-answer-to-request-79-given-two-days-after-it.md, 261105-1023-does-entry-v3-keep-or-drop-the-c-and-r-name-status-branch.md, 261105-1023-does-the-deferred-fetch-item-hold-a-later-tag.md

---

## Question

The user ruled that the bundle of request 82 is built from the tag `v13.5.0` and not from `HEAD`, on the statement that nothing shipped differs between the two, and asked for that statement to be measured. The measurement does not confirm it. The brief says that in this case the plan stops and the question goes to the user, so no plan was written. A second ruling of the same brief meets the same point from the other side: the Go copy's fourth control-file name lands on `main` after Prior's pin commit, and that change alters the module binaries a bundle carries. Both facts ask one thing: which commit the candidate is built from, and what request 82 then says about `main`.

**Measured on 2026-11-14 at fusion `c124027a`**, read-only:

- `git diff --name-only v13.5.0 HEAD` over the entries of `install.sh`'s copy loop (lines 85 to 86: `.claude-plugin agents skills rules hooks codec bin stilwerk templates docs README.md README-agents.md README-hooks.md LICENSE`) prints five paths, all under `codec/`: `codec/fixtures/prior/REQUESTS.md`, `codec/src/__tests__/install.test.ts`, `codec/src/__tests__/migration.test.ts`, `codec/vitest.config.mjs` and `codec/vitest.workspace.mjs`. `git diff --numstat` prints `554 0`, `2 1`, `4 0`, `5 2` and `34 0` for them; the last is new and absent at the tag. The four that are not the request log came with `e72f04b4` and `c4cb3a48`, both 2026-11-12, both `test(codec)`.
- The copy loop copies `codec` whole, and the bundle's install tree is every git-tracked file under the loop's entries (`README-agents.md` `### The Prior module bundle`, read). The delivered 13.4.4 tarball holds `codec/src/__tests__/install.test.ts`, `codec/src/__tests__/migration.test.ts`, `codec/vitest.config.mjs` and `codec/fixtures/prior/REQUESTS.md` (`tar -tf`), and request 79 itself lists `codec/src/__tests__/install.test.ts` among the install-tree paths that moved. The request log uses "shipped" for exactly these paths (`### Request 79, overtaken in four statements, and a fifth that ended with the tag`, statement 5).
- So a bundle built at the tag and one built at `HEAD` differ in five tarball entries, one of them an entry the tag does not have, and carry different digests. The request log is among the five in every build, as at 79.
- What is unchanged: `codec/dist/fusion-record.js` hashes to `36570a7c…` at `v13.5.0` and at `HEAD`; `git diff --stat v13.5.0 HEAD -- adapters` prints nothing; no path under `agents`, `skills`, `rules`, `hooks`, `bin`, `catalog` or `docs` differs. *Inference:* none of the four files is read by anything a Prior run starts, since they are test sources and test configuration; no run checked it.
- `adapters/prior/fusionmodule/internal/controlrecord/controlrecord.go`, `Select`, names three file names at the tag and at `HEAD`. `internal/entry/entry.go:546` calls it to choose the control records the entry workflow reads, so the function is compiled into `bin/<target>/fusion-module`. `adapters/` is not on the copy loop, and its sources reach the bundle only as those binaries. A bundle built from the tag therefore carries three names whatever `main` holds later.
- `catalog/catalog.json` at the tag gives the `campaign` entry `support.prior` `unsupported`, and `catalog/profiles/orchestrator/parts/59-prior.md` says `bin/fusion-campaign sync` does not run on Prior. Whether any entry Prior supports changes a `campaign.json` in a hosted run was not traced.
- No bundle of version 13.5.0 has been built or delivered: `ls ~/.local/share/prior/incoming/fusion/` lists `13.0.0`, `13.1.0`, `13.4.0`, `13.4.1`, `13.4.2` and `13.4.4`.

**What the request log says about commits to shipped files after a candidate.** Request 79, `### What fusion does with the answer`: "until a tag, `main` takes no commit to a shipped file after D other than this file. A commit that must land first moves the candidate to a new patch version". Its clause **Corrected** takes the same route for any change that moves the digest. Request 81, same heading: "The next candidate carrying this codec is built on `main` after the tag and after the branch reaches it". Neither text has a sentence for a candidate built from a tag that `main` has already left.

## Options

1. **The tag, as ruled, and request 82 states the difference.** The bundle is the tree of `v13.5.0` (`60639346`). Request 82 names the four files in which `main` differs from the candidate, says they are test sources and test configuration, and says that the bundle's module selects three control-file names while `main` selects four from the commit that carries the Go change.
   - Pros: the bundle and every figure of the request can be built and measured now, before Prior's pin commit; the user's ruling stands as given; the candidate is reproducible from a pushed tag.
   - Cons: `main` differs from the candidate in install-tree files from the first day, so the rule request 79 set for D cannot be restated for 82 and the request needs a rule of its own; Prior's host carries four names from its pin commit and the candidate's module three, in a request that puts the campaign first; if Prior asks for the fourth name in the module, that is a new patch version and a second request.

2. **A new patch version, built after the Go change.** After Prior's pin commit the Go copy takes the fourth name, the version moves to 13.5.1, and the bundle is built from that commit. Request 82 is then the candidate 13.5.1.
   - Pros: the candidate equals `main` in every install-tree file and in the module's rule; this is the route request 79 names for a commit that must land first.
   - Cons: it replaces the ruling "from the tag `v13.5.0`"; no digest-bearing part of the request can be prepared before the pin commit, only its text and the measurements that do not depend on the bundle; it adds the release steps of a version (the catalog suite, `plugin.json`, the pin examples) and puts the tag and marketplace question to the user again.

3. **The tag, and the Go change waits for Prior's answer to 82.** As option 1 for the bundle. The fourth name does not land on `main` in this item; it lands with the next candidate, after the answer.
   - Pros: `main`'s module rule stays equal to the candidate's until the answer; the bundle is prepared now.
   - Cons: it replaces the ruling that the Go copy takes the name when the pin commit is passed, and fusion's copy then trails Prior's host by one candidate; the four test files still differ and are still stated.

4. **A commit of `main` under the version 13.5.0.** The bundle is built from the commit that carries the Go change, with `plugin.json` unchanged at `13.5.0`. Request 79's bundle was built this way, at D, before any tag existed.
   - Pros: the candidate equals `main`; no version bump.
   - Cons: it replaces the ruling "not from `HEAD`"; a bundle named 13.5.0 then differs from the tree the tag `v13.5.0` names, which already exists and is pushed; nothing digest-bearing is prepared before the pin commit.

## Constraints

- `codec/fixtures/prior/REQUESTS.md` is append-only, and a draft of request 82 does not enter it before it is filed.
- The bundle is built in a scratch clone or an archive of the chosen commit, never by checking it out in the live tree.
- A tag or a marketplace bump is put to the user before either is done (request 79, `### What fusion does with the answer`).
- Request 82 names Prior's pin commit, so it is filed after that commit under every option.
- Nothing is written in Prior's repository.
- Every figure request 82 states is measured on the bundle it names, so the option fixes which figures can be taken before the pin commit.

## Recommendation

We recommend no option over another. Options 1 and 2 differ in what the user wants Prior to test first, the tagged release as it stands or `main` with the module's rule brought level with Prior's host, and no measurement taken here decides that. Two points bear on the choice. Under option 1 the difference in the four files has no known effect on a Prior run, and that is an inference from their being tests. Under options 1 and 3 the question whether a three-name module is a defect on a four-name host is left to Prior's answer.

Answered: this record, option 1 — the candidate of request 82 is built from the tag `v13.5.0` as ruled, and request 82 states where `main` differs, the three-name module against the four-name host, and that `/fusion:campaign` cannot start in a Prior-hosted run of 13.5.0; on the recommendation of discussion `261114-1608-which-commit-request-82-candidate-built-from.md`; the user answered "1" in chat on 2026-11-14; ruled by user, Kai Stalmann <ks@qantr.com>

Implemented: the bundle built from `v13.5.0` and delivered (digest `sha256:2ba70dbeba8662212ef8312801da1c8103e90bfe42cf6a1ac8e34b71352ad643`), and `codec/fixtures/prior/REQUESTS.md` `## The candidate 13.5.0 (request 82)`, `### Where main differs from the candidate` at `f7c6f14e36044df130facc3ce6c8c8af6296b212` — the eight differing paths, the three-name module against four names from `2fe7baba` on, and `/fusion:campaign` not startable in a Prior-hosted run
