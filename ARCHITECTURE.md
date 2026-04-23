# Campus Study Platform - System Architecture & Design

## 1. Project Overview

**Campus Study Platform** is a web-based collaboration tool that enables students to:
- Form study groups with peers
- Schedule and attend study sessions
- Share study materials and files
- Real-time messaging within groups
- Track study activities through an admin dashboard

---

## 2. System Architecture

### 2.1 High-Level Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                     CLIENT (React + Vite)                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Pages: Login, Register, Dashboard, GroupPage, Admin    │ │
│  │  Components: ChatBox, FileUpload, GroupCard, Scheduler  │ │
│  │  Context: AuthContext (state management)                │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                                                    │
│         │ HTTP (REST) + WebSocket (Socket.IO)              │
│         ▼                                                    │
└─────────────────────────────────────────────────────────────┘
         │
         │
┌─────────────────────────────────────────────────────────────┐
│                  SERVER (Express.js + Node)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │ Routes Layer                                            │ │
│  │ ├─ /api/auth       (Authentication)                   │ │
│  │ ├─ /api/users      (User management)                  │ │
│  │ ├─ /api/groups     (Group operations)                 │ │
│  │ ├─ /api/chat       (Messaging)                        │ │
│  │ ├─ /api/sessions   (Study sessions)                   │ │
│  │ ├─ /api/admin      (Admin operations)                 │ │
│  │ ├─ /api/upload     (File uploads)                     │ │
│  │ └─ /api/health     (Health check)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                                                    │
│  ┌──────▼─────────────────────────────────────────────────┐ │
│  │ Middleware Layer                                        │ │
│  │ ├─ Auth Middleware (JWT verification)                 │ │
│  │ ├─ Error Middleware (Centralized error handling)      │ │
│  │ └─ CORS Middleware (Cross-origin requests)            │ │
│  └──────┬─────────────────────────────────────────────────┘ │
│         │                                                    │
│  ┌──────▼─────────────────────────────────────────────────┐ │
│  │ Controller Layer                                        │ │
│  │ ├─ AuthController     (Login, Register, JWT)          │ │
│  │ ├─ UserController     (Profile, User data)            │ │
│  │ ├─ GroupController    (CRUD operations on groups)     │ │
│  │ ├─ ChatController     (Message operations)            │ │
│  │ ├─ SessionController  (Session operations)            │ │
│  │ ├─ UploadController   (File uploads to Cloudinary)    │ │
│  │ └─ AdminController    (Admin operations)              │ │
│  └──────┬─────────────────────────────────────────────────┘ │
│         │                                                    │
│  ┌──────▼─────────────────────────────────────────────────┐ │
│  │ Model Layer (MongoDB)                                  │ │
│  │ ├─ User Schema     (name, email, password, groups)    │ │
│  │ ├─ Group Schema    (name, members, files, sessions)   │ │
│  │ ├─ Session Schema  (title, schedule, attendees)       │ │
│  │ ├─ Message Schema  (content, sender, group, timestamp)│ │
│  │ └─ Relationships   (Foreign keys)                     │ │
│  └────────────────────────────────────────────────────────┘ │
│         │                                                    │
│  ┌──────▼─────────────────────────────────────────────────┐ │
│  │ External Integrations                                  │ │
│  │ ├─ MongoDB (Database)                                 │ │
│  │ ├─ Cloudinary (File storage)                          │ │
│  │ ├─ Socket.IO (Real-time events)                       │ │
│  │ └─ JWT (Authentication)                               │ │
│  └────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Data Models

### 3.1 User Model
```javascript
User {
  id: ObjectId (Primary Key)
  name: String (Required)
  email: String (Required, Unique)
  password: String (Hashed, Required)
  role: Enum ['user', 'admin'] (Default: 'user')
  avatar: String (Optional URL)
  groups: Array<GroupId> (References)
  isActive: Boolean (Default: true)
  createdAt: Date
  updatedAt: Date
}
```

**Methods:**
- `comparePassword(candidatePassword)` - Verify password during login
- `hashPassword()` - Automatically called before save

---

### 3.2 Group Model
```javascript
Group {
  id: ObjectId (Primary Key)
  name: String (Required)
  description: String
  subject: String (Required)
  creator: UserId (Required)
  members: Array<{user: UserId, role: Enum, joinedAt: Date}>
  files: Array<{name, url, publicId, uploadedBy, uploadedAt}>
  isPrivate: Boolean (Default: false)
  maxMembers: Number (Default: 50)
  createdAt: Date
  updatedAt: Date
}
```

**Virtuals:**
- `memberCount` - Returns total members

---

### 3.3 Session Model
```javascript
Session {
  id: ObjectId (Primary Key)
  title: String (Required)
  description: String
  group: GroupId (Required)
  scheduledBy: UserId (Required)
  startTime: Date (Required)
  endTime: Date (Required)
  location: String (Default: 'Online')
  meetingLink: String (Optional)
  attendees: Array<UserId>
  status: Enum ['upcoming', 'ongoing', 'completed', 'cancelled']
  createdAt: Date
  updatedAt: Date
}
```

---

### 3.4 Message Model
```javascript
Message {
  id: ObjectId (Primary Key)
  content: String (Required)
  sender: UserId (Required)
  group: GroupId (Required)
  attachments: Array<String> (Optional URLs)
  createdAt: Date
  updatedAt: Date
}
```

---

## 4. API Endpoints

### 4.1 Authentication Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/register` | Register new user | No |
| POST | `/api/auth/login` | Login user | No |
| POST | `/api/auth/logout` | Logout user | Yes |
| GET | `/api/auth/verify` | Verify token validity | Yes |

### 4.2 User Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/users/profile` | Get user profile | Yes |
| PUT | `/api/users/profile` | Update profile | Yes |
| GET | `/api/users/:userId` | Get user by ID | Yes |
| GET | `/api/users` | List all users | Yes |

### 4.3 Group Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/groups` | List all groups | Yes |
| POST | `/api/groups` | Create new group | Yes |
| GET | `/api/groups/:groupId` | Get group details | Yes |
| PUT | `/api/groups/:groupId` | Update group | Yes |
| DELETE | `/api/groups/:groupId` | Delete group | Yes |
| POST | `/api/groups/:groupId/join` | Join group | Yes |
| POST | `/api/groups/:groupId/leave` | Leave group | Yes |

### 4.4 Chat Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/chat/:groupId/messages` | Get group messages | Yes |
| POST | `/api/chat/:groupId/message` | Send message | Yes |
| DELETE | `/api/chat/message/:messageId` | Delete message | Yes |

### 4.5 Session Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/sessions/group/:groupId` | List sessions for group | Yes |
| POST | `/api/sessions` | Create session | Yes |
| PUT | `/api/sessions/:sessionId` | Update session | Yes |
| DELETE | `/api/sessions/:sessionId` | Delete session | Yes |
| POST | `/api/sessions/:sessionId/join` | Join session | Yes |

### 4.6 File Upload Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/upload/group/:groupId` | Upload file to group | Yes |
| DELETE | `/api/upload/:fileId` | Delete file | Yes |

### 4.7 Admin Endpoints
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/admin/users` | List all users | Admin |
| GET | `/api/admin/groups` | List all groups | Admin |
| DELETE | `/api/admin/user/:userId` | Delete user | Admin |
| DELETE | `/api/admin/group/:groupId` | Delete group | Admin |

---

## 5. Real-Time Communication (Socket.IO)

### 5.1 Socket Events

**Client → Server Events:**
- `join_group` - User joins a group chat
- `leave_group` - User leaves a group chat
- `send_message` - Send message to group
- `typing` - User is typing
- `session_start` - Start study session
- `session_end` - End study session

**Server → Client Events:**
- `message_received` - New message in group
- `user_joined` - User joined group
- `user_typing` - User is typing indicator
- `session_started` - Study session started
- `session_ended` - Study session ended
- `error` - Socket error event

### 5.2 Socket Namespaces (Optional Enhancement)
```
/chat        - All chat-related events
/sessions    - All session-related events
/notifications - All notification events
```

---

## 6. Security Considerations

### 6.1 Authentication & Authorization
- **JWT Tokens** for stateless authentication
- **HTTP-only Cookies** for token storage (optional)
- **Role-based Access Control** (User vs Admin)
- **Middleware verification** on all protected routes

### 6.2 Data Protection
- **Password Hashing** using bcryptjs (salt rounds: 12)
- **CORS** configured for allowed origins
- **Request Size Limits** (50MB for large file uploads)
- **Input Validation** on all endpoints

### 6.3 Database Security
- **MongoDB Connection** via connection string
- **Unique Constraints** on email fields
- **Reference Validation** between collections

### 6.4 File Upload Security
- **Cloudinary Integration** for safe file storage
- **File Type Restrictions** (configurable)
- **Secure URLs** for file access

---

## 7. Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT
- **Real-Time**: Socket.IO
- **File Storage**: Cloudinary
- **Password Hashing**: bcryptjs
- **Environment**: dotenv

### Frontend
- **Library**: React 18
- **Build Tool**: Vite
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Real-Time**: Socket.IO Client
- **Styling**: Tailwind CSS
- **State Management**: React Context API

### Development Tools
- **Backend Dev**: Nodemon (auto-reload)
- **Frontend Dev** Vite (hot module replacement)

---

## 8. Deployment Architecture

```
┌─────────────────────────────────────┐
│      Version Control (GitHub)       │
└────────────┬────────────────────────┘
             │
         CI/CD
             │
    ┌────────▼─────────┐
    │   Build & Test   │
    └────────┬─────────┘
             │
    ┌────────▼─────────────┐
    │  Deployment Server   │
    │  ├─ Backend Service  │
    │  ├─ MongoDB Instance │
    │  └─ Frontend Assets  │
    └──────────────────────┘
```

---

## 9. Scaling Considerations

### Horizontal Scaling
- **Load Balancer** for distributing traffic
- **Multiple Server Instances** behind load balancer
- **Redis** for session/cache management
- **Database Replication** for MongoDB

### Performance Optimization
- **Redis Caching** for frequently accessed data
- **Database Indexing** on common query fields
- **CDN** for static assets
- **Pagination** for large datasets
- **WebSocket Namespaces** for better real-time organization

---

## 10. Testing Strategy

### Unit Testing
- Test individual functions and utilities
- Mock external dependencies
- Test edge cases and error scenarios

### Integration Testing
- Test API endpoints with real database
- Test authentication flow
- Test file upload flow
- Test Socket.IO events

### End-to-End Testing
- Test complete user workflows
- Test cross-browser compatibility
- Test real-time messaging flow

---

