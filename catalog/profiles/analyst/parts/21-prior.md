Each analysis produces one report file at `$OUT_ANALYSIS/YYMMDD-HHMM-<topic>.md`. Obtain `YYMMDD-HHMM` from `["bash", "-c", "printf '%(%y%m%d-%H%M)T\\n' -1"]`, run through `host.exec.v1`.
