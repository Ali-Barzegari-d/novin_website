# Authorization matrix

| Role | Permitted operations |
|---|---|
| Customer | Own profile, own request list, opaque-token offer/receipt link, deletion request. |
| Expert | Read assigned/internal requests and record screening outcomes. |
| Operations | Search/export/assign requests, screen, create/version/revoke/resend offers, issue contract invoice links. |
| Finance | Read necessary requests, issue invoice links, confirm/reject bank transfers, issue refunds. |
| Content | Manage pages, case studies, client publication approval, team, and legal drafts. |
| Superadmin | All roles plus non-secret settings, staff access, audit/errors; MFA is mandatory for sensitive actions. |

The API applies deny-by-default RBAC. Deactivating staff revokes current sessions in one transaction. Customer APIs do not expose internal request state, assignments, notes, audit entries, attachments, or provider diagnostics.
