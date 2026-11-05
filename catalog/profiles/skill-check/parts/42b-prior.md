## tmp — the run's scratch directory

On Claude Code this selector verifies `~/.fusion-tmp/<checkout-id>` and its grants. This host has neither, so `bin/fusion-tmp` is not run here. A run's intermediate files go in `/tmp`, kept for this run and its child runs and gone at its end (request 76, question 5), and the question on Prior is whether the run can write there:

```bash
node -e 'const fs=require("fs"),d=require("os").tmpdir(),f=d+"/fusion-check-tmp-"+process.pid;try{fs.writeFileSync(f,"");fs.rmSync(f);console.log("tmp=writable dir="+d)}catch(e){console.log("tmp=unwritable dir="+d)}'
```

`tmp=writable` is one line, not a warning, and the selector is stamped like any other that ran. `tmp=unwritable`: report it and do not stamp this selector, because the host's scratch rule did not hold for this run.

