import { useEffect } from "react";
import useFile from "../store/useFile";
import useJSONAnalyzer from "../store/useJSONAnalyzer";
import useJSONLibrary from "../store/useJSONLibrary";
import useMultiJSON from "../store/useMultiJSON";

/**
 * Hook pour synchroniser la sélection du JSON Library avec l'éditeur
 * Charge automatiquement le contenu JSON quand on le sélectionne dans la bibliothèque
 */
export const useSyncJSONLibraryWithEditor = () => {
  useEffect(() => {
    let prevSelectedId: string | null = null;

    const unsubscribeLibrary = (useJSONLibrary.subscribe as any)(
      (state: any) => state.selectedId,
      (selectedId: string | null) => {
        if (!selectedId || selectedId === prevSelectedId) return;

        prevSelectedId = selectedId;

        const json = useJSONLibrary.getState().getJSON(selectedId);
        if (json) {
          // Charger le contenu dans l'éditeur
          useFile.getState().setContents({
            contents: json.content,
            hasChanges: false,
          });

          // Analyser le schéma (si pas déjà fait)
          const schemas = useJSONAnalyzer.getState().getAllSchemas();
          const alreadyAnalyzed = schemas.some(s => s.sourceJsonId === selectedId);
          if (!alreadyAnalyzed) {
            useJSONAnalyzer.getState().analyzeSchema(selectedId, json.content);
          }

          // Ajouter à l'historique
          useMultiJSON.getState().addToHistory(selectedId, "opened");
        }
      }
    );

    return () => unsubscribeLibrary();
  }, []);
};

export default useSyncJSONLibraryWithEditor;
