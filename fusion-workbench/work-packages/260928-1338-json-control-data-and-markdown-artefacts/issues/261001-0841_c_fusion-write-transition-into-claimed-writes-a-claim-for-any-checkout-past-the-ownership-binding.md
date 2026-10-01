fusion-write transition into claimed writes a claim for any checkout, past the ownership binding
---
`bin/fusion-write transition --to claimed --claim '<JSON>'` on an `open` package sends a caller-built `claim` object. The client does not check it, so one call leaves the package claimed by any `checkout_id`, a checkout that does not exist included. The call also works when this checkout's identity cannot be read. Afterwards every Claude-side route is refused (`claim` gives `conflict/already-claimed`, `release` and `transition` give exit 5). Prior response 38 says there is no supported Claude-side takeover, so this side cannot repair the claim.
---
**Filed by:** reviewer, Kai Stalmann <ks@qantr.com>
**Cross-references:** 260930-2305_*_plan-fj03c-the-write-client-setup-and-the-skills-on-json.md (step 3), 260930-2305_*_how-is-a-claim-held-by-a-checkout-that-no-longer-exists-released-under-response-22.md, 261001-0837-reviewer-fj03b-initialize-and-fj03c.md

Severity: High. Scope: `hooks/lib/record-write.ts` (the `transition` subcommand of `bin/fusion-write`).

**Evidence (current tree):**

- `hooks/lib/record-write.ts`, `PAYLOAD_FIELDS`: `package: ["claim", "outcome"],`. The `transition` case of `fieldsOf` copies `--claim` into `payload` with `JSON.parse`, unchecked.
- `ownership()` checks only these:
  - `claim`: the identity must be readable.
  - `release` or `transition` when `target.control.status === "claimed"`: the holder must match.

  A transition *into* `claimed` from `open` returns `null` and is not checked.
- Probe through the real bundle, in a scratch `git init` project (this checkout `120479c9`):
  - `transition --to claimed --claim '{"checkout_id":"deadbeef",…}'` gave `result=landed`, exit 0.
  - A following `claim` gave exit 6, `conflict/already-claimed … deadbeef`.
  - `transition --to open` gave exit 5.

**Contract:**

- Prior `fusion-fj02-prior-response.md` `## 22`: the ownership checks apply at "all entry points … including general transition".
- FJ03c step 3 states that `claim` "refuses without a readable identity". The `claim` subcommand binds `checkout_id` to `CHECKOUT=`, and this route skips that binding.

**Fix direction:** make `transition --to claimed` a usage error that names `claim` as the route. Admit `--claim` on a package only as `null`, when leaving `claimed`. If a claimed-to-claimed transfer is ever needed, it is request 38's dedicated route and not this one.

**Acceptance:** a case in `hooks/lib/__tests__/record-write.test.ts`, shown red against the current code:

- `transition --to claimed --claim {…another checkout…}` is `usage`, and only `inspect` and `show` reach the codec.
- The same call with the identity unreadable is refused.
- `transition --to closed --claim null` out of a claim this checkout holds still lands.

---
Resolved: `hooks/lib/record-write.ts` decides on the claim field a request writes, not on its subcommand, as the review's cross-cutting note proposed. A new check, `claimWritten`, runs after the request fields are built and before the mutation. It applies to `claim`, to a `transition` of a package into `claimed`, and to any `transition` carrying a non-null `--claim`. Each needs this checkout's identity readable and the written claim's `checkout_id` equal to it, else `ownership` (exit 5) with nothing sent. A transition into `claimed` without a claim refuses the same way. `--claim null` on leaving a claim the holder holds still lands. The standing-claim check for `release` and transitions out of `claimed` is unchanged. This binds the claim to this checkout, as `claim` does, rather than making `transition --to claimed` a usage error, as the dispatch ordered under response 22. `hooks/lib/__tests__/record-write.test.ts` (the ownership case): another checkout's claim and an unreadable identity are each refused with no mutation sent, and this checkout's claim and the holder's `transition --to open --claim null` land. Shown red with the check limited to `claim` again: the foreign claim landed. The `bin/fusion-write` header's exit-5 line names the written claim too. The "Stated for objection" policy in `codec/fixtures/prior/REQUESTS.md` ("and for nothing else") still states the old cut; it is noted on the open `261001-0841_*_three-texts-in-the-range-state-what-the-code-or-test-no-longer-does.md` for the next codec revision.
