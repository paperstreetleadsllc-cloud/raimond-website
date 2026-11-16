# Agents

No agents are implemented. This is deliberate: the directive requires the core audit to work first.

The Website Audit Specialist's responsibilities are currently carried out by deterministic code in `src/lib/audit`, which is the foundation the agent will call rather than replace.

When agents are built (Phase 6), each will have a definition record covering responsibility, inputs, outputs, tool permissions, retry and budget limits, and approval requirements, and each run will be logged. External messages, publishing, spending, and changes to customer websites will always pass through an approval queue.
