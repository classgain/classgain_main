const configuredApiUrl = import.meta.env.VITE_API_URL;
export const API = (configuredApiUrl || '/api').replace(/\/$/, '');

function isJsonResponse(response) {
  return (response.headers.get('content-type') || '').includes('application/json');
}

function buildRequestHeaders(options = {}) {
  const headers = new Headers(options.headers || {});

  if (options.body && !(options.body instanceof FormData) && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  return headers;
}

function buildPartnerHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : undefined;
}

function buildQueryString(params = {}) {
  const searchParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.set(key, value);
    }
  });

  const queryString = searchParams.toString();
  return queryString ? `?${queryString}` : '';
}

export async function fetchEducationItems(category, options = {}) {
  const response = await fetch(`${API}/education/${encodeURIComponent(category)}`, {
    cache: 'no-store',
    credentials: 'include',
    ...options
  });

  if (!response.ok) {
    throw new Error('Unable to load education data from MongoDB right now.');
  }

  if (!isJsonResponse(response)) {
    throw new Error('Education API is not connected yet. Check the Render backend.');
  }

  return response.json();
}

export async function fetchAllEducationItems(options = {}) {
  const response = await fetch(`${API}/education`, {
    cache: 'no-store',
    credentials: 'include',
    ...options
  });

  if (!response.ok) {
    throw new Error('Unable to load all education centers from MongoDB right now.');
  }

  if (!isJsonResponse(response)) {
    throw new Error('Education API is not connected yet. Check the Render backend.');
  }

  return response.json();
}

export async function fetchEducationItemDetails(itemId, options = {}) {
  const response = await fetch(`${API}/education/details/${encodeURIComponent(itemId)}`, {
    cache: 'no-store',
    credentials: 'include',
    ...options
  });

  if (!response.ok) {
    throw new Error('Unable to load this education center details from MongoDB right now.');
  }

  if (!isJsonResponse(response)) {
    throw new Error('Education details API is not connected yet. Check the Render backend.');
  }

  return response.json();
}

export async function createEducationApplication(itemId, payload) {
  return apiRequest(`/education/details/${encodeURIComponent(itemId)}/apply`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function apiRequest(path, options = {}) {
  let response;

  try {
    response = await fetch(`${API}${path}`, {
      credentials: 'include',
      ...options,
      headers: buildRequestHeaders(options)
    });
  } catch (_error) {
    throw new Error('Cannot reach the backend right now. Check that the server is running and the API URL is correct.');
  }

  const contentIsJson = isJsonResponse(response);
  const data = contentIsJson ? await response.json().catch(() => ({})) : {};

  if (!contentIsJson) {
    if (!response.ok) {
      throw new Error(`Backend API returned ${response.status}. Check that the Node/Express server has this route.`);
    }

    throw new Error('The frontend is live, but the backend API is not connected yet.');
  }

  if (!response.ok || data.success === false) {
    throw new Error(data.message || 'Request failed. Please try again.');
  }

  return data;
}

export function signupStudent(payload) {
  return apiRequest('/user/signup', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function loginStudent(payload) {
  return apiRequest('/user/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchStudentDashboard(params = {}) {
  const { token } = params;

  return apiRequest('/user/dashboard', {
    method: 'GET',
    headers: token
      ? {
          Authorization: `Bearer ${token}`
        }
      : undefined
  });
}

function buildStudentHeaders(token) {
  return token
    ? {
        Authorization: `Bearer ${token}`
      }
    : undefined;
}

export function updateStudentProfile(payload) {
  const { token, ...requestBody } = payload;

  return apiRequest('/user/profile', {
    method: 'POST',
    headers: buildStudentHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function createStudentDashboardItem(collection, payload) {
  const { token, ...requestBody } = payload;

  return apiRequest(`/user/${encodeURIComponent(collection)}`, {
    method: 'POST',
    headers: buildStudentHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function updateStudentDashboardItem(collection, itemId, payload) {
  const { token, ...requestBody } = payload;

  return apiRequest(`/user/${encodeURIComponent(collection)}/${encodeURIComponent(itemId)}`, {
    method: 'PATCH',
    headers: buildStudentHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function deleteStudentDashboardItem(collection, itemId, token, options = {}) {
  const queryString = buildQueryString({ email: options.email });

  return apiRequest(`/user/${encodeURIComponent(collection)}/${encodeURIComponent(itemId)}${queryString}`, {
    method: 'DELETE',
    headers: buildStudentHeaders(token)
  });
}

export function registerEducationPartner(payload) {
  return apiRequest('/partners/register', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function loginEducationPartner(payload) {
  return apiRequest('/partners/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function submitEducationCenterHelpTicket(payload) {
  return apiRequest('/education-center/help', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function registerEducationCenter(payload) {
  const body = new FormData();
  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') body.append(key, value);
  });
  return apiRequest('/education-center/register', {
    method: 'POST',
    body
  });
}

export function loginEducationCenter(payload) {
  return apiRequest('/education-center/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

export function fetchEducationCenterDashboard(params = {}) {
  const { token } = params;

  return apiRequest('/partners/dashboard', {
    method: 'GET',
    headers: buildPartnerHeaders(token)
  });
}

export function createEducationCenterUpload(payload) {
  const { token, ...requestBody } = payload;

  return apiRequest('/partners/education-center', {
    method: 'POST',
    headers: buildPartnerHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function createVideoUploaderChannel(payload) {
  const { token, ...requestBody } = payload;

  return apiRequest('/partners/video-channel', {
    method: 'POST',
    headers: buildPartnerHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function createEducationCenterCourse(payload) {
  const { token, ...requestBody } = payload;

  return apiRequest('/partners/courses', {
    method: 'POST',
    headers: buildPartnerHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function updateEducationCenterCourse(courseId, payload) {
  const { token, ...requestBody } = payload;

  return apiRequest(`/partners/courses/${encodeURIComponent(courseId)}`, {
    method: 'PATCH',
    headers: buildPartnerHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function deleteEducationCenterCourse(courseId, token) {
  return apiRequest(`/partners/courses/${encodeURIComponent(courseId)}`, {
    method: 'DELETE',
    headers: buildPartnerHeaders(token)
  });
}

export function createEducationCenterScholarship(payload) {
  const { token, ...requestBody } = payload;

  return apiRequest('/partners/scholarships', {
    method: 'POST',
    headers: buildPartnerHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function updateEducationCenterScholarship(scholarshipId, payload) {
  const { token, ...requestBody } = payload;

  return apiRequest(`/partners/scholarships/${encodeURIComponent(scholarshipId)}`, {
    method: 'PATCH',
    headers: buildPartnerHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function deleteEducationCenterScholarship(scholarshipId, token) {
  return apiRequest(`/partners/scholarships/${encodeURIComponent(scholarshipId)}`, {
    method: 'DELETE',
    headers: buildPartnerHeaders(token)
  });
}

export function updateEducationCenterApplication(applicationId, payload) {
  const { token, ...requestBody } = payload;

  return apiRequest(`/partners/applications/${encodeURIComponent(applicationId)}`, {
    method: 'PATCH',
    headers: buildPartnerHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function createEducationCenterGalleryImage(payload) {
  const { token, ...requestBody } = payload;

  return apiRequest('/partners/gallery-images', {
    method: 'POST',
    headers: buildPartnerHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function deleteEducationCenterGalleryImage(imageId, token) {
  return apiRequest(`/partners/gallery-images/${encodeURIComponent(imageId)}`, {
    method: 'DELETE',
    headers: buildPartnerHeaders(token)
  });
}

export function createEducationCenterVideo(payload) {
  const { token, ...requestBody } = payload;

  return apiRequest('/partners/videos', {
    method: 'POST',
    headers: buildPartnerHeaders(token),
    body: JSON.stringify(requestBody)
  });
}

export function deleteEducationCenterVideo(videoId, token) {
  return apiRequest(`/partners/videos/${encodeURIComponent(videoId)}`, {
    method: 'DELETE',
    headers: buildPartnerHeaders(token)
  });
}
