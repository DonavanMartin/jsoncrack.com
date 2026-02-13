import React from "react";
import { Badge, Paper, Progress, Group, Stack, Tooltip, ActionIcon, Tabs } from "@mantine/core";
import styled from "styled-components";
import { MdTrendingUp, MdCheckCircle, MdWarning, MdInfo } from "react-icons/md";
import useJSONAnalyzer, { OptimizationSuggestion } from "../../store/useJSONAnalyzer";
import useJSONLibrary from "../../store/useJSONLibrary";
import useMultiJSON from "../../store/useMultiJSON";

const OptimizationWrapper = styled.div`
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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const StatCard = styled(Paper)`
  padding: 12px;
  text-align: center;
` as any;

const StatValue = styled.div`
  font-size: 18px;
  font-weight: 700;
  color: #4c6ef5;
`;

const StatLabel = styled.div`
  font-size: 11px;
  color: rgba(200, 200, 200, 0.7);
  margin-top: 4px;
`;

const SuggestionCard = styled(Paper)<{ severity: "low" | "medium" | "high" }>`
  padding: 12px;
  border-left: 4px solid
    ${props => {
      switch (props.severity) {
        case "high":
          return "#FF6B6B";
        case "medium":
          return "#FFA500";
        case "low":
          return "#4ECDC4";
      }
    }};
  transition: all 0.2s ease;

  &:hover {
    transform: translateX(4px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
` as any;

const SuggestionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: start;
  margin-bottom: 8px;
`;

const SuggestionTitle = styled.h4`
  margin: 0;
  font-size: 13px;
  font-weight: 600;
`;

const SuggestionDescription = styled.p`
  margin: 0 0 8px 0;
  font-size: 12px;
  color: rgba(200, 200, 200, 0.8);
`;

const SavingsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  margin-top: 8px;
`;

const SavingItem = styled.div`
  padding: 6px;
  background: rgba(76, 110, 245, 0.1);
  border-radius: 4px;
  font-size: 11px;
`;

interface OptimizationsPanelProps {
  jsonId?: string;
}

export const OptimizationsPanel: React.FC<OptimizationsPanelProps> = ({ jsonId }) => {
  const { suggestOptimizations, getAllOptimizations } = useJSONAnalyzer();
  const { getSelectedId } = useJSONLibrary();
  const { getLibraryStats } = useMultiJSON();

  const targetId = jsonId || getSelectedId();
  const suggestions = targetId ? suggestOptimizations(targetId) : getAllOptimizations();
  const stats = getLibraryStats();

  const highSeverity = suggestions.filter(s => s.severity === "high").length;
  const mediumSeverity = suggestions.filter(s => s.severity === "medium").length;
  const totalSavings = suggestions.reduce((sum, s) => sum + (s.estimatedSavings.sizeKB || 0), 0);

  const getSeverityIcon = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return <MdWarning size={16} />;
      case "medium":
        return <MdTrendingUp size={16} />;
      case "low":
        return <MdInfo size={16} />;
    }
  };

  const getSeverityColor = (severity: "low" | "medium" | "high") => {
    switch (severity) {
      case "high":
        return "red";
      case "medium":
        return "orange";
      case "low":
        return "cyan";
    }
  };

  return (
    <OptimizationWrapper>
      <div>
        <h3 style={{ margin: "0 0 12px 0" }}>🔍 Optimisations</h3>
      </div>

      {/* Stats Header */}
      <StatsGrid>
        <StatCard shadow="xs">
          <StatValue>{stats.totalOptimizationOpportunities}</StatValue>
          <StatLabel>Opportunités</StatLabel>
        </StatCard>
        <StatCard shadow="xs" style={{ background: "rgba(255, 107, 107, 0.1)" }}>
          <StatValue style={{ color: "#FF6B6B" }}>{highSeverity}</StatValue>
          <StatLabel>Critiques</StatLabel>
        </StatCard>
        <StatCard shadow="xs">
          <StatValue>{stats.totalJSON}</StatValue>
          <StatLabel>JSON</StatLabel>
        </StatCard>
        <StatCard shadow="xs" style={{ background: "rgba(76, 110, 245, 0.1)" }}>
          <StatValue style={{ color: "#4C6EF5" }}>
            {totalSavings}
            KB
          </StatValue>
          <StatLabel>Économies potentielles</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Suggestions list */}
      <div>
        {suggestions.length === 0 ? (
          <Paper p="md" style={{ textAlign: "center", opacity: 0.5 }}>
            <MdCheckCircle size={32} style={{ margin: "0 auto 8px" }} />
            Aucune optimisation suggérée!
          </Paper>
        ) : (
          <Stack gap={8}>
            {suggestions
              .sort((a, b) => {
                const severityOrder = { high: 0, medium: 1, low: 2 };
                return severityOrder[a.severity] - severityOrder[b.severity];
              })
              .map(suggestion => (
                <SuggestionCard key={suggestion.id} severity={suggestion.severity} shadow="xs">
                  <SuggestionHeader>
                    <div style={{ flex: 1 }}>
                      <SuggestionTitle>{suggestion.description}</SuggestionTitle>
                    </div>
                    <Group gap={4}>
                      {getSeverityIcon(suggestion.severity)}
                      <Badge
                        size="xs"
                        variant="light"
                        color={getSeverityColor(suggestion.severity)}
                      >
                        {suggestion.severity === "high"
                          ? "Critique"
                          : suggestion.severity === "medium"
                            ? "Moyen"
                            : "Faible"}
                      </Badge>
                    </Group>
                  </SuggestionHeader>

                  <div>
                    <div style={{ fontSize: "11px", marginBottom: "8px" }}>
                      Impact: {suggestion.impact}%
                    </div>
                    <Progress
                      value={suggestion.impact}
                      color={
                        suggestion.severity === "high"
                          ? "red"
                          : suggestion.severity === "medium"
                            ? "orange"
                            : "cyan"
                      }
                      size="sm"
                    />
                  </div>

                  {(suggestion.estimatedSavings.sizeKB ||
                    suggestion.estimatedSavings.complexity) && (
                    <SavingsGrid>
                      {suggestion.estimatedSavings.sizeKB && (
                        <SavingItem>💾 -{suggestion.estimatedSavings.sizeKB}KB</SavingItem>
                      )}
                      {suggestion.estimatedSavings.complexity && (
                        <SavingItem>
                          📉 -{suggestion.estimatedSavings.complexity}% Complexité
                        </SavingItem>
                      )}
                    </SavingsGrid>
                  )}

                  {suggestion.affectedPaths.length > 0 && (
                    <div style={{ marginTop: "8px" }}>
                      <div style={{ fontSize: "11px", marginBottom: "4px" }}>Chemins affectés:</div>
                      <div
                        style={{
                          fontSize: "11px",
                          color: "rgba(200, 200, 200, 0.6)",
                          fontFamily: "monospace",
                          whiteSpace: "pre-wrap",
                          wordBreak: "break-all",
                        }}
                      >
                        {suggestion.affectedPaths.join("\n")}
                      </div>
                    </div>
                  )}
                </SuggestionCard>
              ))}
          </Stack>
        )}
      </div>
    </OptimizationWrapper>
  );
};

export default OptimizationsPanel;
