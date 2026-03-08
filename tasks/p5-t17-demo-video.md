---
id: p5-t17
phase: 5
title: Demo video
status: todo
---

# Demo video

Record the demo video that anchors the X launch. The video is the product —
it needs to show the magic clearly in under 60 seconds.

## Script

1. **Start**: `curl -fsSL https://corpo.sh/install | sh` — one line, installs
2. **Auth**: `corpo auth google` — browser opens, one click, done
3. **Import**: `corpo import https://docs.google.com/[real doc link]` —
   viewer opens automatically, clean rendered doc
4. **Edit**: hit `e`, fix something in the editor, viewer live-reloads
5. **Publish**: `corpo import [same link] --publish` — prints `corpo.sh/{id}`
6. **Share**: open `corpo.sh/{id}` in browser — rendered doc, shareable link

Total: ~45 seconds. No cuts if possible.

## Requirements

- Use a real Google Doc (a PPS is ideal — shows tables rendering correctly)
- Terminal font and size must be legible at small size in an X embed
- Record at 2x resolution, export at 1080p
- No voiceover — the commands speak for themselves

## Done when

- [ ] Video is recorded and exported
- [ ] All 6 steps visible and legible
- [ ] Under 60 seconds
- [ ] Exported in a format suitable for X upload (MP4, < 512MB)
