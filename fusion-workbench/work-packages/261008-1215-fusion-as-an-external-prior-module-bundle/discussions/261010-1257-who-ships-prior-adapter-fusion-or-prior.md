# Who ships the Go adapter that runs fusion under Prior: fusion or Prior?

---
**Domain:** code
**Partners:** orchestrator and consultant
**Rounds:** 2
**Ceiling:** 8
**Outcome:** did not converge after 2 rounds (closed by the user; both undecidable claims wait on inputs only Prior holds)
**Cross-references:** 261008-1215-fusion-as-an-external-prior-module-bundle.md, 261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md, 261010-1235-in-which-language-is-the-prior-module-executable-built-and-how-does-it-consume-priors-module-api.md, 261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md

---

## Question

Two architectures are on the table for running fusion's roles and workflows under Prior. **A:** fusion ships an executable Prior module bundle, a Go adapter under `adapters/prior/` built against Prior's `moduleapi/v1`, beside the host-neutral catalog. **B:** fusion stays free of any Go or Prior dependency and ships only data (role texts, declarative workflow definitions, schemas, conformance tests); Prior authors, builds and versions the adapter that executes them. The user raised it on 2026-10-10 while ruling decision `261010-1235-in-which-language-is-the-prior-module-executable-built-and-how-does-it-consume-priors-module-api.md` ("der Bau im Prior Paket / Prior checkout"), and asked which side should deliver the adapter. That decision stays open until this is settled.

## What held up

### C1 — The Directive's item 1 requires fusion to deliver an executable, independently runnable Prior module bundle, a requirement that originates in Prior's own delivery request; B changes the Directive and needs Prior's agreement.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** narrative `## Directive` item 1; Prior `167c605:docs/design/fusion-prior-workflow-delivery-request.md` (committed): the bundle request, and "Fusion owns authored workflow/profile behavior and its adapter".

### C2 — The 2026-10-09 ruling makes fusion the owner of workflow rules; under B that ownership survives only if workflows are declarative data Prior's adapter interprets, with fusion-shipped conformance tests Prior must pass.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `261009-1024-fusion-is-the-one-source-of-role-texts-and-workflow-rules-for-both-hosts.md` `## What it binds` (fusion authors every workflow: steps, hand-overs, completion conditions); the B condition is derived, not stated, and the consultant judged it sound.

### C3 — Under A, fusion consumes Prior's `moduleapi/v1` at source level, Prior's Go module path is not fetchable and a local `replace` is forbidden, so A forces a vendored copy or a build inside a Prior checkout.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** Prior `167c605:go.mod` (`github.com/kai/prior`, only remote a `file://` URL); `git ls-remote https://github.com/kai/prior` "Repository not found" and the Go proxy 404, both taken 2026-10-10; delivery request forbids `replace`; `prior-module-api-v1.md` "Consumers must pin a Prior source revision until a released API bundle exists".

### C4 — Under either option the standalone Claude Code distribution is unaffected, because `install.sh` does not install the adapter.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `install.sh` copy allowlist names no `adapters/` or `catalog/`. Inference (consultant): a marketplace clone would carry the Go source as inert files, adding no runtime dependency.

### C5 — Prior's own dual-host plan assigns the adapter and the executable module to fusion.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** in substance by committed sources: delivery request (fusion owns "its adapter") and `167c605:docs/design/prior-installed-module-bundles.md` ("Fusion still needs to deliver its actual Prior executable"). The dual-host plan itself (§3.3, §3.4, FH05, FH08) says the same but is untracked at `167c605`.

### C10 — The approved plan already makes the adapter an interpreter of fusion's declarative workflow definitions, so C2's precondition for B is already part of A; A and B differ in who writes, builds and releases the Go interpreter and whose revision the bundle identity names.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `261010-1235-plan-fusion-prior-module-bundle-explorer-then-four-role-repair.md` `## Approach`.

### C11 — The plan still names a vendored `moduleapi/v1` copy (approach, step 7–8 files, `build-identity.json`), which the build-in-a-Prior-checkout preference the user voiced would replace; steps 7–8 need revising whichever option wins.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** plan `## Approach` and steps 7–8. The consultant read an amended answer in the language decision's working tree; that answer was written by mistake after the user stopped it and was reverted to the committed open state on 2026-10-10, so the preference stands only as the user's chat words.

### C12 — No publisher signing exists; Prior's host is the trust authority under both options, comparing an expected sha256 inventory identity; under A with a build in a Prior checkout the build identity must record two source revisions.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `167c605:docs/design/prior-installed-module-bundles.md` `## Host integration` steps 1–2 ("A digest alone never confers trust"), `## Inventory and persistence`. The two-revision point is inference.

### C13 — B opens no non-Go route: whoever writes the adapter writes it in Go until Prior publishes cross-language vectors.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `167c605:docs/design/prior-module-api-v1.md` `## Authentication`.

### C14 — Prior's own external-module tests needed a test-only local `replace`, and no shipped bundle may depend on it; the `replace` problem is not fusion-specific and disappears under B only because Prior builds inside its own module.

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `167c605:docs/design/prior-module-api-v1.md` `## Evidence and remaining work`; the last clause is inference.

### C16 — Under A the build is cheap (pure Go, `CGO_ENABLED=0`, cross-compiled on one machine); the real cost is delivery: per-platform builds and identities per release, and a new fusion build whenever Prior adds a target.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** pure-Go cross-compile checks in `167c605:docs/decisions/0002-sqlite-binding-evaluation.md`; the plan's step 8 produces one binary and one `platform` value and needs one build per target under A. The new-target clause is inference.

### C18 — Option C (a Node/TypeScript adapter shipped by fusion) is blocked at `167c605` by two Prior-side preconditions: no cross-language handshake vectors, and a module process receives no `PATH` and the manifest cannot declare an interpreter.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `prior-module-api-v1.md` `## Authentication` (vectors before a non-Go binding; byte-exact Go JSON); `internal/module/bundle.go` and `internal/module/process.go` pass only `PRIOR_MODULE_IDENTITY` and `PRIOR_MODULE_CONNECTION_SECRET`, no `PATH`, no args ("no ambient environment is copied"); `moduleapi/v1/manifest.go` `type Manifest` has one `executable` string and no runtime field, and `Decode` rejects unknown fields.

### C20 — fusion already requires Node wherever its Claude distribution runs, so C adds no new toolchain to fusion.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `bin/fusion-paths` and `bin/fusion-write` run `node`; codec and hooks declare Node `>=20.12.0`. Nuance: C needs Node on the machine running Prior, which may differ; the `install.sh` warning that agents work without Node is out of date.

### C21 — A Node adapter does not remove per-platform bundles: the bundle must carry complete runtime assets and its identity hashes every payload file, so Node itself would have to travel inside it, per platform and far larger than a Go binary.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** delivery request ("complete runtime assets"); `prior-installed-module-bundles.md` `## Inventory and persistence`; built on C18. A shebang to a host `node` would leave the interpreter outside the hashed identity.

### C22 — Prior's bundle contract names neither per-platform nor multi-platform bundles: no platform field in `Manifest` and no platform rule in the bundles document.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `moduleapi/v1/manifest.go` `type Manifest`; `167c605:docs/design/prior-installed-module-bundles.md`.

### C23 — Prior already runs a pinned external Node with recorded path and SHA-256 and an empty environment, but only for the codec, not for modules; the narrowest change enabling C is letting the bundle manager pin a host interpreter the same way, a Prior contract change.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** `167c605:internal/fusionhost/codec_process.go`; `prior fusion prepare --node` in `prior-fusion-workbench-service.md`.

### C24 — C carries two preconditions, both Prior-side work (handshake vectors, an interpreter pin); without them C reduces to A plus a bundled Node runtime, strictly more to ship than a Go binary.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** C18, C21, C23.

## What fell

### C6 — Under B a Prior module API change no longer forces a fusion release; under A every such change does.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** consumers pin a Prior revision (`prior-module-api-v1.md`), and "Exact old pins remain usable after deactivation/upgrade" (`prior-installed-module-bundles.md` `## Host integration` step 4); under A a Prior change forces a release only when the pin moves, a capability is needed or the old revision loses support. Under B a change to capabilities or schemas the workflow data declares still reaches fusion.
- **Conceded:** first partner, round 1 — the two pin citations above.

### C7 — Prior already embeds a Go `fusion` module 1.8.0, so B only replaces that module's content source.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** `167c605:modules/fusion/manifest.json` is 1.8.0 with 9 workflows, but the logic is Go across about ten packages importing `github.com/kai/prior/internal/module`, and `cmd/fusion/main.go` speaks the old `internal/ipc` token handshake, not the v1 authenticated one; B means a new external v1 interpreter.
- **Conceded:** first partner, round 1 — `cmd/fusion/main.go` and the `internal/module` imports.

### C8 — The ruling's words "Prior stellt die Ausführung bereit" do not by themselves decide which side writes the adapter.

- **Advanced by:** first partner
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** the same ruling continues "Fusion liefert einen gemeinsamen Rollenkatalog samt ausführbarem Workflow; Prior ersetzt dafür seine eingebetteten Fusion-Definitionen", which gives delivery of the executable workflow to fusion; B fits only if "ausführbar" means data Prior interprets, which only the user can say.
- **Conceded:** first partner, round 1 — the continuation of the ruling quoted above.

### C15 — Under A fusion must ship four native binaries (darwin/linux × arm64/amd64), each a separate bundle identity Prior verifies.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** Prior V1 targets macOS and Linux (`167c605:concept/architecture.md`), but the initial targets are three: macOS arm64 and Ubuntu 24.04 amd64/arm64 (`167c605:concept/implementation-plan.md`, Q-PLATFORM); and one identity per binary follows only if each bundle holds one binary, which the contract does not force (C22).
- **Conceded:** first partner, round 2 — Q-PLATFORM's three targets and C22.

### C17 — Under B Prior's existing platform release matrix builds the adapter alongside Prior's binaries.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** the final V1 release matrix is an open item (`concept/implementation-plan.md`; decisions 0011 and 0012); no CI or build pipeline exists at `167c605`. Inference (consultant): Prior must build `cmd/prior` per target anyway, so one more Go binary would cost it little, in a pipeline that does not exist yet.
- **Conceded:** first partner, round 2 — no pipeline at `167c605`.

### C19 — Option C lets the adapter call fusion's TypeScript codec directly, whereas a Go adapter needs a Go codec port or Prior's workbench service.

- **Advanced by:** first partner
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** "Fusion control records and narratives have exactly one writer: that codec" and no competing writer (`prior-fusion-workbench-service.md`, 2026-10-09 update; bundles doc `## Remaining integration`); Prior owns workbench authorization (delivery request), so an in-process codec call would bypass it. Under A, B and C the adapter reaches the workbench through Prior's host services, as the plan already states (step 13, G8).
- **Conceded:** first partner, round 2 — the single-writer and authorization citations.

## What could not be decided

### C9 — An interpreter Prior writes and builds, running fusion's data, passes the acceptance test that excludes "an embedded fallback or a synthetic module relabelled as Fusion".

- **Advanced by:** consultant
- **Entered:** round 1
- **Last moved:** round 1
- **Evidence:** missing input: Prior's written reading of its acceptance clause (delivery request; Directive), e.g. as an answer to request 67; and the user's reading of "ausführbarer Workflow" (C8).

### C25 — One bundle could hold all target Go binaries behind a POSIX `sh` launcher as the manifest's executable, giving one identity across platforms.

- **Advanced by:** consultant
- **Entered:** round 2
- **Last moved:** round 2
- **Evidence:** missing input: Prior's reading of whether such a launcher is admissible, since the executable digest Prior checks would belong to the launcher and the launcher must run without `PATH`. A POSIX shell is a stated Fusion prerequisite (`concept/architecture.md`).

## Recommendation

This recommendation binds nothing; decision `261010-1235-in-which-language-is-the-prior-module-executable-built-and-how-does-it-consume-priors-module-api.md` stays open and is the user's to rule.

At Prior `167c605`, option A (fusion ships a Go adapter bundle) is the only route that needs no prior Prior-side work: it matches Prior's committed delivery request and the user's ruling of 2026-10-09 (C1, C5, C8), it costs fusion three cross-compiled pure-Go binaries rather than four (C15, C16), and the workbench is reached through Prior's host services under every option (C19). Option C (Node) does not remove per-platform delivery and needs two Prior contract changes (C18, C21, C23, C24). Option B has no Prior build pipeline to land in yet (C17) and its acceptance as "real Fusion" is open (C9).

Recommended, qualified: A, provided Prior answers two questions in writing before the plan's slice B is built: (1) whether one bundle carrying the target binaries behind a POSIX `sh` launcher is admissible, or each platform is its own bundle (C25, C22); (2) whether Prior would accept an interpreter it writes and builds, running fusion's data, as the real external Fusion module (C9). Either answer can move the recommendation: a yes to (2) together with a Prior build pipeline reopens B, and a Prior interpreter pin for module processes reopens C.
