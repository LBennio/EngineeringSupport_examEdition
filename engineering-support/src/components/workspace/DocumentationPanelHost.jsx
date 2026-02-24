"use client";

import TextSectionPanel from "@/components/workspace/panels/TextSectionPanel";
import StakeholdersPanel from "@/components/workspace/panels/StakeholdersPanel";
import FunctionalItemsPanel from "@/components/workspace/panels/FunctionalItemsPanel";
import ListsItemsWithBulletsPanel from "@/components/workspace/panels/ListsItemsWithBulletsPanel";
import ListsItemsWithImagePanel from "@/components/workspace/panels/ListsItemsWithImagePanel";
import OtherItemsPanel from "@/components/workspace/panels/OtherItemsPanel";
import SprintBacklogPanel from "@/components/workspace/panels/SprintBacklogPanel";
import DiagramsListPanel from "@/components/workspace/panels/DiagramsListPanel";
import ModelsListPanel from "@/components/workspace/panels/ModelsListPanel";
import UseCaseSpecsPanel from "@/components/workspace/panels/UseCaseSpecsPanel";

function findOutlineNodeById(outlineTree, targetNodeId) {
  for (const node of outlineTree || []) {
    if (String(node.id) === String(targetNodeId)) return node;
    if (node.children?.length) {
      const found = findOutlineNodeById(node.children, targetNodeId);
      if (found) return found;
    }
  }
  return null;
}

function normalizePanelType(rawType) {
  return String(rawType || "")
    .trim()
    .toLowerCase();
}

export default function DocumentationPanelHost({ docController }) {
  if (!docController) {
    return <div>Controller non disponibile (docController undefined).</div>;
  }

  const selectedNodeId = docController.selectedNodeId;
  const selectedNode = findOutlineNodeById(docController.outlineTree, selectedNodeId);

  if (!selectedNode || !selectedNode.type) {
    return <div>Seleziona un punto della scaletta per iniziare.</div>;
  }

  const panelType = normalizePanelType(selectedNode.type);


const commonPanelProps = {
  docController,
  nodeId: selectedNode.id,
  title: selectedNode.title,
  subtitle: selectedNode.subtitle || selectedNode.description || "",

  documentData: docController.documentData,
  selectedNodeId: docController.selectedNodeId,
  flattenedNodeIds: docController.flattenedNodeIds,
  selectNode: docController.selectNode,
  goToNextNode: docController.goToNextNode,
  saveDocumentationToStorage: docController.saveDocumentationToStorage,
  loadDocumentationFromStorage: docController.loadDocumentationFromStorage,
  updateNodeField: docController.updateNodeField,
  addItemToNodeList: docController.addItemToNodeList,
  updateItemInNodeList: docController.updateItemInNodeList,
  deleteItemFromNodeList: docController.deleteItemFromNodeList
};

  switch (panelType) {
    case "text":
    case "textsection":
    case "text_section":
    case "textsectionpanel":
      return <TextSectionPanel {...commonPanelProps} />;

    case "stakeholders":
    case "stakeholder":
      return <StakeholdersPanel {...commonPanelProps} />;

    case "functionalitems":
    case "functional_items":
    case "functional":
      return <FunctionalItemsPanel {...commonPanelProps} />;

    case "listwithbullets":
    case "bullets":
    case "listsitemswithbulletspanel":
      return <ListsItemsWithBulletsPanel {...commonPanelProps} />;

    case "listwithimage":
    case "image":
    case "listsitemswithimagepanel":
      return <ListsItemsWithImagePanel {...commonPanelProps} />;

    case "otheritems":
    case "other":
      return <OtherItemsPanel {...commonPanelProps} />;

    case "sprintbacklog":
    case "sprint":
      return <SprintBacklogPanel {...commonPanelProps} />;

    case "diagrams":
    case "diagram":
      return <DiagramsListPanel {...commonPanelProps} />;

    case "models":
    case "model":
      return <ModelsListPanel {...commonPanelProps} />;

    case "usecasespecs":
    case "usecase":
    case "usecases":
      return <UseCaseSpecsPanel {...commonPanelProps} />;

    default:
      return <TextSectionPanel {...commonPanelProps} />;
  }
}
