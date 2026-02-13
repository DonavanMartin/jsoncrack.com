import React, { useMemo } from "react";
import { Paper, Badge, Group, Stack, Tooltip, Card } from "@mantine/core";
import styled from "styled-components";
import { MdArrowForward, MdDataObject } from "react-icons/md";
import useJSONAnalyzer, { Relationship } from "../../store/useJSONAnalyzer";
import useJSONLibrary, { JSONMetadata } from "../../store/useJSONLibrary";

const RelationsWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }: any) => theme.BACKGROUND_SECONDARY};
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(200, 200, 200, 0.3);
    border-radius: 3px;
  }
`;

const RelationNode = styled(Paper)`
  padding: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(76, 110, 245, 0.2);

  &:hover {
    border-color: rgba(76, 110, 245, 0.5);
    box-shadow: 0 4px 12px rgba(76, 110, 245, 0.1);
  }
` as any;

const NodeIcon = styled.div<{ type: "reference" | "schema-match" | "common-field" | "class" | "instance" }>`
  display: inline-block;
  width: 24px;
  height: 24px;
  border-radius: 4px;
  background: ${props =>
    typeof props.type === "string" ? 
      (props.type.includes("reference") || props.type === "class" ? "rgba(255, 159, 64, 0.2)" : "rgba(76, 110, 245, 0.2)")
      : "rgba(76, 110, 245, 0.2)"};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
`;

const RelationLine = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 8px 0;
  font-size: 12px;
`;

const SourceNode = styled.div`
  flex: 1;
  padding: 8px;
  background: rgba(100, 100, 100, 0.1);
  border-radius: 4px;
  font-size: 12px;
  color: rgba(200, 200, 200, 0.9);
`;

const RelationType = styled.div`
  padding: 4px 8px;
  background: rgba(76, 110, 245, 0.2);
  border-radius: 3px;
  font-size: 11px;
  font-weight: 600;
  color: #4c6ef5;
`;

const TargetNode = styled.div`
  flex: 1;
  padding: 8px;
  background: rgba(76, 110, 245, 0.1);
  border-radius: 4px;
  font-size: 12px;
  color: rgba(200, 200, 200, 0.9);
`;

const DependencyGraph = styled.div`
  position: relative;
  padding: 12px;
  background: rgba(100, 100, 100, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(76, 110, 245, 0.1);
`;

const DependencyLevel = styled.div`
  margin-bottom: 12px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const LevelLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  color: rgba(200, 200, 200, 0.6);
  margin-bottom: 6px;
  text-transform: uppercase;
`;

const LevelNodes = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 8px;
`;

const LevelNode = styled.div<{ type: "class" | "instance" }>`
  padding: 8px;
  background: ${props =>
    props.type === "class" ? "rgba(255, 159, 64, 0.15)" : "rgba(76, 110, 245, 0.15)"};
  border: 1px solid
    ${props => (props.type === "class" ? "rgba(255, 159, 64, 0.3)" : "rgba(76, 110, 245, 0.3)")};
  border-radius: 4px;
  font-size: 11px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    filter: brightness(1.2);
  }
`;

interface RelationsPanelProps {
  jsonId?: string;
  onSelectJSON?: (json: JSONMetadata) => void;
}

export const RelationsPanel: React.FC<RelationsPanelProps> = ({ jsonId, onSelectJSON }) => {
  const { getJSON, getSelectedId, getAllJSON, selectJSON } = useJSONLibrary();
  const { getRelationships } = useJSONAnalyzer();

  const targetId = jsonId || getSelectedId();
  const currentJSON = targetId ? getJSON(targetId) : null;
  const relations = targetId ? getRelationships(targetId) : [];

  // Construire le graphe de dépendances
  const dependencyLevels = useMemo(() => {
    const allJSON = getAllJSON();
    const levels: JSONMetadata[][] = [];
    const visited = new Set<string>();

    const buildLevels = (startId: string, level: number) => {
      if (visited.has(startId) || level >= 3) return;
      visited.add(startId);

      if (!levels[level]) levels[level] = [];

      const json = getJSON(startId);
      if (json && !levels[level].some(j => j.id === json.id)) {
        levels[level].push(json);
      }

      const json_relations = getRelationships(startId);
      json_relations.forEach(rel => {
        buildLevels(rel.targetId, level + 1);
      });
    };

    if (targetId) {
      buildLevels(targetId, 0);
    }

    return levels;
  }, [targetId]);

  const handleSelectJSON = (id: string) => {
    selectJSON(id);
    const json = getJSON(id);
    if (json) {
      onSelectJSON?.(json);
    }
  };

  return (
    <RelationsWrapper>
      <div>
        <h3 style={{ margin: "0 0 12px 0" }}>🔗 Relations</h3>
      </div>

      {!currentJSON ? (
        <Paper p="md" style={{ textAlign: "center", opacity: 0.5 }}>
          Sélectionnez un JSON pour voir ses relations
        </Paper>
      ) : (
        <>
          {/* Current JSON Info */}
          <RelationNode shadow="xs" style={{ background: "rgba(76, 110, 245, 0.05)" }}>
            <Group justify="space-between" align="start">
              <Stack gap={4}>
                <Group gap={8}>
                  <NodeIcon type={currentJSON.type}>
                    {currentJSON.type === "class" ? "C" : "D"}
                  </NodeIcon>
                  <div style={{ fontWeight: 600 }}>{currentJSON.name}</div>
                </Group>
                {currentJSON.description && (
                  <div style={{ fontSize: "12px", opacity: 0.7 }}>{currentJSON.description}</div>
                )}
              </Stack>
              <Badge size="sm" variant="light">
                {currentJSON.relatedIds.length} relation(s)
              </Badge>
            </Group>
          </RelationNode>

          {/* Direct Relations */}
          {relations.length > 0 && (
            <div>
              <h4 style={{ margin: "12px 0 8px 0", fontSize: "12px" }}>Relations directes</h4>
              <Stack gap={8}>
                {relations.map((rel, idx) => (
                  <RelationNode key={`${rel.targetId}-${idx}`} shadow="xs" onClick={() => handleSelectJSON(rel.targetId)}>
                    <RelationLine>
                      <SourceNode>
                        <MdDataObject size={12} /> {currentJSON.name}
                      </SourceNode>
                      <MdArrowForward size={14} />
                      <TargetNode>
                        <NodeIcon type={rel.type}>{rel.type === "reference" ? "REF" : "MATCH"}</NodeIcon>
                        {rel.sourceId}
                      </TargetNode>
                    </RelationLine>
                  </RelationNode>
                ))}
              </Stack>
            </div>
          )}

          {/* Dependency Graph */}
          {dependencyLevels.length > 1 && (
            <div>
              <h4 style={{ margin: "12px 0 8px 0", fontSize: "12px" }}>Graphe de dépendances</h4>
              <DependencyGraph>
                {dependencyLevels.map((level, levelIndex) => (
                  <DependencyLevel key={`level-${levelIndex}`}>
                    <LevelLabel>
                      Niveau {levelIndex}
                      {levelIndex === 0 ? " (Actuel)" : ""}
                    </LevelLabel>
                    <LevelNodes>
                      {level.map(json => (
                        <Tooltip
                          key={json.id}
                          label={`${json.type === "class" ? "Classe" : "Instance"}: ${json.name}`}
                        >
                          <LevelNode type={json.type} onClick={() => handleSelectJSON(json.id)}>
                            {json.name.substring(0, 15)}
                            {json.name.length > 15 ? "..." : ""}
                          </LevelNode>
                        </Tooltip>
                      ))}
                    </LevelNodes>
                  </DependencyLevel>
                ))}
              </DependencyGraph>
            </div>
          )}
        </>
      )}
    </RelationsWrapper>
  );
};

export default RelationsPanel;
