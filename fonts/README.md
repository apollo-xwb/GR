# Custom Fonts Directory

Place your custom font files here. This directory is at the root level (same level as `app/` and `public/`).

## Required Font Files

### Power Grotesk
**Source**: https://power-type.com/power-grotesk/

Required files (`.woff2` format):
- `PowerGrotesk-Regular.woff2`
- `PowerGrotesk-Medium.woff2`
- `PowerGrotesk-SemiBold.woff2`
- `PowerGrotesk-Bold.woff2`

### BaseNeue
**Source**: Obtain from your font provider

Required files (`.woff2` format):
- `BaseNeue-Regular.woff2`
- `BaseNeue-Medium.woff2`
- `BaseNeue-SemiBold.woff2`
- `BaseNeue-Bold.woff2`

## Installation

1. Download the fonts from their sources
2. Convert to `.woff2` format if needed
3. Place all `.woff2` files directly in this `fonts/` directory
4. Restart your Next.js dev server
5. The fonts will automatically load via `next/font/local` in `app/layout.tsx`

## Note

- Files must be in `.woff2` format (not `.woff` or `.ttf`)
- File names must match exactly (case-sensitive)
- After adding fonts, restart the dev server for changes to take effect

