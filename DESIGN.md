# DESIGN.md — เครื่องมือเงินไทย

Subject: free Thai personal-finance calculators. Audience: salaried and freelance Thais who search a concrete
question ("เงินเดือน 30,000 รับสุทธิเท่าไร"). Job of every page: answer that question in one glance.

## Concept
Printed paper that Thai people already trust: the transfer slip, the till receipt, the tax form filled with a
ballpoint pen. Inputs are blanks to fill in; results are a slip that prints out. No cards, no icon chips.

## Color (roles)
| Token | Light | Dark | Role |
|---|---|---|---|
| --ground | #E9EEEB | #0F1512 | page background (grey-green paper) |
| --paper | #FFFFFF | #17201C | slip and form surfaces |
| --ink | #16201C | #E8EFEB | text, rules that matter |
| --mut | #4B5951 | #A3B1AA | secondary text (>= 4.5:1 on ground) |
| --rule | #B9C4BE | #34423B | hairlines, dotted leaders |
| --blue | #1D3CB8 | #9DB2FF | ballpoint ink: typed numbers, links, focus |
| --hl | #FFE45C | #F2D24B | highlighter: the single key figure on a slip (only boldness on the page) |

## Type
- Display: Pridi 600 (Thai serif with character) for h1/h2 and the wordmark.
- Body: IBM Plex Sans Thai 400/500/600, 17px, line-height 1.75, measure <= 66ch.
- Figures: IBM Plex Mono 500 on slips and form blanks only (receipt convention, tabular).
- Scale: 15 / 17 / 20 / 26 / clamp(2rem,5vw,3.4rem). Sentence case, no all-caps labels.

## Layout
- Left aligned. Max width 1080. Tool page: form blank (left) + slip (right, sticky); stacks on mobile.
- Home: hero asks the question and holds a live slip. Tools listed as a table of contents with dotted
  leaders (grouped by task), not as cards.

## Shape and depth
- One radius: 3px on controls. Slip: flat, torn bottom edge. No drop shadows.

## Components
- Blank: label above, underline input, unit at right, typed value in --blue, focus adds highlighter wash.
- Slip: header line, rows (label ····· value), key figure highlighted, note, footer disclaimer, copy button.
- TOC row: name ····· short description; hover underlines name in --blue.
- Link: --blue, underlined. Focus: 3px --blue outline.

## Motion
One moment: the home slip "prints" in once on load. Everything else static. Respects prefers-reduced-motion.

## Accessibility floor
AA contrast on every pair (checked in check.js), 48px controls, labels bound to inputs, live region on the slip,
visible focus, works at 320px.
