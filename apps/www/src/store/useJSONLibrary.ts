import { create } from "zustand";
import { persist } from "zustand/middleware";

export type JSONMetadata = {
  id: string;
  name: string;
  type: "class" | "instance"; // class = schéma template, instance = données concrètes
  description?: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  relatedIds: string[]; // IDs des JSON liés
  tags: string[];
  status: "new" | "modified" | "saved"; // File status for UI indicators
};

interface JSONLibraryActions {
  // Gestion basique
  addJSON: (metadata: Omit<JSONMetadata, "id" | "createdAt" | "updatedAt" | "status">) => string;
  updateJSON: (id: string, updates: Partial<JSONMetadata>) => void;
  saveJSON: (id: string) => void; // Mark file as saved
  deleteJSON: (id: string) => void;
  getJSON: (id: string) => JSONMetadata | undefined;
  getAllJSON: () => JSONMetadata[];
  
  // Gestion des relations
  addRelation: (sourceId: string, targetId: string) => void;
  removeRelation: (sourceId: string, targetId: string) => void;
  getRelations: (id: string) => JSONMetadata[];
  
  // Recherche et filtrage
  searchByName: (query: string) => JSONMetadata[];
  getByType: (type: "class" | "instance") => JSONMetadata[];
  
  // Gestion de la sélection
  selectJSON: (id: string) => void;
  getSelectedId: () => string | null;
  
  // Utilitaires
  clear: () => void;
}

const initialStates = {
  jsonLibrary: new Map<string, JSONMetadata>(),
  selectedId: null as string | null,
};

export type JSONLibraryStates = typeof initialStates;

const useJSONLibrary = create(
  persist<JSONLibraryStates & JSONLibraryActions>(
    (set, get) => ({
      ...initialStates,
      
      addJSON: (metadata) => {
        const id = `json_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const jsonMetadata: JSONMetadata = {
          ...metadata,
          id,
          createdAt: Date.now(),
          updatedAt: Date.now(),
          status: "new", // Mark new files as "new"
        };
        set((state) => ({
          jsonLibrary: new Map(state.jsonLibrary).set(id, jsonMetadata),
          selectedId: id, // Auto-select nouveaux JSON
        }));
        return id;
      },

      updateJSON: (id, updates) => {
        const existing = get().jsonLibrary.get(id);
        if (!existing) return;
        
        // Mark as modified if content or name changed and not already saving
        const isContentChange = updates.content !== undefined || updates.name !== undefined;
        const newStatus = isContentChange && existing.status !== "saved" ? "modified" : existing.status;
        
        set((state) => ({
          jsonLibrary: new Map(state.jsonLibrary).set(id, {
            ...existing,
            ...updates,
            status: newStatus,
            updatedAt: Date.now(),
          }),
        }));
      },

      saveJSON: (id) => {
        const existing = get().jsonLibrary.get(id);
        if (!existing) return;
        
        set((state) => ({
          jsonLibrary: new Map(state.jsonLibrary).set(id, {
            ...existing,
            status: "saved",
            updatedAt: Date.now(),
          }),
        }));
      },

      deleteJSON: (id) => {
        set((state) => {
          const newLibrary = new Map(state.jsonLibrary);
          newLibrary.delete(id);
          
          // Nettoyer les relations
          newLibrary.forEach((json) => {
            json.relatedIds = json.relatedIds.filter((rid) => rid !== id);
          });
          
          return {
            jsonLibrary: newLibrary,
            selectedId: state.selectedId === id ? null : state.selectedId,
          };
        });
      },

      getJSON: (id) => {
        return get().jsonLibrary.get(id);
      },

      getAllJSON: () => {
        return Array.from(get().jsonLibrary.values());
      },

      addRelation: (sourceId, targetId) => {
        const source = get().jsonLibrary.get(sourceId);
        const target = get().jsonLibrary.get(targetId);
        
        if (!source || !target || source.id === target.id) return;
        
        if (!source.relatedIds.includes(targetId)) {
          set((state) => ({
            jsonLibrary: new Map(state.jsonLibrary).set(sourceId, {
              ...source,
              relatedIds: [...source.relatedIds, targetId],
            }),
          }));
        }
      },

      removeRelation: (sourceId, targetId) => {
        const source = get().jsonLibrary.get(sourceId);
        if (!source) return;
        
        set((state) => ({
          jsonLibrary: new Map(state.jsonLibrary).set(sourceId, {
            ...source,
            relatedIds: source.relatedIds.filter((id) => id !== targetId),
          }),
        }));
      },

      getRelations: (id) => {
        const json = get().jsonLibrary.get(id);
        if (!json) return [];
        
        return json.relatedIds
          .map((relatedId) => get().jsonLibrary.get(relatedId))
          .filter((j) => j !== undefined) as JSONMetadata[];
      },

      searchByName: (query) => {
        const lowerQuery = query.toLowerCase();
        return get()
          .getAllJSON()
          .filter(
            (json) =>
              json.name.toLowerCase().includes(lowerQuery) ||
              json.description?.toLowerCase().includes(lowerQuery)
          );
      },

      getByType: (type) => {
        return get()
          .getAllJSON()
          .filter((json) => json.type === type);
      },

      selectJSON: (id) => {
        if (get().jsonLibrary.has(id)) {
          set({ selectedId: id });
        }
      },

      getSelectedId: () => {
        return get().selectedId;
      },

      clear: () => {
        set({ jsonLibrary: new Map(), selectedId: null });
      },
    }),
    {
      name: "json-library",
      storage: {
        getItem: (name) => {
          const item = localStorage.getItem(name);
          if (!item) return null;
          
          try {
            const data = JSON.parse(item);
            // Convertir Map en objet
            if (data.state?.jsonLibrary) {
              data.state.jsonLibrary = new Map(data.state.jsonLibrary);
            }
            return data;
          } catch {
            return null;
          }
        },
        setItem: (name, value) => {
          try {
            const data = JSON.parse(JSON.stringify(value));
            // Convertir Map en objet pour localStorage
            if (data?.state?.jsonLibrary instanceof Map) {
              data.state.jsonLibrary = Array.from(data.state.jsonLibrary);
            }
            localStorage.setItem(name, JSON.stringify(data));
          } catch {
            // Silently fail
          }
        },
        removeItem: (name) => {
          localStorage.removeItem(name);
        },
      },
    }
  )
);

export default useJSONLibrary;
