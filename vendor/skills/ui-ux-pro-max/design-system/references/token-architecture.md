# Token architecture

Design values form three layers: primitives (raw colors, spacing, type, radius
and shadow), semantics (background, foreground, primary, muted, destructive,
section spacing), and components (button, input and card properties). A
component token always resolves through the semantic layer to a primitive.

Name tokens as `--category-item-variant-state`. Keep the 4 px spacing base and
document the purpose of every semantic/component token. This retained summary
is derived from the official MIT UI UX Pro Max source recorded in
`docs/SKILL_PROVENANCE.md`.
