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
}) => {
  const toggleNodeCollapse = useGraph(state => state.toggleNodeCollapse);

  if (!hasChildren) {
    return null;
  }

  return (
    <StyledCircleButton
      $isCollapsed={isCollapsed}
      onClick={e => {
        e.stopPropagation();
        toggleNodeCollapse(collapseId);
      }}
      title={isCollapsed ? "Expand" : "Collapse"}
    >
      {isCollapsed ? <LuPlus size={12} /> : <LuMinus size={12} />}
    </StyledCircleButton>
  );
};
