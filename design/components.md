# Components (Figma Spec)

All components are designed for Auto Layout. Use the tokenized styles from `design/tokens/apple.tokens.json`.

## Navbar (Frosted)
- Frame: Auto Layout horizontal, padding 12–16
- Background: white 60–70% opacity
- Stroke: white 30–40%
- Effect: Background blur 20 px
- Shadow: soft

## Segmented Control
- Container: Auto Layout horizontal, padding 4, radius 12, fill gray/100, stroke border
- Item: padding 6×10, radius 10
- Active: fill white, shadow soft
- Motion: Smart Animate 200 ms ease-out

## Card
- Fill: white 90%
- Stroke: border
- Radius: 16
- Shadow: soft
- Padding: 16–20

## Button (Secondary)
- Fill: mutedBg → hover: white
- Stroke: border
- Radius: 12
- Motion: 200 ms scale to 0.98 on press

## Input
- Fill: white 70% → focus: white
- Stroke: border → focus: accent
- Radius: 12

## Dialog
- Surface: frosted glass, blur 30 px
- Enter: Dissolve or Smart Animate 250 ms

## List Item
- Height: 44–52 px, horizontal padding 12–16
- Hover: mutedBg 60%
- Right affordance: Chevron