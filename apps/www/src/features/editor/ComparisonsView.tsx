import React, { useState, useMemo } from "react";
import { Paper, Badge, Stack, Group, Tabs, ScrollArea, Table, Progress } from "@mantine/core";
import styled from "styled-components";
import { MdCompare, MdCheck, MdClose } from "react-icons/md";
import useJSONLibrary from "../../store/useJSONLibrary";
import useMultiJSON from "../../store/useMultiJSON";

const ComparisonWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 12px;
  padding: 12px;
  background: ${({ theme }: any) => theme.BACKGROUND_SECONDARY};
`;

const ComparisonGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;
`;

const ComparisonHeader = styled(Paper)`
  padding: 12px;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const SimilarityBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  flex: 1;
`;

const FieldTable = styled(Table)`
  font-size: 12px;

  th {
    padding: 8px;
  }

  td {
    padding: 8px;
  }
`;

interface ComparisonsViewProps {
  jsonId?: string;
}

export const ComparisonsView: React.FC<ComparisonsViewProps> = ({ jsonId }) => {
  const { getSelectedId, getAllJSON, getJSON } = useJSONLibrary();
  const { getComparisons } = useMultiJSON();
  const [selectedComparison, setSelectedComparison] = useState<string | null>(null);

  const targetId = jsonId || getSelectedId();
  const allComparisons = getComparisons();

  const relevantComparisons = useMemo(() => {
    if (!targetId) return [];
    return allComparisons.filter(c => c.jsonId1 === targetId || c.jsonId2 === targetId);
  }, [targetId, allComparisons]);

  const selectedComp = selectedComparison
    ? allComparisons.find(c => c.id === selectedComparison)
    : null;

  const json1 = selectedComp ? getJSON(selectedComp.jsonId1) : null;
  const json2 = selectedComp ? getJSON(selectedComp.jsonId2) : null;

  if (!targetId) {
    return (
      <ComparisonWrapper>
        <h3 style={{ margin: 0 }}>🔄 Comparaisons</h3>
        <Paper p="md" style={{ textAlign: "center", opacity: 0.5 }}>
          Sélectionnez un JSON pour voir les comparaisons
        </Paper>
      </ComparisonWrapper>
    );
  }

  return (
    <ComparisonWrapper>
      <h3 style={{ margin: "0 0 12px 0" }}>🔄 Comparaisons</h3>

      {relevantComparisons.length === 0 ? (
        <Paper p="md" style={{ textAlign: "center", opacity: 0.5 }}>
          Aucune comparaison disponible
        </Paper>
      ) : (
        <>
          <div>
            <h4 style={{ margin: "0 0 8px 0", fontSize: "12px" }}>
              Comparaisons disponibles ({relevantComparisons.length})
            </h4>
            <Stack gap={8}>
              {relevantComparisons.map(comp => {
                const otherJsonId = comp.jsonId1 === targetId ? comp.jsonId2 : comp.jsonId1;
                const otherJson = getJSON(otherJsonId);

                return (
                  <Paper
                    key={comp.id}
                    p="xs"
                    onClick={() => setSelectedComparison(comp.id)}
                    style={{
                      cursor: "pointer",
                      background:
                        selectedComparison === comp.id ? "rgba(76, 110, 245, 0.1)" : "transparent",
                      border:
                        selectedComparison === comp.id
                          ? "1px solid rgba(76, 110, 245, 0.3)"
                          : "1px solid transparent",
                    }}
                  >
                    <Group justify="space-between">
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: "12px", fontWeight: 600 }}>{otherJson?.name}</div>
                        <div style={{ fontSize: "11px", opacity: 0.6 }}>
                          {comp.commonFields.length} champs communs
                        </div>
                      </div>
                      <Badge color="blue" variant="light" size="sm">
                        {Math.round(comp.similarityScore * 100)}%
                      </Badge>
                    </Group>
                  </Paper>
                );
              })}
            </Stack>
          </div>

          {selectedComp && json1 && json2 && (
            <Paper p="md" style={{ flex: 1, overflow: "auto" }}>
              <Stack gap="md">
                {/* Similarity Overview */}
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 600,
                      marginBottom: "8px",
                    }}
                  >
                    Similarité: {Math.round(selectedComp.similarityScore * 100)}%
                  </div>
                  <Progress value={selectedComp.similarityScore * 100} color="blue" />
                </div>

                {/* Champs communs */}
                <div>
                  <h4
                    style={{
                      margin: "0 0 8px 0",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    ✅ Champs communs ({selectedComp.commonFields.length})
                  </h4>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                      gap: "6px",
                    }}
                  >
                    {selectedComp.commonFields.map(field => (
                      <div
                        key={field}
                        style={{
                          padding: "6px 8px",
                          background: "rgba(76, 200, 100, 0.1)",
                          borderRadius: "4px",
                          fontSize: "11px",
                          border: "1px solid rgba(76, 200, 100, 0.2)",
                          fontFamily: "monospace",
                        }}
                      >
                        {field}
                      </div>
                    ))}
                  </div>
                </div>

                {/* Différences */}
                {selectedComp.differencesCount > 0 && (
                  <div>
                    <h4
                      style={{
                        margin: "0 0 8px 0",
                        fontSize: "12px",
                        fontWeight: 600,
                      }}
                    >
                      ⚠️ Différences ({selectedComp.differencesCount})
                    </h4>
                    <div style={{ fontSize: "12px", opacity: 0.7 }}>
                      {selectedComp.differencesCount} champs différents ou absents
                    </div>
                  </div>
                )}

                {/* Recommandations */}
                <div
                  style={{
                    padding: "8px",
                    background: "rgba(76, 110, 245, 0.1)",
                    borderRadius: "4px",
                    fontSize: "11px",
                  }}
                >
                  <div style={{ fontWeight: 600, marginBottom: "4px" }}>💡 Recommandation:</div>
                  {selectedComp.similarityScore > 0.7
                    ? "Ces JSON ont une structure similaire. Considérez d'extraire une classe commune."
                    : selectedComp.similarityScore > 0.4
                      ? "Ces JSON partagent plusieurs champs communs. Une classe partielle pourrait être utile."
                      : "Ces JSON sont assez différents. Pas de refactorisation majeure recommandée."}
                </div>
              </Stack>
            </Paper>
          )}
        </>
      )}
    </ComparisonWrapper>
  );
};

export default ComparisonsView;
