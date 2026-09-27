# MailBatch for Gmail V1.6

Start with `START_HERE.txt`, or open **Guide** inside MailBatch for the full English/Vietnamese walkthrough.

## Existing MailBatch user
Do **not** remove your configured extension. Extract V1.6, run `UPDATE_EXISTING.bat`, select the folder Chrome is already loading, then Reload MailBatch in `chrome://extensions` and refresh Gmail. The updater preserves the existing OAuth Client ID and extension identity.

## New in V1.6

- **Ctrl+K hyperlinks:** highlight text in the message editor, press `Ctrl+K`, paste a web/email/phone link, then Apply. The toolbar also includes a link button. Existing links can be edited or removed from the same dialog.
- Global **EN / VI** interface selector. The selected language is remembered and applies across the MailBatch UI.
- The floating **MailBatch** launcher chip can be dragged anywhere inside the Gmail viewport. Its position is remembered. Clicking it still opens the same right-side panel.
- **Cloud Setup** was redesigned as a step-by-step setup guide with its own English/Vietnamese switch, setup cards, clearer `/exec` URL guidance, secret guidance, Test flow, and usage/safety notes.
- The in-app **Guide** remains bilingual and now explains the language selector and movable launcher.

## Existing V1.4 functionality retained
- Personalized `{{keywords}}`
- Rich-text email formatting
- Banner image
- Common attachments and per-recipient attachments
- Gmail Draft creation
- Local scheduler
- Cloud scheduler using your own Google Apps Script so scheduled sends can continue while the computer is off

Cloud scheduling is **not** Gmail's native Scheduled folder. MailBatch creates Gmail Drafts and your own Apps Script sends those draft IDs later.

See `docs/README_EN.md` and `docs/README_VI.md` for detailed instructions.
