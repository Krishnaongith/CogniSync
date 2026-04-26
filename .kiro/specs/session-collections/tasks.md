# Implementation Plan: Session Collections

## Overview

This plan implements the Session Collections feature incrementally: data layer first (types, shared DB, stores), then UI components, then integration/wiring. Each task builds on the previous, and property-based tests are placed close to the code they validate. All code is TypeScript/React, tests use vitest + fast-check.

## Tasks

- [x] 1. Define Collection type and update Session type
  - Add `Collection` interface to `cogni-sync/src/types/index.ts` with fields: `id` (string), `name` (string), `createdAt` (string), `updatedAt` (string)
  - Add optional `collectionId?: string | null` field to the existing `Session` interface
  - _Requirements: 7.3, 4.1, 4.2_

- [x] 2. Create shared openDB module and refactor useSessionStore
  - [x] 2.1 Create `cogni-sync/src/db/openDB.ts` shared database module
    - Implement `openDB()` that opens `cognisync_db` at version 2
    - Handle v0→v1 upgrade: create `sessions` store with `id` keyPath, `savedAt` and `fileName` indexes
    - Handle v1→v2 upgrade: create `collections` store with `id` keyPath and `name` index
    - _Requirements: 7.1, 7.4_

  - [x] 2.2 Refactor `cogni-sync/src/hooks/useSessionStore.ts` to use shared `openDB`
    - Replace the local `openDB` function with an import from `cogni-sync/src/db/openDB.ts`
    - Add `updateSession(id, updates)` method to `SessionStoreAPI` for updating `collectionId` on a session
    - Ensure all existing functionality (save, get, getAll, delete) continues to work with the v2 database
    - _Requirements: 4.3, 4.4, 5.1, 5.2_

- [x] 3. Implement useCollectionStore hook with pure helpers
  - [x] 3.1 Create `cogni-sync/src/hooks/useCollectionStore.ts`
    - Export pure helper functions: `validateCollectionName`, `isNameDuplicate`, `sortCollectionsByUpdatedAt`, `getSessionsForCollection`
    - `validateCollectionName(name)`: returns error string if empty/whitespace-only, `null` if valid
    - `isNameDuplicate(name, existing, excludeId?)`: case-insensitive duplicate check
    - `sortCollectionsByUpdatedAt(collections)`: sort descending by `updatedAt`
    - `getSessionsForCollection(sessions, collectionId)`: filter by `collectionId`, sort by `savedAt` descending
    - Implement `CollectionStoreAPI`: `createCollection`, `renameCollection`, `deleteCollection`, `getAllCollections`, `getCollection`
    - `createCollection`: validate name, check duplicates, persist to IndexedDB (or localStorage fallback)
    - `renameCollection`: validate new name, check duplicates (excluding self), update name and `updatedAt`
    - `deleteCollection`: remove collection record, cascade `collectionId = null` on affected sessions in same transaction
    - `getAllCollections`: return all collections from IndexedDB or localStorage
    - localStorage fallback using key `cognisync_collections`
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 2.1, 2.2, 2.3, 3.1, 3.2, 6.1, 6.3, 7.1, 7.2_

  - [x] 3.2 Write property test: Collection creation produces a valid record (Property 1)
    - **Property 1: Collection creation produces a valid record**
    - For any valid non-empty, non-whitespace name, a created collection has non-empty `id`, `name` equal to input, and `createdAt === updatedAt` as valid ISO timestamps
    - Test file: `cogni-sync/src/__tests__/useCollectionStore.test.ts`
    - `// Feature: session-collections, Property 1: Collection creation produces a valid record`
    - numRuns: 100
    - **Validates: Requirements 1.1, 7.3**

  - [x] 3.3 Write property test: Whitespace-only names are rejected (Property 2)
    - **Property 2: Whitespace-only names are rejected**
    - For any string of only whitespace characters, `validateCollectionName` returns a non-null error
    - Test file: `cogni-sync/src/__tests__/useCollectionStore.test.ts`
    - `// Feature: session-collections, Property 2: Whitespace-only names are rejected`
    - numRuns: 100
    - **Validates: Requirements 1.2, 2.2**

  - [x] 3.4 Write property test: Case-insensitive duplicate name detection (Property 3)
    - **Property 3: Case-insensitive duplicate name detection**
    - For any name and case variation, `isNameDuplicate` returns `true`; with `excludeId` matching the collection's own id, returns `false`
    - Test file: `cogni-sync/src/__tests__/useCollectionStore.test.ts`
    - `// Feature: session-collections, Property 3: Case-insensitive duplicate name detection`
    - numRuns: 100
    - **Validates: Requirements 1.3, 2.3**

  - [x] 3.5 Write property test: Rename preserves identity and updates timestamp (Property 4)
    - **Property 4: Rename preserves identity and updates timestamp**
    - For any collection and valid new name, rename preserves `id` and `createdAt`, updates `name`, and `updatedAt >= original updatedAt`
    - Test file: `cogni-sync/src/__tests__/useCollectionStore.test.ts`
    - `// Feature: session-collections, Property 4: Rename preserves identity and updates timestamp`
    - numRuns: 100
    - **Validates: Requirements 2.1**

  - [x] 3.6 Write property test: Collection deletion removes only the target (Property 5)
    - **Property 5: Collection deletion removes only the target**
    - For any list of collections and a target, deletion removes only the target and leaves others unchanged
    - Test file: `cogni-sync/src/__tests__/useCollectionStore.test.ts`
    - `// Feature: session-collections, Property 5: Collection deletion removes only the target`
    - numRuns: 100
    - **Validates: Requirements 3.1**

  - [x] 3.7 Write property test: Deletion cascade nullifies session collectionIds (Property 6)
    - **Property 6: Deletion cascade nullifies session collectionIds**
    - For any sessions with various `collectionId` values, cascade sets matching sessions to `null` and leaves others unchanged
    - Test file: `cogni-sync/src/__tests__/useCollectionStore.test.ts`
    - `// Feature: session-collections, Property 6: Deletion cascade nullifies session collectionIds`
    - numRuns: 100
    - **Validates: Requirements 3.2**

  - [x] 3.8 Write property test: Session collectionId assignment (Property 7)
    - **Property 7: Session collectionId assignment**
    - For any session and target `collectionId` (including `null`), updating produces a session with the target `collectionId` and all other fields unchanged
    - Test file: `cogni-sync/src/__tests__/useCollectionStore.test.ts`
    - `// Feature: session-collections, Property 7: Session collectionId assignment`
    - numRuns: 100
    - **Validates: Requirements 4.1, 4.3, 4.4, 5.1, 5.2**

  - [x] 3.9 Write property test: Collections sorted by updatedAt descending (Property 8)
    - **Property 8: Collections sorted by updatedAt descending**
    - For any list of collections, `sortCollectionsByUpdatedAt` returns them in descending `updatedAt` order
    - Test file: `cogni-sync/src/__tests__/useCollectionStore.test.ts`
    - `// Feature: session-collections, Property 8: Collections sorted by updatedAt descending`
    - numRuns: 100
    - **Validates: Requirements 6.1**

  - [x] 3.10 Write property test: getSessionsForCollection returns correct filtered and sorted results (Property 9)
    - **Property 9: getSessionsForCollection returns correct filtered and sorted results**
    - For any sessions and `collectionId`, returns only matching sessions sorted by `savedAt` descending, with correct count
    - Test file: `cogni-sync/src/__tests__/useCollectionStore.test.ts`
    - `// Feature: session-collections, Property 9: getSessionsForCollection returns correct filtered and sorted results`
    - numRuns: 100
    - **Validates: Requirements 6.3, 6.4, 10.2**

- [x] 4. Checkpoint — Ensure all data layer tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 5. Build CollectionPicker component
  - Create `cogni-sync/src/components/CollectionPicker.tsx`
  - Dropdown/popover listing all collections plus "Uncategorized" option
  - "Create new collection" inline input at the top
  - Inline validation errors for empty name and duplicate name
  - On inline creation: create collection via `useCollectionStore`, auto-select the new collection
  - Follow existing glassmorphism dark-first design system
  - _Requirements: 9.1, 9.2, 9.3, 4.1, 4.2_

- [x] 6. Build CollectionsView and CollectionDetail components
  - [x] 6.1 Create `cogni-sync/src/components/CollectionsView.tsx`
    - Display all user-created collections sorted by `updatedAt` descending
    - Show session count badge next to each collection name
    - Show "Uncategorized" section at the bottom when uncategorized sessions exist
    - "New Collection" button with inline name input
    - Empty state when no collections exist
    - Empty-state message when a collection has zero sessions
    - Clicking a collection navigates to CollectionDetail
    - Follow existing glassmorphism dark-first design system
    - _Requirements: 6.1, 6.2, 6.4, 6.5, 8.3_

  - [x] 6.2 Create `cogni-sync/src/components/CollectionDetail.tsx`
    - Display sessions belonging to a specific collection, sorted by `savedAt` descending
    - Header with editable collection name (inline rename), session count, back button
    - Each session row: file name, date, actions (restore, move, delete)
    - "Move to…" action opens CollectionPicker
    - Empty state message when collection has no sessions
    - Delete collection button with confirmation dialog
    - _Requirements: 2.1, 3.1, 3.3, 5.1, 5.2, 5.3, 6.3, 6.5_

- [x] 7. Create CollectionsPage wrapper and integrate routing
  - [x] 7.1 Create `cogni-sync/src/pages/CollectionsPage.tsx`
    - Page wrapper that loads collections and sessions via `useCollectionStore` and `useSessionStore`
    - Manage local state for selected collection
    - Render `CollectionsView` or `CollectionDetail` based on route params
    - _Requirements: 8.2_

  - [x] 7.2 Update `cogni-sync/src/router.tsx` to add collection routes
    - Add `{ path: 'collections', element: <CollectionsPage /> }` to `/app` children
    - Add `{ path: 'collections/:collectionId', element: <CollectionsPage /> }` to `/app` children
    - _Requirements: 8.2_

  - [x] 7.3 Update `cogni-sync/src/components/AppHeader.tsx` to add Collections tab
    - Add `FolderIcon` SVG component
    - Add `{ id: 'collections', label: 'Collections', path: '/app/collections', end: false, Icon: FolderIcon }` to the `TABS` array
    - _Requirements: 8.1_

- [x] 8. Integrate CollectionPicker into SimplifyView save flow
  - Update `cogni-sync/src/pages/SimplifyView.tsx` to show CollectionPicker next to the "Save Session" button
  - When saving, pass the selected `collectionId` to the session being saved
  - Update `saveCurrentSession` in `cogni-sync/src/context/AppContext.tsx` to accept and store `collectionId`
  - Default to `null` (Uncategorized) when no collection is selected
  - _Requirements: 4.1, 4.2_

- [x] 9. Integrate CollectionPicker into HistoryView for session reassignment
  - Update `cogni-sync/src/pages/HistoryView.tsx` to allow assigning/moving sessions to collections via CollectionPicker
  - When a session is assigned to a collection, update the session's `collectionId` and the collection's `updatedAt`
  - _Requirements: 4.3, 4.4, 5.3_

- [x] 10. Final checkpoint — Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties from the design document
- Unit tests validate specific examples and edge cases
- All property tests use fast-check with numRuns: 100 and include the comment `// Feature: session-collections, Property N: <property_text>`
