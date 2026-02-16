# 📊 JSON Crack Multi-JSON Architecture

## Overview

The JSON Crack enhancement integrates a complete multi-JSON management system with intelligent schema analysis, relationship detection, and optimization suggestions.

## 🏗️ Architecture

### 1. **Zustand Stores** (Global State)

#### `useJSONLibrary` (`src/store/useJSONLibrary.ts`)
Manages the JSON library in memory.

**Features:**
- Multi-JSON storage with metadata (id, name, type, description)
- Types: `class` (reusable schema) | `instance` (concrete data)
- Relationship management between JSON files
- localStorage persistence
- Active selection

**Usage:**
```typescript
import useJSONLibrary from "../store/useJSONLibrary";

const { addJSON, getJSON, selectJSON, getRelations } = useJSONLibrary();

// Add a JSON
const jsonId = addJSON({
  name: "Users",
  type: "instance",
  description: "List of users",
  content: jsonString,
  relatedIds: [],
  tags: []
});

// Get relationships
const related = getRelations(jsonId);
```

---

#### `useJSONAnalyzer` (`src/store/useJSONAnalyzer.ts`)
Analyzes schemas and detects optimization opportunities.

**Features:**
- Automatic structural analysis (types, depth, occurrences)
- Relationship detection through schema comparison
- Optimization suggestion generation
- Complexity calculation (0-100)
- Schema hashing for fast comparison

**Analyses performed:**
- Arrays >100 elements → normalization suggestion
- Duplicate structures → extract to class suggestion
- Repeated fields → deduplication suggestion
- Excessive complexity → refactoring metrics

**Usage:**
```typescript
import useJSONAnalyzer from "../store/useJSONAnalyzer.ts";

const { analyzeSchema, suggestOptimizations, findSimilarSchemas } = useJSONAnalyzer();

// Analyze a JSON
const schemaId = analyzeSchema(jsonId, jsonContent);

// Get suggestions
const suggestions = suggestOptimizations(jsonId);

// Find similar schemas
const similar = findSimilarSchemas(schemaId); // > 50% similarity
```

---

#### `useMultiJSON` (`src/store/useMultiJSON.ts`)
Orchestration and synchronization between stores.

**Features:**
- JSON comparison (similarity, common fields)
- Navigation history
- Global statistics
- Analysis synchronization

**Usage:**
```typescript
import useMultiJSON from "../store/useMultiJSON";

const { createComparison, syncAnalyses, getLibraryStats } = useMultiJSON();

// Compare two JSON files
const comparison = createComparison(jsonId1, jsonId2);
// → similarityScore, commonFields, differencesCount

// Synchronize all analyses
syncAnalyses(); // or syncAnalyses([jsonId1, jsonId2])

// Statistics
const stats = getLibraryStats();
// → totalJSON, totalClasses, totalInstances, averageComplexity, etc.
```

---

### 2. **UI Components**

#### `JSONLibraryPanel` (`src/features/editor/JSONLibraryPanel.tsx`)
Navigation panel and JSON library management.

**Usage:**
```tsx
<JSONLibraryPanel
  onSelectJSON={(json) => console.log("Selected:", json.id)}
  onAddJSON={() => openImportModal()}
/>
```

**Features:**
- JSON list with filtering (classes/instances)
- Search by name/description
- Display relationships
- Deletion with confirmation

---

#### `OptimizationsPanel` (`src/features/editor/OptimizationsPanel.tsx`)
Display optimization suggestions by severity.

**Usage:**
```tsx
<OptimizationsPanel jsonId={selectedJsonId} />
```

**Displays:**
- Severity statistics (high/medium/low)
- Impact progress bar
- Savings estimates (KB, complexity)
- Affected JSON paths

---

#### `RelationsPanel` (`src/features/editor/RelationsPanel.tsx`)
Visualization of relationships and dependency graph.

**Usage:**
```tsx
<RelationsPanel
  jsonId={selectedJsonId}
  onSelectJSON={(json) => navigate(json.id)}
/>
```

**Displays:**
- Current JSON info
- Direct relationships (with type icons)
- Dependency graph across 3 levels

---

#### `ComparisonsView` (`src/features/editor/ComparisonsView.tsx`)
Structural comparison between JSON files.

**Displays:**
- List of relevant comparisons
- Similarity bar
- Common fields (with highlight)
- Differences and recommendations

---

#### `MultiJSONImportModal` (`src/features/editor/MultiJSONImportModal.tsx`)
Modal for importing JSON (file or paste).

**Usage:**
```tsx
<MultiJSONImportModal
  isOpen={modalOpen}
  onClose={() => setModalOpen(false)}
  onImported={(jsonId) => console.log("Imported:", jsonId)}
/>
```

**Features:**
- Import `.json` files
- Manual JSON paste
- Real-time validation
- Type selection (class/instance)

---

#### `MultiJSONWorkspace` (`src/features/editor/MultiJSONWorkspace.tsx`)
Integrator component with tabs (Library, Optimizations, Relations, Comparisons).

**Usage:**
```tsx
<MultiJSONWorkspace>
  {/* Main content: editor/graph */}
</MultiJSONWorkspace>
```

---

#### `JSONAnalyzerDashboard` (`src/features/editor/JSONAnalyzerDashboard.tsx`)
Overview of statistics and global library health.

**Displays:**
- Key metrics (total JSON, relationships, complexity, health)
- Classes/instances distribution
- Priority recommendations

---

## 🔄 Typical workflow

```
1. Import JSON → MultiJSONImportModal
   ↓
2. Auto-analysis → useJSONAnalyzer.analyzeSchema()
   ↓
3. Relationship detection → useJSONAnalyzer.detectRelationships()
   ↓
4. JSON selection → useJSONLibrary.selectJSON()
   ↓
5. Multi-panel display:
   - JSONLibraryPanel: Navigation
   - OptimizationsPanel: Suggestions
   - RelationsPanel: Dependency graph
   - ComparisonsView: Comparisons
   - JSONAnalyzerDashboard: Overview
```

## 📊 Key data types

### `JSONMetadata`
```typescript
{
  id: string;                    // Unique ID
  name: string;                  // Display name
  type: "class" | "instance";    // JSON type
  description?: string;          // Optional description
  content: string;               // JSON content
  createdAt: number;             // Timestamp
  updatedAt: number;             // Modification timestamp
  relatedIds: string[];          // IDs of related JSON files
  tags: string[];                // Custom tags
}
```

### `OptimizationSuggestion`
```typescript
{
  id: string;
  jsonId: string;
  type: "extract-schema" | "normalize-array" | 
        "deduplicate" | "refactor";
  severity: "low" | "medium" | "high";
  description: string;
  impact: number;                // 0-100
  estimatedSavings: {
    sizeKB?: number;
    complexity?: number;
  };
  affectedPaths: string[];       // JSON paths
}
```

### `Relationship`
```typescript
{
  sourceId: string;
  targetId: string;
  type: "reference" | "schema-match" | "common-field";
  confidence: number;            // 0-1
  commonPaths?: string[];
}
```

---

## 🎨 Optimization analysis strategies

### 1. **Large Array Detection**
- Threshold: >100 elements
- Suggestion: Normalization (extract structure, use references)
- Savings: (count - 100) * fieldSize * 0.05 KB

### 2. **Class Extraction**
- Detection: Similar schemas (>50% match)
- Suggestion: Create common class, use inheritance
- Benefit: Reduced complexity, better maintainability

### 3. **Deduplication**
- Detection: Repeated values in >30% of occurrences
- Suggestion: Enumeration or reference
- Savings: Size * % repetition

### 4. **Refactoring**
- Detection: Complexity > 80 or depth > 7
- Suggestion: Normalization, extract sub-structures
- Benefit: Readability, query performance

---

## 🔌 Integration with existing JSON Crack

### Option 1: Side panel (recommended)
Add `MultiJSONWorkspace` as a side panel in `editor.tsx`:

```tsx
<StyledEditor>
  <Allotment.Pane size={25}>
    <MultiJSONWorkspace>
      {/* Existing editor/graph */}
    </MultiJSONWorkspace>
  </Allotment.Pane>
  {/* Rest of interface */}
</StyledEditor>
```

### Option 2: Separate tab
Add a `/editor/multi-json` route with the full workspace.

### Option 3: Modal
Integrate via a button in the existing toolbar.

---

## 🚀 Advanced features to implement

1. **Visual relationship graph** (D3.js or Reaflow)
2. **Export class → TypeScript** (dependency already: `json_typegen_wasm`)
3. **Suggested APIs** (auto-suggest endpoints)
4. **Versioning & Diffs** (compare historical versions)
5. **Real-time collaboration** (WebSocket sync)
6. **Machine Learning** (statically undetected patterns)
7. **Monitoring** (threshold alerts)

---

## 📝 Development notes

- **Performance**: Map Zustand for collections > 1000 items
- **Persistence**: localStorage (consider IndexedDB for large volumes)
- **Tests**: Mocks analyzeSchema, detectRelationships
- **Accessibility**: ARIA labels on all panels
- **Responsive**: Mobile-first (Allotment hide on small screens)

---

## 📦 Required dependencies (already in package.json)

- `zustand` ✅ (state)
- `@mantine/core` ✅ (UI components)
- `styled-components` ✅ (styling)
- `allotment` ✅ (split pane)
- `react-icons` ✅ (icons)
- `next` ✅ (framework)

No additional dependencies required! 🎉
