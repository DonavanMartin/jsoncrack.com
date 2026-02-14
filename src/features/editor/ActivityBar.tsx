import React from "react";
import { Tooltip } from "@mantine/core";
import styled from "styled-components";
import { MdLibraryBooks, MdSearch, MdExtension, MdSettings } from "react-icons/md";
import { BiSolidDockLeft } from "react-icons/bi";
import { FiDownload, FiUpload } from "react-icons/fi";
import { useModal } from "../../store/useModal";
import useFile from "../../store/useFile";

const ActivityBarWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 12px 8px;
  background: ${({ theme }: any) => theme.BACKGROUND_SECONDARY};
  border-right: 1px solid rgba(200, 200, 200, 0.1);
  height: 100%;
  width: 50px;
  min-width: 50px;
`;

const ActivityBarButton = styled.button<{ isActive: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  background: ${props =>
    props.isActive ? "rgba(76, 110, 245, 0.2)" : "transparent"};
  border-left: 3px solid ${props => (props.isActive ? "#4C6EF5" : "transparent")};
  transition: all 0.2s ease;
  color: rgba(200, 200, 200, 0.7);

  &:hover {
    background: rgba(200, 200, 200, 0.1);
    color: rgba(200, 200, 200, 0.9);
  }

  svg {
    font-size: 20px;
  }
`;

interface ActivityBarProps {
  activePanel: "json-library" | "search" | "extensions" | "preferences" | null;
  onSelectPanel: (panel: "json-library" | "search" | "extensions" | "preferences" | null) => void;
  fullscreen?: boolean;
  onToggleFullscreen?: () => void;
}

export const ActivityBar: React.FC<ActivityBarProps> = ({ activePanel, onSelectPanel, fullscreen, onToggleFullscreen }) => {
  const setVisible = useModal(state => state.setVisible);
  const getContents = useFile(state => state.getContents);
  const getFormat = useFile(state => state.getFormat);

  const handleClick = (panel: "json-library" | "search" | "extensions" | "preferences") => {
    // Toggle: if already active, close it; otherwise open it
    if (activePanel === panel) {
      onSelectPanel(null);
    } else {
      onSelectPanel(panel);
    }
  };

  const handleToggleFullscreen = () => {
    onToggleFullscreen?.();
  };

  const handleExport = () => {
    const a = document.createElement("a");
    const file = new Blob([getContents()], { type: "text/plain" });
    a.href = window.URL.createObjectURL(file);
    a.download = `jsoncrack.${getFormat()}`;
    a.click();
  };

  return (
    <ActivityBarWrapper>
      <Tooltip label="JSON Library" position="right">
        <ActivityBarButton
          isActive={activePanel === "json-library"}
          onClick={() => handleClick("json-library")}
        >
          <MdLibraryBooks />
        </ActivityBarButton>
      </Tooltip>

      <Tooltip label="Search" position="right">
        <ActivityBarButton
          isActive={activePanel === "search"}
          onClick={() => handleClick("search")}
        >
          <MdSearch />
        </ActivityBarButton>
      </Tooltip>

      <Tooltip label="Tools" position="right">
        <ActivityBarButton
          isActive={activePanel === "extensions"}
          onClick={() => handleClick("extensions")}
        >
          <MdExtension />
        </ActivityBarButton>
      </Tooltip>

      <Tooltip label="Import" position="right">
        <ActivityBarButton
          isActive={false}
          onClick={() => {
            setVisible("ImportModal", true);
          }}
        >
          <FiUpload />
        </ActivityBarButton>
      </Tooltip>

      <Tooltip label="Export" position="right">
        <ActivityBarButton
          isActive={false}
          onClick={handleExport}
        >
          <FiDownload />
        </ActivityBarButton>
      </Tooltip>

      <Tooltip label="Preferences" position="right">
        <ActivityBarButton
          isActive={activePanel === "preferences"}
          onClick={() => handleClick("preferences")}
        >
          <MdSettings />
        </ActivityBarButton>
      </Tooltip>

      <div style={{ marginTop: "auto" }}>
        <Tooltip label={fullscreen ? "Exit Fullscreen" : "Fullscreen"} position="right">
          <ActivityBarButton
            isActive={false}
            onClick={handleToggleFullscreen}
          >
            <BiSolidDockLeft />
          </ActivityBarButton>
        </Tooltip>
      </div>
    </ActivityBarWrapper>
  );
};

export default ActivityBar;
