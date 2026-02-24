
"use client";

import styles from "./DocumentationOutline.module.css";

export default function DocumentationOutline({
  outlineTree,
  selectedNodeId,
  adminCommentsByNodeId,
  onSelectNode
}) {
  
  function isNodeSelectable(node) {
    return Boolean(node && node.id);
  }


  function handleSelectNode(nodeId) {
    if (typeof onSelectNode !== "function") return;
    onSelectNode(nodeId);
  }

  function handleKeyDown(event, nodeId, selectable) {
    if (!selectable) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleSelectNode(nodeId);
    }
  }

  function renderNode(node, depthLevel = 0) {
    const hasChildren = Array.isArray(node.children) && node.children.length > 0;
    const selectable = isNodeSelectable(node);

    const commentsForNode = adminCommentsByNodeId?.[node.id] || [];
    const commentsCount = commentsForNode.length;
    const lastCommentPreview = commentsCount > 0 ? String(commentsForNode[0]?.message || "") : "";

    return (
      <div key={node.id} className={styles.nodeBlock}>
        <div
          className={`${styles.nodeRow} ${selectable ? styles.nodeRowClickable : ""} ${
            selectedNodeId === node.id ? styles.nodeRowActive : ""
          }`}
          style={{ paddingLeft: 10 + depthLevel * 12 }}
          onClick={selectable ? () => handleSelectNode(node.id) : undefined}
          onKeyDown={(e) => handleKeyDown(e, node.id, selectable)}
          role={selectable ? "button" : undefined}
          tabIndex={selectable ? 0 : undefined}
          aria-current={selectedNodeId === node.id ? "true" : "false"}
        >
          <span className={styles.nodeTitle}>{node.title}</span>

          {commentsCount > 0 ? (
            <span className={styles.commentsBadge} title={lastCommentPreview}>
              {commentsCount}
            </span>
          ) : null}
        </div>

        {hasChildren ? (
          <div className={styles.children}>
            {node.children.map((child) => renderNode(child, depthLevel + 1))}
          </div>
        ) : null}
      </div>
    );
  }

  const safeOutlineTree = Array.isArray(outlineTree) ? outlineTree : [];
  return <div className={styles.outline}>{safeOutlineTree.map((n) => renderNode(n, 0))}</div>;
}
