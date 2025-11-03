# Projects, Teams & Analytics - Complete Guide

This guide explains the enhanced project-based ticketing system with comprehensive analytics and reporting features.

## Table of Contents
1. [Overview](#overview)
2. [Project & Team Management](#project--team-management)
3. [Ticket Integration](#ticket-integration)
4. [Analytics Endpoints](#analytics-endpoints)
5. [API Usage Examples](#api-usage-examples)
6. [Frontend Integration](#frontend-integration)

---

## Overview

The system now provides a complete project management solution with:
- **Project & Team Structure**: Organize work by projects and teams
- **Ticket Validation**: Ensure data integrity with relationship validation
- **Comprehensive Analytics**: Track performance, velocity, and health metrics
- **Burndown Charts**: Monitor sprint progress in real-time
- **Team Performance**: Measure individual and team productivity

---

## Project & Team Management

### Data Model Hierarchy

```
Organization
  └─ Projects
      ├─ Teams
      │   └─ Team Members (Users with roles)
      ├─ Sprints
      └─ Tickets
```

### Project Fields
- **id**: Auto-generated ID
- **name**: Project name (required, unique)
- **key**: Project key (auto-generated from name, e.g., "PROJECT_NAME" → "PROJECTNA")
- **description**: Optional text description
- **status**: Active | Completed | On Hold | Cancelled
- **startDate**: Optional start date
- **endDate**: Optional end date
- **createdBy**: User who created the project

### Team Fields
- **id**: Auto-generated ID
- **name**: Team name (required)
- **description**: Optional description
- **projectId**: Must belong to a project (required)
- **leaderId**: Optional team leader user ID
- **status**: Active | Inactive

### Team Member Fields
- **id**: Auto-generated ID
- **teamId**: Team ID (required)
- **userId**: User ID (required)
- **role**: Custom role string (e.g., "Developer", "Tester", "Designer")
- **joinedAt**: Auto-set join date

---

## Ticket Integration

### Enhanced Validation

The ticketing system now validates:

1. **Project Exists**: When creating/updating a ticket with `projectId`, the project must exist
2. **Team Exists**: When creating/updating a ticket with `teamId`, the team must exist
3. **Team-Project Match**: If both `projectId` and `teamId` are provided, the team must belong to that project
4. **Team Membership**: If assigning to a user on a team ticket, that user must be a team member
5. **Sprint Validity**: Sprints must exist and belong to the specified project

### Ticket Fields Related to Projects/Teams

- **projectId**: Links ticket to a project
- **teamId**: Links ticket to a team
- **sprintId**: Links ticket to a sprint (which also has projectId/teamId)
- **assigneeId**: Must be a team member if teamId is set

### Example Validation Errors

```json
{
  "message": "Team does not belong to the specified project."
}

{
  "message": "Assignee is not a member of the specified team."
}

{
  "message": "Invalid sprint ID. Sprint does not exist."
}
```

---

## Analytics Endpoints

### 1. Organization Dashboard
**GET** `/api/analytics/dashboard`

**Access**: Manager, Admin, Super Admin

**Response**:
```json
{
  "overview": {
    "projects": { "total": 10, "active": 7 },
    "teams": { "total": 15, "active": 12 },
    "tickets": { "total": 250, "open": 80, "closed": 170, "overdue": 15 },
    "sprints": { "active": 5 },
    "users": { "total": 45 }
  },
  "breakdown": {
    "byPriority": { "Low": 50, "Medium": 120, "High": 60, "Highest": 20 },
    "byStatus": { "Backlog": 30, "To Do": 25, "In Progress": 25, "Done": 170 }
  },
  "recentActivity": {
    "ticketsCreated7Days": 12,
    "ticketsClosed7Days": 18
  },
  "topProjects": [
    {
      "project": { "id": 1, "name": "Project Alpha", "key": "PROJECTALP" },
      "ticketCount": 45
    }
  ]
}
```

### 2. Project Analytics
**GET** `/api/analytics/projects/:id`

**Access**: Manager, Admin, Super Admin

**Response**:
```json
{
  "project": {
    "id": 1,
    "name": "Project Alpha",
    "key": "PROJECTALP",
    "status": "Active"
  },
  "summary": {
    "totalTickets": 45,
    "openTickets": 15,
    "closedTickets": 30,
    "overdueTickets": 3,
    "avgResolutionTimeHours": 48,
    "completionRate": 67
  },
  "breakdown": {
    "byStatus": { "Backlog": 5, "In Progress": 10, "Done": 30 },
    "byPriority": { "Low": 10, "Medium": 20, "High": 15 },
    "byType": { "Bug": 12, "Task": 20, "Story": 13 }
  },
  "teams": {
    "total": 3,
    "active": 3,
    "totalMembers": 12
  },
  "sprints": {
    "total": 5,
    "active": 1,
    "completed": 4
  },
  "storyPoints": {
    "total": 120,
    "completed": 85,
    "remaining": 35,
    "completionRate": 71
  },
  "timeTracking": {
    "estimatedHours": 480,
    "spentHours": 420,
    "remainingHours": 60,
    "variance": -60
  },
  "recentActivity": {
    "ticketsCreated30Days": 8,
    "ticketsClosed30Days": 12,
    "velocity": [
      { "week": "Week -3", "closed": 2 },
      { "week": "Week -2", "closed": 4 },
      { "week": "Week -1", "closed": 3 },
      { "week": "Week 0", "closed": 5 }
    ]
  }
}
```

### 3. Team Analytics
**GET** `/api/analytics/teams/:id`

**Access**: Manager, Admin, Super Admin, Agent

**Response**:
```json
{
  "team": {
    "id": 1,
    "name": "Development Team A",
    "status": "Active",
    "project": { "id": 1, "name": "Project Alpha", "key": "PROJECTALP" },
    "leader": { "id": 5, "email": "lead@example.com", "fullName": "John Leader" }
  },
  "summary": {
    "totalMembers": 5,
    "totalTickets": 25,
    "openTickets": 8,
    "closedTickets": 17,
    "avgHandlingTimeHours": 36,
    "completionRate": 68
  },
  "memberPerformance": [
    {
      "user": { "id": 10, "email": "dev1@example.com", "fullName": "Alice Dev" },
      "role": "Senior Developer",
      "joinedAt": "2024-01-15T00:00:00.000Z",
      "stats": {
        "assignedTickets": 8,
        "completedTickets": 6,
        "inProgress": 2,
        "timeSpent": 48,
        "storyPointsCompleted": 21,
        "completionRate": 75
      }
    }
  ],
  "workloadDistribution": [
    { "userId": 10, "userName": "Alice Dev", "openTickets": 2, "inProgress": 2 }
  ],
  "velocity": {
    "average": 18,
    "sprints": [
      {
        "sprintId": 5,
        "sprintName": "Sprint 5",
        "status": "Active",
        "pointsCommitted": 20,
        "pointsCompleted": 18,
        "ticketsCompleted": 8,
        "totalTickets": 10
      }
    ]
  }
}
```

### 4. Sprint Analytics
**GET** `/api/analytics/sprints/:id`

**Access**: Manager, Admin, Super Admin, Agent

**Response**:
```json
{
  "sprint": {
    "id": 5,
    "name": "Sprint 5",
    "goal": "Complete user authentication features",
    "status": "Active",
    "startDate": "2025-01-20",
    "endDate": "2025-02-03",
    "project": { "id": 1, "name": "Project Alpha", "key": "PROJECTALP" },
    "team": { "id": 1, "name": "Development Team A" }
  },
  "summary": {
    "totalTickets": 10,
    "completedTickets": 6,
    "inProgressTickets": 3,
    "todoTickets": 1,
    "completionRate": 60
  },
  "storyPoints": {
    "committed": 20,
    "completed": 12,
    "remaining": 8,
    "completionRate": 60
  },
  "scope": {
    "initialTickets": 9,
    "addedTickets": 1,
    "scopeChangePercent": 10
  },
  "breakdown": {
    "byType": { "Bug": 2, "Task": 5, "Story": 3 },
    "byStatus": { "Done": 6, "In Progress": 3, "To Do": 1 }
  },
  "timeTracking": {
    "estimatedHours": 160,
    "spentHours": 120,
    "remainingHours": 40,
    "variance": -40
  },
  "burndown": [
    { "day": 0, "date": "2025-01-20", "ideal": 20, "actual": 20 },
    { "day": 1, "date": "2025-01-21", "ideal": 18, "actual": 19 },
    { "day": 2, "date": "2025-01-22", "ideal": 17, "actual": 17 },
    { "day": 3, "date": "2025-01-23", "ideal": 15, "actual": 14 }
  ]
}
```

### 5. User Analytics
**GET** `/api/analytics/users/:id`

**Access**: Authenticated users

**Response**:
```json
{
  "user": {
    "id": 10,
    "email": "dev1@example.com",
    "fullName": "Alice Dev",
    "role": "Agent"
  },
  "summary": {
    "totalAssigned": 15,
    "completed": 11,
    "active": 4,
    "completionRate": 73,
    "storyPointsCompleted": 42,
    "totalTimeSpent": 88
  },
  "teams": [
    {
      "team": {
        "id": 1,
        "name": "Development Team A",
        "project": { "id": 1, "name": "Project Alpha" }
      },
      "role": "Senior Developer",
      "joinedAt": "2024-01-15"
    }
  ],
  "breakdown": {
    "byStatus": { "Done": 11, "In Progress": 3, "To Do": 1 }
  },
  "recentActivity": {
    "completionsLast30Days": 6
  }
}
```

---

## API Usage Examples

### Creating a Project with Team

```javascript
// 1. Create Project
const projectResponse = await fetch('http://localhost:3000/api/projects', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'E-Commerce Platform',
    description: 'Customer-facing shopping platform',
    status: 'Active',
    startDate: '2025-01-01',
    endDate: '2025-12-31'
  })
});
const project = await projectResponse.json();

// 2. Create Team
const teamResponse = await fetch('http://localhost:3000/api/teams', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    name: 'Frontend Team',
    description: 'Handles all UI/UX development',
    projectId: project.project.id,
    leaderId: 5,
    status: 'Active'
  })
});
const team = await teamResponse.json();

// 3. Add Team Members
await fetch(`http://localhost:3000/api/teams/${team.team.id}/members`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    userId: 10,
    role: 'Senior Developer'
  })
});
```

### Creating a Validated Ticket

```javascript
// Create ticket with full validation
const ticketResponse = await fetch('http://localhost:3000/api/tickets', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    title: 'Implement user authentication',
    description: 'Add JWT-based authentication system',
    projectId: 1,        // Must exist
    teamId: 1,           // Must exist and belong to project
    assigneeId: 10,      // Must be a member of team 1
    sprintId: 5,         // Must exist and belong to project
    type: 'Story',
    priority: 'High',
    storyPoints: 8,
    originalEstimate: 16
  })
});

// If validation fails, you'll get detailed error:
// { "message": "Assignee is not a member of the specified team." }
```

### Fetching Analytics

```javascript
// Get project analytics
const analytics = await fetch('http://localhost:3000/api/analytics/projects/1', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const projectData = await analytics.json();

console.log('Project Completion Rate:', projectData.summary.completionRate + '%');
console.log('Story Points Completed:', projectData.storyPoints.completed);
console.log('Team Velocity:', projectData.recentActivity.velocity);

// Get sprint burndown for chart
const sprintAnalytics = await fetch('http://localhost:3000/api/analytics/sprints/5', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const sprintData = await sprintAnalytics.json();

// Use burndown data for chart
const chartData = sprintData.burndown.map(point => ({
  day: point.date,
  ideal: point.ideal,
  actual: point.actual
}));
```

---

## Frontend Integration

### Dashboard Components Needed

1. **Organization Dashboard**
   - Overview cards (total projects, teams, tickets)
   - Priority breakdown pie chart
   - Status breakdown bar chart
   - Recent activity timeline
   - Top projects list

2. **Project Dashboard**
   - Project header with status
   - Ticket summary cards
   - Story points progress bar
   - Time tracking gauge
   - Velocity line chart (4 weeks)
   - Team list with member counts

3. **Team Dashboard**
   - Team header with leader info
   - Member performance table
   - Workload distribution bar chart
   - Sprint velocity trend
   - Average handling time metric

4. **Sprint Dashboard**
   - Sprint header with dates and goal
   - Progress cards (tickets, story points)
   - Burndown chart (ideal vs actual)
   - Scope change indicator
   - Ticket breakdown by type/status
   - Time variance metric

### Example Vue Component (Dashboard)

```vue
<template>
  <div class="analytics-dashboard">
    <h1>Analytics Dashboard</h1>

    <!-- Overview Cards -->
    <div class="overview-cards">
      <div class="card">
        <h3>Projects</h3>
        <p class="stat">{{ analytics.overview?.projects.active }} / {{ analytics.overview?.projects.total }}</p>
        <small>Active Projects</small>
      </div>
      <div class="card">
        <h3>Tickets</h3>
        <p class="stat">{{ analytics.overview?.tickets.open }}</p>
        <small>Open Tickets</small>
      </div>
      <div class="card warning">
        <h3>Overdue</h3>
        <p class="stat">{{ analytics.overview?.tickets.overdue }}</p>
        <small>Tickets Overdue</small>
      </div>
    </div>

    <!-- Charts -->
    <div class="charts-grid">
      <div class="chart-container">
        <h3>Tickets by Priority</h3>
        <PieChart :data="priorityChartData" />
      </div>
      <div class="chart-container">
        <h3>Tickets by Status</h3>
        <BarChart :data="statusChartData" />
      </div>
    </div>

    <!-- Top Projects -->
    <div class="top-projects">
      <h3>Top Projects by Ticket Count</h3>
      <table>
        <thead>
          <tr>
            <th>Project</th>
            <th>Key</th>
            <th>Tickets</th>
            <th>Status</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in analytics.topProjects" :key="item.project.id">
            <td>{{ item.project.name }}</td>
            <td>{{ item.project.key }}</td>
            <td>{{ item.ticketCount }}</td>
            <td><span :class="'badge ' + item.project.status.toLowerCase()">{{ item.project.status }}</span></td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

export default {
  name: 'AnalyticsDashboard',
  setup() {
    const analytics = ref({});

    const fetchDashboard = async () => {
      try {
        const response = await axios.get('/api/analytics/dashboard');
        analytics.value = response.data;
      } catch (error) {
        console.error('Error fetching dashboard:', error);
      }
    };

    const priorityChartData = computed(() => {
      if (!analytics.value.breakdown?.byPriority) return [];
      return Object.entries(analytics.value.breakdown.byPriority).map(([key, value]) => ({
        label: key,
        value
      }));
    });

    const statusChartData = computed(() => {
      if (!analytics.value.breakdown?.byStatus) return [];
      return Object.entries(analytics.value.breakdown.byStatus).map(([key, value]) => ({
        label: key,
        value
      }));
    });

    onMounted(fetchDashboard);

    return {
      analytics,
      priorityChartData,
      statusChartData
    };
  }
};
</script>

<style scoped>
.overview-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.card {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.card.warning {
  border-left: 4px solid #f44336;
}

.stat {
  font-size: 2rem;
  font-weight: bold;
  margin: 0.5rem 0;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
}

.chart-container {
  background: #fff;
  padding: 1.5rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

table {
  width: 100%;
  border-collapse: collapse;
}

th, td {
  padding: 0.75rem;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.badge {
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
}

.badge.active {
  background: #4caf50;
  color: white;
}
</style>
```

---

## Next Steps

1. **Frontend Development**:
   - Create dashboard views for organization, project, team, and sprint analytics
   - Implement charts using a library like Chart.js or ApexCharts
   - Add filters and date range selectors

2. **Enhanced Features**:
   - Export analytics to PDF/CSV
   - Custom report builder
   - Email scheduled reports
   - Real-time analytics updates via WebSocket

3. **Permissions**:
   - Add team-based access control (only team members see team tickets)
   - Project visibility settings (public/private)
   - Custom roles with granular permissions

4. **Additional Analytics**:
   - Cycle time analysis
   - Lead time tracking
   - Cumulative flow diagrams
   - Predictive analytics (forecasting)

---

## Troubleshooting

### Validation Errors

**Error**: "Team does not belong to the specified project"
- **Solution**: Ensure the teamId you're using belongs to the projectId you specified

**Error**: "Assignee is not a member of the specified team"
- **Solution**: Add the user to the team first using `/api/teams/:id/members`

### Analytics Not Showing Data

- Verify tickets have projectId/teamId set
- Check that sprints have startDate and endDate for burndown charts
- Ensure story points are set on tickets for velocity tracking

---

## Support

For issues or questions:
1. Check this documentation
2. Review API endpoint responses for detailed error messages
3. Check server logs for detailed error information
4. Contact the development team

---

**Last Updated**: January 2025
**Version**: 3.0
