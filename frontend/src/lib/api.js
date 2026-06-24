// Use FastAPI directly in the browser. This makes every network request visibly
// target port 8000 while CORS permits the React development origin on port 3000.
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api';

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type': 'application/json', ...options.headers },
    ...options,
  });
  if (!response.ok) {
    const body = await response.json().catch(() => null);
    const detail = Array.isArray(body?.detail)
      ? body.detail.map((item) => item.msg || JSON.stringify(item)).join('; ')
      : body?.detail;
    throw new Error(detail || `Request failed (${response.status})`);
  }
  return response.status === 204 ? null : response.json();
}

export const api = {
  listUsers: (uid) => request(`/users${uid ? `?uid=${encodeURIComponent(uid)}` : ''}`),
  createUser: (user) => request('/users', { method: 'POST', body: JSON.stringify(user) }),
  login: (credentials) => request('/users/login', { method: 'POST', body: JSON.stringify(credentials) }),
  updateUser: (email, user) => request(`/users/${encodeURIComponent(email)}`, { method: 'PUT', body: JSON.stringify(user) }),
  listPosts: () => request('/posts'),
  createPost: (post) => request('/posts', { method: 'POST', body: JSON.stringify(post) }),
  votePost: (id, vote) => request(`/posts/${id}/vote`, { method: 'POST', body: JSON.stringify(vote) }),
  deletePost: (id) => request(`/posts/${id}`, { method: 'DELETE' }),
  createComment: (postId, comment) => request(`/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify(comment) }),
  deleteComment: (id) => request(`/comments/${id}`, { method: 'DELETE' }),
  listPackages: () => request('/packages'),
  createPackage: (travelPackage) => request('/packages', { method: 'POST', body: JSON.stringify(travelPackage) }),
  updatePackage: (id, travelPackage) => request(`/packages/${id}`, { method: 'PUT', body: JSON.stringify(travelPackage) }),
  deletePackage: (id) => request(`/packages/${id}`, { method: 'DELETE' }),
  listVerifications: () => request('/verifications'),
  createVerification: (verification) => request('/verifications', { method: 'POST', body: JSON.stringify(verification) }),
  approveVerification: (id, decision) => request(`/verifications/${id}/approve`, { method: 'POST', body: JSON.stringify(decision) }),
  listFlaggedPosts: () => request('/flagged-posts'),
  createFlaggedPost: (report) => request('/flagged-posts', { method: 'POST', body: JSON.stringify(report) }),
  deleteFlaggedPost: (id) => request(`/flagged-posts/${id}`, { method: 'DELETE' }),
  listCommentReports: () => request('/comment-reports'),
  createCommentReport: (report) => request('/comment-reports', { method: 'POST', body: JSON.stringify(report) }),
  deleteCommentReport: (id) => request(`/comment-reports/${id}`, { method: 'DELETE' }),
  inspireTrip: (vibe) => request('/ai/inspire', { method: 'POST', body: JSON.stringify({ vibe }) }),
};
