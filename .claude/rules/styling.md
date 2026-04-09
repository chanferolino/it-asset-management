# Styling

## Design System: Glassmorphism

All UI components follow a glassmorphic design language — frosted-glass surfaces over a soft, light background with subtle color accents.

## Color Palette

| Token         | Hex       | RGB           | Usage                                      |
|---------------|-----------|---------------|---------------------------------------------|
| `red-500`     | `#ff0000` | `255, 0, 0`  | Focus rings, active indicators, alerts       |
| `red-600`     | `#c80000` | `200, 0, 0`  | Primary buttons, links, CTA                  |
| `red-700`     | `#b10000` | `177, 0, 0`  | Button hover                                 |
| `red-800`     | `#7b0000` | `123, 0, 0`  | Button active/pressed, secondary text accents |
| `red-900`     | `#300000` | `48, 0, 0`   | Headings, primary text                        |
| `white`       | `#ffffff` |               | Card backgrounds, input backgrounds           |
| `gray-bg`     | `#f5f5f5` |               | Page background                               |
| `gray-border` | `#e0e0e0` |               | Input borders, dividers                       |
| `gray-text`   | `#888888` |               | Subtitles, secondary text                     |
| `gray-label`  | `#555555` |               | Form labels                                   |
| `gray-muted`  | `#bbbbbb` |               | Placeholder text                              |

## Glass Surface

All card and panel surfaces use:

```css
background: rgba(255, 255, 255, 0.7);
backdrop-filter: blur(24px);
-webkit-backdrop-filter: blur(24px);
border-radius: 24px;
border: 1px solid rgba(255, 255, 255, 0.8);
box-shadow:
  0 8px 32px rgba(0, 0, 0, 0.08),
  0 2px 8px rgba(0, 0, 0, 0.04);
```

### Tailwind equivalents

- Glass card: `rounded-3xl border border-white/80 bg-white/70 shadow-xl shadow-black/[0.08] backdrop-blur-xl`
- Glass panel: `rounded-2xl border border-white/80 bg-white/70 backdrop-blur-xl`
- Glass input: `rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm`

## Background

- Base: `bg-[#f5f5f5]` flat light gray
- Decorative blurred shapes using soft reds (`bg-red-500/[0.06]` to `bg-red-500/[0.12]`) for depth
- Shapes use `rounded-full` and `blur-[100px]`

## Components

### Buttons

- **Primary:** `rounded-xl bg-[#c80000] text-white hover:bg-[#b10000] active:bg-[#7b0000] active:scale-[0.98] transition-all`
- **Secondary/Outline:** `rounded-xl border border-[#e0e0e0] bg-transparent text-[#7b0000] hover:bg-red-500/[0.04] hover:border-[#c80000] transition-all`

### Inputs

- `rounded-xl border border-[#e0e0e0] bg-white/60 backdrop-blur-sm`
- Focus: `focus:border-red-500 focus:ring-2 focus:ring-red-500/[0.08]`
- Labels: `text-xs font-semibold uppercase tracking-wide text-[#555555]`

### Navigation / Sidebar

- Glass nav: `border-b border-black/[0.06] bg-white/70 backdrop-blur-xl`
- Active item: `bg-red-500/[0.08] text-[#c80000] font-medium`
- Inactive item: `text-[#888888] hover:bg-red-500/[0.04] hover:text-[#7b0000] transition-all`

### Alerts / Errors

- `rounded-xl border border-red-500/20 bg-red-500/[0.06] text-[#c80000]`

## Typography

- Headings: `text-[#300000] font-bold tracking-tight`
- Body/subtitle: `text-[#888888]`
- Labels: `text-xs font-semibold uppercase tracking-wide text-[#555555]`
- No hard black (`#000`) — use `text-[#300000]` for darkest text

## General Rules

- Predominantly white UI — color is used sparingly for accents and actions
- Border radius: `rounded-3xl` (24px) for cards/panels, `rounded-xl` (12px) for inputs/buttons, `rounded-lg` (10px) for small elements
- Transitions: `transition-all duration-200` for color/background
- Use `cn()` from `@/lib/utils` for composing classes
