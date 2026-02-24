import { apiRequest } from "@/lib/api";
import { ENDPOINTS } from "@/lib/endpoints";

const offlineProjectsModeEnabled =
  process.env.NEXT_PUBLIC_DEV_PROJECTS_BYPASS === "true" ||
  !process.env.NEXT_PUBLIC_API_BASE_URL;


const DEV_PROJECTS_STORAGE_KEY = "engineering_support__dev_projects__v1";
const DEV_PROJECT_COMMENTS_KEY_PREFIX = "engineering_support__dev_project_comments__v1__";


function safeReadFromLocalStorage(storageKey, fallbackValue) {
  if (typeof window === "undefined") return fallbackValue;

  try {
    const rawValue = window.localStorage.getItem(storageKey);
    if (!rawValue) return fallbackValue;
    return JSON.parse(rawValue);
  } catch (readError) {
    return fallbackValue;
  }
}


function safeWriteToLocalStorage(storageKey, value) {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(storageKey, JSON.stringify(value));
  } catch (writeError) {

  }
}

function generateClientProjectId() {
  const randomPart = Math.random().toString(16).slice(2);
  return `proj-${Date.now()}-${randomPart}`;
}

function getDevProjectsList() {
  const storedProjects = safeReadFromLocalStorage(DEV_PROJECTS_STORAGE_KEY, []);
  return Array.isArray(storedProjects) ? storedProjects : [];
}

function setDevProjectsList(projectsList) {
  safeWriteToLocalStorage(DEV_PROJECTS_STORAGE_KEY, projectsList);
}

export async function fetchProjectsForAuthenticatedUser() {
  if (offlineProjectsModeEnabled) {
    return getDevProjectsList();
  }

  const { ok, data, error } = await apiRequest(ENDPOINTS.PROJECTS.LIST_CREATE, {
    method: "GET"
  });
  if (!ok) throw new Error(error.message);
  return data;
}

export async function createProjectForAuthenticatedUser(projectDraft) {
  const projectName = String(projectDraft?.name || "").trim();
  const projectDescription = String(projectDraft?.description || "").trim();

  if (projectName === "") {
    throw new Error("Il nome del progetto è obbligatorio.");
  }

  if (offlineProjectsModeEnabled) {
    const currentProjects = getDevProjectsList();

    const createdProject = {
      id: generateClientProjectId(),
      name: projectName,
      description: projectDescription,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const updatedProjects = [createdProject, ...currentProjects];
    setDevProjectsList(updatedProjects);

    return createdProject;
  }

  const { ok, data, error } = await apiRequest(ENDPOINTS.PROJECTS.LIST_CREATE, {
    method: "POST",
    body: JSON.stringify({ name: projectName, description: projectDescription })
  });
  if (!ok) throw new Error(error.message);
  return data;
}

export async function updateProjectById(projectId, projectUpdatePayload) {
  const updatedName = String(projectUpdatePayload?.name || "").trim();
  const updatedDescription = String(projectUpdatePayload?.description || "").trim();

  if (updatedName === "") {
    throw new Error("Il nome del progetto è obbligatorio.");
  }

  if (offlineProjectsModeEnabled) {
    const currentProjects = getDevProjectsList();

    const updatedProjects = currentProjects.map((projectItem) => {
      if (String(projectItem.id) !== String(projectId)) return projectItem;

      return {
        ...projectItem,
        name: updatedName,
        description: updatedDescription,
        updatedAt: new Date().toISOString()
      };
    });

    setDevProjectsList(updatedProjects);

    const updatedProject = updatedProjects.find((p) => String(p.id) === String(projectId));
    if (!updatedProject) throw new Error("Progetto non trovato (offline).");

    return updatedProject;
  }

  const { ok, data, error } = await apiRequest(ENDPOINTS.PROJECTS.UPDATE_DELETE(projectId), {
    method: "PUT",
    body: JSON.stringify({ name: updatedName, description: updatedDescription })
  });
  if (!ok) throw new Error(error.message);
  return data;
}

export async function deleteProjectById(projectId) {
  if (offlineProjectsModeEnabled) {
    const currentProjects = getDevProjectsList();
    const updatedProjects = currentProjects.filter(
      (projectItem) => String(projectItem.id) !== String(projectId)
    );

    setDevProjectsList(updatedProjects);

    return { deleted: true };
  }

  const { ok, data, error } = await apiRequest(ENDPOINTS.PROJECTS.UPDATE_DELETE(projectId), {
    method: "DELETE"
  });
  if (!ok) throw new Error(error.message);
  return data;
}

export async function fetchCommentsForProject(projectId) {
  if (offlineProjectsModeEnabled) {
    const storageKey = `${DEV_PROJECT_COMMENTS_KEY_PREFIX}${String(projectId)}`;
    const storedComments = safeReadFromLocalStorage(storageKey, []);
    return Array.isArray(storedComments) ? storedComments : [];
  }

  const { ok, data, error } = await apiRequest(ENDPOINTS.PROJECTS.COMMENTS(projectId), {
    method: "GET"
  });
  if (!ok) throw new Error(error.message);
  return data;
}

export async function addCommentToProject(projectId, commentPayload) {
  const commentMessage = String(commentPayload?.message || "").trim();
  if (commentMessage === "") throw new Error("Il commento non può essere vuoto.");

  if (offlineProjectsModeEnabled) {
    const storageKey = `${DEV_PROJECT_COMMENTS_KEY_PREFIX}${String(projectId)}`;
    const currentComments = safeReadFromLocalStorage(storageKey, []);

    const newComment = {
      id: `c-${Date.now()}-${Math.random().toString(16).slice(2)}`,
      message: commentMessage,
      createdAt: new Date().toISOString()
    };

    const updatedComments = [newComment, ...(Array.isArray(currentComments) ? currentComments : [])];
    safeWriteToLocalStorage(storageKey, updatedComments);

    return newComment;
  }

  const { ok, data, error } = await apiRequest(ENDPOINTS.PROJECTS.COMMENTS(projectId), {
    method: "POST",
    body: JSON.stringify({ message: commentMessage })
  });
  if (!ok) throw new Error(error.message);
  return data;
}
