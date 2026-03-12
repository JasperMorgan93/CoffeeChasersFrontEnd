# AGENTS.md

Guidance for AI coding agents (including Copilot) working in this repository.

## Project Snapshot

- Framework: Expo + React Native + Expo Router (file-based routing)
- Language: TypeScript
- Navigation: Tabs inside `app/(tabs)/_layout.tsx`, root stack in `app/_layout.tsx`
- Fonts: Inter via `@expo-google-fonts/inter`, loaded in `app/_layout.tsx`
- Design tokens:
  - Colors: `constants/colors.ts`
  - Typography + spacing: `constants/typography.ts`

## Primary Goal for Changes

Make small, focused, production-safe edits that preserve current architecture and style.

## Repository Conventions

### 1) Routing and screens

- Add tab screens under `app/(tabs)/`.
- Register new tabs in `app/(tabs)/_layout.tsx` with:
  - `name` matching file name
  - `title`
  - `tabBarIcon` using `Ionicons`
- Keep `+not-found.tsx` as a non-tab route.
- Do **not** add `not-found` as a tab screen.

### 2) Styling

- Use `StyleSheet.create` in each component/screen.
- Reuse tokens from constants; avoid hard-coded color/font/spacing values where tokens exist.
- Prefer these tokens:
  - `COLORS.background`, `COLORS.textPrimary`, `COLORS.textPrimaryMuted`
  - `TYPOGRAPHY.fontFamily.*`, `TYPOGRAPHY.fontSize.*`, `TYPOGRAPHY.spacing.*`

### 3) Typography and fonts

- Font loading belongs in `app/_layout.tsx` via `useFonts`.
- Keep font keys in sync between loaded font names and `TYPOGRAPHY.fontFamily` values.
- If adding a new font weight/style, update both:
  - `useFonts({...})` in `app/_layout.tsx`
  - `constants/typography.ts`

### 4) Components

- Shared/reusable UI goes in `components/`.
- Keep components simple, typed, and token-based.
- Existing reusable components to leverage:
  - `components/AppButton.tsx`
  - `components/MapPlaceholder.tsx`

### 5) Home map strategy

- `MapPlaceholder` is intentionally temporary for future Mapbox integration.
- When Mapbox is introduced, replace internals of `MapPlaceholder` first to minimize blast radius.
- Keep public usage from `app/(tabs)/index.tsx` stable when possible.

## Agent Workflow Expectations

### Before editing

- Read target files fully before patching.
- Check for recent user edits and preserve them.
- Avoid unrelated refactors.
- Check for best practise changes and confirm those first.

### During editing

- Make the smallest viable change set.
- Keep naming and formatting consistent with surrounding code.
- Maintain TypeScript types (no `any` unless unavoidable).

### After editing

- Run diagnostics for changed files.
- If any error is introduced, fix it before finishing.
- Don't cycle through errors and fixes if they persist. Confer with the user about the intended change and possible issues.

## What to Avoid

- Don’t hard-code new colors/font families/spacing if constants cover them.
- Don’t move architecture around without user request.
- Don’t add new dependencies unless needed and explicitly aligned with request.
- Don’t remove existing UX patterns (tabs, token usage, reusable components) unless asked.

## Common Tasks Cheat Sheet

### Add a new tab screen

1. Create `app/(tabs)/<name>.tsx`
2. Add `<Tabs.Screen name="<name>" options={{ title, tabBarIcon }} />` in `app/(tabs)/_layout.tsx`
3. Ensure styles use constants
4. Validate changed files for errors

### Add reusable UI element

1. Create/update component in `components/`
2. Type props clearly
3. Use constants for colors/typography/spacing
4. Reuse in screens; avoid duplicate styles

### Add/adjust fonts

1. Install dependency (if needed)
2. Load font in `app/_layout.tsx`
3. Update `constants/typography.ts` mappings
4. Validate styles and diagnostics

## Quality Bar

A change is complete when it is:
- Correct for the requested behavior
- Consistent with existing code style
- Token-driven for styling
- Type-safe and diagnostics-clean
