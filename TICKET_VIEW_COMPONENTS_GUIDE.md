# Ticket View Enhancement - Frontend Components Guide

## Overview
This guide shows all the frontend components needed for the enhanced ticket view page.

## Components to Create

### 1. Activity Timeline Component
**File**: `frontend/src/components/ticket/ActivityTimeline.vue`
- Shows complete history with color-coded events
- Displays: user, action, timestamp, changes (old → new values)
- Color scheme:
  - Blue: created
  - Purple: status_changed
  - Green: assigned/reassigned
  - Orange: priority_changed
  - Red: closed
  - Yellow: reopened
  - Cyan: cloned
  - Teal: time_logged

### 2. Status Workflow Component
**File**: `frontend/src/components/ticket/StatusWorkflow.vue`
- Visual progress bar: Backlog → To Do → In Progress → In Review → Testing → Done → Closed
- Click on status to change it quickly
- Shows current status highlighted
- Each status clickable

### 3. Quick Actions Component
**File**: `frontend/src/components/ticket/QuickActions.vue`
- Button: "Assign to Me" (POST /tickets/:id/assign-to-me)
- Button: "Mark Urgent" (POST /tickets/:id/mark-urgent)
- Button: "Close Ticket" (POST /tickets/:id/close)
- Button: "Reopen Ticket" (POST /tickets/:id/reopen)
- Button: "Clone Ticket" (POST /tickets/:id/clone)

### 4. Time Tracking Component
**File**: `frontend/src/components/ticket/TimeTracking.vue`
- Input: Hours spent (number)
- Input: Description (text)
- Button: "Log Time"
- Display: Total time logged
- List: Recent time logs with user names

### 5. Team & Project Panel
**File**: `frontend/src/components/ticket/TeamProjectPanel.vue`
- Shows: Project name with link to analytics
- Shows: Team name with members list
- Button: "Reassign" (change assignee dropdown)
- Link to project dashboard

### 6. Export/Print Options
**File**: `frontend/src/components/ticket/ExportOptions.vue`
- Button: "Export PDF" (GET /export/ticket/:id/pdf)
- Button: "Print" (window.print())
- Button: "Share Link" (copy URL to clipboard)

## Integration into TicketDetailView.vue

Add imports at top:
```typescript
import ActivityTimeline from '../components/ticket/ActivityTimeline.vue';
import StatusWorkflow from '../components/ticket/StatusWorkflow.vue';
import QuickActions from '../components/ticket/QuickActions.vue';
import TimeTracking from '../components/ticket/TimeTracking.vue';
import TeamProjectPanel from '../components/ticket/TeamProjectPanel.vue';
import ExportOptions from '../components/ticket/ExportOptions.vue';
```

Update template structure:
```vue
<template>
  <div class="ticket-detail-view">
    <!-- Header with title and export options -->
    <div class="ticket-header">
      <h1>{{ ticket.title }}</h1>
      <ExportOptions :ticketId="ticketId" />
    </div>

    <!-- Status Workflow -->
    <StatusWorkflow :ticket="ticket" @statusChanged="handleStatusChange" />

    <!-- Quick Actions -->
    <QuickActions :ticketId="ticketId" @actionComplete="refreshTicket" />

    <!-- Main Content Grid -->
    <div class="ticket-content-grid">
      <!-- Left Column: Details -->
      <div class="ticket-details">
        <!-- Existing ticket details -->
      </div>

      <!-- Right Column: Sidebar -->
      <div class="ticket-sidebar">
        <TeamProjectPanel :ticket="ticket" />
        <TimeTracking :ticketId="ticketId" />
        <ActivityTimeline :ticketId="ticketId" />
      </div>
    </div>
  </div>
</template>
```

## Backend API Endpoints Available

All endpoints ready and working:

- `POST /api/tickets/:id/assign-to-me` - Assign to current user
- `POST /api/tickets/:id/mark-urgent` - Set priority to Highest
- `POST /api/tickets/:id/close` - Close ticket
- `POST /api/tickets/:id/reopen` - Reopen ticket
- `POST /api/tickets/:id/clone` - Clone ticket
- `PATCH /api/tickets/:id/status` - Change status
- `POST /api/tickets/:id/log-time` - Log time
- `GET /api/tickets/:id/time-logs` - Get time logs
- `GET /api/tickets/:id/history` - Get activity history
- `GET /api/export/ticket/:id/pdf` - Export PDF

## Next Steps

1. Create each component file
2. Update TicketDetailView.vue layout
3. Test all functionality
4. Style for responsiveness

