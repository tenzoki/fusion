3. **No commit message file on Prior.** You do not commit, so you write no message file and run no `git commit`. The host captures the workspace when this run ends (`host.capture.v1`) and integrates it as the run's commit (`host.integrate.v1`), so one entry run integrates once, at its end, however many tasks it carried. What a per-task commit message records is still owed: in the per-task report of Step 5, give the task in the commit message's shape, so the run's report is the record of each task.
   ```
   <type>(<scope>): <summary>

   Task: <task ID>
   Source: <path to source plan/issue file — omit the line when the task came from no record>
   ```
   - `<type>`: `fix`, `feat`, `refactor`, `docs`, `chore`, `test`; `<scope>`: affected package or area
   - `rules/fusion-workbench-conventions.md` `## Record filing` puts a record file behind five conditions, and a task that meets none of them gets no record file and no `Source:` line. Do not manufacture one to fill the field.
4. **No staging list.** The capture takes the whole workspace, so no path is named for staging and none can be left out of a list. Name, in the per-task report, the files the task changed, the task-relevant files plus the `fusion-workbench/` records it produced, so the user can read what the integration will carry.
5. **No index write, no lock.** Never run `git add`, `git reset` or `git commit`, and never take the commit lock: the host is the only committer of this run.
6. The `commit` event is not yours to emit on any host.
7. **No staging check.** A record cannot be left unstaged when the whole workspace is captured; Step 4 ends here.
