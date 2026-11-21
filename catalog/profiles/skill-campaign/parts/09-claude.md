
## Step 9: the watch

**Every use of this command while a campaign is running turns the watch on**, after whatever else it did: arm `Monitor` on `"$FUSION_PLUGIN_ROOT/bin/fusion-campaign" watch --since <last head= read>`, `timeout_ms` 1800000, its `description` naming the campaign and `on moved run overview --since <old>; on expiry re-arm from the last head`. Mechanism: the helper's header, `## probe and watch`. `state=already-watching`: one is armed; say nothing. `Monitor` must be pre-allowed in the user's permissions, or each re-arm waits on a prompt.

- On `moved=<old>\t<new>`, run `overview --since <old>` and tell the user only its `new-question=` rows, each with the offer to answer (Step 8), and its `new-ready=` rows, in Step 3's words; with none, say nothing. `note=since-unknown`: say once that something already known may repeat. Its `head=` is now the last head.
- On `failed=`, or an overview that exits non-zero: one sentence on what could not be checked; keep watching.
- On every expiry re-arm from the last head.

Stop it (`TaskStop`) after a `pause` or `end` in this session, on an overview that shows the campaign not running, and when the user says to stop watching. The next use of this command while it runs turns it on again.
