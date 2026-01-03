/**
 * SESMine Platform - Authentication System
 * Integrated with EmailJS for user verification
 * Version: 2.0.0
 */

// ==================== CONFIGURATION ====================
const AUTH_CONFIG = {
  emailjs: {
    serviceId: 'service_qfwvqyg',
    publicKey: 'pYI5e7c0EjKvjvgbV'
  },
  storage: {
    userKey: 'sesmine_user',
    tokenKey: 'sesmine_token',
    sessionKey: 'sesmine_session'
  },
  routes: {
    login: '/auth/login.html',
    signup: '/auth/signup.html',
    dashboard: '/dashboard/main-dashboard.html',
    adminDashboard: '/admin/admin-dashboard.html',
    adminLogin: '/admin/admin-login.html'
  },
  session: {
    timeout: 24 * 60 * 60 * 1000, // 24 hours
    refreshInterval: 15 * 60 * 1000 // 15 minutes
  }
};

// ==================== USER MANAGEMENT ====================

/**
 * Check if user is authenticated
 * @returns {boolean}
 */
function isAuthenticated() {
  const user = getCurrentUser();
  const session = getSession();
  
  if (!user || !session) {
    return false;
  }
  
  // Check if session is expired
  if (Date.now() > session.expiresAt) {
    logout();
    return false;
  }
  
  return true;
}

/**
 * Get current user from storage
 * @returns {Object|null}
 */
function getCurrentUser() {
  try {
    const userStr = localStorage.getItem(AUTH_CONFIG.storage.userKey);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Get current session
 * @returns {Object|null}
 */
function getSession() {
  try {
    const sessionStr = sessionStorage.getItem(AUTH_CONFIG.storage.sessionKey);
    return sessionStr ? JSON.parse(sessionStr) : null;
  } catch (error) {
    console.error('Error getting session:', error);
    return null;
  }
}

/**
 * Save user to storage
 * @param {Object} userData - User data to save
 */
function saveUser(userData) {
  try {
    // Create user object
    const user = {
      id: userData.id || generateUserId(),
      email: userData.email,
      name: userData.name || userData.fullName,
      company: userData.company || '',
      role: userData.role || 'user',
      plan: userData.plan || 'free',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLogin: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem(AUTH_CONFIG.storage.userKey, JSON.stringify(user));
    
    // Create session
    createSession(user);
    
    return user;
  } catch (error) {
    console.error('Error saving user:', error);
    return null;
  }
}

/**
 * Create user session
 * @param {Object} user - User object
 */
function createSession(user) {
  const session = {
    userId: user.id,
    email: user.email,
    createdAt: Date.now(),
    expiresAt: Date.now() + AUTH_CONFIG.session.timeout,
    token: generateToken()
  };
  
  sessionStorage.setItem(AUTH_CONFIG.storage.sessionKey, JSON.stringify(session));
  localStorage.setItem(AUTH_CONFIG.storage.tokenKey, session.token);
}

/**
 * Generate unique user ID
 * @returns {string}
 */
function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

/**
 * Generate session token
 * @returns {string}
 */
function generateToken() {
  return 'token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 16);
}

/**
 * Logout user
 */
function logout() {
  // Clear storage
  localStorage.removeItem(AUTH_CONFIG.storage.userKey);
  localStorage.removeItem(AUTH_CONFIG.storage.tokenKey);
  sessionStorage.removeItem(AUTH_CONFIG.storage.sessionKey);
  
  // Redirect to login
  window.location.href = AUTH_CONFIG.routes.login;
}

// ==================== AUTHENTICATION FUNCTIONS ====================

/**
 * Handle user login
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {boolean} rememberMe - Remember user
 * @returns {Promise<Object>}
 */
async function handleLogin(email, password, rememberMe = false) {
  try {
    // Validate inputs
    if (!email || !password) {
      throw new Error('Email and password are required');
    }
    
    // Check if user exists in localStorage
    const users = getAllUsers();
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
    
    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }
    
    // In production, verify password hash
    // For now, we'll accept any password for demo purposes
    
    // Save user and create session
    const savedUser = saveUser(user);
    
    // Send login notification via EmailJS
    await sendLoginNotification(savedUser);
    
    return {
      success: true,
      user: savedUser,
      message: 'Login successful'
    };
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Handle user signup
 * @param {Object} userData - User registration data
 * @returns {Promise<Object>}
 */
async function handleSignup(userData) {
  try {
    // Validate inputs
    if (!userData.email || !userData.password || !userData.fullName) {
      throw new Error('All fields are required');
    }
    
    // Check if user already exists
    const users = getAllUsers();
    const existingUser = users.find(u => u.email.toLowerCase() === userData.email.toLowerCase());
    
    if (existingUser) {
      throw new Error('User already exists. Please login instead.');
    }
    
    // Create new user
    const newUser = {
      id: generateUserId(),
      email: userData.email,
      name: userData.fullName,
      company: userData.company || '',
      phone: userData.phone || '',
      role: 'user',
      plan: 'free',
      createdAt: new Date().toISOString()
    };
    
    // Save to users list
    users.push(newUser);
    localStorage.setItem('sesmine_users', JSON.stringify(users));
    
    // Save current user and create session
    const savedUser = saveUser(newUser);
    
    // Send welcome email via EmailJS
    await sendWelcomeEmail(savedUser);
    
    return {
      success: true,
      user: savedUser,
      message: 'Registration successful'
    };
  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get all registered users
 * @returns {Array}
 */
function getAllUsers() {
  try {
    const usersStr = localStorage.getItem('sesmine_users');
    return usersStr ? JSON.parse(usersStr) : [];
  } catch (error) {
    console.error('Error getting users:', error);
    return [];
  }
}

// ==================== EMAIL NOTIFICATIONS ====================

/**
 * Send welcome email via EmailJS
 * @param {Object} user - User object
 */
async function sendWelcomeEmail(user) {
  try {
    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      from_name: 'SESMine Platform',
      subject: 'Welcome to SESMine Platform',
      message: `Welcome ${user.name}! Thank you for joining SESMine Platform. Your account has been successfully created.`,
      reply_to: 'support@sesmine.com'
    };
    
    await emailjs.send(
      AUTH_CONFIG.emailjs.serviceId,
      'template_welcome', // You'll need to create this template in EmailJS
      templateParams,
      AUTH_CONFIG.emailjs.publicKey
    );
    
    console.log('Welcome email sent successfully');
  } catch (error) {
    console.error('Error sending welcome email:', error);
    // Don't throw error - email failure shouldn't block registration
  }
}

/**
 * Send login notification via EmailJS
 * @param {Object} user - User object
 */
async function sendLoginNotification(user) {
  try {
    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      from_name: 'SESMine Platform',
      subject: 'Login Notification',
      message: `Hello ${user.name}, you have successfully logged in to SESMine Platform at ${new Date().toLocaleString()}.`,
      reply_to: 'support@sesmine.com'
    };
    
    await emailjs.send(
      AUTH_CONFIG.emailjs.serviceId,
      'template_notification', // You'll need to create this template in EmailJS
      templateParams,
      AUTH_CONFIG.emailjs.publicKey
    );
    
    console.log('Login notification sent successfully');
  } catch (error) {
    console.error('Error sending login notification:', error);
    // Don't throw error - email failure shouldn't block login
  }
}

// ==================== ACCESS CONTROL ====================

/**
 * Check if user has access to specific feature
 * @param {string} feature - Feature name
 * @returns {boolean}
 */
function hasAccess(feature) {
  const user = getCurrentUser();
  
  if (!user) {
    return false;
  }
  
  // Define access levels
  const accessLevels = {
    free: ['basic-tools', 'limited-reports'],
    starter: ['basic-tools', 'standard-reports', 'basic-hubs'],
    professional: ['all-tools', 'advanced-reports', 'all-hubs', 'priority-support'],
    enterprise: ['all-features', 'custom-solutions', 'dedicated-support']
  };
  
  const userAccess = accessLevels[user.plan] || accessLevels.free;
  return userAccess.includes(feature) || userAccess.includes('all-features');
}

/**
 * Require authentication for page
 */
function requireAuth() {
  if (!isAuthenticated()) {
    // Store intended destination
    sessionStorage.setItem('intendedDestination', window.location.href);
    
    // Redirect to login
    window.location.href = AUTH_CONFIG.routes.login;
  }
}

/**
 * Require admin access
 */
function requireAdmin() {
  const user = getCurrentUser();
  
  if (!user || user.role !== 'admin') {
    // Redirect to admin login
    window.location.href = AUTH_CONFIG.routes.adminLogin;
  }
}

/**
 * Check access and redirect if needed
 * @param {string} feature - Feature to check
 */
function checkAccessAndRedirect(feature) {
  if (!isAuthenticated()) {
    // Store intended destination
    sessionStorage.setItem('intendedDestination', window.location.href);
    sessionStorage.setItem('intendedFeature', feature);
    
    // Redirect to login
    window.location.href = AUTH_CONFIG.routes.login;
    return false;
  }
  
  if (!hasAccess(feature)) {
    // Show upgrade modal or redirect to pricing
    showUpgradeModal(feature);
    return false;
  }
  
  return true;
}

/**
 * Show upgrade modal
 * @param {string} feature - Feature name
 */
function showUpgradeModal(feature) {
  // Create modal
  const modal = document.createElement('div');
  modal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50';
  modal.innerHTML = `
    <div class="bg-slate-900 rounded-2xl p-8 max-w-md mx-4 border border-slate-800">
      <div class="text-center">
        <i class="fas fa-lock text-amber-500 text-5xl mb-4"></i>
        <h2 class="text-2xl font-bold mb-4">Upgrade Required</h2>
        <p class="text-gray-400 mb-6">
          This feature requires a higher plan. Upgrade now to unlock ${feature} and more!
        </p>
        <div class="flex gap-4">
          <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-slate-800 hover:bg-slate-700 px-6 py-3 rounded-xl font-semibold transition-colors">
            Maybe Later
          </button>
          <a href="../pricing/index.html" class="flex-1 bg-gradient-to-r from-amber-500 to-orange-600 px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition-all text-center">
            View Plans
          </a>
        </div>
      </div>
    </div>
  `;
  
  document.body.appendChild(modal);
}

// ==================== SESSION MANAGEMENT ====================

/**
 * Refresh user session
 */
function refreshSession() {
  const user = getCurrentUser();
  const session = getSession();
  
  if (user && session) {
    // Update session expiry
    session.expiresAt = Date.now() + AUTH_CONFIG.session.timeout;
    sessionStorage.setItem(AUTH_CONFIG.storage.sessionKey, JSON.stringify(session));
  }
}

/**
 * Start session refresh interval
 */
function startSessionRefresh() {
  setInterval(() => {
    if (isAuthenticated()) {
      refreshSession();
    }
  }, AUTH_CONFIG.session.refreshInterval);
}

// ==================== INITIALIZATION ====================

/**
 * Initialize authentication system
 */
function initAuth() {
  // Start session refresh
  startSessionRefresh();
  
  // Check for intended destination after login
  const intendedDestination = sessionStorage.getItem('intendedDestination');
  if (intendedDestination && isAuthenticated()) {
    sessionStorage.removeItem('intendedDestination');
    sessionStorage.removeItem('intendedFeature');
    window.location.href = intendedDestination;
  }
}

// Auto-initialize on page load
if (typeof window !== 'undefined') {
  window.addEventListener('DOMContentLoaded', initAuth);
}

// ==================== EXPORTS ====================
// Make functions available globally
if (typeof window !== 'undefined') {
  window.isAuthenticated = isAuthenticated;
  window.getCurrentUser = getCurrentUser;
  window.handleLogin = handleLogin;
  window.handleSignup = handleSignup;
  window.logout = logout;
  window.requireAuth = requireAuth;
  window.requireAdmin = requireAdmin;
  window.hasAccess = hasAccess;
  window.checkAccessAndRedirect = checkAccessAndRedirect;
}
