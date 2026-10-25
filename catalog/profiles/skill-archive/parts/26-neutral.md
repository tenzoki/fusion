
2. **Parse the argument.**
   - Match against `^tier-[123]( +(\d+)d)?$` for tier mode (capture the optional age threshold; default 14).
   - Otherwise treat as a natural-language description.
