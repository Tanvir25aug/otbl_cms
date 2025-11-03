# 🚀 JIRA-Like Ticketing System Upgrade Guide

## Overview
This guide documents the complete upgrade of the ticketing system to a full-featured JIRA-like project management system with agile capabilities.

---

## 📋 What's New

### ✅ **Enhanced Ticket Management**

#### **New Ticket Fields**
- **Status Workflow**: Backlog → To Do → In Progress → In Review → Testing → Done → Closed
- **Priority Levels**: Lowest, Low, Medium, High, Highest
- **Ticket Types**: Epic, Story, Task, Bug, Subtask, Improvement, New Feature
- **Severity Levels**: Blocker, Critical, Major, Minor, Trivial
- **Resolution Types**: Unresolved, Fixed, Won't Fix, Duplicate, Cannot Reproduce, Done

#### **Agile Features**
- **Story Points**: Estimate work effort
- **Time Tracking**: Original estimate, time spent, remaining estimate
- **Sprint Assignment**: Link tickets to sprints
- **Epic Hierarchy**: Group stories under epics
- **Parent-Child Relationships**: Create subtasks

#### **Dates**
- Start Date
- Due Date
- Resolved Date (auto-set when completed)

#### **Organization**
- Labels (array of tags)
- Components (system modules)
- Affected Versions
- Fix Versions
- Environment details

#### **Collaboration**
- Watchers (array of user IDs)
- Flagging system
- Archive functionality

---

### 🏃 **Sprint Management**

#### **Sprint Lifecycle**
1. **Future** - Planning phase
2. **Active** - Currently running
3. **Closed** - Completed

#### **Sprint Features**
- Sprint goals and planning
- Start/End dates
- Team and project association
- Story points tracking
- Completion metrics
- Only one active sprint per project

#### **Sprint Metrics**
- Total tickets
- Completed tickets
- Story points (completed / total)
- Completion percentage

---

### 📊 **Audit Trail & History**

#### **TicketHistory Model**
- Tracks all ticket changes
- Records field updates (old value → new value)
- User attribution
- Timestamp for every change
- Action types: created, updated, status_changed, assigned, etc.

---

### 📎 **Attachments (Structure Ready)**

#### **TicketAttachment Model**
- File upload support structure
- File metadata tracking
- User attribution
- Description field

---

## 🗄️ **Database Changes**

### **New Tables**
1. **Sprints**
   - Sprint management
   - Status tracking
   - Metrics storage

2. **TicketHistories**
   - Complete audit trail
   - Field-level change tracking

3. **TicketAttachments**
   - File attachment metadata
   - User and ticket associations

### **Enhanced Tickets Table**
**New Columns:**
- `sprintId` - Sprint association
- `epicId` - Epic parent
- `startDate` - Ticket start date
- `resolvedDate` - Completion timestamp
- `resolutionComment` - Resolution details
- `storyPoints` - Agile estimation
- `originalEstimate` - Initial time estimate (hours)
- `remainingEstimate` - Time left (hours)
- `timeSpent` - Actual time logged (hours)
- `labels` - JSON array of tags
- `components` - JSON array of components
- `affectedVersions` - JSON array
- `fixVersions` - JSON array
- `environment` - Environment details
- `watchers` - JSON array of user IDs
- `isFlagged` - Boolean flag
- `isArchived` - Boolean archive status

**Modified Columns (now ENUMs):**
- `status`
- `priority`
- `type`
- `severity`
- `resolution`

---

## 🛠️ **Backend Updates**

### **New Controllers**
- **`sprintController.js`** - Full sprint CRUD + lifecycle management
  - Create, read, update, delete sprints
  - Start/complete sprints
  - Add/remove tickets from sprints
  - Calculate sprint metrics

### **Enhanced Controllers**
- **`ticketController.js`** - Extended with:
  - Advanced filtering (sprint, type, priority, flags)
  - Automatic history tracking
  - Watcher management
  - Time logging
  - Flag toggle
  - Archive functionality
  - Full relationship includes

### **New Routes**
- **`/sprints`** - Sprint management API
  - GET `/sprints` - List all sprints
  - POST `/sprints` - Create sprint
  - GET `/sprints/:id` - Get sprint details with metrics
  - PUT `/sprints/:id` - Update sprint
  - DELETE `/sprints/:id` - Delete sprint
  - POST `/sprints/:id/start` - Start sprint
  - POST `/sprints/:id/complete` - Complete sprint
  - POST `/sprints/:id/tickets` - Add ticket to sprint
  - DELETE `/sprints/:id/tickets` - Remove ticket from sprint

### **Enhanced Routes**
- **`/tickets`** - Extended endpoints:
  - POST `/tickets/:id/watchers` - Add watcher
  - DELETE `/tickets/:id/watchers` - Remove watcher
  - POST `/tickets/:id/log-time` - Log work time
  - GET `/tickets/:id/history` - Get change history
  - POST `/tickets/:id/flag` - Toggle flag
  - POST `/tickets/:id/archive` - Archive ticket

### **Model Associations**
```javascript
Ticket ↔ Sprint
Ticket ↔ Epic
Ticket ↔ Parent/Subtasks
Ticket ↔ History (one-to-many)
Ticket ↔ Attachments (one-to-many)
Sprint ↔ Project
Sprint ↔ Team
```

---

## 🎨 **Frontend Updates**

### **New Views**

#### **1. TicketCreateViewEnhanced.vue**
- All JIRA-like fields supported
- Organized sections
- Story points and estimates
- Labels, components, versions
- Environment details

#### **2. TicketDetailViewEnhanced.vue**
- **Tabbed Interface:**
  - Comments
  - History (audit trail)
  - Linked Issues
  - Subtasks
- **Inline Editing** - Quick field updates
- **Time Tracking Widget** - Log work
- **Actions Panel** - Flag, archive, delete
- **Full relationship display**

#### **3. TicketBoardViewEnhanced.vue**
- **Sprint Selector** - Switch between sprints
- **Drag & Drop** - Move tickets between columns
- **Sprint Metrics Dashboard**
  - Story points progress
  - Completion percentage
  - Ticket counts
- **Advanced Filters**
  - Type, priority, assignee
  - Search functionality
- **Ticket Cards Show:**
  - Type, priority, story points
  - Subtask progress
  - Comment count
  - Assignee avatar
  - Labels

#### **4. TicketListViewEnhanced.vue**
- **Stats Cards** - Total, In Progress, Completed, Bugs
- **Advanced Filtering**
  - Type, status, priority, sprint
  - Search by title/ID
- **Table Columns:**
  - Flag indicator
  - Type badge
  - Story points
  - Sprint
  - Assignee with avatar
  - Due date (with overdue warning)
  - Attachment/subtask indicators
- **Pagination** - Handle large datasets

#### **5. SprintManagementView.vue**
- **Active Sprint Dashboard**
  - Sprint metrics
  - Progress bar
  - Backlog view
  - Quick actions
- **Future Sprints** - Plan ahead
- **Completed Sprints** - Historical view
- **Sprint CRUD Operations**
  - Create new sprints
  - Edit sprint details
  - Start/Complete sprints
  - Delete sprints

---

## 🔧 **Installation & Setup**

### **1. Run Database Migration**
```bash
cd backend
npx sequelize-cli db:migrate
```

This will:
- Add new columns to Tickets table
- Create Sprints, TicketHistories, TicketAttachments tables
- Convert status, priority, type, severity, resolution to ENUMs

### **2. Update Frontend Routes**
Add these routes to `frontend/src/router/index.ts`:

```typescript
{
  path: '/tickets/create',
  component: () => import('../views/TicketCreateViewEnhanced.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/tickets/board',
  component: () => import('../views/TicketBoardViewEnhanced.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/tickets/:id',
  component: () => import('../views/TicketDetailViewEnhanced.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/tickets',
  component: () => import('../views/TicketListViewEnhanced.vue'),
  meta: { requiresAuth: true }
},
{
  path: '/sprints',
  component: () => import('../views/SprintManagementView.vue'),
  meta: { requiresAuth: true, roles: ['Super Admin', 'Admin', 'Manager'] }
}
```

### **3. Install Dependencies**
No new dependencies required! All features use existing libraries.

### **4. Restart Services**
```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev
```

---

## 📝 **Usage Examples**

### **Creating a Sprint**
```javascript
POST /api/sprints
{
  "name": "Sprint 1",
  "goal": "Implement user authentication",
  "startDate": "2025-10-01",
  "endDate": "2025-10-14",
  "projectId": 1,
  "teamId": 1
}
```

### **Creating a Ticket with Full Fields**
```javascript
POST /api/tickets
{
  "title": "Implement JWT authentication",
  "description": "<p>Add JWT token-based authentication...</p>",
  "type": "Story",
  "priority": "High",
  "severity": "Major",
  "storyPoints": 5,
  "originalEstimate": 16,
  "sprintId": 1,
  "epicId": 10,
  "labels": ["backend", "security"],
  "components": ["API", "Auth"],
  "dueDate": "2025-10-10"
}
```

### **Logging Time**
```javascript
POST /api/tickets/123/log-time
{
  "timeSpent": 4
}
```

### **Adding a Watcher**
```javascript
POST /api/tickets/123/watchers
{
  "userId": 5
}
```

---

## 🎯 **Key Features Summary**

### **Epic → Story → Task → Subtask Hierarchy** ✅
Organize work at multiple levels

### **Sprint Planning & Tracking** ✅
Full agile sprint lifecycle

### **Time Tracking** ✅
Estimate and log work hours

### **Story Points** ✅
Velocity-based planning

### **Watchers** ✅
Follow tickets you care about

### **Ticket Flagging** ✅
Mark important issues

### **Ticket Archiving** ✅
Clean up closed work

### **Complete Audit History** ✅
Every change tracked

### **Ticket Linking** ✅
blocks, duplicates, relates to

### **Labels & Components** ✅
Organize and categorize

### **Version Tracking** ✅
Affected and fix versions

### **Advanced Filtering** ✅
Find exactly what you need

### **Sprint Metrics** ✅
Burndown and velocity tracking

---

## 🔍 **API Endpoints Reference**

### **Tickets**
- `GET /api/tickets` - List tickets (supports filtering)
- `POST /api/tickets` - Create ticket
- `GET /api/tickets/:id` - Get ticket details
- `PUT /api/tickets/:id` - Update ticket
- `DELETE /api/tickets/:id` - Delete ticket
- `PUT /api/tickets/:id/assign` - Assign ticket
- `POST /api/tickets/:id/link` - Link tickets
- `POST /api/tickets/:id/unlink` - Unlink tickets
- `POST /api/tickets/:id/watchers` - Add watcher
- `DELETE /api/tickets/:id/watchers` - Remove watcher
- `POST /api/tickets/:id/log-time` - Log time
- `GET /api/tickets/:id/history` - Get history
- `POST /api/tickets/:id/flag` - Toggle flag
- `POST /api/tickets/:id/archive` - Archive ticket
- `GET /api/tickets/:id/comments` - Get comments
- `POST /api/tickets/:id/comments` - Add comment

### **Sprints**
- `GET /api/sprints` - List sprints
- `POST /api/sprints` - Create sprint
- `GET /api/sprints/:id` - Get sprint with metrics
- `PUT /api/sprints/:id` - Update sprint
- `DELETE /api/sprints/:id` - Delete sprint
- `POST /api/sprints/:id/start` - Start sprint
- `POST /api/sprints/:id/complete` - Complete sprint
- `POST /api/sprints/:id/tickets` - Add ticket to sprint
- `DELETE /api/sprints/:id/tickets` - Remove ticket from sprint

---

## 🎨 **UI/UX Features**

- **Modern Card-Based Design**
- **Responsive Tables**
- **Drag & Drop Kanban Board**
- **Inline Editing**
- **Avatar System**
- **Badge System for Status/Priority**
- **Progress Bars**
- **Stats Dashboards**
- **Modal Dialogs**
- **Tabbed Interfaces**
- **Search & Filter Controls**
- **Pagination**

---

## 🚧 **Future Enhancements**

1. **File Upload Implementation** - Complete attachment functionality
2. **Email Notifications** - Notify watchers of changes
3. **Custom Workflows** - Define custom status flows
4. **Burndown Charts** - Visualize sprint progress
5. **Velocity Tracking** - Team performance metrics
6. **Custom Fields** - User-defined ticket fields
7. **Advanced Reporting** - Analytics dashboard
8. **Roadmap View** - Epic timeline visualization

---

## 📚 **Migration Notes**

### **Data Migration**
- Existing tickets will retain their data
- Status values will be mapped to new ENUM values
- History tracking starts from migration forward
- No data loss during upgrade

### **Breaking Changes**
- Status/Priority/Type are now ENUMs (more restrictive)
- API responses include more nested data
- Frontend components are completely replaced

---

## 🆘 **Troubleshooting**

### **Migration Fails**
```bash
# Rollback migration
npx sequelize-cli db:migrate:undo

# Check database
npx sequelize-cli db:migrate:status
```

### **ENUM Errors**
If you see ENUM errors, the migration may need to drop existing columns first. Consider backing up data before migration.

### **Frontend Not Showing New Views**
Clear browser cache and rebuild:
```bash
cd frontend
npm run build
```

---

## ✅ **Testing Checklist**

- [ ] Create a sprint
- [ ] Create tickets of different types
- [ ] Assign tickets to sprint
- [ ] Start sprint
- [ ] Move tickets on Kanban board
- [ ] Log time on tickets
- [ ] Add comments
- [ ] Link tickets
- [ ] Complete sprint
- [ ] View ticket history
- [ ] Test filtering and search
- [ ] Test pagination

---

## 📞 **Support**

For questions or issues with the upgrade:
1. Check this guide first
2. Review the code comments
3. Check database migration status
4. Verify API endpoints are responding

---

**🎉 Congratulations! Your ticketing system is now a full JIRA-like project management platform!**
