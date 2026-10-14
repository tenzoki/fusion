The workbench page assembler accepts a zero-length page and loops on it
---
`hostsvc.decodePage` accepts a descriptor with `page_bytes` 0 and a non-null `next_offset` equal to its own `offset` while `offset < total_bytes`. `assemble` then requests the same offset under the same slot, `page:<handle>:<offset>`, whose operation id the host replays, receives the same descriptor and loops until the invocation's context ends. A host defect or a replayed bad page hangs the repair workflow at read-record or close instead of refusing it as a contract violation.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** `261014-0830-reviewer-closing-pass-over-the-prior-module-bundle-package.md`

Evidence:

- `adapters/prior/fusionmodule/internal/hostsvc/hostsvc.go:461`: `page.PageBytes < 0 || page.PageBytes > PageLimit` admits 0.
- `hostsvc.go:473`: `*page.NextOffset != end || end >= page.TotalBytes`: with `page_bytes` 0, `end == offset == next_offset` and `end < total_bytes`, so the page passes.
- `hostsvc.go:421-432`: `for page.NextOffset != nil` re-requests `offset` with no progress check.

Fix direction: refuse a page with a non-null `next_offset` and `page_bytes` 0 (equivalently, require `*page.NextOffset > page.Offset`) as `ErrReply`.

Acceptance: a test in `internal/hostsvc` whose fake host answers a first page `{"offset":0,"page_bytes":0,"next_offset":0,"total_bytes":10,…}` returns an `ErrReply` error after at most one page call.
