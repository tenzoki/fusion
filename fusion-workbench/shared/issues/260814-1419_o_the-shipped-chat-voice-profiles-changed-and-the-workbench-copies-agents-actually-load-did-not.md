The shipped chat-voice profiles changed and the workbench copies agents actually load did not, so the change is inert in this repository

---
Commit `ae21c87` tightened the length caps in `stilwerk/chat-voice-de.yaml` and `stilwerk/chat-voice-en.yaml`. `bin/fusion-rules` does not emit those files. It emits `./fusion-workbench/stilwerk/<stem>-<lang>.yaml` (`bin/fusion-rules:296-321`, `emit_voice_profile`), and the workbench copies were not touched. Every agent dispatched in this repository since `ae21c87` — including the curator run in the same session — has loaded the old caps. `/fusion:setup` will not repair it: its copy is idempotent, and it copies from the *installed* plugin at `$FUSION_PLUGIN_ROOT`, not from the work tree.

---
**Found by:** coderev, Turn-3 incremental review of `5c843e6..0301909`, review file `circles/260801-1244-curator/reviews/260814-1419-coderev-curator-turn-3.md`.
**Owner:** `coder`, with a decision to make first — see *Two fixes, and they are not equivalent*.
**Severity:** Medium.
**Filed in the shared store** per the Origin Rule: commit `ae21c87` was made during Circle `260801-1244-curator`'s Turn 3 but was not caused by its Directive, which is the curator agent and the always-on growth bound.
**Cross-references:** `fusion-workbench/portfolio.md` `## Warnings` → *"Standing, each verified against disk this run"* → `chat-voice-caps-tightened-in-the-template-only` (playmaker run 260814-0823 raised this while the edit was still uncommitted; committing it did not clear it); `circles/260801-1244-curator/history/260814-1332-curator-run.md` candidate C07 (the curator measured the divergence at 13:32 and classed it as outside its three surfaces); `shared/issues/260814-1001_*_three-skill-bodies-embed-german-while-skill-bodies-are-an-english-surface.md` (a neighbouring shipped-vs-consumed gap).

**Verified 2026-08-14 at HEAD `0301909`:**

```
$ for f in chat-voice-de.yaml chat-voice-en.yaml default-voice-de.yaml default-voice-en.yaml; do
    diff -q stilwerk/$f fusion-workbench/stilwerk/$f; done
chat-voice-de.yaml     plugin=7358  workbench=7353  DIVERGED
chat-voice-en.yaml     plugin=6800  workbench=6801  DIVERGED
default-voice-de.yaml  plugin=13417 workbench=13417 IDENTICAL
default-voice-en.yaml  plugin=10438 workbench=10438 IDENTICAL
```

The two long-form profiles are byte-identical, so the divergence is exactly what `ae21c87` wrote and nothing older.

```
$ bin/fusion-rules curator | grep voice
./fusion-workbench/stilwerk/chat-voice-de.yaml
./fusion-workbench/stilwerk/default-voice-en.yaml
```

The emitted path is the workbench copy. Its C04 entry still reads *"Gate-Prompts bis 8 Zeilen, Chat-Antworten bis 12 Zeilen"*; the shipped copy reads 6 and 8.

**Timeline, which shows setup is not the remedy.** `ae21c87` committed at 13:05. `/fusion:setup` re-ran at 13:11 — `fusion-workbench/.fusion-setup` moved to `{"setup_at":"2026-08-14T13:11:08+0200",…,"plugin_version":"8.2.0"}` in commit `0301909`. The workbench profiles are still the old ones. Two reasons compound: setup skips files that already exist, and even a forced copy would bring `~/.fusion/stilwerk/`, which is the 8.2.0 tarball and not this work tree.

**Why it is worth a record rather than a `cp`.** The class is general, not specific to these two files. Every asset `/fusion:setup` copies into the workbench — the four `stilwerk/` profiles, `monitor`, `templates/plane.config.yaml` — is edited in the work tree and consumed from the workbench, with no mechanism that notices when the two disagree. `CLAUDE.md` `## Conventions` documents the work-tree preference for `bin/fusion-rules`, `bin/fusion-paths` and `bin/fusion-source-root` precisely because a stale installed copy is a known failure here; the copied assets have no equivalent and no warning. Copying these two files closes today's instance and leaves the mechanism that produced it.

**Two fixes, and they are not equivalent.**

1. **Make `bin/fusion-rules` prefer the work tree for `stilwerk/` too, under `bin/fusion-plugin-cwd`,** the way it already prefers the work-tree `rules/`. Smallest change consistent with an existing, documented convention. Note that whether the work-tree preference extends further is part (c) of `shared/decisions/260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md`, which is deliberately unanswered — so this route needs that decision first.
2. **Add a divergence check.** A test or a Setup-step comparison that fails when a copied asset differs from its shipped source. Catches every asset, not just these two, and needs no decision. Costs a new gate to maintain.

**One thing that is not a fix: reverting `ae21c87`.** Whether the caps should be 6/8 or 8/12 is a separate question, filed as `shared/issues/260814-1419_*_the-tightened-chat-profile-caps-contradict-the-length-section-of-the-rule-that-owns-them.md`.

**Bookkeeping gap noticed alongside it, recorded here rather than filed separately.** `ae21c87` is attributed to no task in any session record. `grep -rn ae21c87 fusion-workbench/` returns five hits and every one of them is the curator citing it as *the HEAD it read against*, never as a change this session made. It has no `commit` event in `orchestrator-events.jsonl`, no row in `orchestrator-live.md` (its two neighbours `2a8a2f7` and `e101761` both have one), and no mention in the Circle's Turn log or the session history. A shipped-asset change inside a Turn loop with no task, no event and no entry is how a change of this shape stops being reviewable.

---
**Reconciliation 260817-1836** (reconciler, domain `code`). Re-verified reproducible at HEAD `2552586`: Re-measured: `chat-voice-de.yaml` is 7 358 bytes shipped against 7 353 in the workbench, `chat-voice-en.yaml` 6 800 against 6 801. The divergence is unchanged since filing, `bin/fusion-rules` still resolves the profile from the workbench copy with no work-tree preference for `stilwerk/`, and no divergence check exists. This is the same class as `260816-1330_*_the-override-record-names-the-shipped-chat-profiles-cap…`. Marker stays open. Log: `shared/history/260817-1836-reconciliation.md`.

---
**Progress 260821-0020** (coder, plan step 3 of `circles/260820-2051-style-rules-arrive-and-get-measured`). Fix 2 of the two above is built, in the Setup-step form rather than as a new gate: `/fusion:setup` Step 0d stamps every asset it copies into `fusion-workbench/.asset-provenance`, and the new Step 0e compares each stylometric profile against the shipped copy and offers a replace. The comparison resolves the shipped root through `bin/fusion-source-root`, which is what makes it read this work tree here instead of the 8.2.0-era tarball the timeline above shows setup pulling from. Run against this repository's own workbench it reports both chat profiles as differing and, with no provenance recorded, says it cannot tell an adaptation from a stale copy for either — the honest answer for a file nobody stamped.

Fix 1 was not taken and part (c) of `shared/decisions/260810-1544_*_should-prompt-called-bin-helpers-get-one-guarded-call-convention-and-does-the-work-tree-preference-extend-to-them.md` stays unanswered; the scope of the helper's use here was decided for this comparison alone (`circles/260820-2051-style-rules-arrive-and-get-measured/decisions/260820-2324_*_is-the-work-tree-the-refresh-source-when-setup-runs-in-the-plugins-own-repository.md`, option 1, recommended and not yet answered by the user).

**Marker stays `_o_`.** The mechanism exists; the divergence this record measures does not close until the workbench copies are actually refreshed through it, which is plan step 8. The bookkeeping gap recorded at the end of this file is untouched.

---
**Annotation appended 260821-0322** (coder, plan step 16 of
`circles/260820-2051-style-rules-arrive-and-get-measured/planning/260820-2324_*_plan-style-rules-arrive-and-get-measured.md`).
One claim in the timeline above has **expired**. Appended rather than edited, because the sentence
was accurate when written and the date it stopped being accurate is part of the finding.

**The expired claim.** *"Even a forced copy would bring `~/.fusion/stilwerk/`, which is the 8.2.0
tarball and not this work tree."* True on 2026-08-14 at HEAD `0301909`. `$FUSION_PLUGIN_ROOT`
resolves to `/Users/k1/.fusion`, and its `.claude-plugin/plugin.json` reads version **10.4.0**
today, so the obstacle the sentence names has gone: a forced copy no longer reaches an 8.2.0
tarball.

**Today's measurement, and what it does and does not show.** Measured 2026-08-21 with
`diff -q "$FUSION_PLUGIN_ROOT/stilwerk/<f>" stilwerk/<f>` over all four profiles, against two
trees:

```
vs. the work tree at 7135a19 (this Circle's Grounding HEAD)   all four IDENTICAL
vs. the work tree at 86edaac (this Circle's repunctuation)    all four DIVERGED
```

So the installed copy caught up with the work tree at some point before this Circle opened, which
is what retires the sentence, and it has since fallen behind again by exactly this Circle's four
`stilwerk/` commits, `5ed284d`, `403b91a`, `ca83e79` and `02ea2bd`. The obstacle is not permanent
and it is not gone for good either: it recurs the moment the work tree moves ahead of the last
release. What removed it for this repository is not the install being fresh but plan step 3, whose
Step 0e comparison resolves the shipped root through `bin/fusion-source-root` and therefore reads
this work tree here rather than any tarball.

**The record is not closed on this.** The marker stays `_o_` for the reason the 260821-0020 progress
note already gives: the mechanism exists and the divergence this record measures is a separate
condition. That condition is now met on its own terms and by a different act, plan step 8, which
refreshed the four workbench copies; all four are byte-identical with the work tree as of
`diff -q stilwerk/<f> fusion-workbench/stilwerk/<f>` at HEAD `86edaac`. What is still open in this
file is the bookkeeping gap at the end of it, which nothing here touches.
