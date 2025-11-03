# TicketDetailView Integration Guide

## ✅ Components Created

All 6 components have been successfully created:
1. ✅ `frontend/src/components/ticket/ActivityTimeline.vue`
2. ✅ `frontend/src/components/ticket/StatusWorkflow.vue`
3. ✅ `frontend/src/components/ticket/QuickActions.vue`
4. ✅ `frontend/src/components/ticket/TimeTracking.vue`
5. ✅ `frontend/src/components/ticket/TeamProjectPanel.vue`
6. ✅ `frontend/src/components/ticket/ExportOptions.vue`

## 📋 Integration Steps for TicketDetailView.vue

### Step 1: Add Component Imports

Add these imports at the top of the `<script setup>` section (around line 119-125):

```typescript
// Import new ticket components
import ActivityTimeline from '../components/ticket/ActivityTimeline.vue';
import StatusWorkflow from '../components/ticket/StatusWorkflow.vue';
import QuickActions from '../components/ticket/QuickActions.vue';
import TimeTracking from '../components/ticket/TimeTracking.vue';
import TeamProjectPanel from '../components/ticket/TeamProjectPanel.vue';
import ExportOptions from '../components/ticket/ExportOptions.vue';
```

### Step 2: Add Component Refs

Add these refs in the script section (after other refs):

```typescript
const activityTimelineRef = ref<InstanceType<typeof ActivityTimeline> | null>(null);
const canChangeStatus = computed(() => true); // Adjust based on user permissions
const canReassign = computed(() => true); // Adjust based on user permissions
```

### Step 3: Add Refresh Handlers

Add these methods to handle component updates:

```typescript
const handleStatusChange = (newStatus: string) => {
  // Refresh ticket data
  fetchTicketDetails();
  // Refresh activity timeline
  activityTimelineRef.value?.refresh();
};

const handleQuickAction = () => {
  // Refresh ticket data
  fetchTicketDetails();
  // Refresh activity timeline
  activityTimelineRef.value?.refresh();
};

const handleTimeLogged = () => {
  // Refresh activity timeline
  activityTimelineRef.value?.refresh();
};

const handleReassigned = (newAssigneeId: number | null) => {
  // Refresh ticket data
  fetchTicketDetails();
  // Refresh activity timeline
  activityTimelineRef.value?.refresh();
};
```

### Step 4: Update Template Layout

**Replace the current page header** (around lines 4-34) with:

```vue
<!-- Page Header with Export Options -->
<div class="page-header">
  <div class="page-header__content">
    <div class="ticket-header">
      <div class="ticket-id-badge">#{{ ticket.id }}</div>
      <h1 class="ticket-title">{{ ticket.title }}</h1>
    </div>
    <div class="ticket-meta">
      <div class="meta-item">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12 6 12 12 16 14"/>
        </svg>
        Created {{ formatDate(ticket.createdAt) }}
      </div>
      <div class="meta-item" v-if="ticket.assigneeId">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
          <circle cx="12" cy="7" r="4"/>
        </svg>
        Assigned to ID: {{ ticket.assigneeId }}
      </div>
    </div>
  </div>

  <!-- Export Options Component -->
  <div class="header-actions">
    <ExportOptions :ticketId="ticket.id" />
    <router-link to="/tickets" class="btn btn--outline-white">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M19 12H5M12 19l-7-7 7-7"/>
      </svg>
      Back to Tickets
    </router-link>
  </div>
</div>
```

**Add Status Workflow** (after page-header, before info-cards):

```vue
<!-- Status Workflow Component -->
<StatusWorkflow
  :ticket="ticket"
  :canChangeStatus="canChangeStatus"
  @statusChanged="handleStatusChange"
/>
```

**Add Quick Actions** (after info-cards, before description-card):

```vue
<!-- Quick Actions Component -->
<QuickActions
  :ticket="ticket"
  @actionComplete="handleQuickAction"
/>
```

**Add Two-Column Layout** (after description-card):

```vue
<!-- Two Column Layout: Main Content & Sidebar -->
<div class="ticket-content-grid">
  <!-- Left Column: Existing Content (Comments, etc.) -->
  <div class="ticket-main-content">
    <!-- Keep existing comments section here -->
    <!-- Keep existing attachments section here -->
  </div>

  <!-- Right Column: Sidebar with New Components -->
  <div class="ticket-sidebar">
    <!-- Team & Project Panel -->
    <TeamProjectPanel
      :ticket="ticket"
      :canReassign="canReassign"
      @reassigned="handleReassigned"
    />

    <!-- Time Tracking -->
    <TimeTracking
      :ticketId="ticket.id"
      @timeLogged="handleTimeLogged"
    />

    <!-- Activity Timeline -->
    <ActivityTimeline
      ref="activityTimelineRef"
      :ticketId="ticket.id"
    />
  </div>
</div>
```

### Step 5: Add CSS for Grid Layout

Add these styles at the end of the `<style scoped>` section:

```css
/* Two-column grid layout */
.ticket-content-grid {
  display: grid;
  grid-template-columns: 1fr 400px;
  gap: var(--spacing-xl);
  margin-top: var(--spacing-xl);
}

.ticket-main-content {
  min-width: 0; /* Prevents grid overflow */
}

.ticket-sidebar {
  position: sticky;
  top: var(--spacing-xl);
  align-self: start;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: var(--spacing-md);
  flex-wrap: wrap;
}

/* Responsive: Stack on mobile */
@media (max-width: 1024px) {
  .ticket-content-grid {
    grid-template-columns: 1fr;
  }

  .ticket-sidebar {
    position: static;
    max-height: none;
  }
}
```

## 🎨 Visual Structure

The updated ticket view will look like this:

```
┌────────────────────────────────────────────────────┐
│ Header: Title + Export/Print/Share Buttons         │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ Status Workflow: Visual progress bar                │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ Quick Actions: Assign | Urgent | Close | Clone     │
└────────────────────────────────────────────────────┘
┌────────────────────────────────────────────────────┐
│ Info Cards: Status | Priority | Category | Type    │
└────────────────────────────────────────────────────┘
┌──────────────────────────┬─────────────────────────┐
│ Main Content             │ Sidebar                  │
│ ├─ Description           │ ├─ Team & Project       │
│ ├─ Comments              │ ├─ Time Tracking        │
│ └─ Attachments           │ └─ Activity Timeline    │
└──────────────────────────┴─────────────────────────┘
```

## 🧪 Testing Checklist

After integration, test these features:

### Status Workflow
- [ ] Click on different status steps
- [ ] Confirm status change
- [ ] Verify status updates in ticket

### Quick Actions
- [ ] Assign to Me button
- [ ] Mark Urgent button
- [ ] Close/Reopen ticket
- [ ] Clone ticket (should redirect to new ticket)

### Time Tracking
- [ ] Log time with hours
- [ ] Log time with description
- [ ] View total time logged
- [ ] See recent time logs

### Team & Project Panel
- [ ] View project link (if assigned)
- [ ] View team members (if assigned)
- [ ] Reassign ticket to another user

### Activity Timeline
- [ ] View complete history
- [ ] See color-coded events
- [ ] See old → new value changes
- [ ] Timeline updates after actions

### Export Options
- [ ] Export to PDF (downloads file)
- [ ] Print ticket (opens print dialog)
- [ ] Share link (copies URL)

## 🔧 Troubleshooting

### Components not showing
- Ensure all imports are correct
- Check browser console for errors
- Verify API endpoints are accessible

### Timeline not updating
- Check `activityTimelineRef` is assigned
- Ensure `refresh()` is called after actions
- Check API returns history data

### PDF export not working
- Verify backend API is running
- Check `/api/export/ticket/:id/pdf` endpoint
- Ensure authentication token is valid

### Styles look wrong
- Clear browser cache
- Check CSS variables are defined
- Verify grid layout on different screen sizes

## 🎯 Next Steps

1. **Test all features** with real ticket data
2. **Adjust permissions** for canChangeStatus and canReassign
3. **Customize colors** to match your brand
4. **Add loading states** if needed
5. **Add error handling** for better UX

## 📝 Summary

You now have a fully-featured ticket detail page with:
- ✅ Activity Timeline with color-coded history
- ✅ Status Workflow visual progress bar
- ✅ Quick Action buttons for common tasks
- ✅ Time Tracking interface
- ✅ Team & Project context panel
- ✅ Export/Print/Share options

All backend endpoints are ready and functional!
