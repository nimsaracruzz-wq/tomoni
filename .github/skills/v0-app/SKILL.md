---
name: v0-app
description: "Generate and adapt frontend UI from v0.app prompts. Use when the user asks to create UI with v0, translate a v0.app design into this project, or refine v0-generated components while preserving the existing stack and design system."
argument-hint: "Describe the UI or page to generate from v0.app"
user-invocable: true
---

# v0.app UI generation

Use this skill for v0.app-inspired UI work in the TOMONI website and admin portal.

## When to use

- The user asks to generate UI from a v0.app prompt.
- The user provides a v0.app component, screenshot, or code and asks to adapt it.
- The user asks to redesign a page using a v0-style interface.

## Procedure

1. Inspect the existing page, component structure, routes, assets, and shared styles before editing.
2. Preserve the project's existing Next.js, React, TypeScript, Tailwind, and API patterns.
3. Translate the requested v0 design into maintainable project components rather than adding an isolated demo page.
4. Reuse TOMONI branding, logo assets, colors, typography, responsive behavior, accessibility patterns, and existing data APIs.
5. Wire every interactive control to real behavior or clearly expose an actionable empty/error state; do not leave placeholder buttons.
6. Keep user-facing copy concise and use semantic HTML, labels, keyboard focus, and mobile layouts.
7. Validate the changed files, run the smallest relevant test or build, and inspect the result in the browser when the change affects UI.

## Implementation rules

- Prefer existing components and helpers over duplicating v0-generated code.
- Do not add a dependency solely because v0 output uses it; use installed libraries or native React/CSS where practical.
- Keep server actions, authentication, and API contracts unchanged unless the requested UI requires a coordinated backend change.
- Never copy secrets, tokens, or private v0 project data into the repository.
- Treat v0 output as a visual starting point and review it for accessibility, type safety, responsive behavior, and project conventions before using it.
