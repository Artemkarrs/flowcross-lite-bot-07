# Apple Minimal UI Design System for Figma

This repository includes a Figma-ready Apple-style minimal UI system and a live prototype in `src/components/apple/AppleDemo.tsx`.

## What you get
- Color palette and typography aligned with Apple Human Interface Guidelines
- Frosted glass/blur system (10/20/30/40 px)
- Subtle shadows and gradients (no glow/neon)
- Micro-interactions (0.2–0.3s) for hover, press, and appearance
- Component specs (Navbar, Segmented control, Cards, Inputs, Buttons, Dialogs)
- Prototyping guidelines and example flows

## Import tokens to Figma (Tokens Studio)
1. Open Figma and install the "Tokens Studio" plugin.
2. File → Plugins → Tokens Studio → Open.
3. In the plugin, Import → From file → select `design/tokens/apple.tokens.json`.
4. Enable the "Apple Light" theme. The plugin will create Color, Effect, and Typography tokens.
5. Sync tokens to Figma variables/styles if desired.

## Variables and blurs
- Blur presets: 10, 20, 30, 40 px
- Use frosted surfaces: fill: white (60–70% opacity), stroke: white (30–40%), effect: background blur = one of the presets
- Apply subtle drop shadows: 0 1px 3px (8%), 0 6px 20px (4%)

## Components and Auto Layout
- All components are specified for Auto Layout in Figma. See `design/components.md`.
- Spacing scale: 4, 8, 12, 16, 20, 24, 32
- Radius: 8, 10, 12, 16 px (defaults: 12 px)
- Typography: SF Pro Text/Display, with fallbacks to system UI

## Prototyping
- State transitions: 0.2–0.3 s, ease out
- Use Smart Animate for segmented control toggles and list item presses
- Use "Dissolve" or "Smart Animate" for dialog appearance (0.25 s)
- Demonstrate flows: Search → Card → Dialog → Back

## Live demo
- Open the app and switch to the "Apple UI" tab in the bottom navigation. The demo showcases:
  - Frosted top bar and search
  - Cards with subtle shadows
  - Segmented control
  - Dialog with blur(30px)
  - Micro-interactions on buttons and list items

## Notes
- Avoid neon/glow effects. Prefer neutral whites/grays and gentle depth.
- Keep information hierarchy strong with spacing and clear typography.