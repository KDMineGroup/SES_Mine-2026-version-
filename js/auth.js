// ============================================
// SES_MINE Authentication System with EmailJS
// Updated with actual credentials
// ============================================

// EmailJS Configuration - YOUR ACTUAL CREDENTIALS
const EMAILJS_CONFIG = {
  serviceId: 'service_v1tzk6t',
  publicKey: 'vIsuy4VXOAFCLwx2c',
  templates: {
    welcome: 'template_5rwnvg8',
    verification: 'template_verify',
    accessRequest: 'template_access',
    accessGranted: 'template_granted',
    passwordReset: 'template_reset',
    loginNotification: 'template_login',
    adminNotification: 'template_admin'
  }
};

// Access Levels Configuration
const ACCESS_LEVELS = {
  free: {
    name: 'Free',
    hubs: ['operations-hub', 'safety-hub'],
    products: ['cost-calculator-basic'],
    features: ['basic-calculator', 'limited-database', '5-projects-month'],
    maxProjects: 5
  },
  starter: {
    name: 'Starter',
    hubs: ['operations-hub', 'safety-hub', 'engineering-hub', 'economics-hub', 'sustainability-hub'],
    products: ['cost-calculator', 'equipment-database-basic', 'analytics-basic'],
    features: ['full-calculator', 'equipment-database', '25-projects-month', 'email-support'],
    maxProjects: 25
  },
  professional: {
    name: 'Professional',
    hubs: ['all'],
    products: ['all'],
    features: ['unlimited-projects', 'advanced-analytics', 'all-hubs', 'priority-support', 'api-access'],
    maxProjects: -1 // unlimited
  },
  enterprise: {
    name: 'Enterprise',
    hubs: ['all'],
    products: ['all'],
    features: ['unlimited-everything', 'custom-integrations', 'dedicated-support', 'white-label', 'sla-guarantee'],
    maxProjects: -1 // unlimited
  }
};

// Hub and Product Definitions
const RESOURCES = {
  hubs: {
    'engineering-hub': { name: 'Engineering Hub', plan: 'starter' },
    'economics-hub': { name: 'Economics Hub', plan: 'starter' },
    'procurement-hub': { name: 'Procurement Hub', plan: 'professional' },
    'innovation-hub': { name: 'Innovation Hub', plan: 'professional' },
    'consulting-hub': { name: 'Consulting Hub', plan: 'professional' },
    'sustainability-hub': { name: 'Sustainability Hub', plan: 'starter' },
    'operations-hub': { name: 'Operations Hub', plan: 'free' },
    'safety-hub': { name: 'Safety Hub', plan: 'free' },
    'analytics-hub': { name: 'Analytics Hub', plan: 'professional' }
  },
  products: {
    'cost-calculator': { name: 'Cost Calculator', plan: 'starter' },
    'equipment-database': { name: 'Equipment Database', plan: 'starter' },
    'analytics-dashboard': { name: 'Analytics Dashboard', plan: 'professional' },
    'esg-dashboard': { name: 'ESG Dashboard', plan: 'starter' },
    'ai-predictor': { name: 'AI Cost Predictor', plan: 'professional' }
  }
};

// ============================================
// Utility Functions
// ============================================

function generateUserId() {
  return 'user_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function hashPassword(password) {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hash_' + Math.abs(hash).toString(36) + '_' + password.length;
}

function generateAccessToken(userId) {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 9);
  return btoa(`${userId}:${timestamp}:${random}`);
}

function validateEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

function validatePassword(password) {
  const minLength = 8;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

  const isValid = password.length >= minLength && hasUpperCase && hasLowerCase && hasNumbers;
  
  let strength = 'weak';
  let score = 0;
  if (password.length >= minLength) score++;
  if (hasUpperCase) score++;
  if (hasLowerCase) score++;
  if (hasNumbers) score++;
  if (hasSpecialChar) score++;

  if (score >= 5) strength = 'strong';
  else if (score >= 3) strength = 'medium';

  return {
    isValid,
    strength,
    score,
    message: isValid ? `Password strength: ${strength}` : 'Password must be at least 8 characters with uppercase, lowercase, and numbers'
  };
}

function generateVerificationCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// ============================================
// User Registration
// ============================================

async function handleSignup(userData) {
  try {
    console.log('Starting signup process...', userData.email);

    // Validate input
    if (!validateEmail(userData.email)) {
      throw new Error('Invalid email address');
    }

    const passwordValidation = validatePassword(userData.password);
    if (!passwordValidation.isValid) {
      throw new Error(passwordValidation.message);
    }

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('ses_mine_users') || '{}');
    if (existingUsers[userData.email]) {
      throw new Error('User already exists. Please login instead.');
    }

    // Generate unique credentials
    const userId = generateUserId();
    const passwordHash = hashPassword(userData.password);
    const accessToken = generateAccessToken(userId);
    const verificationCode = generateVerificationCode();

    // Create user object
    const newUser = {
      id: userId,
      name: userData.fullName,
      email: userData.email,
      passwordHash: passwordHash,
      company: userData.company || '',
      phone: userData.phone || '',
      plan: userData.plan || 'free',
      accessToken: accessToken,
      verificationCode: verificationCode,
      isVerified: false,
      createdAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
      accessLevel: ACCESS_LEVELS[userData.plan || 'free'],
      requestedAccess: [],
      customAccess: [],
      projectCount: 0
    };

    // Save user to localStorage
    existingUsers[userData.email] = newUser;
    localStorage.setItem('ses_mine_users', JSON.stringify(existingUsers));

    // Save current session
    localStorage.setItem('ses_mine_current_user', JSON.stringify(newUser));
    localStorage.setItem('ses_mine_auth_token', accessToken);

    console.log('User created successfully, sending emails...');

    // Send welcome email
    const emailSent = await sendWelcomeEmail(newUser, verificationCode);
    
    if (!emailSent) {
      console.warn('Welcome email failed to send, but account was created');
    }

    // Send notification to admin
    await notifyAdminNewUser(newUser);

    return {
      success: true,
      user: newUser,
      message: 'Account created successfully! Check your email for verification code.'
    };

  } catch (error) {
    console.error('Signup error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendWelcomeEmail(user, verificationCode) {
  try {
    console.log('Sending welcome email to:', user.email);

    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      user_name: user.name,
      user_id: user.id,
      verification_code: verificationCode,
      login_url: window.location.origin + '/auth/login.html',
      dashboard_url: window.location.origin + '/dashboard/index.html',
      plan_name: user.plan.charAt(0).toUpperCase() + user.plan.slice(1),
      current_date: new Date().toLocaleDateString(),
      support_email: 'support@sesmine.com',
      from_name: 'SES_MINE Team',
      reply_to: 'support@sesmine.com'
    };

    const response = await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.welcome,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Welcome email sent successfully:', response);
    return true;
  } catch (error) {
    console.error('Error sending welcome email:', error);
    return false;
  }
}

async function notifyAdminNewUser(user) {
  try {
    const templateParams = {
      to_email: 'admin@sesmine.com',
      to_name: 'Admin',
      user_name: user.name,
      user_email: user.email,
      user_company: user.company || 'Not provided',
      user_plan: user.plan,
      registration_date: new Date().toLocaleString(),
      user_id: user.id,
      from_name: 'SES_MINE System',
      reply_to: user.email
    };

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.adminNotification,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Admin notification sent');
    return true;
  } catch (error) {
    console.error('Error sending admin notification:', error);
    return false;
  }
}

// ============================================
// User Login
// ============================================

async function handleLogin(email, password, rememberMe = false) {
  try {
    console.log('Starting login process...', email);

    if (!validateEmail(email)) {
      throw new Error('Invalid email address');
    }

    if (!password) {
      throw new Error('Password is required');
    }

    const existingUsers = JSON.parse(localStorage.getItem('ses_mine_users') || '{}');
    const user = existingUsers[email];

    if (!user) {
      throw new Error('User not found. Please sign up first.');
    }

    // Verify password
    const passwordHash = hashPassword(password);
    if (user.passwordHash !== passwordHash) {
      throw new Error('Incorrect password');
    }

    // Generate new access token
    const newAccessToken = generateAccessToken(user.id);
    user.accessToken = newAccessToken;
    user.lastLogin = new Date().toISOString();

    // Update user in storage
    existingUsers[email] = user;
    localStorage.setItem('ses_mine_users', JSON.stringify(existingUsers));

    // Save current session
    localStorage.setItem('ses_mine_current_user', JSON.stringify(user));
    localStorage.setItem('ses_mine_auth_token', newAccessToken);

    if (rememberMe) {
      localStorage.setItem('ses_mine_remember_me', 'true');
    }

    console.log('Login successful');

    // Send login notification (non-blocking)
    sendLoginNotification(user).catch(err => console.warn('Login notification failed:', err));

    return {
      success: true,
      user: user,
      message: 'Login successful!'
    };

  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendLoginNotification(user) {
  try {
    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      user_name: user.name,
      login_time: new Date().toLocaleString(),
      login_location: 'Unknown',
      device_info: navigator.userAgent.substring(0, 100),
      ip_address: 'Hidden for privacy',
      from_name: 'SES_MINE Security',
      reply_to: 'security@sesmine.com'
    };

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.loginNotification,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Login notification sent');
    return true;
  } catch (error) {
    console.error('Error sending login notification:', error);
    return false;
  }
}

// ============================================
// Access Request System
// ============================================

async function requestAccess(resourceId, reason = '') {
  try {
    const user = getCurrentUser();
    if (!user) {
      throw new Error('Please login to request access');
    }

    // Check if already has access
    if (hasAccess(resourceId)) {
      return {
        success: false,
        message: 'You already have access to this resource'
      };
    }

    // Get resource info
    const resource = RESOURCES.hubs[resourceId] || RESOURCES.products[resourceId];
    if (!resource) {
      throw new Error('Invalid resource');
    }

    // Check if already requested
    const existingRequest = user.requestedAccess?.find(
      r => r.resource === resourceId && r.status === 'pending'
    );

    if (existingRequest) {
      return {
        success: false,
        message: 'You already have a pending request for this resource'
      };
    }

    // Create access request
    const accessRequest = {
      id: 'req_' + Date.now(),
      userId: user.id,
      resource: resourceId,
      resourceName: resource.name,
      requiredPlan: resource.plan,
      reason: reason,
      status: 'pending',
      requestedAt: new Date().toISOString()
    };

    // Save request
    user.requestedAccess = user.requestedAccess || [];
    user.requestedAccess.push(accessRequest);
    saveUser(user);

    console.log('Access request created:', accessRequest);

    // Send emails
    await sendAccessRequestEmail(user, accessRequest);
    await sendAccessRequestConfirmation(user, accessRequest);

    return {
      success: true,
      message: 'Access request submitted successfully. You will receive an email once approved.',
      requestId: accessRequest.id
    };

  } catch (error) {
    console.error('Access request error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendAccessRequestEmail(user, request) {
  try {
    const templateParams = {
      to_email: 'admin@sesmine.com',
      to_name: 'Admin',
      user_name: user.name,
      user_email: user.email,
      user_company: user.company || 'Not provided',
      user_plan: user.plan,
      current_plan: user.plan.charAt(0).toUpperCase() + user.plan.slice(1),
      requested_resource: request.resourceName,
      required_plan: request.requiredPlan.charAt(0).toUpperCase() + request.requiredPlan.slice(1),
      request_reason: request.reason || 'No reason provided',
      request_date: new Date(request.requestedAt).toLocaleString(),
      request_id: request.id,
      approve_url: window.location.origin + '/admin/user-management.html?action=approve&requestId=' + request.id,
      user_profile_url: window.location.origin + '/admin/user-management.html?userId=' + user.id,
      from_name: 'SES_MINE System',
      reply_to: user.email
    };

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.accessRequest,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Access request email sent to admin');
    return true;
  } catch (error) {
    console.error('Error sending access request email:', error);
    return false;
  }
}

async function sendAccessRequestConfirmation(user, request) {
  try {
    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      user_name: user.name,
      requested_resource: request.resourceName,
      required_plan: request.requiredPlan.charAt(0).toUpperCase() + request.requiredPlan.slice(1),
      request_id: request.id,
      request_date: new Date(request.requestedAt).toLocaleString(),
      status_url: window.location.origin + '/dashboard/index.html',
      upgrade_url: window.location.origin + '/pricing/index.html',
      from_name: 'SES_MINE Team',
      reply_to: 'support@sesmine.com'
    };

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.accessRequest,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Access request confirmation sent to user');
    return true;
  } catch (error) {
    console.error('Error sending confirmation:', error);
    return false;
  }
}

async function grantAccess(userId, resourceId) {
  try {
    const users = JSON.parse(localStorage.getItem('ses_mine_users') || '{}');
    const user = Object.values(users).find(u => u.id === userId);

    if (!user) {
      throw new Error('User not found');
    }

    // Update user access
    if (!user.customAccess) {
      user.customAccess = [];
    }
    
    if (!user.customAccess.includes(resourceId)) {
      user.customAccess.push(resourceId);
    }

    // Update request status
    if (user.requestedAccess) {
      const request = user.requestedAccess.find(
        r => r.resource === resourceId && r.status === 'pending'
      );
      if (request) {
        request.status = 'approved';
        request.approvedAt = new Date().toISOString();
      }
    }

    // Save user
    users[user.email] = user;
    localStorage.setItem('ses_mine_users', JSON.stringify(users));

    // Send access granted email
    await sendAccessGrantedEmail(user, resourceId);

    return {
      success: true,
      message: 'Access granted successfully'
    };

  } catch (error) {
    console.error('Grant access error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

async function sendAccessGrantedEmail(user, resourceId) {
  try {
    const resource = RESOURCES.hubs[resourceId] || RESOURCES.products[resourceId];
    
    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      user_name: user.name,
      granted_resource: resource.name,
      resource_name: resource.name,
      access_url: window.location.origin + '/hubs/' + resourceId + '.html',
      dashboard_url: window.location.origin + '/dashboard/index.html',
      granted_date: new Date().toLocaleString(),
      from_name: 'SES_MINE Team',
      reply_to: 'support@sesmine.com'
    };

    await emailjs.send(
      EMAILJS_CONFIG.serviceId,
      EMAILJS_CONFIG.templates.accessGranted,
      templateParams,
      EMAILJS_CONFIG.publicKey
    );

    console.log('Access granted email sent');
    return true;
  } catch (error) {
    console.error('Error sending access granted email:', error);
    return false;
  }
}

// ============================================
// Access Control Functions
// ============================================

function hasAccess(resourceId) {
  const user = getCurrentUser();
  if (!user) return false;

  // Admin has access to everything
  if (user.role === 'admin') return true;

  // Check custom access
  if (user.customAccess && user.customAccess.includes(resourceId)) {
    return true;
  }

  // Check plan-based access
  const accessLevel = ACCESS_LEVELS[user.plan];
  if (!accessLevel) return false;

  // Check if resource is in allowed hubs
  if (accessLevel.hubs.includes('all') || accessLevel.hubs.includes(resourceId)) {
    return true;
  }

  // Check if resource is in allowed products
  if (accessLevel.products.includes('all') || accessLevel.products.includes(resourceId)) {
    return true;
  }

  return false;
}

function requireAccess(resourceId, redirectUrl = '/pricing/index.html') {
  if (!hasAccess(resourceId)) {
    showAccessRequestModal(resourceId, redirectUrl);
    return false;
  }
  return true;
}

function showAccessRequestModal(resourceId, redirectUrl) {
  const user = getCurrentUser();
  
  if (!user) {
    sessionStorage.setItem('intendedDestination', window.location.href);
    window.location.href = '/auth/login.html';
    return;
  }

  const resource = RESOURCES.hubs[resourceId] || RESOURCES.products[resourceId];
  const resourceName = resource ? resource.name : resourceId;
  const requiredPlan = resource ? resource.plan : 'professional';

  const modal = document.createElement('div');
  modal.id = 'accessModal';
  modal.className = 'fixed inset-0 z-50 flex items-center justify-center bg-slate-950/90 backdrop-blur-sm';
  modal.innerHTML = `
    <div class="bg-slate-900 rounded-2xl border border-slate-800 p-8 max-w-md mx-4 animate-in">
      <div class="text-center mb-6">
        <div class="w-16 h-16 bg-amber-500/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
          <i class="fas fa-lock text-amber-400 text-2xl"></i>
        </div>
        <h3 class="text-2xl font-bold mb-2">Access Required</h3>
        <p class="text-gray-400">
          <strong>${resourceName}</strong> requires a ${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)} plan or higher.
        </p>
      </div>

      <div class="space-y-4 mb-6">
        <div class="bg-slate-950 rounded-xl p-4">
          <div class="text-sm text-gray-400 mb-1">Your Current Plan</div>
          <div class="font-bold text-cyan-400">${user.plan.charAt(0).toUpperCase() + user.plan.slice(1)}</div>
        </div>
        
        <div class="bg-slate-950 rounded-xl p-4">
          <div class="text-sm text-gray-400 mb-1">Required Plan</div>
          <div class="font-bold text-amber-400">${requiredPlan.charAt(0).toUpperCase() + requiredPlan.slice(1)}</div>
        </div>

        <div class="bg-slate-950 rounded-xl p-4">
          <label class="text-sm text-gray-400 block mb-2">Reason for Request (Optional)</label>
          <textarea id="accessReason" class="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white text-sm" rows="3" placeholder="Why do you need access to this resource?"></textarea>
        </div>
      </div>

      <div class="space-y-3">
        <button onclick="requestAccessFromModal('${resourceId}')" class="w-full bg-gradient-to-r from-cyan-500 to-blue-600 px-6 py-3 rounded-xl font-bold hover:shadow-lg transition-all">
          <i class="fas fa-paper-plane mr-2"></i>Request Access
        </button>
        <a href="${redirectUrl}" class="block w-full bg-slate-800 hover:bg-slate-700 text-center px-6 py-3 rounded-xl font-bold transition-all">
          <i class="fas fa-crown mr-2"></i>Upgrade Plan
        </a>
        <button onclick="closeAccessModal()" class="w-full text-gray-400 hover:text-white py-2 transition-colors">
          Cancel
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);
}

window.requestAccessFromModal = async function(resourceId) {
  const reason = document.getElementById('accessReason')?.value || '';
  const result = await requestAccess(resourceId, reason);
  
  if (result.success) {
    alert('✅ ' + result.message);
    closeAccessModal();
  } else {
    alert('❌ Error: ' + result.error);
  }
};

window.closeAccessModal = function() {
  const modal = document.getElementById('accessModal');
  if (modal) {
    modal.remove();
  }
};

// ============================================
// Session Management
// ============================================

function getCurrentUser() {
  const userJson = localStorage.getItem('ses_mine_current_user');
  return userJson ? JSON.parse(userJson) : null;
}

function saveUser(user) {
  const users = JSON.parse(localStorage.getItem('ses_mine_users') || '{}');
  users[user.email] = user;
  localStorage.setItem('ses_mine_users', JSON.stringify(users));
  localStorage.setItem('ses_mine_current_user', JSON.stringify(user));
}

function isAuthenticated() {
  const token = localStorage.getItem('ses_mine_auth_token');
  const user = getCurrentUser();
  return !!(token && user);
}

function requireAuth() {
  if (!isAuthenticated()) {
    sessionStorage.setItem('intendedDestination', window.location.href);
    window.location.href = '/auth/login.html';
    return false;
  }
  return true;
}

function logout() {
  localStorage.removeItem('ses_mine_current_user');
  localStorage.removeItem('ses_mine_auth_token');
  localStorage.removeItem('ses_mine_remember_me');
  window.location.href = '/index.html';
}

function getQueryParams() {
  const params = {};
  const queryString = window.location.search.substring(1);
  const pairs = queryString.split('&');
  
  for (let pair of pairs) {
    const [key, value] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = decodeURIComponent(value || '');
    }
  }
  
  return params;
}

// ============================================
// Initialize EmailJS
// ============================================

if (typeof emailjs !== 'undefined') {
  emailjs.init(EMAILJS_CONFIG.publicKey);
  console.log('✅ EmailJS initialized with service:', EMAILJS_CONFIG.serviceId);
} else {
  console.warn('⚠️ EmailJS library not loaded. Please include the EmailJS SDK.');
}

// Export functions
window.handleSignup = handleSignup;
window.handleLogin = handleLogin;
window.requestAccess = requestAccess;
window.grantAccess = grantAccess;
window.hasAccess = hasAccess;
window.requireAccess = requireAccess;
window.getCurrentUser = getCurrentUser;
window.saveUser = saveUser;
window.isAuthenticated = isAuthenticated;
window.requireAuth = requireAuth;
window.logout = logout;
window.validateEmail = validateEmail;
window.validatePassword = validatePassword;
window.getQueryParams = getQueryParams;
window.ACCESS_LEVELS = ACCESS_LEVELS;
window.RESOURCES = RESOURCES;

console.log('✅ SES_MINE Authentication System loaded successfully');
