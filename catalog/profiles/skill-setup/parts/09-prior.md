**A v11 store name is refused.** `circles/`, `shared/planning/` and `shared/consult/` were read beside their v12 names until the window closed at `13.0.0`, and nothing reads them since, so the probe prints one `LEGACY-STORES` line naming each one it finds and Setup stops: the migrate entry renames them, then Setup runs again.

Detection is by artefact presence, not by version. A pre-v4, v4-era or bracket-marked shape is the migrate entry's to recognise, and it refuses with the `v11.11.1` route; setup probes for none of them. Read-only:
