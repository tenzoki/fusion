# A command of its own files a new work package, and /fusion:memo keeps one task list and one notes file per person

---
**Domain:** code
**Status:** done
**Cross-references:** 260922-1059_*_what-becomes-of-memos-which-the-concept-has-no-type-for.md, 260923-0839-implement-prior-nomenclature.md
**Filed by:** user, Kai Stalmann <ks@qantr.com>

---

## Directive

The user's words, 260924: "ich glaube das muss getrennt werden. eigener befehl für anlegen eines neuen pakets (statt /memo idee). memo dagegen wird per person angelegt: einmal tasks und einem notizen, unterscheidung nach inhalt." And: "diesen split sollten wir auch auf dem main branch noch nachtragen. lege das arbeitspaket als auf beiden brnaches an."

Filing a new work package moves out of `/fusion:memo` (its `idea:` / `idee:` route) into a command of its own. `/fusion:memo` keeps the personal log, keyed per person instead of per checkout: one task list and one notes file, the target chosen by the content of the entry. The change is wanted on `main` (the v11 line) as well as on the v12 branch `v12-prior-nomenclature`. The item is reached when both lines ship the new command and the per-person memo files, with an adoption path for the existing per-checkout `memos-<checkout>.md` and `tasks-<checkout>.md` files.

## Settled with the user, 260924

- The new command is `/fusion:wp`.
- A person is keyed by their git e-mail, slugged for a filename (for example `tasks-ks-qantr-com.md` and `notes-ks-qantr-com.md`).
- `/fusion:memo` adopts an existing per-checkout `memos-<checkout>.md` or `tasks-<checkout>.md` on its next run into the per-person files, and says so.

## Closure, 261002

Closed `done` on the user's word, after the 261002 reconciliation found the work shipped and the item still `open`. The work landed in `092e9c8b` (`/fusion:wp` files a new work package; `/fusion:memo` keeps one task list and one notes file per person and adopts the per-checkout files), which is contained in `v11.11.2` on the v11 line and in `v12.0.0` onward. No claim was ever written on this item, so none stands to name the holder; the commit's author does. No review pass was run at closure; the item closes over its shipped releases.
