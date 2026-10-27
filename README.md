# Vido

Vido renders deterministic JavaScript canvas films with original synthesized audio. A local Node coordinator launches isolated headless browsers, validates PNG frames, synthesizes audio in a worker thread, and publishes an MP4 only after FFmpeg and FFprobe succeed. No npm packages, remote rendering services, or API keys are required.

| Film ID | Entry point | Duration / frames | Output |
| --- | --- | --- | --- |
| `metabolic` | `index.html` | 10 s / 300 | `out/metabolic-engine.mp4` |
| `apocalypse` | `apocalypse/index.html` | 130 s / 3,900 | `out/apocalypse-of-peter.mp4` |
| `nightshift` | `demo/index.html` | 18 s / 540 | `out/the-night-shift.mp4` |

All three use 1280 × 720 at 30 fps. **The Night Shift** is an original miniature about a lunar lighting crew, with locally synthesized music-box/jazz music.

## Requirements

- Node.js **22 or later** (validated here with Node 24).
- FFmpeg and FFprobe on PATH, including `libx264` and AAC. Contact sheets also require `drawtext`.
- Microsoft Edge, Chrome, or Chromium. Standard Windows Edge/Chrome paths are detected; some Linux/macOS paths are also supported but have not been validated here. Set `VIDO_BROWSER` to another executable if necessary.
- Windows contact sheets use Arial; Linux/macOS use a discovered system font.

If your global npm shim fails (this machine reported a missing `graceful-fs` during shell-profile startup), invoke Node directly: `node cli.js record --film nightshift`, `node --test tests/*.test.js`, and `node scripts/check.js`. The project does not need npm installation to run.

Git Bash is no longer required. npm scripts invoke Node directly. The old `.sh` entry points are thin wrappers for compatibility.

## Make a film

From the project directory, in PowerShell or another terminal:

```powershell
npm run record -- --film nightshift --jobs 2
npm run record -- --film metabolic --jobs 2
npm run record -- --film apocalypse --jobs 4
```

The command starts its own loopback server on a free port, launches unique headless browser profiles, captures disjoint frame ranges, encodes, validates, and shuts down its own processes. You do not need to start a preview server first. Existing final videos are preserved when capture or encoding fails.

Options:

| Option | Meaning |
| --- | --- |
| `--film` | Registered film ID (default `apocalypse`); its entry-point path is also accepted. |
| `--jobs` | 1–8 workers, no more than the frame count; default 2. |
| `--name` | Output basename containing letters, numbers, underscores, or hyphens. |
| `--frames` | Optional **numeric** prefix frame count for smoke tests, from 1 to the film's full count. |
| `--preset` | `slow` (default), `medium`, or `fast`. H.264 CRF 18, AAC 192 kb/s. |

For example, a one-second smoke test that preserves the normal output:

```powershell
npm run record -- --film metabolic --frames 30 --jobs 1 --name metabolic-smoke --preset fast
```

**Migration:** the old `--frames` directory name, `--dur`, and `--audio` overrides are no longer supported. The registry owns timing, dimensions, and audio module selection. Frame directories are generated per job and are never cleared by arbitrary CLI paths. Partial renders are a prefix starting at frame zero, not a general timeline edit.

## Preview, stills, and review

```powershell
npm run serve
```

Open [The Night Shift](http://127.0.0.1:8765/demo/index.html), [Metabolic](http://127.0.0.1:8765/index.html), or [Apocalypse](http://127.0.0.1:8765/apocalypse/index.html). Click or press a key to enable sound. Audio synthesis runs in a Web Worker; `audioStatus()` exposes readiness and errors. Preview skips repeated draws of the same 30-fps frame.

- `?t=5` draws a validated still timestamp without autoplay.
- `?capture` initializes the film for `renderAt(seconds)` in the console.
- `?record` runs a complete single-browser job and reports success only after verified encoding. Use the CLI for worker ranges and parallel capture. `from`, `to`, and `noencode` query options now fail explicitly.
- `window.__ready`, `window.__filmErrors`, and `window.__captureStatus` expose status. `window.__recorded` is set only after a successful single-browser encode.

Generate **exact canvas** PNGs (not viewport screenshots):

```powershell
npm run still -- --film nightshift 2 6 10 15
npm run still -- --film metabolic --out out/stills/metabolic --prefix review 1 3 7
npm run sheet -- out/the-night-shift.mp4 2
```

Stills launch and close their own local server/browser. Contact sheets include timestamps, use up to 72 samples per page, and create numbered pages when needed. The sample limit is 720 per invocation. Preview the MP4 as well: stills cannot establish motion or audio quality.

## Job artifacts and troubleshooting

Each run writes `out/jobs/<UUID>/`:

- `manifest.json`: configuration, source hash, tool versions, state, counts, timings, and final media validation.
- `events.jsonl`: stage transitions, frame progress, worker timing distributions, FFmpeg progress/errors.
- `browser-N.log`: headless browser stderr.
- `frames/f000000.png`, etc.: atomically committed, CRC/pixel-validated frames.
- `soundtrack.wav` and `video.mp4`: job-specific audio and verified master. Failed encodes may leave `video.partial.mp4` for diagnosis.

The final MP4 is copied to a temporary publication file and renamed into `out/<name>.mp4` after validation. The job copy remains available even if a later run replaces the published filename. Frame count, resolution, frame rate, audio presence, and duration are checked. Identical frame retries are idempotent; conflicting retries are rejected.

The server binds only to `127.0.0.1`, restricts asset paths, checks Host/Origin, and requires a session token on job operations. It is a local development tool, not an internet-facing hosting service. Uploads are capped at 8 MiB, with eight in-flight uploads per job and four active jobs per server. Only one job encodes at a time per server. Standalone browser sessions sharing a server must retry completion if another encode is busy; CLI runs have their own servers.

A stalled capture fails after two minutes without a committed frame. Browser initialization, network requests, audio synthesis, and encoding also have bounded timeouts. Ctrl+C cancels the CLI run and closes its owned browsers. Logs and frames are intentionally retained; there is no automatic deletion or unverified resume. Inspect a completed/failed job before manually removing its directory if disk space is needed.

Output reservations in `out/locks/` prevent concurrent writers, including separate CLI processes. If a process is forcibly killed, inspect any leftover reservation and confirm its PID is no longer running before removing the lock file. Do not delete a live job's reservation.

Use a different preview port with `$env:PORT=8766; npm run serve` in PowerShell. The recorder uses its own free port independently. If Edge is missing, set `$env:VIDO_BROWSER='C:\path\to\browser.exe'`.

## Audio and subtitles

```powershell
npm run audio -- --wav-only
npm run audio
npm run srt
npm run srt -- --plain
npm run srt -- --check
npm run srt -- --check --strict
```

The audio command remains a Metabolic utility: WAV-only writes `out/soundtrack.wav`; full mode requires the master MP4 and verifies replacements before publishing the master/share copies. It no longer copies the full master merely to create a share source. Audio work runs off-thread.

Apocalypse text/timing lives in `lib/apocalypse-data.js`. The player, page-turn audio cues, and subtitle generator consume this metadata; browser leaf scripts are no longer evaluated to extract subtitles. Generated SRT files remain separate from the MP4. Structural checks reject invalid timing, overlaps, and lines longer than 46 characters or cues longer than three lines. `--check` performs validation without overwriting files; `--strict` also returns nonzero for reading speeds above 32 characters/second. The current long-form script still has fast-reading warnings; addressing those requires an editorial timing/content decision.

## Development and tests

```powershell
npm run check
npm test
npm run test:browser
```

Unit/integration checks cover path containment, argument validation, PNG corruption, HTTP authorization/input handling, duplicate uploads, incomplete capture, cancellation, preservation of previous outputs, subprocess errors, media-probe checks, and deterministic audio. Server tests use loopback; browser tests require an installed browser and check repeated/seeked frames at representative boundaries. Results are written to `out/browser-check.json`.

Key files:

| Location | Responsibility |
| --- | --- |
| `lib/films.js` | Film registry shared with browsers |
| `lib/server.js` | Job lifecycle, uploads, validation, encode, publication |
| `lib/media.js`, `lib/output-lock.js` | Media checks, subprocess handling, output reservations |
| `lib/runtime.js`, `lib/preview-audio.js` | Shared browser capture/preview and audio worker |
| `lib/browser.js`, `cli.js` | Headless browser lifecycle and cross-shell commands |
| `js/`, `apocalypse/js/` | Existing film artwork and synthesis |
| `lib/apocalypse-data.js` | Shared Apocalypse text/timing |
| `demo/` | Original Night Shift artwork and score |

For a new film, register it in `lib/films.js`, add its public asset directory to the server allowlist, load `films.js` and `runtime.js`, and call `Vido.boot(id, canvas, renderAt)` after initializing artwork. Export `renderSoundtrack(sampleRate, duration)` and `toWav` from its audio module. Keep rendering independent of prior timestamps; test fresh, repeated, and seeked frames. Do not add random/time-dependent rendering without a deterministic seed.

The [original review](docs/code-review-2026-10-26.md) records the pre-change findings. The [implementation report](docs/fixes-and-demo-2026-10-26.md) records fixes and current verification.
