import React, { useState } from "react";
import {
  Button,
  Group,
  Stack,
  Paper,
  Tooltip,
  ActionIcon,
  SegmentedControl,
  Flex,
  Text,
  Badge,
} from "@mantine/core";
import styled from "styled-components";
import { MdChevronLeft } from "react-icons/md";
import useConfig from "../../store/useConfig";

const PreferencesWrapper = styled.div`
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

const ScrollContainer = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 8px;

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

const PreferenceItem = styled(Paper)`
  padding: 12px;
  background: rgba(200, 200, 200, 0.05);
  border: 1px solid rgba(200, 200, 200, 0.1);
  border-radius: 6px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const PreferenceLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: rgba(200, 200, 200, 0.9);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const PreferenceDescription = styled.p`
  font-size: 11px;
  color: rgba(200, 200, 200, 0.6);
  margin: 0;
  line-height: 1.4;
`;

interface PreferencesPanelProps {
  onCollapse?: () => void;
}

export const PreferencesPanel: React.FC<PreferencesPanelProps> = ({ onCollapse }) => {
  const darkmodeEnabled = useConfig(state => state.darkmodeEnabled);
  const toggleDarkMode = useConfig(state => state.toggleDarkMode);
  const [hideDevToolsTime, setHideDevToolsTime] = useState<"session" | "day" | null>(null);
  const [isRecordingShortcut, setIsRecordingShortcut] = useState(false);
  const [customShortcut, setCustomShortcut] = useState<string>("");

  const handleHideDevTools = (duration: "session" | "day") => {
    setHideDevToolsTime(duration);
    // In a real implementation, this would actually hide the dev tools
    setTimeout(() => {
      alert(`Dev Tools hidden for this ${duration}`);
      setHideDevToolsTime(null);
    }, 500);
  };

  const handleRestartServer = () => {
    if (confirm("Restart the development server?")) {
      window.location.reload();
    }
  };

  const handleResetCache = () => {
    if (confirm("Reset bundler cache and restart dev server?")) {
      window.location.reload();
    }
  };

  const handleRecordShortcut = () => {
    setIsRecordingShortcut(true);
    const handleKeyDown = (event: KeyboardEvent) => {
      event.preventDefault();
      const keysArray: string[] = [];
      if (event.ctrlKey) {
        keysArray.push("Ctrl");
      }
      if (event.shiftKey) {
        keysArray.push("Shift");
      }
      if (event.altKey) {
        keysArray.push("Alt");
      }
      if (event.metaKey) {
        keysArray.push("Cmd");
      }
      if (event.key && !["Control", "Shift", "Alt", "Meta"].includes(event.key)) {
        keysArray.push(event.key.toUpperCase());
      }
      setCustomShortcut(keysArray.join("+"));
      setIsRecordingShortcut(false);
      document.removeEventListener("keydown", handleKeyDown);
    };
    document.addEventListener("keydown", handleKeyDown);
  };

  return (
    <PreferencesWrapper>
      <Header>
        <Group justify="space-between" align="center">
          <HeaderTitle>⚙️ Preferences</HeaderTitle>
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
      </Header>

      <ScrollContainer>
        {/* Theme */}
        <PreferenceItem>
          <PreferenceLabel>Theme</PreferenceLabel>
          <PreferenceDescription>Select your theme preference.</PreferenceDescription>
          <SegmentedControl
            size="xs"
            fullWidth
            value={darkmodeEnabled ? "dark" : "light"}
            onChange={(val) => toggleDarkMode(val === "dark")}
            data={[
              { label: "Light", value: "light" },
              { label: "Dark", value: "dark" },
            ]}
          />
        </PreferenceItem>

        {/* Position */}
        <PreferenceItem>
          <PreferenceLabel>Position</PreferenceLabel>
          <PreferenceDescription>Adjust the placement of your dev tools.</PreferenceDescription>
          <SegmentedControl
            size="xs"
            fullWidth
            value="bottom-right"
            data={[
              { label: "Bottom Right", value: "bottom-right" },
              { label: "Bottom", value: "bottom" },
              { label: "Left", value: "left" },
            ]}
          />
        </PreferenceItem>

        {/* Size */}
        <PreferenceItem>
          <PreferenceLabel>Size</PreferenceLabel>
          <PreferenceDescription>Adjust the size of your dev tools.</PreferenceDescription>
          <SegmentedControl
            size="xs"
            fullWidth
            value="medium"
            data={[
              { label: "Small", value: "small" },
              { label: "Medium", value: "medium" },
              { label: "Large", value: "large" },
            ]}
          />
        </PreferenceItem>

        {/* Hide Dev Tools for this session */}
        <PreferenceItem>
          <PreferenceLabel>Hide Dev Tools</PreferenceLabel>
          <PreferenceDescription>
            Hide Dev Tools until you restart your dev server, or 1 day.
          </PreferenceDescription>
          <Flex gap="xs">
            <Button
              size="xs"
              variant={hideDevToolsTime === "session" ? "filled" : "light"}
              onClick={() => handleHideDevTools("session")}
              loading={hideDevToolsTime === "session"}
            >
              Hide Session
            </Button>
            <Button
              size="xs"
              variant={hideDevToolsTime === "day" ? "filled" : "light"}
              onClick={() => handleHideDevTools("day")}
              loading={hideDevToolsTime === "day"}
            >
              Hide 1 Day
            </Button>
          </Flex>
        </PreferenceItem>

        {/* Dev Tools Shortcut */}
        <PreferenceItem>
          <PreferenceLabel>Dev Tools Shortcut</PreferenceLabel>
          <PreferenceDescription>Set a custom keyboard shortcut to toggle visibility.</PreferenceDescription>
          <Flex gap="xs" align="center">
            <div style={{ flex: 1, fontSize: "12px", padding: "6px 8px", background: "rgba(0,0,0,0.2)", borderRadius: "4px" }}>
              {isRecordingShortcut ? "Recording..." : customShortcut || "Press Record"}
            </div>
            <Button
              size="xs"
              variant={isRecordingShortcut ? "filled" : "light"}
              onClick={handleRecordShortcut}
              loading={isRecordingShortcut}
            >
              {isRecordingShortcut ? "Recording" : "Record"}
            </Button>
          </Flex>
        </PreferenceItem>

        {/* Disable Dev Tools */}
        <PreferenceItem>
          <PreferenceLabel>Disable Dev Tools</PreferenceLabel>
          <PreferenceDescription>
            To disable this UI completely, set <code>devIndicators: false</code> in your next.config file.
          </PreferenceDescription>
          <Badge size="sm" variant="light" color="yellow">
            Requires Config Change
          </Badge>
        </PreferenceItem>

        {/* Restart Dev Server */}
        <PreferenceItem>
          <PreferenceLabel>Restart Dev Server</PreferenceLabel>
          <PreferenceDescription>
            Restarts the development server without needing to leave the browser.
          </PreferenceDescription>
          <Button
            size="xs"
            onClick={handleRestartServer}
            color="blue"
          >
            Restart
          </Button>
        </PreferenceItem>

        {/* Reset Bundler Cache */}
        <PreferenceItem>
          <PreferenceLabel>Reset Bundler Cache</PreferenceLabel>
          <PreferenceDescription>
            Clears the bundler cache and restarts the dev server. Helpful if you are seeing stale errors or changes are not appearing.
          </PreferenceDescription>
          <Button
            size="xs"
            onClick={handleResetCache}
            color="orange"
          >
            Reset Cache
          </Button>
        </PreferenceItem>
      </ScrollContainer>
    </PreferencesWrapper>
  );
};

export default PreferencesPanel;
