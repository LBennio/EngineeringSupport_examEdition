
export const ENDPOINTS = { 
  AUTH: { 
    REGISTER: "/auth/register",
    LOGIN: "/auth/login",
    LOGOUT: "/auth/logout",
    ME: "/auth/me",
    OAUTH_START: "/auth/oauth/start"
  },
  USERS: { 
    LIST: "/users"
  },
  PROJECTS: { 
    LIST_CREATE: "/projects", 
    UPDATE_DELETE: (projectId) => `/projects/${projectId}`, 
    PDF: (projectId) => `/projects/${projectId}/pdf`, 
    COMMENTS: (projectId) => `/projects/${projectId}/comments` 
  },  
  TEAM: {
    GET_MY_TEAM: "/team/me",
    CREATE_TEAM: "/team",
    LIST_MEMBERS: "/team/members",
    ADD_MEMBER: "/team/members",
    REMOVE_MEMBER: (memberUserId) => `/team/members/${memberUserId}`
  },
  TEAM_PROJECTS: {
    LIST: "/team/projects",
    UPDATE_DELETE: (projectId) => `/team/projects/${projectId}`
  }
};
