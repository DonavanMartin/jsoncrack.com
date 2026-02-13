import React, { useState } from "react";
import {
  Button,
  TextInput,
  Select,
  Badge,
  Group,
  Stack,
  Paper,
  Tooltip,
  ActionIcon,
} from "@mantine/core";
import styled from "styled-components";
import { MdAdd, MdDelete, MdLink, MdChevronLeft } from "react-icons/md";
import useJSONLibrary, { JSONMetadata } from "../../store/useJSONLibrary";
import useMultiJSON from "../../store/useMultiJSON";

const LibraryWrapper = styled.div<{ isCollapsed: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  gap: 8px;
  padding: 8px;
  background: ${({ theme }: any) => theme.BACKGROUND_SECONDARY};
  overflow: hidden;
  position: relative;
`;

const Header = styled.div`
  padding: 8px;
  border-bottom: 1px solid rgba(200, 200, 200, 0.2);
`;

const HeaderTitle = styled.h3`
  margin: 0;
  font-size: 13px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const SearchWrapper = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 0 8px;
`;

const JSONListWrapper = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 0 8px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: rgba(200, 200, 200, 0.3);
    border-radius: 3px;

    &:hover {
      background: rgba(200, 200, 200, 0.5);
    }
  }
`;

const JSONItemWrapper = styled.div<{ isSelected: boolean }>`
  padding: 8px;
  cursor: pointer;
  border-left: 3px solid ${props => (props.isSelected ? "#4C6EF5" : "transparent")};
  transition: all 0.2s ease;
  background: ${props => (props.isSelected ? "rgba(76, 110, 245, 0.1)" : "transparent")};
  border-radius: 4px;
  font-size: 12px;

  &:hover {
    background: rgba(200, 200, 200, 0.1);
    border-left-color: #4c6ef5;
  }
`;

const JSONItemName = styled.div`
  font-weight: 600;
  margin-bottom: 4px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
`;

const StatusIndicator = styled.div<{ status: "new" | "modified" | "saved" }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
  background-color: ${props => {
    switch (props.status) {
      case "new":
        return "#51cf66"; // Green for new
      case "modified":
        return "#ffd43b"; // Yellow for modified
      case "saved":
        return "rgba(200, 200, 200, 0.4)"; // Gray for saved
      default:
        return "transparent";
    }
  }};
`;

const JSONItemMeta = styled.div`
  display: flex;
  gap: 6px;
  align-items: center;
  font-size: 10px;
  color: rgba(200, 200, 200, 0.6);
`;

interface JSONLibraryPanelProps {
  onSelectJSON?: (json: JSONMetadata) => void;
  onAddJSON?: () => void;
  onCollapse?: () => void;
}

export const JSONLibraryPanel: React.FC<JSONLibraryPanelProps> = ({ onSelectJSON, onAddJSON, onCollapse }) => {
  const { getAllJSON, getJSON, selectJSON, deleteJSON } = useJSONLibrary();
  const { getSelectedId } = useJSONLibrary();
  const { addToHistory } = useMultiJSON();
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState<"all" | "class" | "instance">("all");

  const allJSON = getAllJSON();
  const selectedId = getSelectedId();

  const filtered = allJSON.filter(json => {
    const matchesSearch =
      json.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      json.description?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = filterType === "all" || json.type === filterType;
    return matchesSearch && matchesType;
  });

  const handleSelectJSON = (json: JSONMetadata) => {
    selectJSON(json.id);
    addToHistory(json.id, "opened");
    onSelectJSON?.(json);
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm("Supprimer ce JSON?")) {
      deleteJSON(id);
    }
  };

  const getIcon = (type: "class" | "instance") => {
    return type === "class" ? "🏗️" : "📄";
  };

  return (
    <LibraryWrapper isCollapsed={false}>
      <Header>
        <Group justify="space-between" align="center">
          <HeaderTitle>📚 JSON</HeaderTitle>
          <Group gap={4}>
            <Tooltip label="Importer">
              <ActionIcon variant="subtle" color="blue" onClick={onAddJSON} size="sm">
                <MdAdd size={14} />
              </ActionIcon>
            </Tooltip>
            <Tooltip label="Fermer">
              <ActionIcon
                variant="subtle"
                color="gray"
                onClick={() => onCollapse?.()}
                size="sm"
              >
                <MdChevronLeft size={14} />
              </ActionIcon>
            </Tooltip>
          </Group>
        </Group>
      </Header>

      <SearchWrapper>
        <TextInput
          placeholder="Chercher..."
          value={searchQuery}
          onChange={e => setSearchQuery(e.currentTarget.value)}
          style={{ flex: 1 }}
          size="xs"
        />
      </SearchWrapper>

      <Select
        label="Filtre"
        value={filterType}
        onChange={val => setFilterType((val as any) || "all")}
        data={[
          { label: "Tous", value: "all" },
          { label: "Classes", value: "class" },
          { label: "Instances", value: "instance" },
        ]}
        size="xs"
        styles={{
          label: { fontSize: "10px", marginBottom: "4px" },
        }}
      />

      <JSONListWrapper>
        {filtered.length === 0 ? (
          <div style={{ textAlign: "center", opacity: 0.5, fontSize: "12px", padding: "16px" }}>
            Aucun JSON
          </div>
        ) : (
          filtered.map(json => (
            <JSONItemWrapper
              key={json.id}
              isSelected={selectedId === json.id}
              onClick={() => handleSelectJSON(json)}
            >
              <JSONItemName>
                <span style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                  {getIcon(json.type)} {json.name}
                </span>
                <span style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <StatusIndicator status={json.status} title={json.status} />
                  <Tooltip label="Supprimer">
                    <ActionIcon
                      size={14}
                      variant="subtle"
                      color="red"
                      onClick={e => handleDelete(json.id, e)}
                    >
                      <MdDelete size={10} />
                    </ActionIcon>
                  </Tooltip>
                </span>
              </JSONItemName>

              <JSONItemMeta>
                {json.relatedIds.length > 0 && (
                  <Tooltip label={`${json.relatedIds.length} lien(s)`}>
                    <span style={{ display: "flex", gap: "2px", alignItems: "center" }}>
                      <MdLink size={10} /> {json.relatedIds.length}
                    </span>
                  </Tooltip>
                )}
                <span>
                  {new Date(json.updatedAt).toLocaleDateString("fr-FR", {
                    month: "short",
                    day: "numeric",
                  })}
                </span>
              </JSONItemMeta>
            </JSONItemWrapper>
          ))
        )}
      </JSONListWrapper>
    </LibraryWrapper>
  );
};

export default JSONLibraryPanel;
