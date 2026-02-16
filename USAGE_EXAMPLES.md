/**
 * EXAMPLES - How to use the Multi-JSON System
 * 
 * These examples show typical workflows and code patterns.
 * Copy & adapt to your needs.
 */

// ============================================
// 1. BASIC: Importing JSON
// ============================================

import useJSONLibrary from "../store/useJSONLibrary";
import useJSONAnalyzer from "../store/useJSONAnalyzer";
import useMultiJSON from "../store/useMultiJSON";

// Example 1: Import a single JSON
function importUserJSON() {
  const { addJSON } = useJSONLibrary();
  const { analyzeSchema } = useJSONAnalyzer();

  const jsonContent = JSON.stringify({
    users: [
      { id: 1, name: "Alice", email: "alice@example.com" },
      { id: 2, name: "Bob", email: "bob@example.com" },
    ],
  });

  // Add to library
  const jsonId = addJSON({
    name: "Users",
    type: "instance",
    description: "User data from API",
    content: jsonContent,
    relatedIds: [],
    tags: ["api", "users"],
  });

  // Analyze automatically
  analyzeSchema(jsonId, jsonContent);

  console.log(`Imported JSON with ID: ${jsonId}`);
}

// Example 2: Batch import multiple JSON
function batchImportJSON() {
  const { addJSON } = useJSONLibrary();
  const { analyzeSchema } = useJSONAnalyzer();
  const { syncAnalyses } = useMultiJSON();

  const jsonFiles = [
    { name: "Users", content: "{...}" },
    { name: "Products", content: "{...}" },
    { name: "Orders", content: "{...}" },
  ];

  const importedIds: string[] = [];

  jsonFiles.forEach((file) => {
    const jsonId = addJSON({
      name: file.name,
      type: "instance",
      description: `${file.name} data`,
      content: file.content,
      relatedIds: [],
      tags: [],
    });

    importedIds.push(jsonId);
    analyzeSchema(jsonId, file.content);
  });

  // Run cross-analysis
  syncAnalyses(importedIds);

  console.log(`Imported ${importedIds.length} JSON files`);
}

// ============================================
// 2. SEARCHING & NAVIGATION
// ============================================

// Example 3: Search for JSON by name
function searchJSON() {
  const { searchByName } = useJSONLibrary();

  const results = searchByName("user");
  console.log(`Found ${results.length} JSON matching 'user'`);

  results.forEach((json) => {
    console.log(`- ${json.name} (${json.type})`);
  });
}

// Example 4: Get all classes
function getAllClasses() {
  const { getByType } = useJSONLibrary();

  const classes = getByType("class");
  console.log(`Total classes: ${classes.length}`);
}

// Example 5: Navigate between related JSON
function navigateRelated() {
  const { getSelectedId, getJSON } = useJSONLibrary();
  const { getRelationships } = useJSONAnalyzer();

  const currentId = getSelectedId();
  if (!currentId) return;

  const currentJSON = getJSON(currentId);
  const relations = getRelationships(currentId);

  console.log(`Viewing: ${currentJSON?.name}`);
  console.log(`Related JSON:`);
  relations.forEach((rel) => {
    console.log(`  - ${rel.name} (${rel.type})`);
  });
}

// ============================================
// 3. ANALYSIS & OPTIMIZATION
// ============================================

// Example 6: Get optimization suggestions
function getOptimizations() {
  const { getSelectedId } = useJSONLibrary();
  const { suggestOptimizations } = useJSONAnalyzer();

  const jsonId = getSelectedId();
  if (!jsonId) return;

  const suggestions = suggestOptimizations(jsonId);

  console.log(`Found ${suggestions.length} optimization opportunities:`);
  suggestions.forEach((sugg) => {
    console.log(`
      Type: ${sugg.type}
      Severity: ${sugg.severity}
      Impact: ${sugg.impact}%
      Est. Savings: ${sugg.estimatedSavings.sizeKB}KB
    `);
  });
}

// Example 7: Find critical issues
function getCriticalOptimizations() {
  const { getAllOptimizations } = useJSONAnalyzer();

  const all = getAllOptimizations();
  const critical = all.filter((s) => s.severity === "high");

  console.log(`Found ${critical.length} CRITICAL optimizations!`);
  critical.forEach((c) => {
    console.log(`- ${c.description} (affects ${c.affectedPaths.join(", ")})`);
  });
}

// Example 8: Compare two JSON
function compareJSON() {
  const { createComparison } = useMultiJSON();

  const comp = createComparison("json_id_1", "json_id_2");

  if (comp) {
    console.log(`
      Similarity: ${Math.round(comp.similarityScore * 100)}%
      Common fields: ${comp.commonFields.join(", ")}
      Differences: ${comp.differencesCount}
    `);
  }
}

// ============================================
// 4. STATISTICS & MONITORING
// ============================================

// Example 9: Get library statistics
function getStats() {
  const { getLibraryStats } = useMultiJSON();

  const stats = getStats();

  console.log(`
    Library Statistics:
    - Total JSON: ${stats.totalJSON}
    - Classes: ${stats.totalClasses}
    - Instances: ${stats.totalInstances}
    - Relations: ${stats.totalRelations}
    - Avg Complexity: ${stats.averageComplexity}
    - Optimization opportunities: ${stats.totalOptimizationOpportunities}
  `);
}

// Example 10: Monitor health
function checkHealth() {
  const { suggestOptimizations } = useJSONAnalyzer();
  const { getLibraryStats } = useMultiJSON();

  const stats = getLibraryStats();
  const allOptim = suggestOptimizations();

  const criticalCount = allOptim.filter((s) => s.severity === "high").length;
  const healthScore = Math.max(0, 100 - (criticalCount / stats.totalJSON) * 10);

  console.log(`
    Library Health: ${Math.round(healthScore)}%
    Status: ${healthScore > 80 ? "GOOD" : healthScore > 50 ? "WARNING" : "CRITICAL"}
  `);
}

// ============================================
// 5. RELATIONSHIPS & DEPENDENCIES
// ============================================

// Example 11: Map class to instances
function getInstancesForClass(classId: string) {
  const { getJSON, getAllJSON } = useJSONLibrary();
  const { getRelationships } = useJSONAnalyzer();

  const classJSON = getJSON(classId);
  if (!classJSON || classJSON.type !== "class") return [];

  const instances = getAllJSON().filter((json) => {
    // Check if this instance is related to the class
    const relations = getRelationships(json.id);
    return relations.some((r) => r.id === classId);
  });

  return instances;
}

// Example 12: Build dependency tree
function buildDependencyTree(jsonId: string, level = 0, visited = new Set()) {
  if (level > 3 || visited.has(jsonId)) return null;
  visited.add(jsonId);

  const { getJSON } = useJSONLibrary();
  const { getRelationships } = useJSONAnalyzer();

  const json = getJSON(jsonId);
  if (!json) return null;

  const relations = getRelationships(jsonId);

  return {
    id: jsonId,
    name: json.name,
    type: json.type,
    children: relations.map((r) =>
      buildDependencyTree(r.id, level + 1, visited)
    ),
  };
}

// ============================================
// 6. REACT COMPONENT EXAMPLES
// ============================================

import React from "react";
import { Button, Group, Stack, Text } from "@mantine/core";

// Example 13: Component using library
function LibraryBrowser() {
  const { getAllJSON, selectJSON } = useJSONLibrary();
  const { suggestOptimizations } = useJSONAnalyzer();

  const all = getAllJSON();

  return (
    <Stack gap="md">
      {all.map((json) => {
        const optim = suggestOptimizations(json.id);
        return (
          <div key={json.id}>
            <Group justify="space-between">
              <Text>{json.name}</Text>
              <Text size="sm" c="gray">
                {optim.length} optimizations
              </Text>
            </Group>
            <Button
              variant="light"
              size="xs"
              onClick={() => selectJSON(json.id)}
            >
              Open
            </Button>
          </div>
        );
      })}
    </Stack>
  );
}

// Example 14: Hook for component usage
function useCurrentJSONOptimizations() {
  const [optimizations, setOptimizations] = React.useState([]);

  const { getSelectedId } = useJSONLibrary();
  const { suggestOptimizations } = useJSONAnalyzer();

  React.useEffect(() => {
    const jsonId = getSelectedId();
    if (jsonId) {
      const suggestions = suggestOptimizations(jsonId);
      setOptimizations(suggestions);
    }
  }, [getSelectedId(), suggestOptimizations]);

  return optimizations;
}

// ============================================
// 7. ADVANCED: Custom Analysis
// ============================================

// Example 15: Find all arrays with >500 elements
function findLargeArrays() {
  const { getAllSchemas } = useJSONAnalyzer();

  const large: Array<{ jsonId: string; path: string; size: number }> = [];

  const traverse = (node: any, path = "$", jsonId = "") => {
    if (node.type === "array" && node.itemType?.occurrences > 500) {
      large.push({
        jsonId,
        path,
        size: node.itemType.occurrences,
      });
    }
    if (node.children) {
      Object.entries(node.children).forEach(([key, child]: [string, any]) => {
        traverse(child, `${path}.${key}`, jsonId);
      });
    }
  };

  getAllSchemas().forEach((schema) => {
    traverse(schema.root, "$", schema.sourceJsonId);
  });

  return large;
}

// Example 16: Export comparison report
function generateComparisonReport() {
  const { getComparisons } = useMultiJSON();
  const { getJSON } = useJSONLibrary();

  const comps = getComparisons();

  const report = comps.map((comp) => ({
    json1: getJSON(comp.jsonId1)?.name,
    json2: getJSON(comp.jsonId2)?.name,
    similarity: Math.round(comp.similarityScore * 100),
    commonFields: comp.commonFields.length,
    differences: comp.differencesCount,
    recommendation:
      comp.similarityScore > 0.7
        ? "Extract common class"
        : comp.similarityScore > 0.4
        ? "Consider partial class"
        : "Keep separate",
  }));

  return report;
}

// ============================================
// 8. ERROR HANDLING
// ============================================

// Example 17: Safe JSON import with error handling
function safeImportJSON(jsonString: string) {
  const { addJSON } = useJSONLibrary();

  try {
    // Validate JSON
    const parsed = JSON.parse(jsonString);

    // Validate structure
    if (typeof parsed === "object" && parsed !== null) {
      const jsonId = addJSON({
        name: "Imported JSON",
        type: "instance",
        description: "User imported JSON",
        content: jsonString,
        relatedIds: [],
        tags: [],
      });
      return { success: true, jsonId };
    } else {
      return { success: false, error: "JSON must be an object" };
    }
  } catch (err) {
    return {
      success: false,
      error: `Invalid JSON: ${err instanceof Error ? err.message : "Unknown error"}`,
    };
  }
}

// ============================================
// 9. PERFORMANCE TIPS
// ============================================

// Example 18: Batch operations for performance
function batchAnalyzeJSON() {
  const { getAllJSON } = useJSONLibrary();
  const { analyzeSchema } = useJSONAnalyzer();
  const { syncAnalyses } = useMultiJSON();

  // Instead of:
  // getAllJSON().forEach(json => analyzeSchema(json.id, json.content));

  // Do this:
  const ids = getAllJSON().map((json) => {
    analyzeSchema(json.id, json.content);
    return json.id;
  });

  // Then sync all at once
  syncAnalyses(ids);
}

// ============================================
// 10. UTILITIES
// ============================================

import { formatJSON, slugify, formatFileSize } from "../lib/utils/multiJSONUtils";

// Example 19: Use utility functions
function processJSON() {
  const rawJSON = '{"name":"Alice"}';

  // Format
  const formatted = formatJSON(JSON.parse(rawJSON), 2);
  console.log(formatted);

  // Slugify name
  const slug = slugify("My JSON File");
  console.log(slug); // "my-json-file"

  // Format size
  const size = formatFileSize(12500);
  console.log(size); // "12.2 KB"
}

// ============================================
// EXPORT FOR REUSE
// ============================================

export {
  importUserJSON,
  batchImportJSON,
  searchJSON,
  getAllClasses,
  navigateRelated,
  getOptimizations,
  getCriticalOptimizations,
  compareJSON,
  getStats,
  checkHealth,
  getInstancesForClass,
  buildDependencyTree,
  LibraryBrowser,
  useCurrentJSONOptimizations,
  findLargeArrays,
  generateComparisonReport,
  safeImportJSON,
  batchAnalyzeJSON,
  processJSON,
};
