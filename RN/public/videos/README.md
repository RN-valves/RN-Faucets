# Video Assets

Place your cinematic hero video files in this directory:

| File | Purpose |
|------|---------|
| `hero-1.mp4` | Italian Collection — first hero loop |
| `hero-2.mp4` | Obsidian Series — second hero loop |
| `hero-3.mp4` | Aurum Edition — third hero loop |

## Recommended Specs
- **Resolution**: 1920×1080 minimum (4K preferred)
- **Duration**: 8–15 seconds per clip for best UX
- **Format**: H.264 MP4 for broadest compatibility
- **Bitrate**: 4–8 Mbps for quality; encode a low-res version for mobile
- **Audio**: Remove audio track (videos are muted)

> Tip: Encode with `ffmpeg -i input.mov -vcodec libx264 -acodec aac -vf scale=1920:-1 hero-1.mp4`
