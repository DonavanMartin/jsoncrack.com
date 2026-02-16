import React, { useMemo } from "react";
import { Paper, Grid, Progress, Stack, Group, Badge, RingProgress, Center } from "@mantine/core";
import styled from "styled-components";
import { MdTrendingUp } from "react-icons/md";
import useJSONAnalyzer from "../../store/useJSONAnalyzer";
import useJSONLibrary from "../../store/useJSONLibrary";
import useMultiJSON from "../../store/useMultiJSON";

const DashboardWrapper = styled.div`
  padding: 20px;
  background: ${({ theme }: any) => theme.BACKGROUND};
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 700;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const StatCard = styled(Paper)`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 12px;
` as any;

const StatLabel = styled.div`
  font-size: 12px;
  color: rgba(200, 200, 200, 0.7);
  text-transform: uppercase;
  font-weight: 600;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #4c6ef5;
`;

const MetricCard = styled(Paper)`
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
` as any;

const MetricIcon = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28px;
  background: rgba(76, 110, 245, 0.1);
  border: 1px solid rgba(76, 110, 245, 0.2);
`;

const MetricContent = styled.div`
  flex: 1;
`;

const MetricTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 4px;
`;

const MetricDescription = styled.div`
  font-size: 12px;
  color: rgba(200, 200, 200, 0.6);
`;

const HealthBar = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
`;

const HealthSegment = styled.div<{ type: "good" | "warning" | "critical" }>`
  flex: 1;
  height: 8px;
  border-radius: 4px;
  background: ${props => {
    switch (props.type) {
      case "good":
        return "rgba(76, 200, 100, 0.5)";
      case "warning":
        return "rgba(255, 159, 64, 0.5)";
      case "critical":
        return "rgba(255, 107, 107, 0.5)";
    }
  }};
`;

export const JSONAnalyzerDashboard: React.FC = () => {
  const { getAllJSON, getByType } = useJSONLibrary();
  const { getAllSchemas, getAllOptimizations } = useJSONAnalyzer();
  const { getLibraryStats, getComparisons } = useMultiJSON();

  const stats = getLibraryStats();
  const allJSON = getAllJSON();
  const allSchemas = getAllSchemas();
  const allOptimizations = getAllOptimizations();
  const comparisons = getComparisons();

  const optimizationStats = useMemo(() => {
    const highSeverity = allOptimizations.filter(o => o.severity === "high").length;
    const mediumSeverity = allOptimizations.filter(o => o.severity === "medium").length;
    const lowSeverity = allOptimizations.filter(o => o.severity === "low").length;

    return { highSeverity, mediumSeverity, lowSeverity };
  }, [allOptimizations]);

  const complexityStats = useMemo(() => {
    if (allSchemas.length === 0) return { avg: 0, max: 0, min: 0 };

    const complexities = allSchemas.map(s => s.complexity);
    return {
      avg: Math.round(complexities.reduce((a, b) => a + b, 0) / complexities.length),
      max: Math.max(...complexities),
      min: Math.min(...complexities),
    };
  }, [allSchemas]);

  const health = useMemo(() => {
    if (allOptimizations.length === 0 || stats.totalJSON === 0) return 100;

    const criticalityScore =
      optimizationStats.highSeverity * 3 +
      optimizationStats.mediumSeverity * 2 +
      optimizationStats.lowSeverity * 1;

    return Math.max(0, 100 - (criticalityScore / stats.totalJSON) * 10);
  }, [optimizationStats, stats.totalJSON, allOptimizations.length]);

  const getHealthColor = (score: number) => {
    if (score >= 80) return "green";
    if (score >= 50) return "orange";
    return "red";
  };

  return (
    <DashboardWrapper>
      {/* Key Metrics */}
      <div>
        <SectionTitle>📊 Vue d'ensemble</SectionTitle>
        <Grid gutter="md" style={{ marginTop: "12px" }}>
          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard shadow="sm">
              <StatLabel>Total JSON</StatLabel>
              <StatValue>{stats.totalJSON}</StatValue>
              <Group gap={8} style={{ fontSize: "12px", marginTop: "8px" }}>
                <Badge size="sm" variant="light">
                  {stats.totalClasses} classes
                </Badge>
                <Badge size="sm" variant="light" color="blue">
                  {stats.totalInstances} instances
                </Badge>
              </Group>
            </StatCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard shadow="sm">
              <StatLabel>Relations détectées</StatLabel>
              <StatValue>{stats.totalRelations}</StatValue>
              <div style={{ fontSize: "12px", marginTop: "8px" }}>
                {comparisons.length} comparaisons
              </div>
            </StatCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard shadow="sm">
              <StatLabel>Complexité moyenne</StatLabel>
              <StatValue>{complexityStats.avg}</StatValue>
              <Group gap={4} style={{ fontSize: "11px", marginTop: "8px" }}>
                <span>Min: {complexityStats.min}</span>
                <span>Max: {complexityStats.max}</span>
              </Group>
            </StatCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
            <StatCard shadow="sm">
              <StatLabel>Santé globale</StatLabel>
              <Group justify="center">
                <RingProgress
                  sections={[{ value: health, color: getHealthColor(health) }]}
                  label={
                    <Center>
                      <div style={{ textAlign: "center" }}>
                        <div style={{ fontSize: "16px", fontWeight: 700 }}>
                          {Math.round(health)}%
                        </div>
                      </div>
                    </Center>
                  }
                  thickness={4}
                  size={80}
                />
              </Group>
            </StatCard>
          </Grid.Col>
        </Grid>
      </div>

      {/* Optimization Opportunities */}
      <div>
        <SectionTitle>⚡ Opportunités d'optimisation</SectionTitle>
        <Grid gutter="md" style={{ marginTop: "12px" }}>
          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <MetricCard shadow="sm">
              <MetricIcon style={{ background: "rgba(255, 107, 107, 0.1)" }}>🔴</MetricIcon>
              <MetricContent>
                <MetricTitle>{optimizationStats.highSeverity} Critiques</MetricTitle>
                <MetricDescription>Problèmes de haute priorité à résoudre</MetricDescription>
              </MetricContent>
            </MetricCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <MetricCard shadow="sm">
              <MetricIcon style={{ background: "rgba(255, 159, 64, 0.1)" }}>🟠</MetricIcon>
              <MetricContent>
                <MetricTitle>{optimizationStats.mediumSeverity} Moyens</MetricTitle>
                <MetricDescription>Améliorations recommandées</MetricDescription>
              </MetricContent>
            </MetricCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
            <MetricCard shadow="sm">
              <MetricIcon style={{ background: "rgba(76, 200, 100, 0.1)" }}>🟢</MetricIcon>
              <MetricContent>
                <MetricTitle>{optimizationStats.lowSeverity} Faibles</MetricTitle>
                <MetricDescription>Optimisations mineures disponibles</MetricDescription>
              </MetricContent>
            </MetricCard>
          </Grid.Col>
        </Grid>
      </div>

      {/* JSON Type Distribution */}
      <div>
        <SectionTitle>📈 Distribution des types</SectionTitle>
        <Grid gutter="md" style={{ marginTop: "12px" }}>
          <Grid.Col span={{ base: 12, sm: 6 }}>
            <StatCard shadow="sm">
              <StatLabel>Classes (Schémas)</StatLabel>
              <StatValue style={{ color: "#FF9F40" }}>{stats.totalClasses}</StatValue>
              <HealthBar>
                <HealthSegment type="good" />
                <HealthSegment type="warning" />
              </HealthBar>
              <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
                Structures réutilisables définies
              </div>
            </StatCard>
          </Grid.Col>

          <Grid.Col span={{ base: 12, sm: 6 }}>
            <StatCard shadow="sm">
              <StatLabel>Instances (Données)</StatLabel>
              <StatValue style={{ color: "#4C6EF5" }}>{stats.totalInstances}</StatValue>
              <Progress value={(stats.totalInstances / stats.totalJSON) * 100} />
              <div style={{ fontSize: "12px", marginTop: "8px", opacity: 0.7 }}>
                Documents avec donnésées concrètes
              </div>
            </StatCard>
          </Grid.Col>
        </Grid>
      </div>

      {/* Quick Recommendations */}
      <div>
        <SectionTitle>💡 Recommandations rapides</SectionTitle>
        <Stack gap="md" style={{ marginTop: "12px" }}>
          {optimizationStats.highSeverity > 0 && (
            <MetricCard shadow="sm" style={{ borderLeft: "4px solid #FF6B6B" }}>
              <div style={{ flex: 1 }}>
                <MetricTitle>
                  Adressez les {optimizationStats.highSeverity} problèmes critiques
                </MetricTitle>
                <MetricDescription>
                  Cela pourrait réduire la complexité de {Math.round(health)}%
                </MetricDescription>
              </div>
              <Badge color="red">URGENT</Badge>
            </MetricCard>
          )}

          {stats.totalClasses === 0 && stats.totalJSON > 1 && (
            <MetricCard shadow="sm" style={{ borderLeft: "4px solid #FFA500" }}>
              <div style={{ flex: 1 }}>
                <MetricTitle>Créez des classes réutilisables</MetricTitle>
                <MetricDescription>
                  Vous avez {stats.totalInstances} instances sans classes définies. Identifiez des
                  structures communes.
                </MetricDescription>
              </div>
              <Badge color="orange">CONSEILLÉ</Badge>
            </MetricCard>
          )}

          {stats.totalRelations === 0 && stats.totalJSON > 1 && (
            <MetricCard shadow="sm" style={{ borderLeft: "4px solid #4C6EF5" }}>
              <div style={{ flex: 1 }}>
                <MetricTitle>Analysez les relations</MetricTitle>
                <MetricDescription>
                  Lancez une synchronisation complète pour détecter les liens entre vos{" "}
                  {stats.totalJSON} JSON.
                </MetricDescription>
              </div>
              <Badge color="blue">INFO</Badge>
            </MetricCard>
          )}
        </Stack>
      </div>
    </DashboardWrapper>
  );
};

export default JSONAnalyzerDashboard;
