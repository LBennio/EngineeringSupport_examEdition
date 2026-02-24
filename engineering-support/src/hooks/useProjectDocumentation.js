"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { documentationOutlineTree, flattenOutlineNodeIds } from "@/lib/documentationSchema";

function buildDocumentationStorageKey(projectId) {
  return `engineering-support:documentation:${String(projectId)}`;
}

function isValidProjectId(projectId) {
  const normalizedId = String(projectId || "").trim();
  if (!normalizedId) return false;
  if (normalizedId.includes("[") || normalizedId.includes("]")) return false;
  return true;
}

function createInitialDocumentationData() {
  return {
    nodes: {},
    adminCommentsByNodeId: {}
  };
}

function normalizeLoadedDocumentationData(rawValue) {
  const safeObject = rawValue && typeof rawValue === "object" ? rawValue : {};

  const safeNodes =
    safeObject.nodes && typeof safeObject.nodes === "object" ? safeObject.nodes : {};

  const safeAdminComments =
    safeObject.adminCommentsByNodeId && typeof safeObject.adminCommentsByNodeId === "object"
      ? safeObject.adminCommentsByNodeId
      : {};

  return {
    nodes: safeNodes,
    adminCommentsByNodeId: safeAdminComments
  };
}

export function useProjectDocumentation(projectId) {
  const flattenedNodeIds = useMemo(() => flattenOutlineNodeIds(documentationOutlineTree), []);
  const defaultSelectedNodeId = flattenedNodeIds[0] || null;

  const [selectedNodeId, setSelectedNodeId] = useState(defaultSelectedNodeId);
  const [documentData, setDocumentData] = useState(createInitialDocumentationData());

  const [isDocumentLoading, setIsDocumentLoading] = useState(true);
  const [documentErrorMessage, setDocumentErrorMessage] = useState("");

  const hasCompletedInitialLoadRef = useRef(false);

  const loadDocumentationFromStorage = useCallback(() => {
    setIsDocumentLoading(true);
    setDocumentErrorMessage("");

    if (!isValidProjectId(projectId)) {
      setDocumentData(createInitialDocumentationData());
      setDocumentErrorMessage("ProjectId non valido o mancante. Apri la workspace da un progetto valido.");
      setIsDocumentLoading(false);
      hasCompletedInitialLoadRef.current = true;
      return;
    }

    try {
      const storageKey = buildDocumentationStorageKey(projectId);
      const rawJsonString = localStorage.getItem(storageKey);

      if (!rawJsonString) {
        setDocumentData(createInitialDocumentationData());
        return;
      }

      const parsedData = JSON.parse(rawJsonString);
      const normalizedData = normalizeLoadedDocumentationData(parsedData);
      setDocumentData(normalizedData);
    } catch (loadError) {
      setDocumentErrorMessage("Impossibile caricare la documentazione (storage corrupt o non disponibile).");
      setDocumentData(createInitialDocumentationData());
    } finally {
      setIsDocumentLoading(false);
      hasCompletedInitialLoadRef.current = true;
    }
  }, [projectId]);

  useEffect(() => {
    loadDocumentationFromStorage();
  }, [loadDocumentationFromStorage]);

  useEffect(() => {
    if (!hasCompletedInitialLoadRef.current) return;
    if (!isValidProjectId(projectId)) return;

    const storageKey = buildDocumentationStorageKey(projectId);

    const autosaveTimeoutId = window.setTimeout(() => {
      try {
        localStorage.setItem(storageKey, JSON.stringify(documentData));
      } catch (autosaveError) {
        setDocumentErrorMessage("Autosave fallito: storage pieno o non disponibile.");
      }
    }, 250);

    return () => window.clearTimeout(autosaveTimeoutId);
  }, [projectId, documentData]);

  const saveDocumentationToStorage = useCallback(() => {
    if (!isValidProjectId(projectId)) {
      return { ok: false, errorMessage: "ProjectId non valido o mancante." };
    }

    try {
      const storageKey = buildDocumentationStorageKey(projectId);
      localStorage.setItem(storageKey, JSON.stringify(documentData));
      return { ok: true, errorMessage: "" };
    } catch (saveError) {
      return {
        ok: false,
        errorMessage: "Impossibile salvare la documentazione (storage pieno o non disponibile)."
      };
    }
  }, [projectId, documentData]);


  const selectNode = useCallback((nodeId) => {
    setSelectedNodeId(nodeId);
  }, []);

  const goToNextNode = useCallback(() => {
    if (!selectedNodeId) return;

    const currentIndex = flattenedNodeIds.findIndex((id) => id === selectedNodeId);
    const nextIndex = currentIndex + 1;

    if (nextIndex >= 0 && nextIndex < flattenedNodeIds.length) {
      setSelectedNodeId(flattenedNodeIds[nextIndex]);
    }
  }, [selectedNodeId, flattenedNodeIds]);

  function ensureNodeState(previousData, nodeId, fallbackNodeState) {
    const previousNodeState = previousData.nodes?.[nodeId];
    if (previousNodeState) return previousNodeState;
    return fallbackNodeState;
  }
   updateNodeField = useCallback((nodeId, fieldName, fieldValue, fallbackNodeState = {}) => {
    setDocumentData((previousData) => {
      const currentNodeState = ensureNodeState(previousData, nodeId, fallbackNodeState);

      return {
        ...previousData,
        nodes: {
          ...previousData.nodes,
          [nodeId]: {
            ...currentNodeState,
            [fieldName]: fieldValue
          }
        }
      };
    });
  }, []);

  const addItemToNodeList = useCallback((nodeId, listFieldName, newItem, fallbackNodeState = {}) => {
    setDocumentData((previousData) => {
      const currentNodeState = ensureNodeState(previousData, nodeId, fallbackNodeState);
      const previousList = Array.isArray(currentNodeState[listFieldName]) ? currentNodeState[listFieldName] : [];

      return {
        ...previousData,
        nodes: {
          ...previousData.nodes,
          [nodeId]: {
            ...currentNodeState,
            [listFieldName]: [newItem, ...previousList]
          }
        }
      };
    });
  }, []);

  const updateItemInNodeList = useCallback((nodeId, listFieldName, itemId, updatedItem, fallbackNodeState = {}) => {
    setDocumentData((previousData) => {
      const currentNodeState = ensureNodeState(previousData, nodeId, fallbackNodeState);
      const previousList = Array.isArray(currentNodeState[listFieldName]) ? currentNodeState[listFieldName] : [];

      const updatedList = previousList.map((item) =>
        String(item.id) === String(itemId) ? updatedItem : item
      );

      return {
        ...previousData,
        nodes: {
          ...previousData.nodes,
          [nodeId]: {
            ...currentNodeState,
            [listFieldName]: updatedList
          }
        }
      };
    });
  }, []);

  const deleteItemFromNodeList = useCallback((nodeId, listFieldName, itemId, fallbackNodeState = {}) => {
    setDocumentData((previousData) => {
      const currentNodeState = ensureNodeState(previousData, nodeId, fallbackNodeState);
      const previousList = Array.isArray(currentNodeState[listFieldName]) ? currentNodeState[listFieldName] : [];

      const updatedList = previousList.filter((item) => String(item.id) !== String(itemId));

      return {
        ...previousData,
        nodes: {
          ...previousData.nodes,
          [nodeId]: {
            ...currentNodeState,
            [listFieldName]: updatedList
          }
        }
      };
    });
  }, []);

  return {
    outlineTree: documentationOutlineTree,
    flattenedNodeIds,
    selectedNodeId,
    documentData,
    isDocumentLoading,
    documentErrorMessage,
    selectNode,
    goToNextNode,
    updateNodeField,
    addItemToNodeList,
    updateItemInNodeList,
    deleteItemFromNodeList,
    saveDocumentationToStorage,
    loadDocumentationFromStorage
  };
}
