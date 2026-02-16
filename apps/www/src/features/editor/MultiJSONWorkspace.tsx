import React, { useState } from "react";
import { Tabs, Tooltip, ActionIcon, Group } from "@mantine/core";
import styled from "styled-components";
import { Allotment } from "allotment";
import { MdAdd, MdRefresh, MdAnalytics } from "react-icons/md";
import useJSONAnalyzer from "../../store/useJSONAnalyzer";
import useJSONLibrary from "../../store/useJSONLibrary";
import useMultiJSON from "../../store/useMultiJSON";
import ComparisonsView from "./ComparisonsView";
import JSONLibraryPanel from "./JSONLibraryPanel";
import MultiJSONImportModal from "./MultiJSONImportModal";
import OptimizationsPanel from "./OptimizationsPanel";
import RelationsPanel from "./RelationsPanel";

const WorkspaceWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;
  background: ${({ theme }: any) => theme.BACKGROUND};
`;

const TabsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid rgba(200, 200, 200, 0.2);
  background: ${({ theme }: any) => theme.BACKGROUND_SECONDARY};
`;

const TabsWrapper = styled.div`
  flex: 1;
  overflow: hidden;
`;

const ActionBar = styled.div`
  display: flex;
  gap: 8px;
`;

interface MultiJSONWorkspaceProps {
  children?: React.ReactNode;
}

export const MultiJSONWorkspace: React.FC<MultiJSONWorkspaceProps> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string | null>("library");
  const [importModalOpen, setImportModalOpen] = useState(false);
  const { getSelectedId } = useJSONLibrary();
  const { syncAnalyses, getLibraryStats } = useMultiJSON();

  const selectedId = getSelectedId();
  const stats = getLibraryStats();

  const handleImportJSON = (jsonId: string) => {
    // Sync analyses après import
    syncAnalyses([jsonId]);
  };

  const handleSyncAll = () => {
    syncAnalyses();
  };

  return (
    <>
      <WorkspaceWrapper>
        <TabsHeader>
          <h2 style={{ margin: 0, fontSize: "16px" }}>📊 JSON Workspace</h2>
          <ActionBar>
            <Tooltip
              label={`${stats.totalJSON} JSON, ${stats.totalOptimizationOpportunities} optimisations`}
            >
              <Group gap={4} style={{ fontSize: "12px", opacity: 0.7 }}>
                <span>📦 {stats.totalJSON}</span>
                <span>🔍 {stats.totalOptimizationOpportunities}</span>
              </Group>
            </Tooltip>
            <Tooltip label="Synchroniser les analyses">
              <ActionIcon variant="light" onClick={handleSyncAll} size="lg">
                <MdRefresh size={16} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Importer un JSON">
              <ActionIcon
                variant="light"
                color="blue"
                onClick={() => setImportModalOpen(true)}
                size="lg"
              >
                <MdAdd size={16} />
              </ActionIcon>
            </Tooltip>
          </ActionBar>
        </TabsHeader>

        <TabsWrapper>
          <Tabs
            value={activeTab}
            onChange={setActiveTab}
            style={{ height: "100%", display: "flex", flexDirection: "column" }}
          >
            <Tabs.List>
              <Tabs.Tab value="library">📚 Bibliothèque</Tabs.Tab>
              <Tabs.Tab value="optimizations">⚡ Optimisations</Tabs.Tab>
              <Tabs.Tab value="relations">🔗 Relations</Tabs.Tab>
              <Tabs.Tab value="comparisons">🔄 Comparaisons</Tabs.Tab>
            </Tabs.List>

            <div style={{ flex: 1, overflow: "hidden" }}>
              <Tabs.Panel value="library" style={{ height: "100%", overflow: "auto" }}>
                <JSONLibraryPanel onAddJSON={() => setImportModalOpen(true)} />
              </Tabs.Panel>

              <Tabs.Panel value="optimizations" style={{ height: "100%", overflow: "auto" }}>
                <OptimizationsPanel jsonId={selectedId || undefined} />
              </Tabs.Panel>

              <Tabs.Panel value="relations" style={{ height: "100%", overflow: "auto" }}>
                <RelationsPanel jsonId={selectedId || undefined} />
              </Tabs.Panel>

              <Tabs.Panel value="comparisons" style={{ height: "100%", overflow: "auto" }}>
                <ComparisonsView jsonId={selectedId || undefined} />
              </Tabs.Panel>
            </div>
          </Tabs>
        </TabsWrapper>
      </WorkspaceWrapper>

      <MultiJSONImportModal
        isOpen={importModalOpen}
        onClose={() => setImportModalOpen(false)}
        onImported={handleImportJSON}
      />

      {/* Contenu principal (éditeur/graphe) */}
      {children}
    </>
  );
};

export default MultiJSONWorkspace;
