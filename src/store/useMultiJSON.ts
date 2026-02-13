import { create } from "zustand";
import useJSONLibrary from "./useJSONLibrary";
import useJSONAnalyzer from "./useJSONAnalyzer";

export type ComparisonView = {
  id: string;
  jsonId1: string;
  jsonId2: string;
  similarityScore: number;
  commonFields: string[];
  differencesCount: number;
};

export type NavigationHistory = {
  jsonId: string;
  timestamp: number;
  action: "opened" | "modified" | "analyzed";
};

interface MultiJSONActions {
  // Comparaison
  createComparison: (jsonId1: string, jsonId2: string) => ComparisonView | null;
  getComparisons: () => ComparisonView[];
  
  // Historique de navigation
  addToHistory: (jsonId: string, action: NavigationHistory["action"]) => void;
  getHistory: () => NavigationHistory[];
  
  // Statistiques globales
  getLibraryStats: () => {
    totalJSON: number;
    totalClasses: number;
    totalInstances: number;
    totalRelations: number;
    averageComplexity: number;
    totalOptimizationOpportunities: number;
  };
  
  // Synchronisation analyses
  syncAnalyses: (jsonIds?: string[]) => void;
  
  // Utilitaires
  clear: () => void;
}

const initialStates = {
  comparisons: new Map<string, ComparisonView>(),
  navigationHistory: [] as NavigationHistory[],
};

export type MultiJSONStates = typeof initialStates;

const useMultiJSON = create<MultiJSONStates & MultiJSONActions>()((set, get) => ({
  ...initialStates,

  createComparison: (jsonId1, jsonId2) => {
    const json1 = useJSONLibrary.getState().getJSON(jsonId1);
    const json2 = useJSONLibrary.getState().getJSON(jsonId2);

    if (!json1 || !json2) return null;

    try {
      const obj1 = JSON.parse(json1.content);
      const obj2 = JSON.parse(json2.content);

      const getFields = (obj: unknown): string[] => {
        if (obj && typeof obj === "object" && !Array.isArray(obj)) {
          return Object.keys(obj as Record<string, unknown>);
        }
        return [];
      };

      const fields1 = getFields(obj1);
      const fields2 = getFields(obj2);
      const commonFields = fields1.filter((f) => fields2.includes(f));

      const diffCount = Math.abs(fields1.length - fields2.length) + 
                       (fields1.length + fields2.length - 2 * commonFields.length);

      const similarity = commonFields.length / Math.max(fields1.length, fields2.length);

      const comparison: ComparisonView = {
        id: `comp_${jsonId1}_${jsonId2}`,
        jsonId1,
        jsonId2,
        similarityScore: similarity,
        commonFields,
        differencesCount: diffCount,
      };

      set((state) => ({
        comparisons: new Map(state.comparisons).set(comparison.id, comparison),
      }));

      return comparison;
    } catch {
      return null;
    }
  },

  getComparisons: () => {
    return Array.from(get().comparisons.values());
  },

  addToHistory: (jsonId, action) => {
    set((state) => ({
      navigationHistory: [
        ...state.navigationHistory,
        {
          jsonId,
          timestamp: Date.now(),
          action,
        },
      ].slice(-100), // Garder les 100 derniers
    }));
  },

  getHistory: () => {
    return get().navigationHistory;
  },

  getLibraryStats: () => {
    const allJSON = useJSONLibrary.getState().getAllJSON();
    const allSchemas = useJSONAnalyzer.getState().getAllSchemas();
    const allOptimizations = useJSONAnalyzer.getState().getAllOptimizations();

    const classes = allJSON.filter((j) => j.type === "class");
    const instances = allJSON.filter((j) => j.type === "instance");

    let totalRelations = 0;
    allJSON.forEach((json) => {
      totalRelations += json.relatedIds.length;
    });

    const avgComplexity = allSchemas.length > 0
      ? allSchemas.reduce((sum, s) => sum + s.complexity, 0) / allSchemas.length
      : 0;

    return {
      totalJSON: allJSON.length,
      totalClasses: classes.length,
      totalInstances: instances.length,
      totalRelations: totalRelations / 2, // Éviter de compter deux fois
      averageComplexity: Math.round(avgComplexity),
      totalOptimizationOpportunities: allOptimizations.length,
    };
  },

  syncAnalyses: (jsonIds) => {
    const targetIds = jsonIds || 
      useJSONLibrary.getState().getAllJSON().map((j) => j.id);

    const analyzer = useJSONAnalyzer.getState();

    targetIds.forEach((jsonId) => {
      const json = useJSONLibrary.getState().getJSON(jsonId);
      if (json) {
        analyzer.analyzeSchema(jsonId, json.content);
      }
    });

    // Détecter les relations après analyse
    const allIds = useJSONLibrary.getState().getAllJSON().map((j) => j.id);
    allIds.forEach((sourceId) => {
      const relations = analyzer.detectRelationships(sourceId, 
        allIds.filter((id) => id !== sourceId)
      );
      
      if (relations.length > 0) {
        set((state) => ({
          comparisons: state.comparisons, // Trigger update
        }));
      }
    });
  },

  clear: () => {
    set({
      comparisons: new Map(),
      navigationHistory: [],
    });
  },
}));

export default useMultiJSON;
