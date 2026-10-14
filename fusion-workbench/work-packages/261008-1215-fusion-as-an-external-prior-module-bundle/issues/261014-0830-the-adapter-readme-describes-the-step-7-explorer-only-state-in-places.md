The adapter README describes the step-7 explorer-only state in places
---
`adapters/prior/README.md` was written at plan step 7 and extended at step 18, and three passages still describe the explorer-only adapter. A reader takes the repair workflow as less covered or less supported than it is, and the header points to a host file that is the explorer's alone.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- `adapters/prior/README.md:10-14`: "The contract is Prior's answer to fusion's request 67 and its two follow-ups"; "The host side that calls this module is `Prior: internal/fusionhost/external_explorer.go`". Answer 69 is the repair contract (`fusionmodule/internal/repair/repair.go:6-8`).
- `adapters/prior/README.md:202-206`: "the four shipped schemas compiled and exercised"; "the catalog resolving the explorer and refusing every planned, unsupported and aliased name". Since step 16 four roles resolve, the reviewer through its two aliases (`fusionmodule/internal/steps/bundle_test.go:104-107`), and the repair schemas are compiled at `repair.Load`, not exercised (see `261014-0830-the-go-schema-validator-is-checked-against-the-explorer-schemas-only.md`).
- `adapters/prior/README.md:39-52` and `adapters/prior/build.sh:39`, `adapters/prior/stage.sh:30`: the default `PRIOR_REPO` is a personal absolute path (`/Users/kai/Projects/productive/F09-Prior`) in committed source; on any other machine the scripts fail with "PRIOR_REPO is not a git repository" rather than asking for the variable.

Fix direction: name answer 69 and the repair host beside the explorer's in the header; reword the Testing bullets to what the tests assert today; make `PRIOR_REPO` required (exit 2 with a usage line when unset) or document the default as the author's machine.

Acceptance: the three passages match the code they describe; `env -u PRIOR_REPO adapters/prior/stage.sh test` on a machine without that path prints a message naming `PRIOR_REPO` as required.
