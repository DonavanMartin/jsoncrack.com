import React from "react";
import styled from "styled-components";
import type { CustomNodeProps } from ".";
import { NODE_DIMENSIONS } from "../../../../../constants/graph";
import type { NodeData } from "../../../../../types/graph";
import useGraph from "../stores/useGraph";
import { ExpandCollapseButton } from "./ExpandCollapseButton";
import { TextRenderer } from "./TextRenderer";
import * as Styled from "./styles";

const StyledRowWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const StyledRowContent = styled.div`
  display: flex;
  align-items: center;
  flex: 1;
  min-width: 0;
  overflow: hidden;
`;

const StyledCollapseButtonWrapper = styled.div`
  display: flex;
  align-items: center;
  margin-left: 8px;
  flex-shrink: 0;
`;

type RowProps = {
  row: NodeData["text"][number];
  x: number;
  y: number;
  index: number;
  collapseId: string;
  isCollapsed: boolean;
};

const Row = ({ row, x, y, index, collapseId, isCollapsed }: RowProps) => {
  const rowPosition = index * NODE_DIMENSIONS.ROW_HEIGHT;

  const getRowText = () => {
    if (row.type === "object") return `{${row.childrenCount ?? 0} keys}`;
    if (row.type === "array") return `[${row.childrenCount ?? 0} items]`;
    return row.value;
  };

  const hasChildren = row.to && row.to.length > 0;

  return (
    <Styled.StyledRow
      $value={row.value}
      data-key={`${row.key}: ${row.value}`}
      data-x={x}
      data-y={y + rowPosition}
    >
      <StyledRowWrapper>
        <StyledRowContent>
          <Styled.StyledKey $type="object">{row.key}: </Styled.StyledKey>
          <TextRenderer>{getRowText()}</TextRenderer>
        </StyledRowContent>
        {hasChildren && (
          <StyledCollapseButtonWrapper>
            <ExpandCollapseButton
              collapseId={collapseId}
              isCollapsed={isCollapsed}
              hasChildren={true}
              childNodeIds={row.to}
            />
          </StyledCollapseButtonWrapper>
        )}
      </StyledRowWrapper>
    </Styled.StyledRow>
  );
};

const Node = ({ node, x, y }: CustomNodeProps) => {
  const collapsedNodeIds = useGraph(state => state.collapsedNodeIds);

  return (
    <Styled.StyledForeignObject
      data-id={`node-${node.id}`}
      width={node.width}
      height={node.height}
      x={0}
      y={0}
      $isObject
    >
      {node.text.map((row, index) => {
        const rowCollapseId = `${node.id}-row-${index}`;
        const isRowCollapsed = collapsedNodeIds.has(rowCollapseId);

        return (
          <Row
            key={`${node.id}-${index}`}
            row={row}
            x={x}
            y={y}
            index={index}
            collapseId={rowCollapseId}
            isCollapsed={isRowCollapsed}
          />
        );
      })}
    </Styled.StyledForeignObject>
  );
};

function propsAreEqual(prev: CustomNodeProps, next: CustomNodeProps) {
  return (
    JSON.stringify(prev.node.text) === JSON.stringify(next.node.text) &&
    prev.node.width === next.node.width
  );
}

export const ObjectNode = React.memo(Node, propsAreEqual);
