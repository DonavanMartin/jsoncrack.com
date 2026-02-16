import React from "react";
import { Overlay, Stack, Text } from "@mantine/core";
import useConfig from "../../../../store/useConfig";

export const NotSupported = () => {
  const darkmodeEnabled = useConfig(state => state.darkmodeEnabled);

  return (
    <Overlay
      backgroundOpacity={0.8}
      color={darkmodeEnabled ? "gray" : "rgb(226, 240, 243)"}
      blur="1.5"
      center
    >
      <Stack maw="60%" align="center" justify="center" gap="sm">
        <Text fz="48" fw={600} c="bright">
          Diagram too large
        </Text>
        <Text ta="center" size="lg" fw={500} c="gray" maw="600">
          This diagram is too large to display. Please reduce the size of your data.
        </Text>
      </Stack>
    </Overlay>
  );
};
