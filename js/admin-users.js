/**
 * SESMine Platform - Admin User Management
 * Handles user CRUD operations and management
 * Version: 1.0.0
 */

// ==================== CONFIGURATION ====================
const USERS_PER_PAGE = 10;
let currentPage = 1;
let filteredUsers = [];

// ==================== USER MANAGEMENT ====================

/**
 * Load and display all users
 */
function loadUsers() {
  const users = getAllUsers();
  filteredUsers = users;
  displayUsers();
}

/**
 * Display users in table
 */
function displayUsers() {
  const tbody = document.getElementById('usersTableBody');
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = startIndex + USERS_PER_PAGE;
  const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
  
  if (paginatedUsers.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td colspan="9" class="text-center py-12 text-gray-400">
          <i class="fas fa-users text-5xl mb-4 block"></i>
          No users found
        </td>
      </tr>
    `;
    return;
  }
  
  tbody.innerHTML = paginatedUsers.map(user => `
    <tr class="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <td class="p-4">
        <input type="checkbox" class="user-checkbox w-4 h-4 rounded border-slate-700 text-purple-500" value="${user.id}">
      </td>
      <td class="p-4">
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center font-bold">
            ${user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <div class="font-semibold">${user.name}</div>
            <div class="text-xs text-gray-400">${user.id}</div>
          </div>
        </div>
      </td>
      <td class="p-4">
        <div class="text-sm">${user.email}</div>
      </td>
      <td class="p-4">
        <div class="text-sm">${user.company || '-'}</div>
      </td>
      <td class="p-4">
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadgeClass(user.plan)}">
          ${user.plan}
        </span>
      </td>
      <td class="p-4">
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${
          user.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-slate-700 text-gray-300'
        }">
          ${user.role}
        </span>
      </td>
      <td class="p-4">
        <div class="text-sm">${formatDate(user.createdAt, 'short')}</div>
      </td>
      <td class="p-4">
        <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(user.status || 'active')}">
          ${user.status || 'active'}
        </span>
      </td>
      <td class="p-4">
        <div class="flex items-center gap-2">
          <button 
            onclick="editUser('${user.id}')"
            class="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors"
            title="Edit"
          >
            <i class="fas fa-edit text-sm"></i>
          </button>
          <button 
            onclick="viewUserDetails('${user.id}')"
            class="bg-purple-500/20 hover:bg-purple-500/30 text-purple-500 p-2 rounded-lg transition-colors"
            title="View Details"
          >
            <i class="fas fa-eye text-sm"></i>
          </button>
          <button 
            onclick="deleteUser('${user.id}')"
            class="bg-red-500/20 hover:bg-red-500/30 text-red-500 p-2 rounded-lg transition-colors"
            title="Delete"
          >
            <i class="fas fa-trash text-sm"></i>
          </button>
        </div>
      </td>
    </tr>
  `).join('');
  
  updatePagination();
}

/**
 * Get plan badge class
 */
function getPlanBadgeClass(plan) {
  const classes = {
    free: 'bg-gray-500/20 text-gray-400',
    starter: 'bg-blue-500/20 text-blue-500',
    professional: 'bg-amber-500/20 text-amber-500',
    enterprise: 'bg-purple-500/20 text-purple-500'
  };
  return classes[plan] || classes.free;
}

/**
 * Get status badge class
 */
function getStatusBadgeClass(status) {
  const classes = {
    active: 'bg-green-500/20 text-green-500',
    suspended: 'bg-red-500/20 text-red-500',
    inactive: 'bg-gray-500/20 text-gray-400'
  };
  return classes[status] || classes.active;
}

/**
 * Update pagination
 */
function updatePagination() {
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  const startIndex = (currentPage - 1) * USERS_PER_PAGE;
  const endIndex = Math.min(startIndex + USERS_PER_PAGE, filteredUsers.length);
  
  document.getElementById('showingFrom').textContent = filteredUsers.length > 0 ? startIndex + 1 : 0;
  document.getElementById('showingTo').textContent = endIndex;
  document.getElementById('totalCount').textContent = filteredUsers.length;
  
  // Generate page numbers
  const paginationNumbers = document.getElementById('paginationNumbers');
  let pages = '';
  
  for (let i = 1; i <= totalPages; i++) {
    if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
      pages += `
        <button 
          onclick="goToPage(${i})"
          class="px-4 py-2 rounded-lg transition-colors ${
            i === currentPage 
              ? 'bg-gradient-to-r from-purple-500 to-pink-600 font-semibold' 
              : 'bg-slate-800 hover:bg-slate-700'
          }"
        >
          ${i}
        </button>
      `;
    } else if (i === currentPage - 2 || i === currentPage + 2) {
      pages += '<span class="px-2">...</span>';
    }
  }
  
  paginationNumbers.innerHTML = pages;
}

/**
 * Go to specific page
 */
function goToPage(page) {
  currentPage = page;
  displayUsers();
}

/**
 * Previous page
 */
function previousPage() {
  if (currentPage > 1) {
    currentPage--;
    displayUsers();
  }
}

/**
 * Next page
 */
function nextPage() {
  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);
  if (currentPage < totalPages) {
    currentPage++;
    displayUsers();
  }
}

/**
 * Filter users
 */
function filterUsers() {
  const searchTerm = document.getElementById('searchUsers').value.toLowerCase();
  const planFilter = document.getElementById('filterPlan').value;
  const roleFilter = document.getElementById('filterRole').value;
  
  const allUsers = getAllUsers();
  
  filteredUsers = allUsers.filter(user => {
    const matchesSearch = !searchTerm || 
      user.name.toLowerCase().includes(searchTerm) ||
      user.email.toLowerCase().includes(searchTerm) ||
      (user.company && user.company.toLowerCase().includes(searchTerm));
    
    const matchesPlan = !planFilter || user.plan === planFilter;
    const matchesRole = !roleFilter || user.role === roleFilter;
    
    return matchesSearch && matchesPlan && matchesRole;
  });
  
  currentPage = 1;
  displayUsers();
  updateStats();
}

/**
 * Update statistics
 */
function updateStats() {
  const users = getAllUsers();
  
  // Total users
  document.getElementById('totalUsers').textContent = users.length;
  
  // Active users
  const activeUsers = users.filter(u => (u.status || 'active') === 'active').length;
  document.getElementById('activeUsers').textContent = activeUsers;
  
  // Premium users (professional + enterprise)
  const premiumUsers = users.filter(u => 
    u.plan === 'professional' || u.plan === 'enterprise'
  ).length;
  document.getElementById('premiumUsers').textContent = premiumUsers;
  
  // New users this month
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const newUsers = users.filter(u => 
    new Date(u.createdAt) >= firstDayOfMonth
  ).length;
  document.getElementById('newUsers').textContent = newUsers;
}

/**
 * Toggle select all
 */
function toggleSelectAll(event) {
  const checkboxes = document.querySelectorAll('.user-checkbox');
  checkboxes.forEach(cb => cb.checked = event.target.checked);
}

/**
 * Open user modal
 */
function openUserModal(userId = null) {
  const modal = document.getElementById('userModal');
  const form = document.getElementById('userForm');
  const title = document.getElementById('userModalTitle');
  
  // Reset form
  form.reset();
  document.getElementById('sendNotification').checked = false;
  
  if (userId) {
    // Edit mode
    const users = getAllUsers();
    const user = users.find(u => u.id === userId);
    
    if (user) {
      title.textContent = 'Edit User';
      document.getElementById('userId').value = user.id;
      document.getElementById('userName').value = user.name;
      document.getElementById('userEmail').value = user.email;
      document.getElementById('userCompany').value = user.company || '';
      document.getElementById('userPhone').value = user.phone || '';
      document.getElementById('userPlan').value = user.plan;
      document.getElementById('userRole').value = user.role;
      document.getElementById('userStatus').value = user.status || 'active';
      document.getElementById('userNotes').value = user.notes || '';
    }
  } else {
    // Create mode
    title.textContent = 'Add New User';
    document.getElementById('userId').value = '';
  }
  
  modal.classList.remove('hidden');
}

/**
 * Close user modal
 */
function closeUserModal() {
  document.getElementById('userModal').classList.add('hidden');
}

/**
 * Save user
 */
async function saveUser(event) {
  event.preventDefault();
  
  const userId = document.getElementById('userId').value;
  const userData = {
    id: userId || generateUserId(),
    name: document.getElementById('userName').value,
    email: document.getElementById('userEmail').value,
    company: document.getElementById('userCompany').value,
    phone: document.getElementById('userPhone').value,
    plan: document.getElementById('userPlan').value,
    role: document.getElementById('userRole').value,
    status: document.getElementById('userStatus').value,
    notes: document.getElementById('userNotes').value,
    updatedAt: new Date().toISOString()
  };
  
  if (!userId) {
    userData.createdAt = new Date().toISOString();
  }
  
  let users = getAllUsers();
  
  if (userId) {
    // Update existing
    const index = users.findIndex(u => u.id === userId);
    if (index !== -1) {
      users[index] = { ...users[index], ...userData };
    }
  } else {
    // Add new
    users.push(userData);
  }
  
  // Save to storage
  localStorage.setItem('sesmine_users', JSON.stringify(users));
  
  // Send notification if checked
  if (document.getElementById('sendNotification').checked) {
    await sendUserNotification(userData, userId ? 'updated' : 'created');
  }
  
  // Show success message
  showNotification(
    userId ? 'User updated successfully!' : 'User created successfully!',
    'success'
  );
  
  // Reload and close
  loadUsers();
  updateStats();
  closeUserModal();
}

/**
 * Edit user
 */
function editUser(userId) {
  openUserModal(userId);
}

/**
 * View user details
 */
function viewUserDetails(userId) {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) return;
  
  // Create detail modal
  const detailModal = document.createElement('div');
  detailModal.className = 'fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6';
  detailModal.innerHTML = `
    <div class="bg-slate-900 rounded-2xl border border-slate-800 w-full max-w-2xl">
      <div class="flex items-center justify-between p-6 border-b border-slate-800">
        <h2 class="text-2xl font-bold">
          <i class="fas fa-user text-purple-500 mr-2"></i>User Details
        </h2>
        <button onclick="this.closest('.fixed').remove()" class="text-gray-400 hover:text-white transition-colors">
          <i class="fas fa-times text-2xl"></i>
        </button>
      </div>
      <div class="p-6 space-y-4">
        <div class="grid md:grid-cols-2 gap-6">
          <div>
            <label class="text-sm text-gray-400 block mb-1">Full Name</label>
            <div class="font-semibold">${user.name}</div>
          </div>
          <div>
            <label class="text-sm text-gray-400 block mb-1">Email</label>
            <div class="font-semibold">${user.email}</div>
          </div>
          <div>
            <label class="text-sm text-gray-400 block mb-1">Company</label>
            <div class="font-semibold">${user.company || '-'}</div>
          </div>
          <div>
            <label class="text-sm text-gray-400 block mb-1">Phone</label>
            <div class="font-semibold">${user.phone || '-'}</div>
          </div>
          <div>
            <label class="text-sm text-gray-400 block mb-1">Plan</label>
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${getPlanBadgeClass(user.plan)}">
              ${user.plan}
            </span>
          </div>
          <div>
            <label class="text-sm text-gray-400 block mb-1">Role</label>
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${
              user.role === 'admin' ? 'bg-purple-500/20 text-purple-500' : 'bg-slate-700 text-gray-300'
            }">
              ${user.role}
            </span>
          </div>
          <div>
            <label class="text-sm text-gray-400 block mb-1">Status</label>
            <span class="px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadgeClass(user.status || 'active')}">
              ${user.status || 'active'}
            </span>
          </div>
          <div>
            <label class="text-sm text-gray-400 block mb-1">Joined</label>
            <div class="font-semibold">${formatDate(user.createdAt, 'long')}</div>
          </div>
        </div>
        ${user.notes ? `
          <div>
            <label class="text-sm text-gray-400 block mb-1">Admin Notes</label>
            <div class="bg-slate-950 rounded-xl p-4 text-sm">${user.notes}</div>
          </div>
        ` : ''}
      </div>
      <div class="border-t border-slate-800 p-6 flex gap-4">
        <button onclick="editUser('${user.id}'); this.closest('.fixed').remove();" class="flex-1 bg-gradient-to-r from-purple-500 to-pink-600 py-3 rounded-xl font-semibold">
          <i class="fas fa-edit mr-2"></i>Edit User
        </button>
        <button onclick="this.closest('.fixed').remove()" class="flex-1 bg-slate-800 hover:bg-slate-700 py-3 rounded-xl font-semibold transition-all">
          Close
        </button>
      </div>
    </div>
  `;
  
  document.body.appendChild(detailModal);
}

/**
 * Delete user
 */
function deleteUser(userId) {
  const users = getAllUsers();
  const user = users.find(u => u.id === userId);
  
  if (!user) return;
  
  if (!confirm(`Are you sure you want to delete user "${user.name}"? This action cannot be undone.`)) {
    return;
  }
  
  // Remove user
  const updatedUsers = users.filter(u => u.id !== userId);
  localStorage.setItem('sesmine_users', JSON.stringify(updatedUsers));
  
  showNotification('User deleted successfully!', 'success');
  loadUsers();
  updateStats();
}

/**
 * Export users to CSV
 */
function exportUsers() {
  const users = filteredUsers.length > 0 ? filteredUsers : getAllUsers();
  
  // Create CSV content
  const headers = ['ID', 'Name', 'Email', 'Company', 'Phone', 'Plan', 'Role', 'Status', 'Joined'];
  const rows = users.map(user => [
    user.id,
    user.name,
    user.email,
    user.company || '',
    user.phone || '',
    user.plan,
    user.role,
    user.status || 'active',
    formatDate(user.createdAt, 'short')
  ]);
  
  let csvContent = headers.join(',') + '\n';
  rows.forEach(row => {
    csvContent += row.map(cell => `"${cell}"`).join(',') + '\n';
  });
  
  // Download file
  const filename = `sesmine-users-${new Date().toISOString().split('T')[0]}.csv`;
  downloadFile(csvContent, filename, 'text/csv');
  
  showNotification('Users exported successfully!', 'success');
}

/**
 * Send user notification via EmailJS
 */
async function sendUserNotification(user, action) {
  try {
    const templateParams = {
      to_email: user.email,
      to_name: user.name,
      from_name: 'SESMine Platform',
      subject: action === 'created' ? 'Welcome to SESMine' : 'Account Updated',
      message: action === 'created' 
        ? `Welcome to SESMine! Your account has been created with ${user.plan} plan.`
        : `Your SESMine account has been updated. Current plan: ${user.plan}.`,
      reply_to: 'support@sesmine.com'
    };
    
    await emailjs.send(
      'service_qfwvqyg',
      'template_notification',
      templateParams,
      'pYI5e7c0EjKvjvgbV'
    );
    
    console.log('User notification sent successfully');
  } catch (error) {
    console.error('Error sending user notification:', error);
  }
}
