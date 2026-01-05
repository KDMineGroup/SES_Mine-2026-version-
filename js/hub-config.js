// ============================================
// Hub Configuration & Access Control
// ============================================

const HUB_CONFIG = {
  'engineering-hub': {
    id: 'engineering-hub',
    name: 'Engineering Hub',
    description: 'Design, planning, and technical solutions',
    icon: 'fas fa-drafting-compass',
    color: '#06b6d4',
    requiredAccess: 'starter',
    features: [
      'Mine Design Tools',
      'Technical Documentation',
      'Engineering Calculators',
      'Equipment Specifications',
      'CAD Integration'
    ],
    modules: [
      { name: 'Mine Design', url: '#mine-design' },
      { name: 'Geotechnical', url: '#geotechnical' },
      { name: 'Structural', url: '#structural' },
      { name: 'Equipment Selection', url: '#equipment' }
    ]
  },

  'economics-hub': {
    id: 'economics-hub',
    name: 'Economics Hub',
    description: 'Financial analysis and economic modeling',
    icon: 'fas fa-chart-line',
    color: '#3b82f6',
    requiredAccess: 'starter',
    features: [
      'Cost Estimation',
      'ROI Analysis',
      'NPV Calculations',
      'Sensitivity Analysis',
      'Financial Reporting'
    ],
    modules: [
      { name: 'Cost Models', url: '#cost-models' },
      { name: 'Financial Analysis', url: '#financial' },
      { name: 'Economic Reports', url: '#reports' },
      { name: 'Budget Planning', url: '#budget' }
    ]
  },

  'operations-hub': {
    id: 'operations-hub',
    name: 'Operations Hub',
    description: 'Production optimization and efficiency',
    icon: 'fas fa-cogs',
    color: '#8b5cf6',
    requiredAccess: 'professional',
    features: [
      'Production Planning',
      'Efficiency Monitoring',
      'Resource Optimization',
      'Performance Metrics',
      'Real-time Tracking'
    ],
    modules: [
      { name: 'Production Planning', url: '#production' },
      { name: 'Fleet Management', url: '#fleet' },
      { name: 'Performance', url: '#performance' },
      { name: 'Optimization', url: '#optimization' }
    ]
  },

  'safety-hub': {
    id: 'safety-hub',
    name: 'Safety Hub',
    description: 'Risk management and safety compliance',
    icon: 'fas fa-shield-alt',
    color: '#10b981',
    requiredAccess: 'professional',
    features: [
      'Risk Assessment',
      'Safety Protocols',
      'Incident Tracking',
      'Compliance Management',
      'Training Programs'
    ],
    modules: [
      { name: 'Risk Assessment', url: '#risk' },
      { name: 'Safety Audits', url: '#audits' },
      { name: 'Incident Reports', url: '#incidents' },
      { name: 'Training', url: '#training' }
    ]
  },

  'analytics-hub': {
    id: 'analytics-hub',
    name: 'Analytics Hub',
    description: 'Advanced data analytics and insights',
    icon: 'fas fa-chart-bar',
    color: '#f59e0b',
    requiredAccess: 'professional',
    features: [
      'Data Visualization',
      'Predictive Analytics',
      'Custom Reports',
      'KPI Dashboards',
      'Trend Analysis'
    ],
    modules: [
      { name: 'Dashboards', url: '#dashboards' },
      { name: 'Reports', url: '#reports' },
      { name: 'Predictions', url: '#predictions' },
      { name: 'Insights', url: '#insights' }
    ]
  },

  'sustainability-hub': {
    id: 'sustainability-hub',
    name: 'Sustainability Hub',
    description: 'ESG and environmental management',
    icon: 'fas fa-leaf',
    color: '#22c55e',
    requiredAccess: 'professional',
    features: [
      'ESG Reporting',
      'Carbon Tracking',
      'Environmental Impact',
      'Sustainability Metrics',
      'Compliance Tracking'
    ],
    modules: [
      { name: 'ESG Dashboard', url: '#esg' },
      { name: 'Carbon Footprint', url: '#carbon' },
      { name: 'Compliance', url: '#compliance' },
      { name: 'Reporting', url: '#reporting' }
    ]
  },

  'innovation-hub': {
    id: 'innovation-hub',
    name: 'Innovation Hub',
    description: 'R&D and emerging technologies',
    icon: 'fas fa-lightbulb',
    color: '#ec4899',
    requiredAccess: 'enterprise',
    features: [
      'AI/ML Integration',
      'Automation Solutions',
      'Digital Twin',
      'IoT Monitoring',
      'Advanced Analytics'
    ],
    modules: [
      { name: 'AI Tools', url: '#ai' },
      { name: 'Automation', url: '#automation' },
      { name: 'Digital Twin', url: '#digital-twin' },
      { name: 'IoT', url: '#iot' }
    ]
  },

  'procurement-hub': {
    id: 'procurement-hub',
    name: 'Procurement Hub',
    description: 'Supply chain and vendor management',
    icon: 'fas fa-shopping-cart',
    color: '#ef4444',
    requiredAccess: 'enterprise',
    features: [
      'Vendor Management',
      'Purchase Orders',
      'Inventory Tracking',
      'Contract Management',
      'Supplier Analytics'
    ],
    modules: [
      { name: 'Vendors', url: '#vendors' },
      { name: 'Orders', url: '#orders' },
      { name: 'Inventory', url: '#inventory' },
      { name: 'Contracts', url: '#contracts' }
    ]
  },

  'consulting-hub': {
    id: 'consulting-hub',
    name: 'Consulting Hub',
    description: 'Expert advisory and consulting services',
    icon: 'fas fa-user-tie',
    color: '#6366f1',
    requiredAccess: 'enterprise',
    features: [
      'Expert Consultation',
      'Project Reviews',
      'Feasibility Studies',
      'Technical Advisory',
      'Custom Solutions'
    ],
    modules: [
      { name: 'Consultations', url: '#consultations' },
      { name: 'Reviews', url: '#reviews' },
      { name: 'Studies', url: '#studies' },
      { name: 'Advisory', url: '#advisory' }
    ]
  }
};

/**
 * Get hub configuration by ID
 */
function getHubConfig(hubId) {
  return HUB_CONFIG[hubId] || null;
}

/**
 * Get all accessible hubs for current user
 */
function getAccessibleHubs() {
  const user = getCurrentUser();
  if (!user) return [];

  return Object.values(HUB_CONFIG).filter(hub => 
    hasAccess(hub.requiredAccess)
  );
}

/**
 * Get locked hubs for upgrade prompts
 */
function getLockedHubs() {
  const user = getCurrentUser();
  if (!user) return Object.values(HUB_CONFIG);

  return Object.values(HUB_CONFIG).filter(hub => 
    !hasAccess(hub.requiredAccess)
  );
}

/**
 * Check if user can access specific hub
 */
function canAccessHub(hubId) {
  const hub = getHubConfig(hubId);
  if (!hub) return false;
  
  return hasAccess(hub.requiredAccess);
}
