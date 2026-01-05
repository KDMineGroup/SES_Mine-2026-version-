# SESMine Admin System Documentation

## Overview
The SESMine Admin System provides comprehensive tools for managing content, users, and platform operations.

## Admin Access

### Default Credentials
- **Email:** `admin@sesmine.com`
- **Password:** `Admin@2025`
- **URL:** `/admin/admin-login.html`

### Security Features
- Secure authentication with role-based access
- Failed login attempt logging
- 2FA support (optional)
- Email notifications for admin logins
- Session management

---

## Content Management System

### Products Management

#### Adding a Product
1. Navigate to **Content Management** → **Products Tab**
2. Click **"Add Product"** button
3. Fill in product details:
   - **Product Name:** Display name
   - **Category:** calculator, database, tool, report, hub
   - **Type:** free, premium, enterprise
   - **Description:** Brief overview
   - **Features:** One per line
   - **Pricing:** Price, discount, billing period
   - **Image URL:** Product thumbnail
   - **Product URL:** Link to product page
   - **Status:** Active/Inactive toggle
4. Click **"Save Product"**

#### Product Fields
```javascript
{
  id: 'prod_timestamp',
  name: 'Product Name',
  category: 'calculator|database|tool|report|hub',
  type: 'free|premium|enterprise',
  description: 'Short description',
  features: ['Feature 1', 'Feature 2'],
  price: 49.99,
  discount: 20,
  period: 'monthly|yearly|one-time',
  image: 'https://...',
  url: '/products/...',
  active: true,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}
```

### Articles Management

#### Adding an Article
1. Navigate to **Content Management** → **Articles Tab**
2. Click **"Add Article"** button
3. Fill in article details:
   - **Title:** Article headline
   - **Category:** news, tutorial, case-study, industry-insights, product-updates
   - **Author:** Writer name
   - **Excerpt:** Brief summary
   - **Content:** Full article text
   - **Featured Image:** Header image URL
   - **Tags:** Comma-separated keywords
   - **Publish Date:** Schedule publication
   - **Status:** draft, published, scheduled
   - **Featured:** Highlight article
4. Click **"Publish"** or **"Save Draft"**

#### Article Fields
```javascript
{
  id: 'article_timestamp',
  title: 'Article Title',
  category: 'news|tutorial|case-study|industry-insights|product-updates',
  author: 'Author Name',
  excerpt: 'Brief summary',
  content: 'Full article content',
  image: 'https://...',
  tags: 'mining,cost,optimization',
  publishDate: '2025-01-01T00:00:00.000Z',
  status: 'draft|published|scheduled',
  featured: false,
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}
```

### Media Library

#### Uploading Media
1. Navigate to **Content Management** → **Media Tab**
2. Click **"Upload Media"** button
3. Drag & drop files or click to browse
4. Supported formats: JPG, PNG, GIF, PDF, MP4 (Max 10MB)
5. Files are automatically uploaded and stored

#### Using Media
- Click **Copy URL** icon to copy media URL
- Paste URL in product/article image fields
- Use in content as needed

---

## User Management System

### User Overview

#### Dashboard Statistics
- **Total Users:** All registered users
- **Active Users:** Users with active status
- **Premium Users:** Professional + Enterprise plans
- **New Users:** Registered this month

### Managing Users

#### Adding a User
1. Navigate to **User Management**
2. Click **"Add User"** button
3. Fill in user details:
   - **Full Name:** User's name
   - **Email:** Login email
   - **Company:** Organization name
   - **Phone:** Contact number
   - **Plan:** free, starter, professional, enterprise
   - **Role:** user, admin
   - **Status:** active, suspended, inactive
   - **Notes:** Internal admin notes
4. Check **"Send email notification"** if needed
5. Click **"Save Changes"**

#### Editing a User
1. Find user in table
2. Click **Edit** icon
3. Modify fields as needed
4. Click **"Save Changes"**

#### Viewing User Details
1. Find user in table
2. Click **View** icon
3. Review complete user information
4. Click **"Edit User"** to make changes

#### Deleting a User
1. Find user in table
2. Click **Delete** icon
3. Confirm deletion
4. User is permanently removed

### User Fields
```javascript
{
  id: 'user_timestamp',
  name: 'John Doe',
  email: 'john@company.com',
  company: 'Company Name',
  phone: '+1 (555) 000-0000',
  plan: 'free|starter|professional|enterprise',
  role: 'user|admin',
  status: 'active|suspended|inactive',
  notes: 'Internal notes',
  createdAt: '2025-01-01T00:00:00.000Z',
  updatedAt: '2025-01-01T00:00:00.000Z'
}
```

### Filtering & Search

#### Search Users
- Type in search box to filter by:
  - Name
  - Email
  - Company

#### Filter by Plan
- Select plan from dropdown:
  - All Plans
  - Free
  - Starter
  - Professional
  - Enterprise

#### Filter by Role
- Select role from dropdown:
  - All Roles
  - User
  - Admin

### Bulk Operations

#### Select Multiple Users
1. Check **Select All** checkbox (header)
2. Or check individual user checkboxes
3. Perform bulk actions (future feature)

### Export Users

#### Export to CSV
1. Apply filters if needed
2. Click **"Export CSV"** button
3. File downloads automatically
4. Opens in Excel/Sheets

---

## Email Notifications

### EmailJS Integration

#### Configuration
- **Service ID:** `service_qfwvqyg`
- **Public Key:** `pYI5e7c0EjKvjvgbV`

#### Email Templates Required
Create these templates in EmailJS dashboard:

1. **template_welcome**
   - Sent when new user registers
   - Variables: `to_email`, `to_name`, `from_name`, `message`

2. **template_notification**
   - Sent for login notifications and updates
   - Variables: `to_email`, `to_name`, `subject`, `message`

3. **template_password_reset**
   - Sent for password reset requests
   - Variables: `to_email`, `reset_link`, `message`

### Notification Events
- User registration (welcome email)
- User login (security notification)
- Admin login (security alert)
- User account updates (change notification)
- Password reset (reset link)

---

## Data Storage

### LocalStorage Keys
```javascript
{
  'sesmine_user': 'Current logged-in user',
  'sesmine_token': 'Authentication token',
  'sesmine_session': 'Session data',
  'sesmine_users': 'All registered users',
  'sesmine_products': 'All products',
  'sesmine_articles': 'All articles',
  'sesmine_media': 'Media library files',
  'admin_failed_attempts': 'Failed login logs'
}
```

### Data Backup
- All data stored in browser localStorage
- Export users to CSV for backup
- In production, migrate to server database

---

## Access Control

### User Plans & Features

#### Free Plan
- Basic calculator
- Limited reports
- Community access
- Basic support

#### Starter Plan ($49/month)
- Cost calculator
- Equipment database
- Standard reports
- Email support
- Basic hubs

#### Professional Plan ($149/month)
- All calculators
- Full database
- Advanced reports
- All hubs
- Priority support
- API access
- Custom reports

#### Enterprise Plan (Custom)
- All features
- Unlimited users
- Custom integration
- Dedicated support
- White-label option
- SLA guarantee

### Role Permissions

#### User Role
- Access to subscribed features
- View own profile
- Use products/tools
- Read articles

#### Admin Role
- Full system access
- Manage content
- Manage users
- View analytics
- System configuration

---

## Best Practices

### Content Management
1. **Use descriptive names** for products and articles
2. **Add high-quality images** for better engagement
3. **Write clear descriptions** to help users understand features
4. **Tag articles properly** for better discoverability
5. **Schedule content** for consistent publishing
6. **Review drafts** before publishing

### User Management
1. **Verify email addresses** before creating accounts
2. **Document user notes** for context
3. **Regular user audits** to remove inactive accounts
4. **Monitor plan usage** to identify upgrade opportunities
5. **Send notifications** for important changes
6. **Backup user data** regularly

### Security
1. **Change default admin password** immediately
2. **Enable 2FA** for admin accounts
3. **Review failed login attempts** regularly
4. **Limit admin access** to trusted personnel
5. **Log all admin actions** for audit trail
6. **Use strong passwords** for all accounts

---

## Troubleshooting

### Common Issues

#### Cannot Login to Admin
- Verify credentials: `admin@sesmine.com` / `Admin@2025`
- Clear browser cache and cookies
- Check browser console for errors
- Ensure JavaScript is enabled

#### Products Not Displaying
- Check if product is marked as "Active"
- Verify product URL is correct
- Clear localStorage and reload
- Check browser console for errors

#### Email Notifications Not Sending
- Verify EmailJS configuration
- Check service ID and public key
- Ensure templates are created in EmailJS
- Check browser console for API errors
- Verify internet connection

#### Users Not Saving
- Check required fields are filled
- Verify email format is valid
- Check localStorage quota (5-10MB limit)
- Clear old data if storage is full

### Getting Help
- Check browser console for errors
- Review this documentation
- Contact system administrator
- Email: support@sesmine.com

---

## Future Enhancements

### Planned Features
- [ ] Server-side database integration
- [ ] Advanced analytics dashboard
- [ ] Bulk user operations
- [ ] Content versioning
- [ ] Automated backups
- [ ] API documentation
- [ ] Mobile admin app
- [ ] Advanced reporting
- [ ] Workflow automation
- [ ] Multi-language support

---

## Version History

### Version 1.0.0 (January 2025)
- Initial release
- Product management
- Article management
- Media library
- User management
- EmailJS integration
- Access control system
- Admin authentication

---

## Support

For technical support or questions:
- **Email:** admin@sesmine.com
- **Documentation:** /admin/README.md
- **System Status:** Check admin dashboard

---

**Last Updated:** January 2025
**Version:** 1.0.0
**Maintained by:** SESMine Development Team
