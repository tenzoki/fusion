# Which process boundary and shipped form does the codec take: one committed Node bundle both hosts spawn, a prebuilt executable per platform, or a Go codec?

---
**Domain:** code
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260928-1341_*_plan-fj00-schemas-dto-mapping-and-reference-status-contract.md, 260928-1341_*_does-the-json-codec-live-in-its-own-package-or-under-hooks.md, 260816-0719_*_should-anything-assert-that-the-committed-hooks-dist-is-the-compilation-of-the-committed-source.md

---

## Question

Prior's `concept/fusion-json-workbench-spec.md` section 6 says the codec and the record transitions have one implementation, that both hosts bind to it, that no second parser exists to avoid the port, that Prior's core takes no Node requirement and the Claude user no Go build, and that the choice is checked at the Prior port before implementation: "entweder nutzt Prior denselben begrenzten externen Codec-Prozess oder beide Hosts ein vorgebautes gemeinsames Codec-Binary". FJ00 landed the implementation in TypeScript under `codec/` with `ajv` as a devDependency; FJ01 has to turn it into something a Claude install runs from the tarball with no `npm install`, and something Prior's Fusion module can spawn over stdin and stdout, which is the process shape `internal/module/process.go` already uses for module executables (pipes, a digest check on the executable, a restricted environment).

## Options

1. **One committed, self-contained JavaScript bundle, spawned by both hosts** — `codec/dist/fusion-record.js`, built by esbuild from `codec/src/cli/main.ts` with ajv, the six schemas and the three contract tables inlined; `bin/fusion-record` execs `node` on it, exactly as the ten node-backed helpers exec `hooks/dist/*.js`; Prior's Fusion module spawns `node <bundle>` as an external process over stdin/stdout JSON, with Prior's digest taken over the bundle file. Committed like `hooks/dist/`, with a codec-side gate that the bundle is the build of the committed source.
   - Pros: Node 20 is already fusion's hook prerequisite, so no new requirement on the Claude side; one implementation, the one FJ00's 522 tests cover; the install stays a tarball copy; Prior's core stays Node-free, since only its Fusion module spawns the process, which is what the spec's first alternative names.
   - Cons: Prior users need `node` on `PATH` wherever the Fusion module runs; a bundle in git is a 300 KB-class generated file per release; esbuild joins the devDependencies.
2. **A prebuilt executable per platform** — the same bundle compiled to a single binary (Node single-executable application, or bun compile), one per OS and architecture, committed or fetched at install.
   - Pros: no Node requirement on either host; Prior's executable digest is the natural fit.
   - Cons: several tens of megabytes per platform in git or a download step the installer does not have today; the "no build at install" property now depends on a per-platform asset list; reproducibility of the binary is weaker than of a JS bundle.
3. **The codec in Go, shipped as a binary to Claude users** — Prior links it, Claude runs the binary.
   - Pros: no process boundary on the Prior side.
   - Cons: a second implementation of a contract FJ00 already proved in TypeScript, which the spec forbids; a Go build or a per-platform binary reaches the Claude user, which it also forbids.

## Constraints

- Spec section 6: one implementation; no Node in Prior's core; no Go build for the Claude user; the chosen variant reads and changes a record early on both hosts.
- `install.sh`: the tarball runs with no build step; compiled artefacts are committed and self-contained (`README-agents.md` `## Releasing`).
- `internal/module/process.go`: a module executable is spawned with stdin/stdout pipes and its digest is checked before start.

## Recommendation

Option 1, with the stdin/stdout JSON protocol fixed so that option 2 stays a packaging change if a Node-free Prior host is ever required: the same bundle compiles to a single executable without touching the protocol. The Prior side is asked in FJ01 to confirm that its Fusion module may spawn `node` and that the digest over the bundle satisfies its identity check.
