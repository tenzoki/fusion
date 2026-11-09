The citation sweep would admit a campaign file named to it, and could stale its charter hash
---
`isCodecFile` in `hooks/citation-sweep.ts` (line 843) uses the hooks' `isControlFile` to refuse a file the sweep must never rewrite. Since plan step 7a that predicate deliberately does not name `campaign.json`: it names the control half of a pair, and a campaign has no narrative. A `campaign.json` handed to the sweep by `--file` or declared as an extra path would therefore be admitted to the corpus, and a rewritten citation inside its charter (an `authorisation_ref`, for example) would leave `state.charter_hash` naming bytes the file no longer holds.
---
**Filed by:** orchestrator, Kai Stalmann <ks@qantr.com>

**Evidence.** Reported by the code-implementer on plan step 7a, read from the code and not executed. The orchestrator read the three places: the guard at line 843 and its two uses at lines 914 and 924 of `hooks/citation-sweep.ts`, both of which speak of "a file only the codec writes". The sweep's default corpus is Markdown, so the fault needs a deliberate `--file` or an `extraPaths` entry naming the JSON file. No campaign file exists in any workbench yet; the writer is plan step 16.

**Why it is not the codec's file and still must not be swept.** A campaign is written by `bin/fusion-campaign`, not by the codec, so the guard's wording does not fit it. What it shares with a codec-written file is that a rewrite by a third tool breaks an invariant the writer keeps: the hash over the charter, whichever rule plan step 16 lands, and the single-writer rule of the steering checkout.

**Acceptance.** The sweep refuses a `campaign.json` named or declared to it, with a message that says whose file it is, and a test holds the refusal; or the plan states why the sweep may rewrite one and what restores the hash afterwards. Either way before plan step 16 writes the first campaign.

**Cross-references:** `261108-2301-plan-campaign-the-frame-for-work-spread-over-several-checkouts.md` (steps 7, 16), `261109-0814-the-control-file-predicate-test-no-longer-sees-what-the-codec-admits.md`
