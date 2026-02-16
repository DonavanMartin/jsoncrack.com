import { Menu, Flex, SegmentedControl } from "@mantine/core";
import { useSessionStorage } from "@mantine/hooks";
import { CgChevronDown } from "react-icons/cg";
import { ViewMode } from "../../../enums/viewMode.enum";
import { StyledToolElement } from "./styles";

export const ViewMenu = () => {
  const [viewMode, setViewMode] = useSessionStorage({
    key: "viewMode",
    defaultValue: ViewMode.Graph,
  });

  return (
    <Menu shadow="md" closeOnItemClick={false} withArrow>
      <Menu.Target>
        <StyledToolElement>
          <Flex align="center" gap={3}>
            View <CgChevronDown />
          </Flex>
        </StyledToolElement>
      </Menu.Target>
      <Menu.Dropdown>
        <SegmentedControl
          size="md"
          w="100%"
          value={viewMode}
          onChange={e => {
            setViewMode(e as ViewMode);
          }}
          data={[
            { value: ViewMode.Graph, label: "Graph" },
            { value: ViewMode.Tree, label: "Tree" },
          ]}
          fullWidth
          orientation="vertical"
        />
      </Menu.Dropdown>
    </Menu>
  );
};
