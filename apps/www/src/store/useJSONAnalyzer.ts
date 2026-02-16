import { create } from "zustand";

export type SchemaNode = {
  type: "object" | "array" | "string" | "number" | "boolean" | "null" | "mixed";
  occurrences: number;
  frequency: number; // 0-1
  samples?: string[];
  children?: Record<string, SchemaNode>;
  itemType?: SchemaNode; // Pour les arrays
};

export type JSONSchema = {
  id: string;
  sourceJsonId: string;
  root: SchemaNode;
  hash: string; // Pour comparer les schémas
  complexity: number; // 0-100
};

export type Relationship = {
  sourceId: string;
  targetId: string;
  type: "reference" | "schema-match" | "common-field";
  confidence: number; // 0-1
  commonPaths?: string[];
};

export type OptimizationSuggestion = {
  id: string;
  jsonId: string;
  type: "extract-schema" | "normalize-array" | "deduplicate" | "refactor";
  severity: "low" | "medium" | "high";
  description: string;
  impact: number; // 0-100
  estimatedSavings: {
    sizeKB?: number;
    complexity?: number;
  };
  affectedPaths: string[];
};

interface JSONAnalyzerActions {
  // Analyse de schémas
  analyzeSchema: (jsonId: string, content: string) => string;
  getSchema: (schemaId: string) => JSONSchema | undefined;
  getAllSchemas: () => JSONSchema[];
  
  // Détection de relations
  detectRelationships: (sourceId: string, targetIds: string[]) => Relationship[];
  getRelationships: (jsonId: string) => Relationship[];
  
  // Optimisations
  suggestOptimizations: (jsonId: string) => OptimizationSuggestion[];
  getAllOptimizations: () => OptimizationSuggestion[];
  
  // Comparaison de schémas
  compareSchemas: (schemaId1: string, schemaId2: string) => number; // Similarité 0-1
  findSimilarSchemas: (schemaId: string) => JSONSchema[];
  
  // Utilitaires
  clear: () => void;
}

const initialStates = {
  schemas: new Map<string, JSONSchema>(),
  relationships: new Map<string, Relationship[]>(),
  optimizations: new Map<string, OptimizationSuggestion[]>(),
};

export type JSONAnalyzerStates = typeof initialStates;

// Utilitaires d'analyse
const analyzeValue = (value: unknown): SchemaNode => {
  const type = Array.isArray(value) 
    ? "array"
    : value === null
    ? "null"
    : typeof value;

  const node: SchemaNode = {
    type: type as SchemaNode["type"],
    occurrences: 1,
    frequency: 1,
    samples: [],
  };

  if (type === "object" && !Array.isArray(value)) {
    node.children = {};
    const obj = value as Record<string, unknown>;
    for (const [key, val] of Object.entries(obj)) {
      node.children[key] = analyzeValue(val);
    }
  } else if (type === "array") {
    const arr = value as unknown[];
    const itemTypes = new Map<string, number>();
    arr.forEach((item) => {
      const itemType = analyzeValue(item).type;
      itemTypes.set(itemType, (itemTypes.get(itemType) || 0) + 1);
    });
    
    if (itemTypes.size === 1) {
      node.itemType = analyzeValue(arr[0]);
    } else {
      node.type = "mixed";
    }
  }

  return node;
};

const hashSchema = (schema: SchemaNode): string => {
  return JSON.stringify(schema).split("").reduce((a, b) => {
    a = (a << 5) - a + b.charCodeAt(0);
    return a & a;
  }, 0).toString(36);
};

const calculateComplexity = (schema: SchemaNode): number => {
  let complexity = 1;
  if (schema.children) {
    complexity += Object.values(schema.children).reduce(
      (sum, child) => sum + calculateComplexity(child),
      0
    );
  }
  if (schema.itemType) {
    complexity += calculateComplexity(schema.itemType);
  }
  return Math.min(complexity * 10, 100); // Normaliser à 0-100
};

const compareSchemaNodes = (a: SchemaNode, b: SchemaNode): number => {
  if (a.type !== b.type) return 0;
  
  let similarity = 0.5;
  
  if (a.children && b.children) {
    const keysA = Object.keys(a.children);
    const keysB = Object.keys(b.children);
    const commonKeys = keysA.filter((k) => keysB.includes(k));
    const totalKeys = new Set([...keysA, ...keysB]).size;
    
    similarity = commonKeys.length / totalKeys;
  }
  
  return similarity;
};

const detectArrayOptimizations = (path: string, node: SchemaNode): OptimizationSuggestion[] => {
  const suggestions: OptimizationSuggestion[] = [];
  
  if (node.type === "array" && node.itemType?.children) {
    const fieldCount = Object.keys(node.itemType.children).length;
    const estimatedItems = node.itemType.children ? 
      Math.max(...Object.values(node.itemType.children).map(n => n.occurrences)) : 10;
    
    // Si array avec beaucoup d'éléments
    if (estimatedItems > 100) {
      suggestions.push({
        id: `opt_${path}_${Date.now()}`,
        jsonId: "",
        type: "normalize-array",
        severity: estimatedItems > 1000 ? "high" : "medium",
        description: `Array de ${estimatedItems} éléments peut être normalisée (extrait une structure classe, utilise des références)`,
        impact: Math.min((estimatedItems - 100) / 10, 100),
        estimatedSavings: {
          sizeKB: Math.ceil(estimatedItems * fieldCount * 0.05),
          complexity: fieldCount * 10,
        },
        affectedPaths: [path],
      });
    }
  }
  
  if (node.children) {
    Object.entries(node.children).forEach(([key, child]) => {
      suggestions.push(...detectArrayOptimizations(`${path}.${key}`, child));
    });
  }
  
  return suggestions;
};

const useJSONAnalyzer = create<JSONAnalyzerStates & JSONAnalyzerActions>()((set, get) => ({
  ...initialStates,

  analyzeSchema: (jsonId, content) => {
    try {
      const parsed = JSON.parse(content);
      const root = analyzeValue(parsed);
      const hash = hashSchema(root);
      const complexity = calculateComplexity(root);

      const schema: JSONSchema = {
        id: `schema_${jsonId}_${Date.now()}`,
        sourceJsonId: jsonId,
        root,
        hash,
        complexity,
      };

      set((state) => ({
        schemas: new Map(state.schemas).set(schema.id, schema),
      }));

      // Analyser les optimisations
      const optimizations = detectArrayOptimizations("$", root).map((opt) => ({
        ...opt,
        jsonId,
      }));

      if (optimizations.length > 0) {
        set((state) => ({
          optimizations: new Map(state.optimizations).set(jsonId, optimizations),
        }));
      }

      return schema.id;
    } catch {
      console.error("Erreur lors de l'analyse du schéma");
      return "";
    }
  },

  getSchema: (schemaId) => {
    return get().schemas.get(schemaId);
  },

  getAllSchemas: () => {
    return Array.from(get().schemas.values());
  },

  detectRelationships: (sourceId, targetIds) => {
    const sourceSchema = get()
      .getAllSchemas()
      .find((s) => s.sourceJsonId === sourceId);
    
    if (!sourceSchema) return [];

    const relationships: Relationship[] = [];

    targetIds.forEach((targetId) => {
      const targetSchema = get()
        .getAllSchemas()
        .find((s) => s.sourceJsonId === targetId);

      if (!targetSchema) return;

      const similarity = compareSchemaNodes(
        sourceSchema.root,
        targetSchema.root
      );

      if (similarity > 0.3) {
        relationships.push({
          sourceId,
          targetId,
          type: "schema-match",
          confidence: similarity,
        });
      }
    });

    return relationships;
  },

  getRelationships: (jsonId) => {
    return get().relationships.get(jsonId) || [];
  },

  suggestOptimizations: (jsonId) => {
    return get().optimizations.get(jsonId) || [];
  },

  getAllOptimizations: () => {
    const all: OptimizationSuggestion[] = [];
    get().optimizations.forEach((opts) => all.push(...opts));
    return all.sort((a, b) => b.impact - a.impact);
  },

  compareSchemas: (schemaId1, schemaId2) => {
    const schema1 = get().getSchema(schemaId1);
    const schema2 = get().getSchema(schemaId2);

    if (!schema1 || !schema2) return 0;

    return compareSchemaNodes(schema1.root, schema2.root);
  },

  findSimilarSchemas: (schemaId) => {
    const schema = get().getSchema(schemaId);
    if (!schema) return [];

    return get()
      .getAllSchemas()
      .filter((s) => s.id !== schemaId && compareSchemaNodes(schema.root, s.root) > 0.5)
      .sort((a, b) => compareSchemaNodes(schema.root, b.root) - compareSchemaNodes(schema.root, a.root));
  },

  clear: () => {
    set({
      schemas: new Map(),
      relationships: new Map(),
      optimizations: new Map(),
    });
  },
}));

export default useJSONAnalyzer;
