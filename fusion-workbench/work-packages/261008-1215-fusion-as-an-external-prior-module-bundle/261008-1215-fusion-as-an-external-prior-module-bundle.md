# Fusion as an external Prior module: bundle, role catalog, explorer and repair workflows

---
**Domain:** code
**Cross-references:** 260928-1338-json-control-data-and-markdown-artefacts.md, 260927-2304-fusion-dual-host-design-review.md

---

## Directive

Deliver what Prior asks of Fusion in `Prior: docs/design/fusion-prior-workflow-delivery-request.md` (at Prior `5609ff1`, 2026-10-04; restated in `Prior: docs/design/fusion-fj03d-prior-response.md` at `7da6690`), continuing FH03, FH04, FH05 and FH08 of `Prior: docs/design/fusion-dual-host-implementation-plan.md`. From one pinned Fusion source revision:

1. an extracted, independently runnable Prior module bundle: executable, module API v1 manifest, complete runtime assets and exact source and build identity, using the existing public contracts (`Prior: docs/design/prior-module-api-v1.md`, `Prior: docs/design/prior-installed-module-bundles.md`), with no execution pointing back into the Fusion checkout and no local Go `replace`;
2. the authored profile catalog and rendered Prior role assets, with explicit support states for the shared roles; the first executable slice needs the explorer, then implementer, reviewer and state-auditor for repair;
3. the bounded explorer workflow and the four-role repair contract: advertised capabilities, input and result schemas, expected host services, context composition and durable operation identities, keeping Fusion's domain control apart from Prior's runtime, approval and accounting evidence; workbench access composed with the module API's 1 MiB frame through bounded requests or a specified handle, not by widening the transport;
4. the unchanged standalone Claude Code distribution from the same revision, with no Prior runtime or installation dependency.

Reached when Prior runs a real external explorer, then a complete reviewed repair with a restart and with old runs still readable, from the delivered bundle; an embedded fallback or a synthetic module labelled as Fusion does not count. The codec contract (requests 59 and 60) stays closed. Filed on the user's word of 2026-10-08 in chat; planned in a session of its own, after the user has tested 13.0.0 with Claude and Prior.


## Closure

Done on 2026-10-14, outcome completed. Commits af14b7bc..edaf7f18 (with the help-topic follow-up 60141589). Released as fusion v13.1.0, tag at C c8d5a6f1; the bundle digest sha256:56ac4c576833152b740e5304af88649a9a4f063289ec799a7bacecdc0770cd94 accepted by Prior at f0b57b6 on macOS arm64 (request 70), rebuilt identically from the tag (step 24); marketplace entry 13.1.0 at tenzoki/claude-plugins 3b7acee. Linux targets built, not qualified. All plan stop clauses hold, confirmed by the user. Closing review `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md` over 9ac8222c..60141589, verdict revise: twelve issues and one decision in this container for follow-on work, four of them carried 13.0.0 work; its Not-opened list is in its head. Still open here: the step-20 issue on the untracked hooks/package-lock.json.
