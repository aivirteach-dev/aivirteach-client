# Tutor UI integration verification

The change reuses the existing SSE reply lifecycle on client base `f11d3ac`. It does not replace the transport or add backend actions.

## Components and contract

Official shadcn base-nova Message, Message Scroller, Trace, Input Group and Textarea registry code is copied into `components/ui`. Local imports and Lucide icons replace registry placeholders. `@shadcn/react` provides scroll behavior. Registry provenance is recorded in NOTICE, with its MIT license in `licenses/shadcn-ui-MIT.txt`.

The existing reply reducer owns diagnosing, answering, fallback, awaiting, saving and completed states. Only the Server's persisted `complete` event finalizes a tutor message. Interrupting the browser still means stopping reception, not stopping the Agent or its billing.

Tool events are limited to `get_vm_status` and `get_guest_agent_status`. The parser retains only recognized tool names, status and finite nonnegative duration. It does not expose raw payloads. Tool rows belong to the active request and disappear when it ends; the history API does not restore them.

## Reproduce local checks

```sh
npm test
WRANGLER_LOG_PATH=/tmp/maic-typecheck.log npm run typecheck
npm run lint
```

Final checks passed 273 tests across 42 files, the production build, 8 rendered HTML checks and typecheck. Lint reports 0 errors and 6 existing warnings. The baseline at `f11d3ac` passed 267 tests across 40 files. The feature adds behavior checks for public tool events, request-local display and multiline input with IME composition.

## Browser verification boundary

Luna used an isolated Chromium session with the actual client and latest Server `ChatController` at `b7d47a5`. A local Nest application serialized its SSE over real HTTP. The injected ChatService, history storage, authentication and quota were test substitutes. It emitted normal, fallback, interrupted and save-failure scenarios. This verifies controller-to-browser behavior; it does not verify a live model, VM, production database or deployment.

The latest Labs contract at `8ffb1c0` was checked separately. Four existing tests for SSE result validation, tool evidence, request cache and provider text deltas passed. Latest Server controller/service/agent-client tests passed 68 tests.

The browser run checked tool statuses, provisional text, saving before complete, scroll following, reading history without jumps, jump to latest, stop and refresh, unsaved errors, safe fallback, multiline input, message alignment and mobile layout. A separate mobile check covers the floating entry and send control.

## Scope

There are no feedback, attachment, tool approval, regeneration or sent-message editing actions in this change. Existing code copying and Markdown link validation remain in place. No backend code, schema, credentials or deployment configuration changes are required.
