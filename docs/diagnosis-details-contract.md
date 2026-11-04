# Chat diagnosis details

Tutor messages in history and the stream `complete` event may include optional `diagnosisDetails`:

```json
{
  "tools": [{ "tool": "get_vm_status", "status": "ok", "durationMs": 12 }],
  "evidence": [
    {
      "id": "obs-001",
      "tool": "get_vm_status",
      "summary": "VM status and reported IPv4 addresses were collected.",
      "capturedAt": "2026-11-04T00:00:00.000Z"
    }
  ],
  "suggestions": [
    { "title": "Check service", "detail": "Review the service status." }
  ]
}
```

The view offers only expand/collapse. Suggestions are plain text; the interface never executes them. The client accepts the public wire limits of 1,000 characters for a title and 10,000 for detail, including redaction expansion. Older and fallback messages omit the field.
