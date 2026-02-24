
export const DOCUMENT_NODE_TYPES = {
  TEXT_SECTION: "TEXT_SECTION",
  STAKEHOLDERS: "STAKEHOLDERS",
  FUNCTIONAL_ITEMS: "FUNCTIONAL_ITEMS",
  LIST_ITEMS_WITH_BULLETS: "LIST_ITEMS_WITH_BULLETS",
  LIST_ITEMS_WITH_IMAGE: "LIST_ITEMS_WITH_IMAGE",
  OTHER_ITEMS: "OTHER_ITEMS",
  SPRINT_BACKLOG: "SPRINT_BACKLOG",
  DIAGRAMS_LIST: "DIAGRAMS_LIST",
  USE_CASE_SPECS: "USE_CASE_SPECS",
  MODELS_LIST: "MODELS_LIST",
  DEPLOYMENT_DIAGRAMS: "DEPLOYMENT_DIAGRAMS"
};

export const documentationOutlineTree = [
  {
    id: "pb",
    title: "1. Product Backlog",
    children: [
      { id: "pb.1.1", title: "1.1 Introduzione", type: DOCUMENT_NODE_TYPES.TEXT_SECTION },
      { id: "pb.1.2", title: "1.2 Contesto di business", type: DOCUMENT_NODE_TYPES.TEXT_SECTION },
      { id: "pb.1.3", title: "1.3 Stakeholder", type: DOCUMENT_NODE_TYPES.STAKEHOLDERS },
      { id: "pb.1.4", title: "1.4 Item Funzionali", type: DOCUMENT_NODE_TYPES.FUNCTIONAL_ITEMS },
      {
        id: "pb.1.5",
        title: "1.5 Item Informativi",
        type: DOCUMENT_NODE_TYPES.LIST_ITEMS_WITH_BULLETS,
        meta: { itemPrefix: "II" }
      },
      {
        id: "pb.1.6",
        title: "1.6 Item di Interfaccia",
        type: DOCUMENT_NODE_TYPES.LIST_ITEMS_WITH_IMAGE,
        meta: { itemPrefix: "UI" }
      },
      {
        id: "pb.1.7",
        title: "1.7 Item Qualitativi",
        type: DOCUMENT_NODE_TYPES.LIST_ITEMS_WITH_BULLETS,
        meta: { itemPrefix: "IQ" }
      },
      { id: "pb.1.8", title: "1.8 Altri Item", type: DOCUMENT_NODE_TYPES.OTHER_ITEMS }
    ]
  },
  {
    id: "sr",
    title: "2. Sprint Report",
    children: [
      { id: "sr.2.1", title: "2.1 Sprint Backlog", type: DOCUMENT_NODE_TYPES.SPRINT_BACKLOG },
      {
        id: "sr.2.2",
        title: "2.2 Product Requirement Specification",
        children: [
          {
            id: "sr.2.2.1",
            title: "2.2.1 Diagrammi dei casi d’uso",
            type: DOCUMENT_NODE_TYPES.DIAGRAMS_LIST,
            meta: { diagramKind: "Use Case Diagram" }
          },
          { id: "sr.2.2.2", title: "2.2.2 Specifiche dei casi d’uso", type: DOCUMENT_NODE_TYPES.USE_CASE_SPECS }
        ]
      },
      {
        id: "sr.2.3",
        title: "2.3 System Architecture",
        children: [
          {
            id: "sr.2.3.1",
            title: "2.3.1 Diagramma delle componenti",
            type: DOCUMENT_NODE_TYPES.DIAGRAMS_LIST,
            meta: { diagramKind: "Component Diagram" }
          },
          { id: "sr.2.3.2", title: "2.3.2 Specifica delle componenti", type: DOCUMENT_NODE_TYPES.TEXT_SECTION },
          { id: "sr.2.3.3", title: "2.3.3 Specifica delle interfacce", type: DOCUMENT_NODE_TYPES.TEXT_SECTION }
        ]
      },
      {
        id: "sr.2.4",
        title: "2.4 Detailed Product Design",
        children: [
          {
            id: "sr.2.4.1",
            title: "2.4.1 Diagramma delle classi",
            type: DOCUMENT_NODE_TYPES.DIAGRAMS_LIST,
            meta: { diagramKind: "Class Diagram" }
          },
          { id: "sr.2.4.2", title: "2.4.2 Specifica delle classi", type: DOCUMENT_NODE_TYPES.TEXT_SECTION },
          {
            id: "sr.2.4.3",
            title: "2.4.3 Diagrammi di sequenza",
            type: DOCUMENT_NODE_TYPES.DIAGRAMS_LIST,
            meta: { diagramKind: "Sequence Diagram" }
          }
        ]
      },
      {
        id: "sr.2.5",
        title: "2.5 Data Modeling and Design",
        children: [
          { id: "sr.2.5.1", title: "2.5.1 Modello logico del database", type: DOCUMENT_NODE_TYPES.MODELS_LIST },
          { id: "sr.2.5.2", title: "2.5.2 Modello fisico del database", type: DOCUMENT_NODE_TYPES.MODELS_LIST }
        ]
      },
      {
        id: "sr.2.6",
        title: "2.6 Product Deployment Design",
        type: DOCUMENT_NODE_TYPES.DEPLOYMENT_DIAGRAMS,
        meta: { diagramKind: "Deployment Diagram" }
      }
    ]
  }
];


export function flattenOutlineNodeIds(outlineTree) {
  const flatNodeIds = [];

  function walk(node) {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const isLeafWithPanel = Boolean(node.type);

    if (isLeafWithPanel) {
      flatNodeIds.push(node.id);
    }

    if (hasChildren) {
      node.children.forEach(walk);
    }
  }

  outlineTree.forEach(walk);
  return flatNodeIds;
}
