---
name: ui-ux-pro-max-ui-styling
description: Retained official UI UX Pro Max UI implementation guidance.
license: MIT
upstream: https://github.com/nextlevelbuilder/ui-ux-pro-max-skill
commit: f23267105ad1f4ccd94af45d382584ad45b586f7
---

# UI styling guidance

Build accessible React interfaces with Tailwind and native semantic controls.
Use component primitives only where genuine reuse exists; avoid a heavyweight
component library when a native element and focused styles suffice.

- Start mobile-first and layer responsive styles.
- Give every control labels, visible focus, keyboard behavior and clear status.
- Use design tokens consistently; do not make status depend on color alone.
- Design loading, disabled, error, success, empty and retry states.
- Preserve entered form data after recoverable errors.
- Respect `prefers-reduced-motion`, use transform/opacity for nonessential
  motion, and ensure copy/long identifiers reflow at narrow widths and zoom.

The full official skill was read before this minimal project-local retention.
`DESIGN.md` overrides it where the two differ.
