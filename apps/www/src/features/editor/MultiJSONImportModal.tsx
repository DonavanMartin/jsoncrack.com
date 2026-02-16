import React, { useCallback, useState } from "react";
import {
  Modal,
  Button,
  Stack,
  Textarea,
  TextInput,
  Select,
  FileInput,
  Group,
  Alert,
} from "@mantine/core";
import styled from "styled-components";
import { MdCloudUpload, MdWarning } from "react-icons/md";
import useJSONAnalyzer from "../../store/useJSONAnalyzer";
import useJSONLibrary from "../../store/useJSONLibrary";

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

interface MultiJSONImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImported?: (jsonId: string) => void;
}

export const MultiJSONImportModal: React.FC<MultiJSONImportModalProps> = ({
  isOpen,
  onClose,
  onImported,
}) => {
  const { addJSON } = useJSONLibrary();
  const { analyzeSchema } = useJSONAnalyzer();

  const [name, setName] = useState("");
  const [type, setType] = useState<"class" | "instance">("instance");
  const [description, setDescription] = useState("");
  const [content, setContent] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileChange = useCallback(async (selectedFile: File | null) => {
    if (!selectedFile) return;

    setFile(selectedFile);
    setName(selectedFile.name.replace(/\.[^/.]+$/, "")); // Supprimer l'extension

    try {
      const text = await selectedFile.text();
      // Valider que c'est du JSON
      JSON.parse(text);
      setContent(text);
      setError(null);
    } catch (err) {
      setError("Le fichier n'est pas un JSON valide");
      setContent("");
    }
  }, []);

  const handlePasteJSON = useCallback((text: string) => {
    try {
      JSON.parse(text);
      setContent(text);
      setError(null);
    } catch {
      setError("Le contenu n'est pas un JSON valide");
    }
  }, []);

  const handleImport = async () => {
    setError(null);

    // Validation
    if (!name.trim()) {
      setError("Le nom est requis");
      return;
    }

    if (!content.trim()) {
      setError("Le contenu JSON est requis");
      return;
    }

    try {
      setIsLoading(true);

      // Valider le JSON
      JSON.parse(content);

      // Ajouter à la bibliothèque
      const jsonId = addJSON({
        name: name.trim(),
        type,
        description: description.trim(),
        content,
        relatedIds: [],
        tags: [],
      });

      // Analyser le schéma automatiquement
      analyzeSchema(jsonId, content);

      // Reset form
      setName("");
      setType("instance");
      setDescription("");
      setContent("");
      setFile(null);

      onImported?.(jsonId);
      onClose();
    } catch (err) {
      setError("Erreur lors de l'importation: " + (err instanceof Error ? err.message : ""));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal opened={isOpen} onClose={onClose} title="📥 Importer un JSON" size="lg">
      <Stack gap="md">
        {error && (
          <Alert icon={<MdWarning />} title="Erreur" color="red">
            {error}
          </Alert>
        )}

        <FormGroup>
          <TextInput
            label="Nom"
            placeholder="Ex: Utilisateurs, Schéma_Produit"
            value={name}
            onChange={e => setName(e.currentTarget.value)}
            required
          />
        </FormGroup>

        <FormGroup>
          <Select
            label="Type"
            value={type}
            onChange={val => setType((val as any) || "instance")}
            data={[
              { label: "Instance (données concrètes)", value: "instance" },
              { label: "Classe (schéma template)", value: "class" },
            ]}
          />
        </FormGroup>

        <FormGroup>
          <Textarea
            label="Description"
            placeholder="Description optionnelle du JSON..."
            value={description}
            onChange={e => setDescription(e.currentTarget.value)}
            minRows={2}
          />
        </FormGroup>

        <div style={{ borderTop: "1px solid rgba(200, 200, 200, 0.2)", paddingTop: "12px" }}>
          <h4 style={{ margin: "0 0 12px 0" }}>Contenu JSON</h4>

          <FileInput
            label="Importer un fichier JSON"
            placeholder="Sélectionner un fichier"
            accept=".json"
            onChange={handleFileChange}
            clearable
          />

          <div style={{ margin: "12px 0", textAlign: "center", opacity: 0.5 }}>— OU —</div>

          <Textarea
            label="Ou collez votre JSON ici"
            placeholder='{"key": "value"}'
            value={content}
            onChange={e => handlePasteJSON(e.currentTarget.value)}
            minRows={6}
            styles={{
              input: {
                fontFamily: "monospace",
                fontSize: "12px",
              },
            }}
          />
        </div>

        <Group justify="flex-end" gap="sm">
          <Button variant="default" onClick={onClose}>
            Annuler
          </Button>
          <Button
            onClick={handleImport}
            loading={isLoading}
            disabled={!name.trim() || !content.trim()}
          >
            Importer
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
};

export default MultiJSONImportModal;
