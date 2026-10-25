
   **Natural-language mode.** Survey what the description suggests; apply safety filters as defaults but flag any live-record hits with `[ACTIVE]` rather than silently dropping them — the user may want them at `refine`.

4. **Citation check** (filter 3). The corpus is built first, existence-guarded, into the positional parameters; the two globbed kinds come through `find`, so a zsh `nomatch` cannot abort the loop (Step 1's split rule):
   ```bash
