# Fixes and demo delivery — October 26, 2026

## Delivered

The project now has a shared Node/browser recording pipeline and a new original 18-second film, **The Night Shift**, about a lunar crew switching on the stars. Artwork is procedural canvas animation; its music-box/jazz score is synthesized locally. No external assets, paid services, or new npm dependencies were used.

- Demo: `out/the-night-shift.mp4`
- Review sheet: `out/the-night-shift-sheet.png`
- Artwork and score: `demo/`
- Updated usage: `README.md`

## Changes against the review

| Review item | Implemented |
| --- | --- |
| R1 — paths and cleanup | Explicit public-asset allowlist and realpath containment; bounded numeric frame indices; generated job directories; no arbitrary frame-directory deletion; loopback binding, Host/Origin checks, session-token authorization. |
| R2 — recoverable errors | Request error boundaries, bounded payloads and concurrency, PNG CRC/dimension/pixel validation, atomic asynchronous frame writes, subprocess error handling and timeouts. |
| R3 — truthful completion | Incomplete jobs cannot encode. Every committed frame is revalidated. FFprobe checks exact video frame count, resolution, frame rate, streams, and durations. Only verified MP4s replace published output. |
| R4 — propagation | Shared driver checks responses, bounds retries, rejects null PNGs and artwork exceptions, and distinguishes captured frames from successful encoding. Strict export does not encode error pages. |
| R5 — isolation | UUID job folders, unique browser profiles, scoped process cleanup, cancellation, separate artifacts/logs, idempotent uploads and completion, filesystem reservations across separate processes. |
| R6 — blocking audio | Browser synthesis runs in a Web Worker; export and audio utility synthesis run in Node worker threads. Preview exposes audio errors/readiness instead of swallowing them. |
| R7 — configuration | Shared film registry and capture runtime; one CLI handles all three films. Incompatible legacy directory/duration/audio overrides now fail explicitly. |
| R8 — observability | Job manifests, JSONL events, worker median/p95 timings, browser stderr, FFmpeg progress/errors, stage status, source hashes, and tool versions. |
| R9 — rendering | Skip duplicate 30-fps preview frames; cache paper patterns, text measurements, running-head sizing, and outgoing page-turn spreads. Seed dynamic drawing independently of earlier frames. |
| R10 — utilities | Node commands replace shell orchestration. Validate arguments/tool availability, export exact-canvas stills, paginate timestamped sheets, and fail audio remux early when the master is absent. Avoid the old share-source MP4 copy. |
| R11 — verification | Syntax/config checks, fault-injection tests, real browser repeat/seek/fresh-load tests, preview audio checks, and actual encode smoke tests. |
| R12 — subtitles | Shared text/timing module replaces evaluating browser files. Enforce line width/count and timing structure; correct minimum-duration/gap allocation. Provide no-write and strict pacing checks. |

The original review remains a historical pre-change snapshot. These changes address its concrete bugs and initial performance work; no speedup relative to the old recorder is claimed because a controlled before/after capture benchmark was not collected.

## Verification

- All **41 JavaScript source/test files** parsed; Apocalypse metadata has continuous boundaries matching the registry duration.
- **11 automated tests passed**, covering paths/options, PNG corruption, authorization/input handling, oversized bodies, incomplete capture, duplicate/conflicting uploads, cancellation, encoder launch failure, prior-output preservation, output reservations, audio structure/repeatability, bounded upload retries, null blobs, and artwork exceptions.
- Browser checks exercise **35 timestamps** across the three films. Repeated and seeked frames must match byte-for-byte. Three representative fresh initializations per film are compared per channel with a maximum tolerance of **one 8-bit level** to account for canvas compositing rounding. No broader pixel tolerance is accepted. The machine-readable result is `out/browser-check.json`. Metabolic and Night Shift fresh comparisons were exact; Apocalypse differed by at most one level.
- Browser checks also wait for each full preview soundtrack and measure responsiveness while its worker is synthesizing. Maximum observed probe round trips were 23 ms (Metabolic), 39 ms (Apocalypse), and 1 ms (Night Shift). This checks readiness and responsiveness, not subjective listening quality.
- Metabolic: real **30-frame / 1-second** encode using two workers passed all media checks, saved as `out/metabolic-pipeline-smoke.mp4`.
- Apocalypse: real **30-frame / 1-second** encode using one worker passed all media checks, saved as `out/apocalypse-pipeline-smoke.mp4`.
- Demo: full **540-frame / 18-second**, **1280 × 720**, **30-fps** H.264/AAC encode. Video and audio durations are both 18 seconds. The final full pass completed in **33.8 seconds**, including **472 ms** of audio synthesis and **3.88 seconds** of encoding; these are one-machine measurements, not performance promises.
- The demo was decoded end-to-end without errors. Audio analysis on the first successful encode measured **−23.8 dB mean / −7.4 dB peak**, confirming non-silent audio with headroom. Opening/ending stills and the encoded contact sheet were visually inspected.
- Formatted and plain SRT generators both pass structural validation with **67 cues**. Checks did not overwrite the existing subtitle files.

Final job manifest: `out/jobs/3ed6a57a-2e17-4d87-b391-3dc978e2dd46/manifest.json`. Independent final media probe: `out/the-night-shift-validation.json`. The final MP4 also decoded without errors after publication.

## Boundaries and remaining choices

- Full-length re-encodes of the two existing films were not performed. Boundary/seek tests, full preview soundtrack synthesis, and short real encodes cover the modified paths, but do not substitute for full editorial review of those films.
- The Apocalypse script still has fast-reading cues, some substantially above 32 characters/second. Strict pacing mode reports failure; fixing the pacing requires shortening text or changing film timing. The script has not been editorially rewritten.
- Intermediate frames/logs are intentionally retained. There is no automatic cleanup or resume; this avoids deleting useful evidence or mixing frames from changed source. Only verified outputs are published.
- A forcibly killed process can leave a reservation in `out/locks/`; inspect its owner PID before removing it. Reservations are not automatically reclaimed because doing so can race an active writer.
- Browser/font rendering is environment-specific. Same-session repeat/seek checks are exact; fresh contexts can differ by one color level. Do not treat compressed MP4 byte hashes across browser/codec versions as an artwork-equivalence test.
- During final shell startup, the global npm installation reported a missing `graceful-fs` dependency. This is outside the project; all implementation checks and rendering used working direct `node` commands. No global installation was modified.
- Windows/Edge is the validated runtime. Linux/macOS browser discovery is included but not acceptance-tested here.
- Further performance experiments (audio caching, block DSP, raw frame streaming, adaptive worker counts, and completed-text-layer caches) remain optional tuning work. The new per-stage metrics provide a basis for deciding whether those changes are worthwhile.

## Reproduce

```powershell
npm run check
npm test
npm run test:browser
npm run demo
npm run sheet -- out/the-night-shift.mp4 2
```

Rendering and HTTP tests require local loopback access and permission to launch headless Edge. No preview server needs to be running for the recording/still commands.
