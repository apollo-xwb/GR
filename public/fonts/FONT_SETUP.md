# Font Setup Instructions

## Required Font Files

To eliminate 404 errors and display the custom fonts, you need to add the following font files to this directory (`public/fonts/`):

### Power Grotesk
**Source**: https://power-type.com/power-grotesk/

Required files:
- `PowerGrotesk-Regular.woff2`
- `PowerGrotesk-Medium.woff2`
- `PowerGrotesk-SemiBold.woff2`
- `PowerGrotesk-Bold.woff2`

### BaseNeue
**Source**: Obtain from your font provider

Required files:
- `BaseNeue-Regular.woff2`
- `BaseNeue-Medium.woff2`
- `BaseNeue-SemiBold.woff2`
- `BaseNeue-Bold.woff2`

## Installation Steps

1. **Download the fonts** from their respective sources
2. **Convert to WOFF2 format** if needed (use online converters like CloudConvert or font tools)
3. **Place all `.woff2` files** in this directory (`public/fonts/`)
4. **Restart your Next.js dev server** (`npm run dev`)
5. **Refresh your browser** - the fonts should now load without 404 errors

## Font Usage

- **Power Grotesk**: Used for headings (h1-h6), bold text, and large text sizes
- **BaseNeue**: Used for UI elements, body text, inputs, labels, and small text

## Troubleshooting

- If you still see 404 errors, verify the file names match exactly (case-sensitive)
- Ensure files are in `.woff2` format (not `.woff` or `.ttf`)
- Check that files are in `public/fonts/` directory (not `public/` or elsewhere)
- Restart the dev server after adding fonts

