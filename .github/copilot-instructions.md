# Copilot coding-agent runtime note

When launching a sub-agent via the `task` tool, do **not** use `reasoning_effort: max`.
Use `reasoning_effort: xhigh` (or lower), or set a model that supports `max`.

Prefer running straightforward repo commands directly instead of spawning a sub-agent.
