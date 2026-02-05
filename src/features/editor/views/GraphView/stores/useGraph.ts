import type { ViewPort } from "react-zoomable-ui";
import type { CanvasDirection } from "reaflow";
import { create } from "zustand";
import { SUPPORTED_LIMIT } from "../../../../../constants/graph";
import useJson from "../../../../../store/useJson";
import type { EdgeData, NodeData } from "../../../../../types/graph";
import { parser } from "../lib/jsonParser";

export interface Graph {
  viewPort: ViewPort | null;
  direction: CanvasDirection;
  loading: boolean;
  fullscreen: boolean;
  nodes: NodeData[];
  edges: EdgeData[];
  selectedNode: NodeData | null;
  path: string;
  aboveSupportedLimit: boolean;
  collapsedNodeIds: Set<string>;
}

const initialStates: Graph = {
  viewPort: null,
  direction: "RIGHT",
  loading: true,
  fullscreen: false,
  nodes: [],
  edges: [],
  selectedNode: null,
  path: "",
  aboveSupportedLimit: false,
  collapsedNodeIds: new Set(),
};

interface GraphActions {
  setGraph: (json?: string, options?: Partial<Graph>[]) => void;
  setLoading: (loading: boolean) => void;
  setDirection: (direction: CanvasDirection) => void;
  setViewPort: (ref: ViewPort) => void;
  setSelectedNode: (nodeData: NodeData) => void;
  focusFirstNode: () => void;
  toggleFullscreen: (value: boolean) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  centerView: () => void;
  clearGraph: () => void;
  setZoomFactor: (zoomFactor: number) => void;
  toggleNodeCollapse: (nodeId: string) => void;
  expandAll: () => void;
  collapseAll: () => void;
  getFilteredGraph: () => { nodes: NodeData[]; edges: EdgeData[] };
}

const useGraph = create<Graph & GraphActions>((set, get) => ({
  ...initialStates,
  clearGraph: () => set({ nodes: [], edges: [], loading: false, collapsedNodeIds: new Set() }),
  setSelectedNode: nodeData => set({ selectedNode: nodeData }),
  setGraph: (data, options) => {
    const { nodes, edges } = parser(data ?? useJson.getState().json);

    if (nodes.length > SUPPORTED_LIMIT) {
      return set({
        aboveSupportedLimit: true,
        ...options,
        loading: false,
      });
    }

    set({
      nodes,
      edges,
      aboveSupportedLimit: false,
      collapsedNodeIds: new Set(),
      ...options,
    });
  },
  setDirection: (direction = "RIGHT") => {
    set({ direction });
    setTimeout(() => get().centerView(), 200);
  },
  setLoading: loading => set({ loading }),
  focusFirstNode: () => {
    const rootNode = document.querySelector("g[id$='node-1']");
    get().viewPort?.camera?.centerFitElementIntoView(rootNode as HTMLElement, {
      elementExtraMarginForZoom: 100,
    });
  },
  setZoomFactor: zoomFactor => {
    const viewPort = get().viewPort;
    viewPort?.camera?.recenter(viewPort.centerX, viewPort.centerY, zoomFactor);
  },
  zoomIn: () => {
    const viewPort = get().viewPort;
    viewPort?.camera?.recenter(viewPort.centerX, viewPort.centerY, viewPort.zoomFactor + 0.1);
  },
  zoomOut: () => {
    const viewPort = get().viewPort;
    viewPort?.camera?.recenter(viewPort.centerX, viewPort.centerY, viewPort.zoomFactor - 0.1);
  },
  centerView: () => {
    const viewPort = get().viewPort;
    viewPort?.updateContainerSize();

    const canvas = document.querySelector(".jsoncrack-canvas") as HTMLElement | null;
    if (canvas) {
      viewPort?.camera?.centerFitElementIntoView(canvas);
    }
  },
  toggleFullscreen: fullscreen => set({ fullscreen }),
  setViewPort: viewPort => set({ viewPort }),
  toggleNodeCollapse: (nodeId: string) => {
    const { collapsedNodeIds } = get();
    const newCollapsedIds = new Set(collapsedNodeIds);
    if (newCollapsedIds.has(nodeId)) {
      newCollapsedIds.delete(nodeId);
    } else {
      newCollapsedIds.add(nodeId);
    }
    set({ collapsedNodeIds: newCollapsedIds });
  },
  expandAll: () => {
    set({ collapsedNodeIds: new Set() });
  },
  collapseAll: () => {
    const { nodes } = get();
    const collapsedNodeIds = new Set<string>();
    
    nodes.forEach(node => {
      node.text.forEach((row, index) => {
        if (row.to && row.to.length > 0) {
          collapsedNodeIds.add(`${node.id}-row-${index}`);
        }
      });
    });
    
    set({ collapsedNodeIds });
  },
  getFilteredGraph: () => {
    const { nodes, edges, collapsedNodeIds } = get();
    const hiddenNodeIds = new Set<string>();

    // Build a map of row collapse IDs to their child node IDs
    const rowChildMap = new Map<string, string[]>();
    nodes.forEach(node => {
      node.text.forEach((row, index) => {
        if (row.to && row.to.length > 0) {
          rowChildMap.set(`${node.id}-row-${index}`, row.to);
        }
      });
    });

    // Recursively mark nodes as hidden
    const markHiddenNodes = (nodeId: string) => {
      hiddenNodeIds.add(nodeId);
      const node = nodes.find(n => n.id === nodeId);
      if (node) {
        node.text.forEach((row, index) => {
          if (row.to && row.to.length > 0) {
            row.to.forEach(childId => {
              markHiddenNodes(childId);
            });
          }
        });
      }
    };

    // For each collapsed row, hide its direct children and their descendants
    collapsedNodeIds.forEach(collapseId => {
      const childIds = rowChildMap.get(collapseId);
      if (childIds) {
        childIds.forEach(childId => {
          markHiddenNodes(childId);
        });
      }
    });

    // Filter out hidden nodes
    const filteredNodes = nodes.filter(node => !hiddenNodeIds.has(node.id));

    // Filter out edges to hidden nodes
    const filteredEdges = edges.filter(edge => !hiddenNodeIds.has(edge.to));

    return { nodes: filteredNodes, edges: filteredEdges };
  },
}));

export default useGraph;
