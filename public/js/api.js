/**
 * public/js/api.js
 * Universal API Client and UI Helper for SkillForge.
 * Simple, vanilla JavaScript for seamless communication with Express backend.
 */

// Central Configuration
const API_BASE_URL = '/api';

/**
 * Retrieve active user session from LocalStorage
 */
function getCurrentUser() {
  const userJson = localStorage.getItem('skillforge_user');
  if (!userJson) return null;
  try {
    return JSON.parse(userJson);
  } catch (e) {
    return null;
  }
}

/**
 * Retrieve JWT token
 */
function getAuthToken() {
  return localStorage.getItem('skillforge_token');
}

/**
 * Set current user session
 */
function setSession(user, token) {
  localStorage.setItem('skillforge_user', JSON.stringify(user));
  if (token) {
    localStorage.setItem('skillforge_token', token);
  }
}

/**
 * Clear session and redirect to login
 */
function logout() {
  localStorage.removeItem('skillforge_user');
  localStorage.removeItem('skillforge_token');
  // Call server logout to clear HTTP-only cookie if set
  fetch(`${API_BASE_URL}/auth/logout`, { method: 'POST' }).finally(() => {
    window.location.href = '/login.html';
  });
}

/**
 * Universal Fetch wrapper with automatic Auth headers and error handling
 */
async function apiFetch(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {})
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      if (response.status === 401 && !window.location.pathname.includes('login.html') && !window.location.pathname.includes('register.html') && window.location.pathname !== '/' && !window.location.pathname.endsWith('index.html')) {
        // Token expired or invalid on protected route
        localStorage.removeItem('skillforge_user');
        localStorage.removeItem('skillforge_token');
        window.location.href = '/login.html?session=expired';
        return;
      }
      throw new Error(data.message || `Request failed with status ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error(`API Error on ${endpoint}:`, error);
    throw error;
  }
}

/**
 * UI Toast Notification Helper (Clean Bootstrap 5 Toast)
 */
function showToast(message, type = 'success') {
  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    toastContainer.style.zIndex = '1100';
    document.body.appendChild(toastContainer);
  }

  const bgClass = type === 'success' ? 'bg-success text-white' : type === 'danger' ? 'bg-danger text-white' : 'bg-primary text-white';
  const icon = type === 'success' ? 'bi-check-circle-fill' : type === 'danger' ? 'bi-exclamation-triangle-fill' : 'bi-info-circle-fill';

  const toastEl = document.createElement('div');
  toastEl.className = `toast align-items-center ${bgClass} border-0 shadow-lg`;
  toastEl.setAttribute('role', 'alert');
  toastEl.setAttribute('aria-live', 'assertive');
  toastEl.setAttribute('aria-atomic', 'true');
  toastEl.innerHTML = `
    <div class="d-flex">
      <div class="toast-body d-flex align-items-center gap-2">
        <i class="bi ${icon}"></i>
        <span>${message}</span>
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  toastContainer.appendChild(toastEl);
  if (window.bootstrap && window.bootstrap.Toast) {
    const toast = new bootstrap.Toast(toastEl, { delay: 3500 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
  } else {
    // Fallback if bootstrap JS hasn't loaded
    setTimeout(() => toastEl.remove(), 3500);
  }
}

/**
 * Protect routes: Redirect to login if user is not authenticated.
 * If logged-in user is an admin accessing student pages, redirect to admin portal.
 */
function requireAuth() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    return null;
  }
  // If an administrator visits any student page, route them directly to the admin workspace
  const path = window.location.pathname;
  const isStudentPage = !path.includes('admin.html') && !path.includes('login.html') && !path.includes('register.html') && !path.endsWith('/') && !path.endsWith('index.html');
  if (user.role === 'admin' && isStudentPage) {
    window.location.href = '/admin.html';
    return null;
  }
  return user;
}

/**
 * Protect admin routes: Verify that the authenticated user strictly holds role: 'admin'
 * If unauthorized or ordinary student, deny access and redirect to student dashboard.
 */
function requireAdmin() {
  const user = getCurrentUser();
  if (!user) {
    window.location.href = `/login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
    return null;
  }
  if (user.role !== 'admin') {
    alert('Access Denied. Administrator privileges required.');
    window.location.href = '/dashboard.html';
    return null;
  }
  return user;
}

/**
 * Initialize Sidebar and Header components on portal pages
 */
function initPortalUI() {
  const user = getCurrentUser();
  if (user) {
    // Populate user initials and name in top header badge
    const headerUserName = document.getElementById('header-user-name');
    const headerUserAvatar = document.getElementById('header-user-avatar');
    if (headerUserName) {
      headerUserName.textContent = user.name || (user.role === 'admin' ? 'Administrator' : 'Student');
    }
    if (headerUserAvatar) {
      const initials = (user.name || (user.role === 'admin' ? 'AD' : 'ST')).split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
      headerUserAvatar.textContent = initials;
    }
  }

  // Toggle mobile sidebar
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const sidebar = document.getElementById('sidebar');
  if (sidebarToggle && sidebar) {
    sidebarToggle.addEventListener('click', () => {
      sidebar.classList.toggle('show');
    });
  }
}

// Auto-run portal UI helper if DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  initPortalUI();
});

