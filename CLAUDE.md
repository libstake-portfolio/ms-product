# Claude Code Working Principles

> The overriding principles that take precedence over all of Claude Code's work. Always follow them before touching code or docs.

---

## 0. Working principles

> Behavioral guidelines to reduce common LLM coding mistakes. **Prioritize care over speed.** Use judgment on trivial tasks.

### 0.1 Think before coding
Don't assume. Don't hide confusion. Surface trade-offs.

- State assumptions explicitly. When uncertain, ask.
- When an interpretation can go several ways, don't quietly pick one — present the options.
- If there's a simpler approach, say so. Push back when warranted.
- When something is unclear, stop. Pinpoint what's confusing and ask.

### 0.2 Simplicity first
The minimum code that solves the problem. No speculative code.

- Don't add functionality beyond what was requested.
- Don't abstract code that's used only once.
- Don't add error handling for scenarios that cannot happen.
- If you wrote 200 lines where 50 would do, rewrite it.

Ask yourself: "Would a senior engineer call this overkill?" If so, simplify.

### 0.3 Stay faithful to structure and principles (avoid ad hoc)
Simplicity does not mean a stopgap.

- Follow existing architectural boundaries, layers, design patterns, and naming/coding conventions.
- Instead of a quick detour or a patch, choose the consistent approach that fits the context the code lives in.
- If a request conflicts with existing principles, don't quietly work around it — surface the conflict.

### 0.4 Surgical changes
Touch only what's needed. Clean up only the traces you made.

When editing existing code:
- Don't arbitrarily "improve" adjacent code, comments, or formatting.
- Don't refactor what isn't broken.
- Follow the existing style even if it differs from yours.
- If you find unrelated dead code, mention it rather than deleting it.

When a change creates orphaned code:
- Remove imports/variables/functions that your change left unused.
- Don't remove pre-existing dead code you weren't asked to touch.

Criterion: every changed line must be directly traceable to the user's request.

### 0.5 Goal-driven execution
Define the success criteria. Iterate until they're confirmed.

Turn the task into a verifiable goal:
- "Add validation" → "Write a test for invalid input first, then make it pass"
- "Fix the bug" → "Write a test that reproduces the bug first, then make it pass"
- "Refactor X" → "Confirm the tests pass before and after the change"

For a multi-step task, lay out a brief plan:
```
1. [step] → confirm: [check]
2. [step] → confirm: [check]
3. [step] → confirm: [check]
```

Clear success criteria enable independent iteration. Weak criteria ("make it work") invite endless re-checking.

### 0.6 Check docs before working (docs signpost)
Before touching code, look at `docs/` first.

- The entry point is [`docs/CLAUDE.md`](./docs/CLAUDE.md) — the docs root index.
- Each area under `docs/` has its own SSOT.
- Process docs (process: commits, dependencies, releases, etc.), when created, go under `docs/process/`, with that area's index at `docs/process/CLAUDE.md` (not yet created — create when needed).
- If a doc conflicts with the request or the code, don't quietly work around it — surface the conflict (§0.1).

### 0.7 Self-contained comments
A comment is self-contained and does not describe anything beyond the code it annotates.

- Never use names, labels, etc. that were arbitrarily set during a conversation with the user.
- Don't describe a comment by referencing things handled outside the commented section.
- Don't write comments that instruct the user or that exist to aid understanding through dialogue. A comment is not a Q&A section.
- Don't put implementation details or code into comments. The code itself is the comment; limit comments to aiding understanding.
- Avoid verbose comments as much as possible. Keep them short and concise.

Criterion: in another session, is the comment fully understandable on its own? And was it written in a non-conversational way?

### 0.8 Annotate side-effects with `! -`
Behavior a function causes that a caller wouldn't expect must be warned about conspicuously.

- Put the side-effect note on its own line in the comment, in the form `! - <description>`. Don't mix it with the regular description.
- Example:
```
/**
 * Reserves stock for the given order.
 *
 * ! - Also decrements the cached availability counter; a read right after
 *     this call sees the lowered value.
 */
```

Criterion: does calling this function produce side-effects, and if so, are the places affected by those side-effects handled appropriately?

### 0.9 Documentation rules
Docs, like code, follow single-source, self-containment, and generalization.

- **No code in docs**: aside from template code, don't write anything that belongs to code — code, variable/constant names, DB table and column names, etc. The SSOT is the code itself, not the doc. A doc describes only direction.
- **Single source of truth (SSOT)**: don't scatter the same content across multiple docs. Designate one doc as authoritative; the rest point to it with a section link (`[title](path#section)`) only. Even when moving a summary over, keep it to a single sentence.
- **Stay in scope**: don't describe content outside the topic the doc covers. When it touches another topic, delegate to the adjacent doc and leave only a link. If no adjacent doc exists, create one.
- **Avoid ad hoc narration**: don't put time-pinned status reports ("Current state (YYYY-MM-DD): X is implemented…"), timing notes for undecided decisions, throwaway markers, or "first draft"-style meta-notes in the body. For what's decided, fold only the outcome into the body; for what's undecided, write only the decision itself, concisely, and only when it's worth recording. Don't write sentences that will become meaningless over time in the first place.
- **Generalization**: prefer expressions not tied to a specific implementation. When an example is needed, show the general form with placeholders (`<svc>`, `<Agg>`, `<feature>`, `<broker>`), and put a concrete example in a separate example section only when one is truly required.
- **Prefer reference links**: instead of copy-pasting "same thing here too," link to the authoritative doc's section. The link text reveals the question that section answers.
- **No stateful content**: don't write plans, milestones, TODOs, future plans, etc. in general docs. Stateful content should be managed only in dedicated docs when needed, e.g. `backlogs.md`, `plans.md`, `decisions.md`.
- **Cascading changes**: after finishing, check whether your doc edit conflicts with existing docs, and cascade the follow-up work accordingly.
- **No indirect context**: when a non-technical reason A leads to conclusion B, the narration "B happened because of A" is forbidden. Write only the conclusion.

#### Pre-change checks
- Is the same fact stated differently in another doc/section? (Contradiction check — resolve immediately when found.)
- If what you're changing/adding overlaps another source of truth, update the original only and link here.
- Is the new doc/section an orphan referenced from nowhere? (Reference it from at least one place.)

Criterion: if you removed this doc, is it clear where the topic would go? Does the body stay valid as time passes? If fixing one doc forces fixing another, that's a sign the single source of truth is broken.

### 0.10 Do not modify this document (Working principles)
Unless an explicit policy change is made by the user, do not modify any content within this document. This document is the overriding principle.
