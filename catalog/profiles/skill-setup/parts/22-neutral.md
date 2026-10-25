
```bash
mkdir -p ./fusion-workbench/stilwerk
PROV=./fusion-workbench/.asset-provenance; [ -f "$PROV" ] || : > "$PROV"
for rel in stilwerk/default-voice-en.yaml stilwerk/default-voice-de.yaml stilwerk/chat-voice-en.yaml stilwerk/chat-voice-de.yaml; do
  [ -f "./fusion-workbench/$rel" ] && continue
