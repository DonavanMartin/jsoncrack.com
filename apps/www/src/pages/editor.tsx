import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useRouter } from "next/router";
import { useMantineColorScheme } from "@mantine/core";
import "@mantine/dropzone/styles.css";
import styled, { ThemeProvider } from "styled-components";
import { Allotment } from "allotment";
import "allotment/dist/style.css";
import { generateNextSeo } from "next-seo/pages";
import { SEO } from "../constants/seo";
import { darkTheme, lightTheme } from "../constants/theme";
import { BottomBar } from "../features/editor/BottomBar";
import { FullscreenDropzone } from "../features/editor/FullscreenDropzone";
import { Toolbar } from "../features/editor/Toolbar";
import useGraph from "../features/editor/views/GraphView/stores/useGraph";
import useConfig from "../store/useConfig";
import useFile from "../store/useFile";
import JSONLibraryPanel from "../features/editor/JSONLibraryPanel";
import PreferencesPanel from "../features/editor/PreferencesPanel";
import MultiJSONImportModal from "../features/editor/MultiJSONImportModal";
import useJSONLibrary from "../store/useJSONLibrary";
import useSyncJSONLibraryWithEditor from "../hooks/useSyncJSONLibraryWithEditor";
import useSyncEditorChanges from "../hooks/useSyncEditorChanges";
import ActivityBar from "../features/editor/ActivityBar";

const ModalController = dynamic(() => import("../features/modals/ModalController"));

export const StyledPageWrapper = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  width: 100%;

  @media only screen and (max-width: 320px) {
    height: 100vh;
  }
`;

export const MainEditorContainer = styled.div`
  display: flex;
  width: 100%;
  height: 100%;
  gap: 0;
`;

export const StyledEditorWrapper = styled.div`
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

export const StyledEditor = styled(Allotment)`
  position: relative !important;
  display: flex;
  width: 100%;
  height: 100%;
  background: ${({ theme }) => theme.BACKGROUND_SECONDARY};

  @media only screen and (max-width: 320px) {
    height: 100vh;
  }
`;

const StyledTextEditor = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
`;

const TextEditor = dynamic(() => import("../features/editor/TextEditor"), {
  ssr: false,
});

const LiveEditor = dynamic(() => import("../features/editor/LiveEditor"), {
  ssr: false,
});

const EditorPage = () => {
  const { query, isReady } = useRouter();
  const { setColorScheme } = useMantineColorScheme();
  const checkEditorSession = useFile(state => state.checkEditorSession);
  const darkmodeEnabled = useConfig(state => state.darkmodeEnabled);
  const fullscreen = useGraph(state => state.fullscreen);
  const toggleFullscreen = useGraph(state => state.toggleFullscreen);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [activePanel, setActivePanel] = useState<"json-library" | "search" | "extensions" | "preferences" | null>("json-library");
  const { getSelectedId } = useJSONLibrary();

  // Synchroniser la sélection du JSON library avec l'éditeur
  useSyncJSONLibraryWithEditor();
  
  // Synchroniser les changements du contenu de l'éditeur
  useSyncEditorChanges();

  useEffect(() => {
    if (isReady) checkEditorSession(query?.json);
  }, [checkEditorSession, isReady, query]);

  useEffect(() => {
    setColorScheme(darkmodeEnabled ? "dark" : "light");
  }, [darkmodeEnabled, setColorScheme]);

  return (
    <>
      <Head>
        {generateNextSeo({
          ...SEO,
          title: "Editor | JSON Crack",
          description:
            "JSON Crack Editor is a tool for visualizing into graphs, analyzing, editing, formatting, querying, transforming and validating JSON, CSV, YAML, XML, and more.",
          canonical: "https://jsoncrack.com/editor",
        })}
      </Head>
      <ThemeProvider theme={darkmodeEnabled ? darkTheme : lightTheme}>
        <ModalController />
        <StyledEditorWrapper>
          <StyledPageWrapper>
            <Toolbar />
            <StyledEditorWrapper>
              <MainEditorContainer>
                <ActivityBar 
                  activePanel={activePanel} 
                  onSelectPanel={setActivePanel}
                  fullscreen={fullscreen}
                  onToggleFullscreen={() => toggleFullscreen(!fullscreen)}
                />
                <StyledEditor proportionalLayout={true}>
                  {/* Panneau gauche: Sidebar with active panel */}
                  {!fullscreen && (activePanel === "json-library" || activePanel === "preferences") && (
                    <Allotment.Pane
                      preferredSize={280}
                      minSize={200}
                      maxSize={500}
                    >
                      {activePanel === "json-library" && (
                        <JSONLibraryPanel 
                          onAddJSON={() => setImportModalOpen(true)}
                          onCollapse={() => setActivePanel(null)}
                        />
                      )}
                      {activePanel === "preferences" && (
                        <PreferencesPanel 
                          onCollapse={() => setActivePanel(null)}
                        />
                      )}
                    </Allotment.Pane>
                  )}

                  {/* Panneau milieu: Text Editor */}
                  {!fullscreen && (
                    <Allotment.Pane
                      minSize={300}
                    >
                      <StyledTextEditor>
                        <TextEditor />
                        <BottomBar />
                      </StyledTextEditor>
                    </Allotment.Pane>
                  )}

                  {/* Panneau droit: Live Editor/Graph */}
                  <Allotment.Pane minSize={0}>
                    <LiveEditor />
                  </Allotment.Pane>
                </StyledEditor>
              </MainEditorContainer>
              <FullscreenDropzone />
            </StyledEditorWrapper>
          </StyledPageWrapper>
        </StyledEditorWrapper>

        {/* Import Modal */}
        <MultiJSONImportModal
          isOpen={importModalOpen}
          onClose={() => setImportModalOpen(false)}
          onImported={() => {
            // Optionnel: charger le JSON importé dans l'éditeur
          }}
        />
      </ThemeProvider>
    </>
  );
};

export default EditorPage;
