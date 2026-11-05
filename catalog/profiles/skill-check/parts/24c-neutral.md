
```bash
[ -f ./fusion.json ] && echo "fusion.json present" || echo "fusion.json absent"
```

- **`present`** — nothing to do. Do not run the copy anyway: the template declares nothing, so copying it over a project's filled-in file would replace a real setting with an empty inheritance.
- **`absent`** — seed the template. The copy is idempotent and never overwrites:

  ```bash
