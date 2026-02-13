import { useEffect } from "react";
import useFile from "../store/useFile";
import useJSONLibrary from "../store/useJSONLibrary";

/**
 * Hook to sync editor content changes with JSON Library file status
 * Marks file as "modified" when content changes
 */
export const useSyncEditorChanges = () => {
  const fileContents = useFile(state => state.contents);
  const selectedId = useJSONLibrary(state => state.getSelectedId());
  const json = useJSONLibrary(state => {
    const id = state.getSelectedId();
    return id ? state.getJSON(id) : null;
  });

  useEffect(() => {
    if (!fileContents || !selectedId || !json) return;

    // If content changed, mark as modified
    if (json.content !== fileContents && fileContents) {
      useJSONLibrary.getState().updateJSON(selectedId, {
        content: fileContents,
      });
    }
  }, [fileContents, selectedId, json]);
};

export default useSyncEditorChanges;
