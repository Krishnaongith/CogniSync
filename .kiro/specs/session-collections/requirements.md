# Requirements Document

## Introduction

The Session Collections feature adds an organizational layer to CogniSync that lets students group their saved sessions into named collections — one per subject, course, or topic. Instead of scrolling through a flat list of sessions in the History view, students can browse by collection (e.g., "Physics 101", "Organic Chemistry"), quickly find the notes they need, and keep their study resources tidy throughout a semester. Collections are persisted in IndexedDB alongside sessions and integrate into the existing app navigation.

## Glossary

- **Collection**: A named group of sessions created by the user, stored in IndexedDB. Each Collection has a unique id, a user-defined name, a creation timestamp, and an update timestamp.
- **Session**: An existing CogniSync entity representing a saved document processing result, identified by a unique id and stored in IndexedDB.
- **Collection_Store**: The IndexedDB object store responsible for persisting Collection records.
- **Session_Store**: The existing IndexedDB object store that persists Session records.
- **Collections_View**: The UI view that displays all collections and allows navigation into individual collections.
- **Uncategorized_Collection**: A virtual, non-deletable grouping that contains all sessions not assigned to any user-created Collection.
- **Collection_Picker**: A UI component that allows the user to select or create a Collection when saving a session or from the History view.

## Requirements

### Requirement 1: Create a Collection

**User Story:** As a student, I want to create a named collection, so that I can organize my sessions by subject or topic.

#### Acceptance Criteria

1. WHEN the user submits a new collection name, THE Collection_Store SHALL create a new Collection record with a unique id, the provided name, and the current timestamp as both createdAt and updatedAt.
2. WHEN the user submits a collection name that is empty or contains only whitespace, THE Collection_Store SHALL reject the creation and THE Collections_View SHALL display a validation error message.
3. WHEN the user submits a collection name that matches an existing Collection name (case-insensitive), THE Collection_Store SHALL reject the creation and THE Collections_View SHALL display a duplicate-name error message.
4. THE Collection_Store SHALL persist the new Collection to IndexedDB within the same transaction.

### Requirement 2: Rename a Collection

**User Story:** As a student, I want to rename a collection, so that I can correct typos or update the name as my courses change.

#### Acceptance Criteria

1. WHEN the user submits a new name for an existing Collection, THE Collection_Store SHALL update the Collection name and set updatedAt to the current timestamp.
2. WHEN the user submits a new name that is empty or contains only whitespace, THE Collection_Store SHALL reject the rename and THE Collections_View SHALL display a validation error message.
3. WHEN the user submits a new name that matches another existing Collection name (case-insensitive), THE Collection_Store SHALL reject the rename and THE Collections_View SHALL display a duplicate-name error message.

### Requirement 3: Delete a Collection

**User Story:** As a student, I want to delete a collection I no longer need, so that my collections list stays relevant.

#### Acceptance Criteria

1. WHEN the user confirms deletion of a Collection, THE Collection_Store SHALL remove the Collection record from IndexedDB.
2. WHEN a Collection is deleted, THE Collection_Store SHALL remove the collectionId reference from all Sessions that belonged to the deleted Collection, causing those Sessions to appear in the Uncategorized_Collection.
3. THE Collections_View SHALL prompt the user for confirmation before deleting a Collection.

### Requirement 4: Assign a Session to a Collection

**User Story:** As a student, I want to assign a session to a collection when I save it or from the history view, so that my notes are organized from the start.

#### Acceptance Criteria

1. WHEN the user saves a new session and selects a Collection from the Collection_Picker, THE Session_Store SHALL store the session with the selected Collection's id as its collectionId field.
2. WHEN the user saves a new session without selecting a Collection, THE Session_Store SHALL store the session with a null collectionId, placing the session in the Uncategorized_Collection.
3. WHEN the user selects a session in the History view and assigns it to a Collection via the Collection_Picker, THE Session_Store SHALL update the session's collectionId to the selected Collection's id and set the Collection's updatedAt to the current timestamp.
4. WHEN the user assigns a session that already belongs to a Collection to a different Collection, THE Session_Store SHALL update the session's collectionId to the new Collection's id.

### Requirement 5: Move Sessions Between Collections

**User Story:** As a student, I want to move a session from one collection to another, so that I can reorganize my notes as my study plan evolves.

#### Acceptance Criteria

1. WHEN the user selects a session within a Collection and chooses a different target Collection, THE Session_Store SHALL update the session's collectionId to the target Collection's id.
2. WHEN the user moves a session to the Uncategorized_Collection, THE Session_Store SHALL set the session's collectionId to null.
3. WHEN a session is moved, THE Collection_Store SHALL update the updatedAt timestamp of both the source and target Collections.

### Requirement 6: Browse Collections

**User Story:** As a student, I want to browse my collections and see the sessions inside each one, so that I can quickly find the notes I need for a specific subject.

#### Acceptance Criteria

1. THE Collections_View SHALL display all user-created Collections sorted by updatedAt in descending order.
2. THE Collections_View SHALL display the Uncategorized_Collection after all user-created Collections when uncategorized sessions exist.
3. WHEN the user selects a Collection, THE Collections_View SHALL display all Sessions belonging to that Collection sorted by savedAt in descending order.
4. THE Collections_View SHALL display the session count next to each Collection name.
5. WHEN a Collection contains zero sessions, THE Collections_View SHALL display the Collection with a count of zero and an empty-state message.

### Requirement 7: Persist Collections in IndexedDB

**User Story:** As a student, I want my collections to persist across browser sessions, so that I do not lose my organizational structure.

#### Acceptance Criteria

1. THE Collection_Store SHALL use an IndexedDB object store named "collections" with keyPath "id" within the existing "cognisync_db" database.
2. WHEN IndexedDB is unavailable, THE Collection_Store SHALL fall back to localStorage for Collection persistence using the key "cognisync_collections".
3. THE Collection_Store SHALL store each Collection with the fields: id (string), name (string), createdAt (string, ISO timestamp), and updatedAt (string, ISO timestamp).
4. WHEN the database is upgraded to include the collections store, THE Collection_Store SHALL create an index on the "name" field for efficient duplicate-name lookups.

### Requirement 8: Integrate Collections into App Navigation

**User Story:** As a student, I want to access my collections from the main app navigation, so that organizing my study resources is convenient.

#### Acceptance Criteria

1. THE AppShell SHALL include a "Collections" tab in the tab navigation alongside the existing Simplify, History, Digest, and Progress tabs.
2. WHEN the user navigates to the Collections tab, THE router SHALL render the Collections_View at the path "/app/collections".
3. THE Collections_View SHALL follow the existing glassmorphism dark-first design system used by other CogniSync views.

### Requirement 9: Create Collection Inline from Collection Picker

**User Story:** As a student, I want to create a new collection directly from the collection picker without leaving my current workflow, so that organizing is seamless.

#### Acceptance Criteria

1. THE Collection_Picker SHALL include an option to create a new Collection by entering a name inline.
2. WHEN the user creates a new Collection via the Collection_Picker, THE Collection_Store SHALL create the Collection and THE Collection_Picker SHALL automatically select the newly created Collection.
3. IF the inline collection name is invalid (empty, whitespace-only, or duplicate), THEN THE Collection_Picker SHALL display the appropriate validation error without closing the picker.

### Requirement 10: Collection Data Integrity on Session Deletion

**User Story:** As a student, I want my collections to remain accurate when I delete sessions, so that collection counts and contents stay correct.

#### Acceptance Criteria

1. WHEN a session is deleted, THE Collection_Store SHALL not require any update because the session's collectionId is stored on the Session record itself.
2. THE Collections_View SHALL reflect the updated session count for a Collection immediately after a session belonging to that Collection is deleted.
