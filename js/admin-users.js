// ============================================
// Admin User Management Helper Functions
// ============================================

/**
 * Get all users from localStorage
 */
function getAllUsers() {
  const users = JSON.parse(localStorage.getItem('ses_mine_users') || '{}');
  return Object.values(users);
}

/**
 * Get user by ID
 */
function getUserById(userId) {
  const users = getAllUsers();
  return users.find(u => u.id === userId);
}

/**
 * Get all access requests
 */
function getAllAccessRequests() {
  const users = getAllUsers();
  const requests = [];
  
  users.forEach(user => {
    if (user.requestedAccess && Array.isArray(user.requestedAccess)) {
      user.requestedAccess.forEach(request => {
        requests.push({
          ...request,
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          userPlan: user.plan
        });
      });
    }
  });
  
  // Sort by date, newest first
  return requests.sort((a, b) => 
    new Date(b.requestedAt) - new Date(a.requestedAt)
  );
}

/**
 * Get request by ID
 */
function getRequestById(requestId) {
  const requests = getAllAccessRequests();
  return requests.find(r => r.id === requestId);
}

/**
 * Delete user
 */
function deleteUser(userId) {
  if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('ses_mine_users') || '{}');
  const user = Object.values(users).find(u => u.id === userId);
  
  if (user) {
    delete users[user.email];
    localStorage.setItem('ses_mine_users', JSON.stringify(users));
    alert('✅ User deleted successfully');
    loadStats();
    loadUsers();
  }
}

/**
 * Upgrade user plan
 */
function upgradePlan(userId) {
  const user = getUserById(userId);
  if (!user) return;
  
  const plans = ['free', 'starter', 'professional', 'enterprise'];
  const currentIndex = plans.indexOf(user.plan);
  
  if (currentIndex === plans.length - 1) {
    alert('User is already on the highest plan');
    return;
  }
  
  const newPlan = plans[currentIndex + 1];
  
  if (confirm(`Upgrade ${user.name} from ${user.plan} to ${newPlan}?`)) {
    user.plan = newPlan;
    user.accessLevel = ACCESS_LEVELS[newPlan];
    saveUser(user);
    
    // Send upgrade notification email
    sendPlanUpgradeEmail(user, newPlan);
    
    alert('✅ Plan upgraded successfully!');
    closeUserModal();
    loadStats();
    loadUsers();
  }
}

/**
 * Send plan upgrade email
 */
async function sendPlanUpgradeEmail(user, newPlan) {
  try {
    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      user_name: user.name,
      new_plan: newPlan.charAt(0).toUpperCase() + newPlan.slice(1),
      old_plan: user.plan.charAt(0).toUpperCase() + user.plan.slice(1),
      upgrade_date: new Date().toLocaleString(),
      dashboard_url: window.location.origin + '/dashboard/index.html',
      features_url: window.location.origin + '/pricing/index.html',
      from_name: 'SES_MINE Team',
      reply_to: 'support@sesmine.com'
    };

    await emailjs.send(
      'service_v1tzk6t',
      'template_5rwnvg8',
      templateParams,
      'vIsuy4VXOAFCLwx2c'
    );

    console.log('Plan upgrade email sent');
    return true;
  } catch (error) {
    console.error('Error sending upgrade email:', error);
    return false;
  }
}

/**
 * Export users to CSV
 */
function exportUsersToCSV() {
  const users = getAllUsers();
  
  const headers = ['Name', 'Email', 'Company', 'Plan', 'Joined', 'Last Login'];
  const rows = users.map(u => [
    u.name,
    u.email,
    u.company || 'N/A',
    u.plan,
    new Date(u.createdAt).toLocaleDateString(),
    new Date(u.lastLogin).toLocaleDateString()
  ]);
  
  let csv = headers.join(',') + '\n';
  rows.forEach(row => {
    csv += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ses_mine_users_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  window.URL.revokeObjectURL(url);
}

/**
 * Get user statistics
 */
function getUserStats() {
  const users = getAllUsers();
  
  return {
    total: users.length,
    byPlan: {
      free: users.filter(u => u.plan === 'free').length,
      starter: users.filter(u => u.plan === 'starter').length,
      professional: users.filter(u => u.plan === 'professional').length,
      enterprise: users.filter(u => u.plan === 'enterprise').length
    },
    active: users.filter(u => {
      const daysSince = (Date.now() - new Date(u.lastLogin)) / (1000 * 60 * 60 * 24);
      return daysSince <= 30;
    }).length,
    verified: users.filter(u => u.isVerified).length,
    thisMonth: users.filter(u => {
      const created = new Date(u.createdAt);
      const now = new Date();
      return created.getMonth() === now.getMonth() && 
             created.getFullYear() === now.getFullYear();
    }).length
  };
}

/**
 * Search users
 */
function searchUsers(query) {
  const users = getAllUsers();
  const lowerQuery = query.toLowerCase();
  
  return users.filter(u => 
    u.name.toLowerCase().includes(lowerQuery) ||
    u.email.toLowerCase().includes(lowerQuery) ||
    (u.company && u.company.toLowerCase().includes(lowerQuery))
  );
}

/**
 * Bulk action - Grant access to multiple users
 */
function bulkGrantAccess(userIds, resourceId) {
  if (!confirm(`Grant access to ${resourceId} for ${userIds.length} users?`)) {
    return;
  }
  
  let successCount = 0;
  
  userIds.forEach(userId => {
    const result = grantAccess(userId, resourceId);
    if (result.success) {
      successCount++;
    }
  });
  
  alert(`✅ Access granted to ${successCount} users`);
  loadUsers();
}

/**
 * Bulk action - Change plan for multiple users
 */
function bulkChangePlan(userIds, newPlan) {
  if (!confirm(`Change plan to ${newPlan} for ${userIds.length} users?`)) {
    return;
  }
  
  const users = JSON.parse(localStorage.getItem('ses_mine_users') || '{}');
  let successCount = 0;
  
  userIds.forEach(userId => {
    const user = Object.values(users).find(u => u.id === userId);
    if (user) {
      user.plan = newPlan;
      user.accessLevel = ACCESS_LEVELS[newPlan];
      users[user.email] = user;
      successCount++;
    }
  });
  
  localStorage.setItem('ses_mine_users', JSON.stringify(users));
  alert(`✅ Plan changed for ${successCount} users`);
  loadUsers();
}

/**
 * Get access request statistics
 */
function getRequestStats() {
  const requests = getAllAccessRequests();
  
  return {
    total: requests.length,
    pending: requests.filter(r => r.status === 'pending').length,
    approved: requests.filter(r => r.status === 'approved').length,
    denied: requests.filter(r => r.status === 'denied').length,
    byResource: requests.reduce((acc, r) => {
      acc[r.resourceName] = (acc[r.resourceName] || 0) + 1;
      return acc;
    }, {})
  };
}

/**
 * Initialize demo data (for testing)
 */
function initializeDemoData() {
  if (getAllUsers().length > 0) {
    console.log('Users already exist, skipping demo data');
    return;
  }
  
  const demoUsers = [
    {
      fullName: 'John Smith',
      email: 'john.smith@mining.com',
      company: 'Global Mining Corp',
      phone: '+1 555-0101',
      password: 'Demo123!',
      plan: 'professional'
    },
    {
      fullName: 'Sarah Johnson',
      email: 'sarah.j@resources.com',
      company: 'Resource Extraction Ltd',
      phone: '+1 555-0102',
      password: 'Demo123!',
      plan: 'starter'
    },
    {
      fullName: 'Mike Chen',
      email: 'mchen@minerals.com',
      company: 'Mineral Solutions Inc',
      phone: '+1 555-0103',
      password: 'Demo123!',
      plan: 'enterprise'
    },
    {
      fullName: 'Emily Davis',
      email: 'edavis@operations.com',
      company: 'Operations Plus',
      phone: '+1 555-0104',
      password: 'Demo123!',
      plan: 'free'
    }
  ];
  
  console.log('Creating demo users...');
  
  demoUsers.forEach(async (userData) => {
    await handleSignup(userData);
  });
  
  console.log('✅ Demo data initialized');
}

// Export functions for global use
window.getAllUsers = getAllUsers;
window.getUserById = getUserById;
window.getAllAccessRequests = getAllAccessRequests;
window.getRequestById = getRequestById;
window.deleteUser = deleteUser;
window.upgradePlan = upgradePlan;
window.exportUsersToCSV = exportUsersToCSV;
window.getUserStats = getUserStats;
window.searchUsers = searchUsers;
window.bulkGrantAccess = bulkGrantAccess;
window.bulkChangePlan = bulkChangePlan;
window.getRequestStats = getRequestStats;
window.initializeDemoData = initializeDemoData;

console.log('✅ Admin user management functions loaded');
