const API_BASE = '';

function buildUrl(path) {
  return `${API_BASE}${path.startsWith('/') ? path : `/${path}`}`;
}

async function request(path, options = {}) {
  console.log('API Request:', path, options);
  const response = await fetch(buildUrl(path), options);
  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const error = new Error(payload.message || 'Request failed.');
    error.status = response.status;
    throw error;
  }

  return payload;
}

export function apiAsset(path) {
  return buildUrl(path);
}

export function getWriters() {
  return request('/api/writers');
}

export function getLibrary() {
  return request('/api/library');
}

export function getAdminLibrary(token) {
  return request('/api/admin/library', {
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function getWriter(slug) {
  return request(`/api/writers/${slug}`);
}

export function getNovel(id) {
  return request(`/api/novels/${id}`);
}

export function adminLogin(credentials) {
  return request('/api/admin/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(credentials)
  });
}

export function createWriter(token, formData) {
  return request('/api/admin/writers', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
}

export function updateWriter(token, writerId, formData) {
  return request(`/api/admin/writers/${writerId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
}

export function createNovel(token, formData) {
  return request('/api/admin/novels', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`
    },
    body: formData
  });
}

export function updateNovel(token, novelId, payload) {
  return request(`/api/admin/novels/${novelId}`, {
    method: 'PUT',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

export function deleteWriter(token, writerId) {
  return request(`/api/admin/writers/${writerId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function deleteNovel(token, novelId) {
  return request(`/api/admin/novels/${novelId}`, {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`
    }
  });
}

export function rateNovel(novelId, reviewData) {
  return request(`/api/novels/${novelId}/reviews`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(reviewData)
  });
}

export function getPopularNovels() {
  return request('/api/popular-novels');
}