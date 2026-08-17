# plugin.json declares 6.1.0 while the tag, the marketplace entry and both pin examples still say 6.0.1

---

`.claude-plugin/plugin.json:3` was bumped to `6.1.0` by step S11. The three other version surfaces
`CLAUDE.md` `## Release process` enumerates, plus the git tag, were not moved. The HEAD commit
titles itself `chore(release,workbench): v6.1.0`, so the repository reads as released while only
the first of the five release steps was taken.

---

## Evidence

| Surface | Value | Checked |
|---|---|---|
| `.claude-plugin/plugin.json:3` | `6.1.0` | `grep -n '"version"'` |
| marketplace `.claude-plugin/marketplace.json:42` (clone at `/Users/k1/Projects/productive/F03-CLAUDE-plugin-marketplace/claude-plugins`) | `6.0.1` | `grep -n '"version"'` |
| `install.sh:27` | `FUSION_REF=tags/v6.0.1 for the current release` | `grep -n FUSION_REF` |
| `README.md:26` | `FUSION_REF=tags/v6.0.1 to pin a release` | `grep -n FUSION_REF` |
| git tags | highest is `v6.0.1`; no `v6.1.0` | `git tag --list 'v*'` |

`claude plugin validate .` passes with one pre-existing warning (the root `CLAUDE.md` is not
shipped), so the manifest itself is well-formed. The JSON parses under both `node` and Ruby's
`JSON`, has no BOM and no CRLF, and its six keys are unchanged from 6.0.1.

## Failure scenario

A user follows `install.sh:26-27` and sets `FUSION_REF=tags/v6.1.0` to pin what `plugin.json` calls
the current version. The tag does not exist, so the tarball fetch fails. A user who instead pins
`tags/v6.0.1` as both examples still instruct gets 6.0.1, silently missing the
`**Artifact language:**` resolution that `README.md:117` now documents as available. `/plugin
install fusion@tenzoki-plugins` continues to serve 6.0.1 because `marketplace.json` was not bumped.

## Why this is a tracking record, not a defect in S11

The plan scoped it out deliberately and twice: step S11 ("The rest of the release — the marketplace
`version`, the git tag, the `FUSION_REF` example in `install.sh` and `README.md` — is the user's
call at a release gate and is deliberately not planned here") and the Out of Scope section. The
gate has not been walked yet. This issue exists so the deferred half is tracked somewhere rather
than carried only in a closed plan.

## Recurrence

The same drift class has been filed and closed twice before:

- `circles/260801-1244-guard-rules-write/issues/260805-1150_c_readme-nennt-als-pin-beispiel-eine-version-die-nie-getaggt-wurde.md`
- `circles/260801-1244-guard-rules-write/issues/260805-1840_c_readme-fusion-ref-beispiel-zeigt-auf-ungetaggte-version.md`

`CLAUDE.md` already names it: "there are effectively **four version surfaces** to keep coherent …
Refresh it at each release rather than letting it drift back to a version nobody tagged." Three
occurrences in one month suggests the convention is not self-enforcing and a check may be worth
more than another reminder — but that is a separate question, not part of closing this one.

## Resolution

Either walk the remaining release steps (`CLAUDE.md` `## Release process` steps 2-6) so all five
surfaces read 6.1.0, or leave `plugin.json` ahead and accept that 6.1.0 is an unreleased working
version. Both are the user's call at the release gate; this record just keeps the choice visible.

## Cross-references

- `CLAUDE.md` `## Release process`
- Plan: `fusion-workbench/shared/planning/260807-2024_c_two-language-declarations.md` step S11, Out of Scope
- Review: `fusion-workbench/shared/reviews/260807-2154-ontorev-chat-voice-sibling-reference-and-version-bump.md`

---
Resolved: All four version surfaces now read 6.1.0, and the release is out. The two pin examples
(`README.md:26`, `install.sh:27`) were bumped in commit `22b0ba8`. The marketplace entry was bumped
and pushed as `tenzoki/claude-plugins@0c091d9`. Tag `v6.1.0` was created on `fd74b89` and pushed, so
the `FUSION_REF=tags/v6.1.0` the examples now name resolves to a tag that exists. Release pre-checks
passed before any of it: `claude plugin validate .` reported passed with the one expected CLAUDE.md
warning, the default-agent smoke test returned SMOKE-OK, the whole suite was green at 1030 tests,
and `hooks/dist/` rebuilt with no diff, so the tarball an HTTPS install unpacks needs no npm step.
This record is the third of its kind; what closed it this time was doing the release rather than
deferring it.
