# Vido code review and improvement plan

Reviewed October 26, 2026. Scope: capture server, recording/still/contact-sheet scripts, browser drivers, drawing helpers and scene code, audio synthesis, subtitles, package commands, and README. This is a recommendations document; application code and existing media were not changed.

## Main recommendation

Make recording a validated, isolated job with explicit success and failure states before optimizing throughput. Today, incomplete frames, failed uploads, drawing errors, and failed encodes can produce misleading completion signals. Fix those boundaries first, then move audio synthesis off the main thread and measure frame rendering, PNG conversion, disk writes, and encoding separately.

Keep the useful existing design: deterministic timestamp-based rendering, prebuilt canvas sprites, shared browser/Node audio synthesis, and a small dependency footprint. A framework or bundler migration is not necessary to address these findings.

## Evidence and limitations

- Parsed all 25 JavaScript source files with Node's `vm.Script`; no syntax errors.
- Exercised the real capture-server handler in an isolated VM with mocked filesystem and process dependencies. Confirmed malformed URI decoding throws, frame indices escape the intended frame directory, and the static path check accepts a sibling directory sharing the project-name prefix. These probes did not write files or start the server.
- Rendered both full soundtracks in memory at 48 kHz using Node v24.19.0. Both had the expected sample count, no nonfinite samples, and a peak of approximately 0.9. WAV lengths matched stereo 16-bit PCM expectations.
- Executed the subtitle generator with file writes intercepted: 67 cues, including two text lines longer than the function's documented 46-character limit.
- No full browser render, pixel comparison, live HTTP fault injection, or new FFmpeg encode was performed. Visual defects and throughput improvements below require those checks. Existing outputs are not proof that the current source successfully regenerates them.
- This workspace has no Git repository metadata, and `package.json` has no automated test command. No relevant project-specific memory or AGENTS.md instructions were found.

Source references below are project-relative paths and line numbers from this snapshot.

## Prioritized backlog

Effort: **S** = localized change; **M** = several modules plus integration checks; **L** = architectural work. Priority reflects likely impact on the current local workflow, not a formal vulnerability rating.

| ID | Priority | Recommendation | Evidence | Effort |
| --- | --- | --- | --- | --- |
| R1 | P1 | Contain filesystem access and remove unchecked deletion paths | Reproduced path calculations; source-confirmed deletion risk | M |
| R2 | P1 | Handle request, filesystem, and subprocess failures without crashing | Reproduced uncaught decode error; source-confirmed missing handlers | S–M |
| R3 | P1 | Refuse incomplete recordings and publish outputs atomically | Source-confirmed timeout and completion defects | M |
| R4 | P1 | Check upload responses and make export fail on drawing errors | Source-confirmed | M |
| R5 | P1 | Isolate runs and coordinate encoding | Source-confirmed shared paths and profiles | M |
| R6 | P2 | Move audio synthesis off browser/server main threads | Measured CPU cost; source-confirmed blocking calls | M |
| R7 | P2 | Share film configuration and recorder behavior | Source-confirmed incompatible capture contracts | M |
| R8 | P2 | Add useful structured logs and job progress | Source-confirmed observability gaps | S–M |
| R9 | P2 | Eliminate repeated preview work; cache measured hotspots | Source-confirmed repetition; savings unmeasured | S–M |
| R10 | P2 | Validate command arguments and tool availability | Source-confirmed failure paths | S–M |
| R11 | P2 | Add deterministic rendering and pipeline regression checks | Missing automated checks | M |
| R12 | P3 | Consolidate subtitle timing and validate layout | Reproduced line overflow; source-confirmed timing duplication | S–M |

## R1 — Contain paths before reading, writing, or deleting

**Sources:** `capture-server.js:11–15,30–34`; `record.sh:6–11`.

The frame index is interpolated directly into a filename. The mocked request `/frame?i=x/../../outside` resolves to `out/outside.png`, outside `out/frames`. More parent segments can escape farther when destination directories exist. The `name` filter does not protect the unvalidated `i` parameter.

Static serving uses `f.startsWith(ROOT)`, which also accepts a sibling named `vido-sibling`. On Windows, the path `/..%5cvido-sibling%5cprobe.txt` resolves there and passes that prefix check. The isolated probe demonstrated path acceptance, not access to an actual sibling file.

Separately, `record.sh` uses the user-provided `--frames` value in `rm -rf "out/frames/$FRAMES"`. A value containing parent segments can direct cleanup outside the intended frame subtree. Do not reproduce this against real directories.

**Suggested changes:**

- Accept frame indices only as bounded nonnegative integers belonging to an active job. Give the `window.dump` still helper a separate endpoint or an explicitly constrained still identifier; it currently uses `s_<time>` indices.
- Resolve paths and verify containment with `path.relative`, rejecting absolute relatives, `..`, and relatives starting with `..` plus a separator. Account for symlinks/junctions if arbitrary local entries remain exposed; preferably serve an explicit asset allowlist.
- Use generated job IDs for frame directories. Never turn arbitrary CLI strings into deletion targets. Verify the resolved target remains below the intended job root before any cleanup.
- Bind explicitly to loopback by default. `.listen(PORT)` currently omits a host. Restrict mutation requests to the local workflow, validate browser Origin where present, and use an unpredictable per-run token for uploads/encoding. Avoid serving hidden configuration files or the entire workspace unnecessarily.

**Acceptance:** table-driven path tests cover encoded backslashes, sibling prefixes, traversal, invalid indices, and cleanup targets without performing destructive probes. Valid frames/stills still work; remote interfaces are not bound by default.

## R2 — Make server errors recoverable and bounded

**Sources:** `capture-server.js:9–33`.

`decodeURIComponent` throws on malformed escapes such as `/%ZZ`. Module loading, soundtrack synthesis, and synchronous filesystem calls can also throw without a request-level error boundary. A missing FFmpeg executable emits an `error` event, but only `close` is handled. The static read stream likewise has no error handler. Upload bodies are buffered without a size limit; duration and FPS are accepted without finite numeric bounds.

**Suggested changes:**

- Parse and validate requests before allocating buffers or touching disk. Cap upload size, duration, FPS, frame count, and concurrent work; validate PNG signature/dimensions and reject empty/truncated payloads.
- Select audio modules from registered films instead of accepting a module path from the request. Removing `..` is not a configuration contract, and loading an unrelated project module can execute its top-level side effects.
- Add request error/abort handling, stream error handling, and one guarded subprocess completion path for both `error` and `close`.
- Return structured errors with appropriate status codes: invalid input, oversized upload, job conflict, missing frames, and encoding failure. A failed FFmpeg exit currently still produces HTTP 200 with text such as `encoded 1`.
- Use asynchronous file writes with bounded concurrency. Write a frame to a temporary filename, then rename it before acknowledging receipt.

**Acceptance:** malformed URLs, invalid audio selection, missing FFmpeg, aborted uploads, and simulated disk errors return actionable failures; the server remains available for the next valid request. Oversized requests stop consuming memory at the configured limit.

## R3 — Verify complete frames and publish only verified output

**Sources:** `record.sh:19–29`; `capture-server.js:25–27`.

The recorder breaks out of its polling loop after 40 minutes but still requests encoding. Completion is based on the number of directory entries rather than the expected contiguous set of valid frames. The server has no independent completeness check. A missing image can terminate the image sequence early; FFmpeg's exit status alone is insufficient to establish the intended duration. Finally, the script lists the output file, which might be from an earlier run.

**Suggested changes:**

- A timeout, dead worker, or failed upload must end the job unsuccessfully and skip encoding.
- Verify exactly the expected indices, successful writes, dimensions, and nonempty/decodable images before encoding. Count only committed frame files.
- Encode to a job-specific temporary MP4. Validate with `ffprobe`: video frame count, dimensions, frame rate, duration, and audio stream presence/duration with an explicit codec-padding tolerance.
- Rename the validated artifact into its final name only after success. Preserve the prior valid output on failure and clearly identify it as belonging to a prior run.
- Return a job result containing status, expected/received frames, output path, encode exit code, and validation results. Make the CLI exit nonzero for any failed stage.

**Acceptance:** remove one frame, corrupt another, force a timeout, and force FFmpeg failure in disposable test jobs. None should replace the previous successful artifact or report success. Normal exports contain exactly 300 or 3,900 video frames.

## R4 — Propagate capture and artwork failures

**Sources:** `js/main.js:70,75–85`; `apocalypse/js/main.js:20–35,63–74`.

Both recorders await `fetch` but never check `response.ok`. An HTTP error response therefore advances capture as if the frame was saved. Neither recorder validates a null `toBlob` result or catches failures to expose a durable error state. `window.__recorded` can be set after an unsuccessful encode response.

Apocalypse deliberately catches leaf build/draw errors and paints the error message into the artwork. That is useful for preview, but export can silently encode those error pages as a successful film. `window.__ready` is also true despite recorded build failures.

**Suggested changes:** distinguish preview diagnostics from strict export. Export should fail on build/draw errors, invalid blobs, and rejected uploads. Record `{stage, frame, leaf, error}` in a readable status object and report it to the job coordinator. Add bounded retries with backoff for transient upload failures, a request timeout, and idempotent frame handling. Permanent validation errors should fail immediately.

**Acceptance:** inject a failing draw, HTTP 500, disconnect, and null blob. Each fails visibly without publishing an MP4. A retry of the same successful frame does not inflate progress or corrupt it.

## R5 — Isolate concurrent work and clean up owned processes

**Sources:** `record.sh:11–16,26`; `capture-server.js:13–27`; `apocalypse/js/main.js:68–71`.

Every Apocalypse render uploads to the same directory. A second run can delete or overwrite the first run's frames; repeated `/done` requests can launch FFmpeg against the same WAV/MP4 paths. Edge profiles are reused by worker index across runs, creating another collision point. There is no interrupt trap to clean up owned processes.

Use `out/jobs/<jobId>/` for frames, logs, audio, and intermediate output; pass the ID through every request. Give each worker a unique profile and register its process/range with the coordinator. Use an explicit state machine (`created → capturing → validating → encoding → succeeded`, with failed/cancelled exits). Permit only one encoding transition per job. Clean up only processes/profiles owned by that job, including on interruption.

Resume only when the manifest matches source/configuration hashes and existing frames pass validation. Make retention explicit: keep failed-job diagnostics and optionally remove successful intermediate frames after output verification.

**Acceptance:** two simultaneous jobs cannot affect each other's frames, profiles, WAVs, or MP4s. Duplicate completion requests do not spawn duplicate encoders. Cancellation stops owned children and leaves other browser sessions alone.

## R6 — Move expensive audio synthesis off the main thread

**Sources:** `apocalypse/js/main.js:83–93`; `js/main.js:96–106`; `capture-server.js:23–24`; `apocalypse/js/score.js:7–11,253–275`.

| In-memory measurement | Metabolic | Apocalypse |
| --- | ---: | ---: |
| Audio duration | 10 s | 130 s |
| Synthesis time, one local run | 964 ms | 8,396 ms |
| Samples per channel | 480,000 | 6,240,000 |
| PCM WAV bytes | 1,920,044 | 24,960,044 |

These are Node measurements, not browser benchmarks or guaranteed timings. The process high-water RSS reached approximately 243.5 MiB after the second render; that value is cumulative across the process and includes more than the audio arrays. The Apocalypse score allocates eight full-length float channels across music, foley, room tone, and output: approximately 190.4 MiB of array payload at 48 kHz before other buffers.

The browser's `setTimeout(..., 30)` delays synthesis but still executes all of it on the UI thread. The server executes it synchronously in the request handler, delaying unrelated requests while it runs.

Use a Web Worker for preview synthesis and a worker thread or child process for export synthesis. Transfer output buffers instead of cloning them. Alternatively, serve a cached preview WAV generated from the same source. Cache by audio source/dependency hash, duration, and sample rate, and report audio readiness/failure instead of swallowing errors.

Only consider block-based DSP after profiling; oscillator state, seeded noise order, reverb tails, and global peak normalization must remain correct. Moving the existing algorithm intact is the lower-risk first step.

**Acceptance:** UI interaction and server health requests remain responsive during synthesis. PCM output matches the previous algorithm for identical configuration; measure latency and peak memory before/after.

## R7 — Establish one film configuration and capture contract

**Sources:** `record.sh:5,8,16,28`; `js/main.js:67,76–83`; `apocalypse/js/main.js:58,64–71`; both `core.js:4` files.

The CLI exposes film/name/frame-directory/duration/audio options, but those options do not alter browser upload destinations or film duration. The Metabolic recorder ignores `noencode`, so the final worker can start encoding while other workers are still uploading. Apocalypse always uploads to `apocalypse` regardless of `--frames`. The README documents these limitations, but the commands still permit incompatible combinations.

Define a film registry containing ID, entry point, duration, FPS, dimensions, audio module, and subtitle support. Derive expected frames and worker ranges from it. Share a small capture driver between films, accepting only validated job ID and frame range. Let the coordinator own encoding, rather than allowing any worker to trigger it. Reject invalid ranges, including fractional, negative, reversed, and beyond-end indices; avoid `value || default` when zero is meaningful.

A Node CLI using built-in process APIs would remove the Git Bash/WSL ambiguity and consolidate recording, stills, audio, and contact sheets. Keep shell wrappers if useful, but centralize validation and configuration.

**Acceptance:** the same CLI records both films with one and multiple workers; uploads stay in the assigned job, configuration mismatches fail before cleanup/capture, and encoding begins only after every worker completes.

## R8 — Add logs that explain slow or failed jobs

**Sources:** `capture-server.js:27,34`; `record.sh:16,20–28`; `still.sh:13–14`; browser audio catches and Apocalypse error logging.

Keep concise terminal progress, backed by JSON Lines in each job directory. Recommended fields: timestamp, severity, event, job ID, film ID, worker ID, stage, frame index/range, elapsed milliseconds, bytes, retry count, and error code/message. Include stack traces for unexpected errors in diagnostic logs. Do not log PNG bodies or per-run authorization tokens.

Record stage starts/ends and failures. Sample frame timings or aggregate them rather than emitting thousands of info-level messages. Track render, PNG conversion, upload/write acknowledgement, audio synthesis, encode, and validation separately; summarize median/p95 frame latency, effective frames/second, last successful frame, and time since progress. Preserve per-worker stderr and FFmpeg stderr; use FFmpeg progress output to show encoding advancement.

Add lightweight health and job-status endpoints. A status response should distinguish initializing, rendering, waiting on uploads, synthesizing, encoding, and failed. Surface browser `error`/`unhandledrejection` events to the runner. De-duplicate repeated leaf errors while retaining the first stack and affected frame range.

**Acceptance:** a stopped worker or encoder failure can be diagnosed from one job directory without rerunning. Progress cannot remain indefinitely labelled “capturing” after a known fatal error.

## R9 — Reduce repeated rendering work, then benchmark the pipeline

**Sources:** `js/main.js:108–114,55`; `apocalypse/js/main.js:95–101`; `apocalypse/js/book.js:90–109,129–134,209–212,242`; `apocalypse/js/core.js:230–234`.

Both previews redraw on every animation callback even when the quantized 30-fps frame index has not changed. On a 60 Hz display, that can redraw each film frame roughly twice. Track the last frame index and skip duplicate draws, resetting it appropriately when restarting or seeking. Keep audio as the timing source.

Other candidates, subject to profiling:

- Cache paper patterns per context and change only their transform.
- Cache running-head glyph widths and superscript widths instead of measuring them repeatedly. Pre-render stable labels/drop caps where appearance permits.
- Cache the outgoing spread during a page turn: its timestamp is fixed at the prior leaf's last frame, yet it is redrawn for every transition frame. Key this by transition and invalidate on source/configuration changes; preserve arbitrary-time rendering.
- Reuse completed text layers after reveal, while continuing animated artwork and post-processing. Include font/layout settings in cache keys.
- Replace synchronous server writes with bounded asynchronous I/O. Measure worker counts of 1, 2, and 4; more Edge processes duplicate initialization/assets and can increase memory pressure.

PNG serialization, disk traffic, and `libx264 -preset slow` may dominate, but no capture profile was collected. Do not claim a speedup yet. Measure a text-heavy section, a page turn, and a motion-heavy section. Consider an explicit faster draft encoding preset; compare quality, size, and time before changing final-output defaults. A direct FFmpeg pipe is a later option with ordering/backpressure complexity and fewer resume artifacts.

**Acceptance:** matched-frame pixel comparisons and seek-order checks pass after each cache change. Report measured total capture time, per-stage latency, memory, and encode time on the same machine/configuration.

## R10 — Make utility commands fail clearly and predictably

**Sources:** `record.sh:6–10,26–29`; `still.sh:6–14`; `sheet.sh:3–4`; `make-audio.js:15–27`.

- Missing option values can leave `shift 2` failing without consuming arguments. Validate arity first. Reject zero/negative/fractional worker counts, unsupported durations, invalid timestamps, and nonpositive sheet intervals.
- `curl -s` does not fail on HTTP error status. Use explicit status checks and bounded connect/operation timeouts. Verify Edge, FFmpeg, required codecs/filters, and the actual film endpoint before allocating work.
- Add cleanup on normal exit, failure, and interrupt. Check worker liveness instead of waiting the entire capture timeout after startup failure. Preserve browser output on failure.
- `still.sh` prints a file path regardless of screenshot success and can capture a browser error page. Check browser exit status, readiness, film errors, and output validity. Use unique profiles. Distinguish viewport screenshots from exact canvas exports.
- `make-audio.js` logs a missing master as skipped, then unconditionally copies that same missing file. Fail early with a clear prerequisite message or intentionally return after WAV-only generation. Avoid the intermediate full MP4 copy when encoding the share version directly from master plus WAV will suffice.
- `sheet.sh` emits only one 72-tile sheet. Compute coverage from probed duration, warn when the interval truncates the review, or create multiple sheets. Discover a font path instead of assuming one installation layout.

**Acceptance:** each invalid invocation terminates quickly with nonzero exit and an actionable message; no existing outputs are deleted during failed preflight. Missing server, browser, or master video is handled explicitly.

## R11 — Add focused automated checks

Start with Node's built-in test runner for configuration, path validation, job transitions, subtitle constraints, and WAV structure. These checks need no application framework. Add a browser automation development dependency only for tests that need real canvas/browser behavior.

High-value integration checks:

1. Render the same timestamp twice, after unrelated timestamps, and in separate workers. Compare pixels in the same pinned browser/font environment. Seeded helpers use mutable shared RNG state, so this verifies the intended determinism rather than assuming it from the presence of seeds.
2. Capture scene boundaries and nearby frames, especially Apocalypse page turns and the ending. Assert no recorded build/draw errors and no unexpected black frames; intentional fades/hard cuts need explicit exceptions.
3. Fault-inject upload rejection, interrupted writes, dead workers, missing/corrupt frames, and encoder failure. Verify failure propagation and preservation of prior output.
4. Run a small real capture/encode smoke test and probe its artifact. Schedule full-film renders separately to keep routine feedback fast.
5. Check audio channel lengths, finite samples, bounds, WAV headers, and repeatability. Use a full render periodically because a short prefix cannot exercise later cues.

Record browser/Node/FFmpeg versions, font availability, source hashes, and render parameters in the manifest. Add package commands for checks and tests. If this directory will be maintained as a repository, initialize version control deliberately and define generated-output ignore/retention rules; do not assume the existing `out/` files should be removed.

## R12 — Keep subtitles and visual timing consistent

**Sources:** `apocalypse/make-srt.js:14–21,45–49,58–69,72–98`; `apocalypse/js/main.js:8–17`; leaf specification objects.

The generator extracts metadata by executing entire leaf source files in a VM. That currently works because top-level code is mostly declarations, but introducing browser-dependent initialization would break subtitle generation. Timeline values also exist separately in the player, audio cues, leaf specs, and special subtitle cases.

Move timing/text metadata into a browser/Node-compatible data module. Reference it from the player and subtitle generator, and validate audio cue alignment where it should match. Retain intentional differences between word reveal and subtitle reading windows rather than forcing all cue timing to be identical.

The wrapping algorithm balances lines but does not guarantee its stated 46-character cap; two current generated lines exceed it. Validate maximum line length/count, positive cue durations, sorted/nonoverlapping timing, and bounds within film duration after the overlap-adjustment pass. The minimum-duration allocation subtracts the inter-cue gap afterward, so document or correct whether the stated minimum is before or after that subtraction. Treat reading-speed warnings as review items with a configurable strict mode, not an automatic reason to remove text.

**Acceptance:** both formatted and plain subtitles pass structural validation; deliberately dense/long text yields a clear report; editing a leaf boundary updates all linked timing or fails a consistency check.

## Suggested implementation sequence

1. **Protect work and make failure truthful:** R1–R4 plus utility preflight from R10. Establish invalid-input, incomplete-frame, and failed-encode tests immediately.
2. **Make the workflow repeatable:** R5, R7, and R8. Introduce isolated jobs, one film registry, shared capture behavior, and stage-level diagnostics.
3. **Remove measured blocking:** R6 and duplicate preview-frame elimination from R9. Establish before/after measurements and image/audio equivalence checks.
4. **Improve iteration and maintenance:** remaining R9 optimizations, R11 integration coverage, and R12 subtitle/data cleanup.

The first milestone is a recorder that either publishes a verified complete film or returns a clear failure while preserving the last valid output. Throughput tuning is most useful once that contract is reliable.
