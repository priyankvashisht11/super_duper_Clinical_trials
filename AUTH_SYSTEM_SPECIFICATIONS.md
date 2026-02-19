# Clinical IQ - Authentication System Specifications

## 📋 Overview

This document outlines the complete specifications for implementing a robust authentication system for Clinical IQ, including user registration, login, profile management, and notifications.

---

## 🎯 System Components

### 1. Notifications System (Bell Icon with Badge)
### 2. User Profile Menu (Account Icon)
### 3. Sign In / Authentication System

---

## 📊 Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  title VARCHAR(50), -- Dr., Prof., etc.
  specialty VARCHAR(100), -- Cardiology, Oncology, etc.
  institution VARCHAR(255),
  license_number VARCHAR(100),
  phone VARCHAR(20),
  country VARCHAR(100) DEFAULT 'India',
  state VARCHAR(100),
  city VARCHAR(100),
  role VARCHAR(50) DEFAULT 'researcher', -- researcher, admin, viewer
  email_verified BOOLEAN DEFAULT FALSE,
  profile_image_url TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  last_login_at TIMESTAMP,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

### Sessions Table
```sql
CREATE TABLE sessions (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  refresh_token VARCHAR(500) UNIQUE,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  ip_address VARCHAR(45),
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_sessions_token ON sessions(token);
CREATE INDEX idx_sessions_user_id ON sessions(user_id);
```

### Notifications Table
```sql
CREATE TABLE notifications (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(50) NOT NULL, -- protocol_update, trial_match, system, comment, mention
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  link VARCHAR(500), -- URL to navigate when clicked
  is_read BOOLEAN DEFAULT FALSE,
  priority VARCHAR(20) DEFAULT 'normal', -- low, normal, high, urgent
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  read_at TIMESTAMP
);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at DESC);
```

### User Preferences Table
```sql
CREATE TABLE user_preferences (
  id SERIAL PRIMARY KEY,
  user_id INTEGER UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT TRUE,
  push_notifications BOOLEAN DEFAULT TRUE,
  trial_alerts BOOLEAN DEFAULT TRUE,
  protocol_updates BOOLEAN DEFAULT TRUE,
  weekly_digest BOOLEAN DEFAULT TRUE,
  theme VARCHAR(20) DEFAULT 'light', -- light, dark, auto
  language VARCHAR(10) DEFAULT 'en',
  timezone VARCHAR(50) DEFAULT 'Asia/Kolkata',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Password Reset Tokens Table
```sql
CREATE TABLE password_reset_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token);
```

### Email Verification Tokens Table
```sql
CREATE TABLE email_verification_tokens (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
  token VARCHAR(500) UNIQUE NOT NULL,
  expires_at TIMESTAMP NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## 🔐 Authentication Flow

### Registration Flow
```
1. User clicks "Sign In" → Shows modal with "Sign Up" tab
2. User fills registration form:
   - Email
   - Password (min 8 chars, 1 uppercase, 1 number, 1 special)
   - Confirm Password
   - First Name
   - Last Name
   - Title (Dr., Prof., etc.)
   - Specialty (dropdown)
   - Institution
   - License Number (optional)
   - Terms & Conditions checkbox
3. Frontend validation
4. POST /api/auth/register
5. Backend:
   - Validate input
   - Check if email exists
   - Hash password (bcrypt, 10 rounds)
   - Create user record
   - Generate email verification token
   - Send verification email
   - Create session
   - Return JWT token + user data
6. Frontend:
   - Store token in localStorage
   - Update AuthContext
   - Redirect to dashboard
   - Show "Please verify your email" banner
```

### Login Flow
```
1. User clicks "Sign In" → Shows modal with "Sign In" tab
2. User enters:
   - Email
   - Password
   - Remember Me (optional)
3. POST /api/auth/login
4. Backend:
   - Find user by email
   - Verify password (bcrypt.compare)
   - Check if account is active
   - Create session
   - Generate JWT token (24h expiry)
   - Generate refresh token (30d expiry)
   - Update last_login_at
   - Return tokens + user data
5. Frontend:
   - Store tokens in localStorage
   - Update AuthContext
   - Redirect to previous page or dashboard
```

### Logout Flow
```
1. User clicks "Logout" from profile menu
2. POST /api/auth/logout
3. Backend:
   - Invalidate session
   - Blacklist token
4. Frontend:
   - Clear localStorage
   - Clear AuthContext
   - Redirect to home page
```

### Token Refresh Flow
```
1. API request returns 401 Unauthorized
2. Frontend intercepts error
3. POST /api/auth/refresh with refresh_token
4. Backend:
   - Validate refresh token
   - Check if session is active
   - Generate new JWT token
   - Return new token
5. Frontend:
   - Update token in localStorage
   - Retry original request
```

---

## 🔔 Notifications System

### Notification Types
1. **Protocol Updates**: "Your protocol 'XYZ' has been reviewed"
2. **Trial Matches**: "New trial matches your saved search"
3. **System Alerts**: "Scheduled maintenance on..."
4. **Comments**: "Dr. Smith commented on your protocol"
5. **Mentions**: "@you were mentioned in a discussion"

### Notification Features
- Real-time updates (WebSocket or polling)
- Badge count on bell icon
- Dropdown panel with recent notifications
- Mark as read/unread
- Mark all as read
- Delete notification
- Filter by type
- Pagination (load more)
- Click to navigate to relevant page

### Notification Panel UI
```
┌─────────────────────────────────────┐
│ Notifications              Mark All │
├─────────────────────────────────────┤
│ 🔵 Protocol Update                  │
│    Your protocol "Diabetes Study"   │
│    has been approved                │
│    2 hours ago                      │
├─────────────────────────────────────┤
│ ⚪ Trial Match                      │
│    3 new trials match your search   │
│    5 hours ago                      │
├─────────────────────────────────────┤
│ ⚪ System Alert                     │
│    New feature: AI Insights         │
│    1 day ago                        │
├─────────────────────────────────────┤
│           Load More                 │
└─────────────────────────────────────┘
```

---

## 👤 User Profile Menu

### Profile Menu Items
1. **Profile** → View/Edit profile
2. **Settings** → Account settings
3. **My Protocols** → List of user's protocols
4. **Bookmarks** → Saved trials/papers
5. **Preferences** → Notification preferences
6. **Help & Support** → Documentation, contact
7. **Logout** → Sign out

### Profile Menu UI
```
┌─────────────────────────────────────┐
│ 👤 Dr. Priya Sharma                │
│    priya.sharma@example.com         │
├─────────────────────────────────────┤
│ 👤 Profile                          │
│ ⚙️  Settings                        │
│ 📄 My Protocols                     │
│ 🔖 Bookmarks                        │
│ 🔔 Preferences                      │
│ ❓ Help & Support                   │
├─────────────────────────────────────┤
│ 🚪 Logout                           │
└─────────────────────────────────────┘
```

---

## 🎨 UI Components

### 1. Sign In Modal
**Features:**
- Tabs: Sign In / Sign Up
- Email + Password fields
- Remember Me checkbox
- Forgot Password link
- Social login (Google, optional)
- Close button
- Responsive design

### 2. Registration Form
**Fields:**
- Email (required, validated)
- Password (required, strength indicator)
- Confirm Password (required, match validation)
- First Name (required)
- Last Name (required)
- Title (dropdown: Dr., Prof., Mr., Ms., etc.)
- Specialty (autocomplete: Cardiology, Oncology, etc.)
- Institution (text)
- License Number (optional)
- Terms & Conditions (checkbox, required)

### 3. Profile Page
**Sections:**
- Profile Photo (upload/change)
- Personal Information (editable)
- Professional Details (editable)
- Account Security (change password)
- Email Verification Status
- Account Activity (recent logins)

### 4. Settings Page
**Sections:**
- Notification Preferences
- Privacy Settings
- Email Preferences
- Theme Selection
- Language Selection
- Timezone

---

## 🔒 Security Features

### Password Security
- Minimum 8 characters
- At least 1 uppercase letter
- At least 1 lowercase letter
- At least 1 number
- At least 1 special character
- Bcrypt hashing (10 rounds)
- Password strength indicator

### Session Security
- JWT tokens (HS256 algorithm)
- Token expiry: 24 hours
- Refresh token expiry: 30 days
- Secure HTTP-only cookies (optional)
- CSRF protection
- Rate limiting on auth endpoints

### Account Security
- Email verification required
- Password reset via email
- Account lockout after 5 failed attempts
- Session management (view/revoke sessions)
- Two-factor authentication (future)

---

## 📡 API Endpoints

### Authentication Endpoints

#### POST /api/auth/register
```json
Request:
{
  "email": "priya.sharma@example.com",
  "password": "SecurePass123!",
  "firstName": "Priya",
  "lastName": "Sharma",
  "title": "Dr.",
  "specialty": "Cardiology",
  "institution": "AIIMS Delhi",
  "licenseNumber": "MCI12345"
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "priya.sharma@example.com",
      "firstName": "Priya",
      "lastName": "Sharma",
      "role": "researcher",
      "emailVerified": false
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/login
```json
Request:
{
  "email": "priya.sharma@example.com",
  "password": "SecurePass123!",
  "rememberMe": true
}

Response:
{
  "success": true,
  "data": {
    "user": {
      "id": 1,
      "email": "priya.sharma@example.com",
      "firstName": "Priya",
      "lastName": "Sharma",
      "role": "researcher",
      "profileImageUrl": null
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/logout
```json
Request:
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### POST /api/auth/refresh
```json
Request:
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}

Response:
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

#### POST /api/auth/forgot-password
```json
Request:
{
  "email": "priya.sharma@example.com"
}

Response:
{
  "success": true,
  "message": "Password reset email sent"
}
```

#### POST /api/auth/reset-password
```json
Request:
{
  "token": "reset_token_here",
  "newPassword": "NewSecurePass123!"
}

Response:
{
  "success": true,
  "message": "Password reset successfully"
}
```

### User Endpoints

#### GET /api/users/me
```json
Response:
{
  "success": true,
  "data": {
    "id": 1,
    "email": "priya.sharma@example.com",
    "firstName": "Priya",
    "lastName": "Sharma",
    "title": "Dr.",
    "specialty": "Cardiology",
    "institution": "AIIMS Delhi",
    "role": "researcher",
    "emailVerified": true,
    "createdAt": "2026-02-10T10:00:00Z"
  }
}
```

#### PUT /api/users/me
```json
Request:
{
  "firstName": "Priya",
  "lastName": "Sharma",
  "specialty": "Interventional Cardiology",
  "phone": "+91-9876543210"
}

Response:
{
  "success": true,
  "data": { /* updated user */ }
}
```

#### PUT /api/users/me/password
```json
Request:
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass123!"
}

Response:
{
  "success": true,
  "message": "Password updated successfully"
}
```

### Notification Endpoints

#### GET /api/notifications
```json
Query Params: ?page=1&limit=20&unreadOnly=false

Response:
{
  "success": true,
  "data": {
    "notifications": [
      {
        "id": 1,
        "type": "protocol_update",
        "title": "Protocol Approved",
        "message": "Your protocol 'Diabetes Study' has been approved",
        "link": "/protocols/123",
        "isRead": false,
        "priority": "high",
        "createdAt": "2026-02-10T10:00:00Z"
      }
    ],
    "unreadCount": 3,
    "totalCount": 25,
    "page": 1,
    "totalPages": 2
  }
}
```

#### PUT /api/notifications/:id/read
```json
Response:
{
  "success": true,
  "message": "Notification marked as read"
}
```

#### PUT /api/notifications/mark-all-read
```json
Response:
{
  "success": true,
  "message": "All notifications marked as read"
}
```

#### DELETE /api/notifications/:id
```json
Response:
{
  "success": true,
  "message": "Notification deleted"
}
```

---

## 🎯 Implementation Phases

### Phase 1: Database & Backend Auth (Priority: HIGH)
**Tasks:**
1. Create database migrations for all tables
2. Set up Prisma schema
3. Implement password hashing utilities
4. Create JWT token generation/validation
5. Build auth middleware
6. Implement auth controllers
7. Create auth routes
8. Add validation middleware
9. Set up rate limiting
10. Test all auth endpoints

**Estimated Time:** 2-3 days

### Phase 2: Frontend Auth UI (Priority: HIGH)
**Tasks:**
1. Create AuthContext
2. Build Sign In modal component
3. Build Registration form
4. Add form validation
5. Implement password strength indicator
6. Create auth service (API calls)
7. Add token management
8. Implement protected routes
9. Add loading states
10. Test auth flows

**Estimated Time:** 2-3 days

### Phase 3: User Profile & Settings (Priority: MEDIUM)
**Tasks:**
1. Create Profile page
2. Build Settings page
3. Implement profile editing
4. Add password change functionality
5. Create profile image upload
6. Build preferences management
7. Add session management
8. Test all user features

**Estimated Time:** 2 days

### Phase 4: Notifications System (Priority: MEDIUM)
**Tasks:**
1. Create notifications backend
2. Build notification panel UI
3. Implement real-time updates
4. Add notification preferences
5. Create notification types
6. Test notification flows

**Estimated Time:** 2 days

### Phase 5: Security & Polish (Priority: HIGH)
**Tasks:**
1. Add email verification
2. Implement password reset
3. Add account lockout
4. Security audit
5. Performance optimization
6. Error handling improvements
7. UI/UX polish
8. Comprehensive testing

**Estimated Time:** 1-2 days

---

## 🧪 Testing Strategy

### Unit Tests
- Password hashing/validation
- Token generation/validation
- Input validation
- Database operations

### Integration Tests
- Registration flow
- Login flow
- Logout flow
- Token refresh
- Password reset
- Profile updates

### E2E Tests
- Complete user journey
- Error scenarios
- Edge cases

---

## 📦 Dependencies

### Backend
```json
{
  "bcrypt": "^5.1.1",
  "jsonwebtoken": "^9.0.2",
  "express-validator": "^7.0.1",
  "express-rate-limit": "^7.1.5",
  "nodemailer": "^6.9.8",
  "uuid": "^9.0.1"
}
```

### Frontend
```json
{
  "@hookform/resolvers": "^3.3.4",
  "react-hook-form": "^7.49.3",
  "zod": "^3.22.4",
  "axios": "^1.6.5"
}
```

---

## 🚀 Success Criteria

- ✅ Users can register with email/password
- ✅ Users can login securely
- ✅ Sessions persist across page refreshes
- ✅ Tokens refresh automatically
- ✅ Users can reset forgotten passwords
- ✅ Email verification works
- ✅ Profile management functional
- ✅ Notifications display correctly
- ✅ All security measures in place
- ✅ No security vulnerabilities
- ✅ Performance is acceptable
- ✅ UI is intuitive and responsive

---

**Status**: Specification Complete - Ready for Implementation
**Next Step**: Begin Phase 1 - Database & Backend Auth
