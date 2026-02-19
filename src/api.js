const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export const getToken = () => localStorage.getItem("safera_token");
export const getUser  = () => { const u = localStorage.getItem("safera_user"); return u ? JSON.parse(u) : null; };
export const saveAuth = (token, user) => { localStorage.setItem("safera_token", token); localStorage.setItem("safera_user", JSON.stringify(user)); };
export const clearAuth = () => { localStorage.removeItem("safera_token"); localStorage.removeItem("safera_user"); };

const request = async (path, options = {}) => {
  const token = getToken();
  const res = await fetch(`${BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.message || "Request failed");
  return data;
};

export const authAPI = {
  register: (body) => request("/auth/register", { method: "POST", body: JSON.stringify(body) }),
  login:    (body) => request("/auth/login",    { method: "POST", body: JSON.stringify(body) }),
  me:       ()     => request("/auth/me"),
};

export const userAPI = {
  getProfile:     ()          => request("/user/profile"),
  updateProfile:  (body)      => request("/user/profile",         { method: "PUT",    body: JSON.stringify(body) }),
  changePassword: (body)      => request("/user/change-password", { method: "PUT",    body: JSON.stringify(body) }),
  getAllUsers:     ()          => request("/user/all"),
  deleteUser:     (id)        => request(`/user/${id}`,           { method: "DELETE" }),
  updateUserRole: (id, role)  => request(`/user/${id}/role`,      { method: "PUT",    body: JSON.stringify({ role }) }),
};

export const sosAPI = {
  send:         (body)        => request("/sos",              { method: "POST", body: JSON.stringify(body) }),
  myAlerts:     ()            => request("/sos/my"),
  allAlerts:    ()            => request("/sos/all"),
  updateStatus: (id, status)  => request(`/sos/${id}/status`, { method: "PUT",  body: JSON.stringify({ status }) }),
};

export const contactsAPI = {
  getAll:  ()          => request("/contacts"),
  create:  (body)      => request("/contacts",      { method: "POST",   body: JSON.stringify(body) }),
  update:  (id, body)  => request(`/contacts/${id}`,{ method: "PUT",    body: JSON.stringify(body) }),
  remove:  (id)        => request(`/contacts/${id}`,{ method: "DELETE" }),
};

export const broadcastAPI = {
  send:   (body) => request("/broadcast",      { method: "POST",   body: JSON.stringify(body) }),
  getAll: ()     => request("/broadcast"),
  delete: (id)   => request(`/broadcast/${id}`, { method: "DELETE" }),
};