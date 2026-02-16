import React from "react";
import { useComputedColorScheme } from "@mantine/core";
import type { NodeProps } from "reaflow";
import { Node } from "reaflow";
import { useModal } from "../../../../../store/useModal";
import type { NodeData } from "../../../../../types/graph";
import useGraph from "../stores/useGraph";
import { ObjectNode } from "./ObjectNode";
import { TextNode } from "./TextNode";

export interface CustomNodeProps {
  node: NodeData;
  x: number;
  y: number;
  hasCollapse?: boolean;
}

const CustomNodeWrapper = (nodeProps: NodeProps<NodeData>) => {
  const setSelectedNode = useGraph(state => state.setSelectedNode);
  const viewPort = useGraph(state => state.viewPort);
  const centerView = useGraph(state => state.centerView);
  const setVisible = useModal(state => state.setVisible);
  const colorScheme = useComputedColorScheme();

  const handleNodeClick = React.useCallback(
    (_: React.MouseEvent<SVGGElement, MouseEvent>, data: NodeData) => {
      if (setSelectedNode) setSelectedNode(data);
      setVisible("NodeModal", true);

      // Adjust view to show the selected node
      if (viewPort) {
        // Wait for multiple animation frames to ensure layout has fully settled
        // This is especially important after expand/collapse operations
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // For root node (id "1"), center the entire view
            if (data.id === "1") {
              centerView();
            } else {
              // For other nodes, fit the specific node into view
              const nodeElement = document.querySelector(
                `[data-id="node-${data.id}"]`
              ) as HTMLElement;
              if (nodeElement && nodeElement.parentElement) {
                viewPort.camera?.centerFitElementIntoView(
                  nodeElement.parentElement,
                  {
                    elementExtraMarginForZoom: 300,
                  }
                );
              }
            }
          });
        });
      }
    },
    [setSelectedNode, setVisible, viewPort, centerView]
  );

  return (
    <Node
      {...nodeProps}
      onClick={handleNodeClick as any}
      animated={false}
      label={null as any}
      onEnter={ev => {
        ev.currentTarget.style.stroke = "#3B82F6";
      }}
      onLeave={ev => {
        ev.currentTarget.style.stroke = colorScheme === "dark" ? "#424242" : "#BCBEC0";
      }}
      style={{
        fill: colorScheme === "dark" ? "#292929" : "#ffffff",
        stroke: colorScheme === "dark" ? "#424242" : "#BCBEC0",
        strokeWidth: 1,
      }}
    >
      {({ node, x, y }) => {
        const hasKey = nodeProps.properties.text[0].key;
        if (!hasKey) return <TextNode node={nodeProps.properties as NodeData} x={x} y={y} />;

        return <ObjectNode node={node as NodeData} x={x} y={y} />;
      }}
    </Node>
  );
};

export const CustomNode = React.memo(CustomNodeWrapper);
