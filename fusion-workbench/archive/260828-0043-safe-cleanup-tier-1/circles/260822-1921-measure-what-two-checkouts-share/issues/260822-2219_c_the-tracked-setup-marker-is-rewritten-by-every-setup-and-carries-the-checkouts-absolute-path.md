The tracked setup marker is rewritten by every Setup and carries the checkout's absolute path
---
`fusion-workbench/.fusion-setup` is classified as "written once, never rewritten" in `rules/workbench-tracking.md` and is on that basis the one entry it names as safe to track. `skills/setup/SKILL.md` writes it with a truncating redirect on every Setup run, and the content it writes includes `setup_pwd`, the absolute path of the checkout Setup ran in. In a project that tracks its workbench and is checked out several times, every checkout's Setup therefore produces a diff on a tracked file, the committed value names one person's local filesystem path, and two checkouts that both run Setup conflict on a one-line file.
---
Measured on 2026-08-22 in the C1 isolation pass, `260822-2219-what-two-checkouts-of-one-project-actually-share.md` `## Findings` section 8.

The marker as cloned from the origin tree read `{"timestamp":"...","plugin_version":"10.5.0"}`. Reproducing the write from `skills/setup/SKILL.md` verbatim inside the clone produced `{"setup_at":"2026-08-22T22:18:25+0200","setup_pwd":"/private/tmp/fusion-c1-measure/A-clone","plugin_version":"10.5.0"}`, and `git status --porcelain` reported ` M fusion-workbench/.fusion-setup`.

Two normative statements are contradicted by that, and both are load-bearing for the multi-user work:

- `rules/workbench-tracking.md` calls `.fusion-setup` "written once, never rewritten" and puts it in the track-it group for exactly that reason.
- `260822-1136_*_spec-fusion-becomes-a-multi-user-tool.md` `## The state partition` class R3 says `.fusion-setup` and `.asset-provenance` "already tolerate a second writer, because a second setup writes the same kind of line about the same assets".

The claim holds for `.asset-provenance`, whose lines are `<sha256>  <path>` and therefore content-derived: a second Setup on the same plugin version writes byte-identical lines. It does not hold for `.fusion-setup`, whose two other fields are a timestamp and a machine-specific absolute path.

A second, smaller point in the same file: `setup_pwd` is published to everybody who clones. Nothing reads it at this version, so it is a leak of a local path rather than a functional fault.

A live instance stands in this repository's own working tree at the moment of filing. `git diff fusion-workbench/.fusion-setup` shows the tracked marker moving from `{"setup_at":"2026-08-22T00:17:26+0200","setup_pwd":"/Users/k1/Projects/productive/fusion","plugin_version":"10.4.0"}` to `{"setup_at":"2026-08-22T10:06:53+0200", ...,"plugin_version":"10.5.0"}`, rewritten by the Setup that ran this morning. One checkout already produces a diff on it per Setup; several checkouts produce a conflict.

Not fixed here: this pass is read-only on the project's files. Any fix touches the classification in `rules/workbench-tracking.md`, the R3 paragraph in the spec, or the marker write in `skills/setup/SKILL.md`, and which of the three is the right one is a design choice rather than a correction.

---
Resolved: fixed — setup_pwd is gone from the marker at HEAD and Setup writes it only on change; the R3 row now says the marker is rewritten with the same content per plugin version, carrying no path and no timestamp of its own; rules/workbench-tracking.md:23
