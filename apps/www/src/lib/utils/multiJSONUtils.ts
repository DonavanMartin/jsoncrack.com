import { SchemaNode } from "../../store/useJSONAnalyzer";

/**
 * Utilitaires pour le système multi-JSON
 */

// ============= JSON Validation =============

/**
 * Valide si une chaîne est du JSON valide
 */
export const isValidJSON = (str: string): boolean => {
  try {
    JSON.parse(str);
    return true;
  } catch {
    return false;
  }
};

/**
 * Essai de parser JSON avec fallback
 */
export const tryParseJSON = (str: string): object | null => {
  try {
    return JSON.parse(str);
  } catch {
    return null;
  }
};

/**
 * Format JSON avec indentation
 */
export const formatJSON = (obj: unknown, spaces = 2): string => {
  try {
    return JSON.stringify(obj, null, spaces);
  } catch {
    return "";
  }
};

/**
 * Minify JSON (enlever whitespace)
 */
export const minifyJSON = (str: string): string => {
  try {
    return JSON.stringify(JSON.parse(str));
  } catch {
    return str;
  }
};

// ============= Schema Analysis =============

/**
 * Obtenir la profondeur d'un objet JSON
 */
export const getJSONDepth = (obj: unknown): number => {
  if (obj === null || typeof obj !== "object") return 0;
  if (Array.isArray(obj)) {
    return 1 + (obj.length > 0 ? getJSONDepth(obj[0]) : 0);
  }
  const values = Object.values(obj as Record<string, unknown>);
  return 1 + (values.length > 0 ? Math.max(...values.map(getJSONDepth)) : 0);
};

/**
 * Compter le nombre de clés unique dans un JSON
 */
export const countUniqueKeys = (obj: unknown): number => {
  const keys = new Set<string>();

  const traverse = (val: unknown) => {
    if (val && typeof val === "object") {
      if (Array.isArray(val)) {
        val.forEach(traverse);
      } else {
        Object.entries(val as Record<string, unknown>).forEach(([k, v]) => {
          keys.add(k);
          traverse(v);
        });
      }
    }
  };

  traverse(obj);
  return keys.size;
};

/**
 * Obtenir tous les chemins d'un JSON
 * Ex: "user.address.city"
 */
export const getJSONPaths = (
  obj: unknown,
  prefix = ""
): string[] => {
  const paths: string[] = [];

  if (obj === null || typeof obj !== "object") {
    if (prefix) paths.push(prefix);
  } else if (Array.isArray(obj)) {
    obj.forEach((item, i) => {
      paths.push(...getJSONPaths(item, `${prefix}[${i}]`));
    });
  } else {
    Object.entries(obj as Record<string, unknown>).forEach(([key, val]) => {
      const path = prefix ? `${prefix}.${key}` : key;
      paths.push(path);
      paths.push(...getJSONPaths(val, path));
    });
  }

  return [...new Set(paths)];
};

/**
 * Extraire une valeur par chemin
 * Ex: getValueByPath(obj, "user.address.city")
 */
export const getValueByPath = (obj: unknown, path: string): unknown => {
  const parts = path
    .split(".")
    .flatMap((p) => p.split(/[\[\]]/).filter(Boolean));

  let current = obj;
  for (const part of parts) {
    if (current && typeof current === "object") {
      if (Array.isArray(current)) {
        current = current[parseInt(part)];
      } else {
        current = (current as Record<string, unknown>)[part];
      }
    } else {
      return undefined;
    }
  }

  return current;
};

// ============= String Utilities =============

/**
 * Génère un ID unique
 */
export const generateUUID = (): string => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * Slugify une chaîne
 */
export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_]+/g, "-")
    .replace(/^-+|-+$/g, "");
};

/**
 * Truncate une chaîne avec ellipsis
 */
export const truncate = (str: string, length = 50): string => {
  return str.length > length ? str.substring(0, length) + "..." : str;
};

// ============= Array Utilities =============

/**
 * Partitionner un array par une condition
 */
export const partition = <T,>(
  arr: T[],
  predicate: (item: T) => boolean
): [T[], T[]] => {
  return arr.reduce(
    ([pass, fail], item) =>
      predicate(item)
        ? [[...pass, item], fail]
        : [pass, [...fail, item]],
    [[], []] as [T[], T[]]
  );
};

/**
 * Compter les instances d'une valeur dans un array
 */
export const countOccurrences = <T,>(arr: T[], item: T): number => {
  return arr.filter((x) => x === item).length;
};

/**
 * Obtenir les éléments uniques
 */
export const unique = <T,>(arr: T[]): T[] => {
  return [...new Set(arr)];
};

// ============= Formatting =============

/**
 * Format nombre avec séparateur de milliers
 */
export const formatNumber = (n: number): string => {
  return n.toLocaleString("fr-FR");
};

/**
 * Format taille en KB/MB/GB
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + " " + sizes[i];
};

/**
 * Format durée en ms → "2.5s" ou "150ms"
 */
export const formatDuration = (ms: number): string => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

/**
 * Format date → "13 fev 2026"
 */
export const formatDate = (timestamp: number): string => {
  return new Date(timestamp).toLocaleDateString("fr-FR");
};

/**
 * Format date avec heure → "13 fev 2026, 14:30"
 */
export const formatDateTime = (timestamp: number): string => {
  return new Date(timestamp).toLocaleString("fr-FR");
};

// ============= Comparison =============

/**
 * Comparer deux objects de façon profonde
 */
export const deepEqual = (a: unknown, b: unknown): boolean => {
  if (a === b) return true;

  if (
    a === null ||
    b === null ||
    typeof a !== "object" ||
    typeof b !== "object"
  ) {
    return false;
  }

  const keysA = Object.keys(a as Record<string, unknown>);
  const keysB = Object.keys(b as Record<string, unknown>);

  if (keysA.length !== keysB.length) return false;

  return keysA.every((key) =>
    deepEqual(
      (a as Record<string, unknown>)[key],
      (b as Record<string, unknown>)[key]
    )
  );
};

/**
 * Fusionner deux objects (shallow merge)
 */
export const merge = <T extends Record<string, unknown>>(
  obj1: T,
  obj2: Partial<T>
): T => {
  return { ...obj1, ...obj2 };
};

/**
 * Obtenir les différences entre deux objects
 */
export const diff = <T extends Record<string, unknown>>(
  obj1: T,
  obj2: T
): Partial<T> => {
  const result: Partial<T> = {};

  Object.keys(obj1).forEach((key) => {
    if (obj1[key] !== obj2[key]) {
      result[key as keyof T] = obj2[key as keyof T];
    }
  });

  return result;
};

// ============= Validation =============

/**
 * Valider une email
 */
export const isValidEmail = (email: string): boolean => {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
};

/**
 * Valider une URL
 */
export const isValidURL = (url: string): boolean => {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
};

/**
 * Valider un type JSON Schema simple
 */
export const validateJSONType = (
  value: unknown,
  type: string
): boolean => {
  switch (type) {
    case "string":
      return typeof value === "string";
    case "number":
      return typeof value === "number";
    case "boolean":
      return typeof value === "boolean";
    case "array":
      return Array.isArray(value);
    case "object":
      return typeof value === "object" && value !== null && !Array.isArray(value);
    case "null":
      return value === null;
    default:
      return false;
  }
};

// ============= Console Helpers =============

/**
 * Log colorisé en début de fonction (debug)
 */
export const logStart = (fnName: string): void => {
  console.log(`%c▶ ${fnName}`, "color: #4C6EF5; font-weight: bold;");
};

/**
 * Log colorisé en fin (success)
 */
export const logSuccess = (msg: string): void => {
  console.log(`%c✓ ${msg}`, "color: #4ECDC4; font-weight: bold;");
};

/**
 * Log colorisé warning
 */
export const logWarning = (msg: string): void => {
  console.warn(`%c⚠ ${msg}`, "color: #FFA500; font-weight: bold;");
};

/**
 * Log colorisé error
 */
export const logError = (msg: string): void => {
  console.error(`%c✗ ${msg}`, "color: #FF6B6B; font-weight: bold;");
};

// ============= Performance =============

/**
 * Mesurer le temps d'exécution d'une fonction
 */
export const measurePerformance = async <T>(
  fn: () => Promise<T>,
  label = "Operation"
): Promise<{ result: T; duration: number }> => {
  const start = performance.now();
  const result = await fn();
  const duration = performance.now() - start;

  console.log(`${label}: ${formatDuration(duration)}`);

  return { result, duration };
};

/**
 * Debounce une fonction
 */
export const debounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): ((...args: Parameters<T>) => void) => {
  let timeout: NodeJS.Timeout;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn(...args), delay);
  };
};

/**
 * Throttle une fonction
 */
export const throttle = <T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): ((...args: Parameters<T>) => void) => {
  let inThrottle: boolean;

  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
};

// ============= Exports =============
export default {
  // JSON
  isValidJSON,
  tryParseJSON,
  formatJSON,
  minifyJSON,
  // Schema
  getJSONDepth,
  countUniqueKeys,
  getJSONPaths,
  getValueByPath,
  // String
  generateUUID,
  slugify,
  truncate,
  // Array
  partition,
  countOccurrences,
  unique,
  // Formatting
  formatNumber,
  formatFileSize,
  formatDuration,
  formatDate,
  formatDateTime,
  // Comparison
  deepEqual,
  merge,
  diff,
  // Validation
  isValidEmail,
  isValidURL,
  validateJSONType,
  // Console
  logStart,
  logSuccess,
  logWarning,
  logError,
  // Performance
  measurePerformance,
  debounce,
  throttle,
};
