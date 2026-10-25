```

| Exit | Report |
|---|---|
| 0 | each `moved=` line is archived and goes into the manifest; a `held=` line held a unit under the fence |
| 6 | nothing stayed eligible under the fence; nothing moved |
| 5 | the fence was refused (another fence, or an unfinished codec write); nothing moved |
| 8 | the move or its verification failed and every file is back; nothing archived |
