# Custom Fonts

This directory should contain the custom font files for the application.

## Required Fonts

### Power Grotesk
- **Source**: https://power-type.com/power-grotesk/
- **Files needed**:
  - `PowerGrotesk-Regular.woff2` and `PowerGrotesk-Regular.woff`
  - `PowerGrotesk-Medium.woff2` and `PowerGrotesk-Medium.woff`
  - `PowerGrotesk-SemiBold.woff2` and `PowerGrotesk-SemiBold.woff`
  - `PowerGrotesk-Bold.woff2` and `PowerGrotesk-Bold.woff`

### BaseNeue
- **Source**: You'll need to obtain this font from your font provider
- **Files needed**:
  - `BaseNeue-Regular.woff2` and `BaseNeue-Regular.woff`
  - `BaseNeue-Medium.woff2` and `BaseNeue-Medium.woff`
  - `BaseNeue-SemiBold.woff2` and `BaseNeue-SemiBold.woff`
  - `BaseNeue-Bold.woff2` and `BaseNeue-Bold.woff`

## Installation

1. Download the font files from their respective sources
2. Convert to `.woff2` and `.woff` formats if needed (use online converters or font tools)
3. Place all font files in this directory (`public/fonts/`)
4. The application will automatically use these fonts once the files are in place

## Note

If font files are missing, the application will gracefully fall back to system fonts (Space Grotesk, etc.) without breaking functionality. The 404 errors in the console are harmless but can be eliminated by adding the font files.

