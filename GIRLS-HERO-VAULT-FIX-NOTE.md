# Girls hero + Hidden Gallery correction

- Overview trip hero is now an explicit organiser control on paid trips.
- Evidence image action reads `Set as trip hero` rather than the ambiguous `Hero`.
- The existing Trip Appearance uploader remains the route for uploading a completely new hero image.
- Hidden Gallery remains a separate `album='vault'` data path and `btg-vault` storage bucket.
- Normal Evidence remains `album='evidence'` only.
- Hidden Gallery sensitive actions now re-check `has_active_vault_session` before proceeding.
- Current Ibiza 2026 production state at diagnosis: 1 Evidence item, 0 Vault items, `hero_storage_path` null.
