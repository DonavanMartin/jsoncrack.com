# 🔧 Integration Guide - Multi-JSON Workspace

## 1️⃣ Integration into `src/pages/editor.tsx`

### Option A: Side panel (RECOMMENDED)

This adds a left column for multi-JSON management.

**Modification:**

```tsx
import { useEffect } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMantineColorScheme } from "@mantine/core";
import "@mantine/dropzone/styles.css";
import styled, { ThemeProvider } from "styled-components";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
// ... other imports

// NEW: Import workspace
import MultiJSONWorkspace from "../features/editor/MultiJSONWorkspace";

// ... existing styled components

const StyledPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;
`;

const EditorMainContent = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
`;

// ... rest of existing code

export default function EditorPage() {
  // ... existing code

  return (
    <>
      {/* Existing Head */}
      <Head>
        {/* ... */}
      </Head>

      <ThemeProvider theme={theme}>
        <StyledPageWrapper>

          {/* NEW: Allotment with Multi-JSON Workspace */}
          <Allotment>
            {/* Left panel: Multi-JSON Workspace */}
            <Allotment.Pane size={20} minSize={200}>
              <MultiJSONWorkspace>
                {/* Content for middle/right */}
              </MultiJSONWorkspace>
            </Allotment.Pane>

            {/* Right panel: Existing editor and graph */}
            <Allotment.Pane size={80}>
              <StyledEditor>
                {/* Existing editor content */}
                {/* LiveEditor and GraphView */}
              </StyledEditor>
            </Allotment.Pane>
          </Allotment>

          {/* Existing bottom bar */}
          <BottomBar />

          {/* Existing modals */}
          <ModalController />
          {isIframe && <ExternalMode />}
        </StyledPageWrapper>
      </ThemeProvider>
    </>
  );
}
```

**Benefits:**
- ✅ Smooth coexistence with existing interface
- ✅ Resizable (Allotment)
- ✅ Collapsible on small screens
- ✅ Quick library access

**Responsive (optional):**
```tsx
// Hide workspace on small screens
<Allotment.Pane 
  size={20} 
  minSize={200}
  style={{ display: window.innerWidth < 768 ? 'none' : 'block' }}
>
```

---

## 2️⃣ Workspace Export (reusable)

Create `src/features/editor/index.ts`:

```typescript
export { default as MultiJSONWorkspace } from "./MultiJSONWorkspace";
export { default as JSONLibraryPanel } from "./JSONLibraryPanel";
export { default as OptimizationsPanel } from "./OptimizationsPanel";
export { default as RelationsPanel } from "./RelationsPanel";
export { default as ComparisonsView } from "./ComparisonsView";
export { default as JSONAnalyzerDashboard } from "./JSONAnalyzerDashboard";
export { default as MultiJSONImportModal } from "./MultiJSONImportModal";
```

---

## 3️⃣ Integration with existing useFile

To synchronize with the currently edited JSON:

**`src/store/useFile.ts` - Modification:**

```typescript
import useJSONLibrary from "./useJSONLibrary";

// In setContents, after modifying the JSON:
setContents: (data: SetContents) => {
  // ... existing code ...
  
  // NEW: Synchronize with library
  const library = useJSONLibrary.getState();
  const selectedId = library.getSelectedId();
  
  if (selectedId && data.contents) {
    library.updateJSON(selectedId, {
      content: data.contents,
      updatedAt: Date.now(),
    });
  }
},
```

---

## 4️⃣ Integration with Toolbar

Add buttons in the toolbar to access multi-JSON features.

**`src/features/editor/Toolbar/FileMenu.tsx` - Addition:**

```tsx
import { MultiJSONImportModal } from "../MultiJSONImportModal";

export const FileMenu = () => {
  const [importModalOpen, setImportModalOpen] = useState(false);

  return (
    <>
      {/* Existing menu */}
      <Menu>
        {/* Existing items */}
        <Menu.Divider />
        
        {/* NEW */}
        <Menu.Item
          icon={<MdCloudUpload />}
          onClick={() => setImportModalOpen(true)}
        >
          Import JSON
        </Menu.Item>
        
        <Menu.Item
          icon={<MdAnalytics />}
          onClick={() => navigate('/editor/dashboard')}
        >
          Analysis Dashboard
        </Menu.Item>
      </Menu>

      <MultiJSONImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
      />
    </>
  );
};
```

---

## 5️⃣ Dashboard Page (optional)

Create a dedicated page for overview:

**`src/pages/editor/dashboard.tsx`:**

```tsx
import Head from "next/head";
import styled from "styled-components";
import { useRouter } from "next/router";
import { JSONAnalyzerDashboard } from "../../features/editor/JSONAnalyzerDashboard";
import useJSONLibrary from "../../store/useJSONLibrary";

const DashboardPageWrapper = styled.div`
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: ${({ theme }: any) => theme.BACKGROUND};
`;

const Header = styled.div`
  padding: 16px;
  border-bottom: 1px solid rgba(200, 200, 200, 0.2);
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const BackButton = styled.button`
  padding: 8px 16px;
  background: rgba(76, 110, 245, 0.2);
  border: 1px solid rgba(76, 110, 245, 0.3);
  border-radius: 4px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;

  &:hover {
    background: rgba(76, 110, 245, 0.3);
  }
`;

export default function AnalyzerDashboardPage() {
  const router = useRouter();
  const { getLibraryStats } = useJSONLibrary();
  const stats = getLibraryStats();

  return (
    <>
      <Head>
        <title>JSON Analyzer Dashboard - JSON Crack</title>
      </Head>

      <DashboardPageWrapper>
        <Header>
          <h1>📊 Analyzer Dashboard</h1>
          <BackButton onClick={() => router.push("/editor")}>
            ← Back to editor
          </BackButton>
        </Header>

        <JSONAnalyzerDashboard />
      </DashboardPageWrapper>
    </>
  );
}
```

---

## 6️⃣ TypeScript Types

Create `src/types/multiJSON.ts`:

```typescript
import { JSONMetadata, OptimizationSuggestion, Relationship } from "../store/useJSONAnalyzer";

export interface JSONLibraryContextType {
  selectedJSON: JSONMetadata | null;
  availableJSON: JSONMetadata[];
  relations: Relationship[];
  optimizations: OptimizationSuggestion[];
  isLoading: boolean;
}

export type JSONImportOptions = {
  name: string;
  type: "class" | "instance";
  description?: string;
  tags?: string[];
};
```

---

## 7️⃣ Custom Hooks (optional)

Create `src/hooks/useJSONWorkspace.ts`:

```typescript
import { useCallback } from "react";
import useJSONLibrary from "../store/useJSONLibrary";
import useJSONAnalyzer from "../store/useJSONAnalyzer";
import useMultiJSON from "../store/useMultiJSON";

export const useJSONWorkspace = () => {
  const { getSelectedId, getJSON, selectJSON, addJSON } = useJSONLibrary();
  const { analyzeSchema, suggestOptimizations } = useJSONAnalyzer();
  const { syncAnalyses } = useMultiJSON();

  const importJSON = useCallback(
    async (options: ImportOptions) => {
      try {
        // Validate JSON
        JSON.parse(options.content);

        // Add to library
        const jsonId = addJSON({
          ...options,
          content: options.content,
          relatedIds: [],
          tags: options.tags || [],
        });

        // Analyze
        analyzeSchema(jsonId, options.content);

        // Select
        selectJSON(jsonId);

        return jsonId;
      } catch (err) {
        throw new Error(`Import failed: ${err}`);
      }
    },
    [addJSON, analyzeSchema, selectJSON]
  );

  const getCurrentAnalysis = useCallback(() => {
    const selectedId = getSelectedId();
    if (!selectedId) return null;

    return {
      json: getJSON(selectedId),
      suggestions: suggestOptimizations(selectedId),
    };
  }, [getSelectedId, getJSON, suggestOptimizations]);

  return {
    importJSON,
    getCurrentAnalysis,
    selectJSON,
  };
};
```

---

## 8️⃣ Tests (jest/vitest)

Example test for `useJSONLibrary`:

```typescript
// src/__tests__/store/useJSONLibrary.test.ts
import { renderHook, act } from "@testing-library/react";
import useJSONLibrary from "../../store/useJSONLibrary";

describe("useJSONLibrary", () => {
  it("should add JSON to library", () => {
    const { result } = renderHook(() => useJSONLibrary());

    let jsonId: string;
    act(() => {
      jsonId = result.current.addJSON({
        name: "Test",
        type: "instance",
        content: '{"test": "data"}',
        relatedIds: [],
        tags: [],
      });
    });

    const json = act(() => result.current.getJSON(jsonId!));
    expect(json?.name).toBe("Test");
  });

  it("should handle relations", () => {
    // ...
  });
});
```

---

## 🎯 Integration Checklist

- [ ] Copy 3 stores into `src/store/`
- [ ] Copy 7 components into `src/features/editor/`
- [ ] Modify `src/pages/editor.tsx` to integrate `MultiJSONWorkspace`
- [ ] Add exports to `src/features/editor/index.ts`
- [ ] Optional: Create dashboard page
- [ ] Optional: Create custom hooks
- [ ] Test TypeScript integrity: `npm run lint`
- [ ] Test build: `npm run build`
- [ ] Test at runtime: `npm run dev`
- [ ] Validate with multiple imported JSON files

---

## 🚀 Deployment

```bash
# Install
npm install

# Build
npm run build

# Run
npm start

# Electron
npm run electron:build:mac
```

---

## 📞 Support & Debug

If TypeScript errors:
```bash
npm run lint:fix
```

If localStorage is full:
```typescript
// Clear
useJSONLibrary.getState().clear();
localStorage.removeItem("json-library");
```

If performance is slow:
```typescript
// Reduce frequency of syncAnalyses
// or use debounce
```

---

**End of guide! 🎉**

You are now ready to integrate the complete multi-JSON system!

Questions? Check `ARCHITECTURE_MULTI_JSON.md`.
