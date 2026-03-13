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

## Coding Principles & Patterns

### 1) Single Responsibility Principle
- **Each function/component/hook should do ONE thing well**
- Break large functions into smaller, focused pieces
- Example: Instead of a 90-line `useReviewHistory` hook, create:
  - Generic `useAsyncData` hook (handles all async patterns)
  - Specific `useReviewHistory` hook (only business logic)

### 2) Composition over Large Functions
- **Prefer composition of small, reusable pieces**
- Follow the "parent class" pattern: extract common logic into base utilities
- Example patterns to use:
  ```tsx
  // ✅ Good: Composed, single responsibility
  const useReviewHistory = () => useAsyncData({
    fetchFn: apiService.getUserReviewHistory,
    initialData: [],
  });

  // ❌ Avoid: Large function with mixed concerns
  const useReviewHistory = () => {
    // 50+ lines of useState, useEffect, error handling, etc.
  };
  ```

### 3) Fail Fast & Early Validation
- **Validate inputs and fail fast with clear error messages**
- Use TypeScript interfaces to catch errors at compile time
- Handle edge cases explicitly rather than letting them propagate
- Example:
  ```tsx
  // ✅ Good: Clear validation and early returns
  const fetchUserData = async (userId: string) => {
    if (!userId.trim()) {
      throw new Error('User ID is required');
    }
    // ... rest of function
  };
  ```

### 4) Reusable Hook Patterns
- **Always extract common async patterns into reusable hooks**
- Use the established `useAsyncData` pattern for all API calls
- Keep business-specific hooks thin and focused
- Standard signature:
  ```tsx
  const useSpecificData = (params) => useAsyncData({
    fetchFn: (signal) => apiService.getSpecificData(params, signal),
    autoFetch: shouldAutoFetch,
    initialData: defaultValue,
  });
  ```

### 5) Function Design Rules
- **Functions should be 10-20 lines maximum**
- **If longer, break into smaller functions or use composition**
- **Use descriptive names that explain the "what", not "how"**
- **One level of abstraction per function**

### 6) Error Handling Standards
- **Always handle errors at the appropriate level**
- **Use specific error types and messages**
- **Log errors in development, show user-friendly messages in production**
- **Pattern:**
  ```tsx
  try {
    const result = await operation();
    return result;
  } catch (error) {
    if (__DEV__) console.error('Detailed error:', error);
    throw new Error('User-friendly message');
  }
  ```

### 7) Type Safety Rules
- **No `any` types unless absolutely necessary**
- **Use interfaces for all data structures**
- **Prefer `unknown` over `any` when type is unclear**
- **Make invalid states unrepresentable through types**

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

### Architecture & Dependencies
- Don't hard-code new colors/font families/spacing if constants cover them.
- Don't move architecture around without user request.
- Don't add new dependencies unless needed and explicitly aligned with request.
- Don't remove existing UX patterns (tabs, token usage, reusable components) unless asked.

### Coding Anti-Patterns
- **Don't write functions longer than 20-30 lines** - break them down
- **Don't mix concerns in a single function** - separate business logic from infrastructure
- **Don't repeat async patterns** - always use `useAsyncData` or similar base patterns
- **Don't ignore TypeScript errors** - fix them or ask for guidance
- **Don't catch errors without handling them properly** - fail fast or propagate with context
- **Don't use `any` types** - use proper interfaces or `unknown`
- **Don't inline complex logic** - extract into named functions
- **Examples of what NOT to do:**
  ```tsx
  // ❌ Too long, mixed concerns
  const useReviewHistory = () => {
    // 80+ lines of state management, API calls, error handling
  };

  // ❌ Unclear function purpose  
  const handleData = (data: any) => { /* unclear what this does */ };

  // ❌ Ignored error handling
  const fetchData = async () => {
    try {
      return await api.getData();
    } catch (e) {
      // Silent failure - bad!
    }
  };
  ```

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

### Create a new data hook (RECOMMENDED PATTERN)

1. **Define specific fetch function:**
   ```tsx
   const fetchSpecificData = useMemo(
     () => (signal?: AbortSignal) => apiService.getSpecificData(params, signal),
     [params]
   );
   ```

2. **Use composition with `useAsyncData`:**
   ```tsx
   export const useSpecificData = (params) => {
     const { data, isLoading, error, refetch, isRefetching } = useAsyncData({
       fetchFn: fetchSpecificData,
       initialData: defaultValue,
       autoFetch: shouldAutoFetch,
     });
     
     return { data, isLoading, error, refetch, isRefetching };
   };
   ```

3. **Keep business logic separate and focused**
4. **Follow single responsibility principle**

## Quality Bar

A change is complete when it is:

### Functional Requirements
- **Correct** for the requested behavior
- **Consistent** with existing code style
- **Token-driven** for styling
- **Type-safe** and diagnostics-clean

### Code Quality Standards  
- **Single Responsibility**: Each function does one thing well
- **Composable**: Uses established patterns like `useAsyncData`
- **Readable**: Functions are 10-20 lines, with descriptive names
- **Resilient**: Proper error handling with fail-fast validation
- **Type-Safe**: No `any` types, proper interfaces used
- **Maintainable**: Common patterns extracted, no code duplication

### Code Review Checklist
- [ ] Functions are focused and single-purpose
- [ ] Common async patterns use `useAsyncData` base hook
- [ ] Error handling is explicit and user-friendly
- [ ] TypeScript interfaces are defined for all data structures
- [ ] No functions exceed 30 lines without justification
- [ ] Business logic is separated from infrastructure concerns
- [ ] All edge cases are handled explicitly
