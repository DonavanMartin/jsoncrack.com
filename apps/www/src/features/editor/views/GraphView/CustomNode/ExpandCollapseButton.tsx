import React from "react";
import styled from "styled-components";
import { LuMinus, LuPlus } from "react-icons/lu";
import useGraph from "../stores/useGraph";

const StyledCircleButton = styled.button<{ $isCollapsed: boolean }>`
  background: ${({ theme }) => theme.BACKGROUND_NODE};
  border: 1px solid ${({ theme }) => theme.NODE_COLORS.DIVIDER};
  border-radius: 50%;
  padding: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  pointer-events: all;
  color: ${({ theme }) => theme.NODE_COLORS.TEXT};
  transition: all 0.15s ease;

  &:hover {
    background: ${({ theme }) => theme.GRID_COLOR_PRIMARY};
    border-color: ${({ theme }) => theme.NODE_COLORS.TEXT};
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

interface ExpandCollapseButtonProps {
  collapseId: string;
  isCollapsed: boolean;
  hasChildren: boolean;
  childNodeIds?: string[];
}


export const ExpandCollapseButton: React.FC<ExpandCollapseButtonProps> = ({
  collapseId,
  isCollapsed,
  hasChildren,
  childNodeIds,
}) => {
  const toggleNodeCollapse = useGraph(state => state.toggleNodeCollapse);
  const setSkipAutoCenter = useGraph(state => state.setSkipAutoCenter);
  const viewPort = useGraph(state => state.viewPort);

  if (!hasChildren) {
    return null;
  }

  const handleExpand = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();

    // Extract parent node ID from collapseId (format: nodeId-row-index)
    const parentNodeId = collapseId.split("-row-")[0];
    const isRootNode = parentNodeId === "1";
    
    // Prevent layout change from triggering auto-centering
    setSkipAutoCenter(true);
    toggleNodeCollapse(collapseId);

    // Apply zoom logic only for root node expand
    if (isRootNode && isCollapsed && viewPort && viewPort.camera) {
      setTimeout(() => {
        try {
          const parentNodeElement = document.querySelector(
            `[data-id="node-${parentNodeId}"]`
          ) as HTMLElement;

          if (parentNodeElement) {
            // Collect all child node elements
            const childElements: HTMLElement[] = [];

            if (childNodeIds && childNodeIds.length > 0) {
              childNodeIds.forEach(childId => {
                const childElement = document.querySelector(
                  `[data-id="node-${childId}"]`
                ) as HTMLElement;
                if (childElement) {
                  childElements.push(childElement);
                }
              });
            }

            // Get bounding rects for all elements
            const parentRect = parentNodeElement.getBoundingClientRect();
            const childRects = childElements.map(el => el.getBoundingClientRect());

            const allRects = [parentRect, ...childRects];

            // Calculate vertical bounds
            const minY = Math.min(...allRects.map(r => r.top));
            const maxY = Math.max(...allRects.map(r => r.bottom));

            // Calculate zoom to fit vertically
            const elementExtraMargin = 30;
            const verticalBounds = (maxY - minY) + elementExtraMargin * 2;
            const newZoomFactor = Math.max(
              0.1,
              (viewPort.containerHeight || 800) / verticalBounds
            );

            // Apply the calculated zoom
            const currentCenterX = viewPort.centerX || 0;
            const currentCenterY = viewPort.centerY || 0;

            // Use recenter to adjust zoom while keeping the same center position
            viewPort.camera?.recenter(currentCenterX, currentCenterY, newZoomFactor);
          }
        } catch (e) {
          console.error('Error adjusting zoom:', e);
        }
      }, 300);
    }
    
    // Re-enable auto-centering after layout settles
    setTimeout(() => {
      setSkipAutoCenter(false);
    }, 500);
  };

  return (
    <StyledCircleButton
      $isCollapsed={isCollapsed}
      onClick={handleExpand}
      title={isCollapsed ? "Expand" : "Collapse"}
    >
      {isCollapsed ? <LuPlus size={12} /> : <LuMinus size={12} />}
    </StyledCircleButton>
  );
};
