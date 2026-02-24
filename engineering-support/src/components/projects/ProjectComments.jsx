"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { addCommentToProject, fetchCommentsForProject } from "@/lib/projectsService";
import { canAdminCommentOnProjects } from "@/lib/accessPolicy";

export default function ProjectComments({ projectId }) {
  const { authenticatedUserProfile, isAuthenticated } = useAuth();
  const authenticatedUserRole = authenticatedUserProfile?.role || "guest";

  const [projectComments, setProjectComments] = useState([]);
  const [isCommentsLoading, setIsCommentsLoading] = useState(false);
  const [commentsErrorMessage, setCommentsErrorMessage] = useState("");
  const [newCommentText, setNewCommentText] = useState("");

  const isAdminUser = isAuthenticated && canAdminCommentOnProjects(authenticatedUserProfile);

  useEffect(() => {
    async function loadProjectComments() {
      if (!isAdminUser) return;
      if (!projectId) return;

      setIsCommentsLoading(true);
      setCommentsErrorMessage("");

      try {
        const commentsFromServer = await fetchCommentsForProject(projectId);
        setProjectComments(commentsFromServer);
      } catch (commentsLoadError) {
        setCommentsErrorMessage(commentsLoadError.message || "Impossibile caricare commenti.");
      } finally {
        setIsCommentsLoading(false);
      }
    }

    loadProjectComments();
  }, [isAdminUser, projectId]);

  async function handleSubmitNewComment() {
    if (!newCommentText.trim()) return;

    setCommentsErrorMessage("");

    try {
      const commentPayload = { message: newCommentText.trim() };
      const createdComment = await addCommentToProject(projectId, commentPayload);

      setProjectComments((previousComments) => [createdComment, ...previousComments]);
      setNewCommentText("");
    } catch (commentCreateError) {
      setCommentsErrorMessage(commentCreateError.message || "Invio commento fallito.");
    }
  }

  if (!isAdminUser) return null;

  return (
    <section style={{ marginTop: 18 }}>
      <h3>Admin comments</h3>

      {isCommentsLoading ? <p>Loading comments...</p> : null}

      {commentsErrorMessage ? (
        <p style={{ color: "tomato" }}>
          <strong>{commentsErrorMessage}</strong>
        </p>
      ) : null}

      <div style={{ display: "grid", gap: 10, maxWidth: 520 }}>
        <textarea
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Write a comment as admin..."
          rows={3}
        />
        <button onClick={handleSubmitNewComment}>Send comment</button>
      </div>

      <ul style={{ marginTop: 12, paddingLeft: 16 }}>
        {projectComments.map((commentItem) => (
          <li key={commentItem.id}>
            <strong>{commentItem.authorRole}</strong>: {commentItem.message}
          </li>
        ))}
      </ul>
    </section>
  );
}
