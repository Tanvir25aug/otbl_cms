const PDFDocument = require('pdfkit');
const analyticsController = require('./analyticsController');
const { Ticket, User, Project, Team, Sprint, TicketHistory, TimeLog, Comment } = require('../models');

/**
 * Export project analytics to PDF
 * GET /api/export/project/:id/pdf
 */
exports.exportProjectPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Create a new PDF document
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=project-${id}-analytics.pdf`);

    // Pipe the PDF to the response
    doc.pipe(res);

    // Fetch analytics data (reuse existing controller logic)
    const mockRes = {
      status: () => ({ json: (data) => data }),
      json: (data) => data
    };

    // Get data by calling the analytics function
    const analyticsData = await new Promise((resolve) => {
      const originalRes = {
        status: (code) => ({
          json: (data) => {
            if (code === 200) resolve(data);
            else resolve(null);
          }
        }),
        json: (data) => resolve(data)
      };
      analyticsController.getProjectAnalytics({ params: { id }, query: req.query, user: req.user }, originalRes);
    });

    if (!analyticsData) {
      doc.fontSize(16).text('Project not found', 100, 100);
      doc.end();
      return;
    }

    // Add content to PDF
    const project = analyticsData.project;
    const summary = analyticsData.summary;

    // Header
    doc.fontSize(24).text('Project Analytics Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Project Info
    doc.fontSize(18).text(`Project: ${project.name} (${project.key})`);
    doc.fontSize(12).text(`Status: ${project.status}`);
    doc.moveDown();

    // Summary Section
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Tickets: ${summary.totalTickets}`);
    doc.text(`Open Tickets: ${summary.openTickets}`);
    doc.text(`Closed Tickets: ${summary.closedTickets}`);
    doc.text(`Overdue Tickets: ${summary.overdueTickets}`);
    doc.text(`Completion Rate: ${summary.completionRate}%`);
    doc.text(`Average Resolution Time: ${summary.avgResolutionTimeHours} hours`);
    doc.moveDown();

    // Story Points
    if (analyticsData.storyPoints) {
      doc.fontSize(16).text('Story Points', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Total: ${analyticsData.storyPoints.total}`);
      doc.text(`Completed: ${analyticsData.storyPoints.completed}`);
      doc.text(`Remaining: ${analyticsData.storyPoints.remaining}`);
      doc.text(`Completion Rate: ${analyticsData.storyPoints.completionRate}%`);
      doc.moveDown();
    }

    // Time Tracking
    if (analyticsData.timeTracking) {
      doc.fontSize(16).text('Time Tracking', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Estimated Hours: ${analyticsData.timeTracking.estimatedHours}`);
      doc.text(`Spent Hours: ${analyticsData.timeTracking.spentHours}`);
      doc.text(`Remaining Hours: ${analyticsData.timeTracking.remainingHours}`);
      doc.text(`Variance: ${analyticsData.timeTracking.variance} hours`);
      doc.moveDown();
    }

    // Breakdown by Status
    doc.fontSize(16).text('Tickets by Status', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    Object.entries(analyticsData.breakdown.byStatus).forEach(([status, count]) => {
      doc.text(`${status}: ${count}`);
    });
    doc.moveDown();

    // Breakdown by Priority
    doc.fontSize(16).text('Tickets by Priority', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    Object.entries(analyticsData.breakdown.byPriority).forEach(([priority, count]) => {
      doc.text(`${priority}: ${count}`);
    });
    doc.moveDown();

    // Teams
    if (analyticsData.teams) {
      doc.fontSize(16).text('Teams', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Total Teams: ${analyticsData.teams.total}`);
      doc.text(`Active Teams: ${analyticsData.teams.active}`);
      doc.text(`Total Members: ${analyticsData.teams.totalMembers}`);
      doc.moveDown();
    }

    // Sprints
    if (analyticsData.sprints) {
      doc.fontSize(16).text('Sprints', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Total Sprints: ${analyticsData.sprints.total}`);
      doc.text(`Active Sprints: ${analyticsData.sprints.active}`);
      doc.text(`Completed Sprints: ${analyticsData.sprints.completed}`);
      doc.moveDown();
    }

    // Recent Activity
    if (analyticsData.recentActivity) {
      doc.fontSize(16).text('Recent Activity (30 Days)', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Tickets Created: ${analyticsData.recentActivity.ticketsCreated30Days}`);
      doc.text(`Tickets Closed: ${analyticsData.recentActivity.ticketsClosed30Days}`);
      doc.moveDown();

      if (analyticsData.recentActivity.velocity && analyticsData.recentActivity.velocity.length > 0) {
        doc.fontSize(14).text('Weekly Velocity', { underline: true });
        doc.moveDown(0.5);
        doc.fontSize(11);
        analyticsData.recentActivity.velocity.forEach(v => {
          doc.text(`${v.week}: ${v.closed} tickets closed`);
        });
      }
    }

    // Footer
    doc.fontSize(8).text(
      'Generated by CMS Analytics System',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error exporting project PDF:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};

/**
 * Export team analytics to PDF
 * GET /api/export/team/:id/pdf
 */
exports.exportTeamPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=team-${id}-analytics.pdf`);
    doc.pipe(res);

    // Fetch team analytics data
    const analyticsData = await new Promise((resolve) => {
      const originalRes = {
        status: (code) => ({
          json: (data) => {
            if (code === 200) resolve(data);
            else resolve(null);
          }
        }),
        json: (data) => resolve(data)
      };
      analyticsController.getTeamAnalytics({ params: { id }, query: req.query, user: req.user }, originalRes);
    });

    if (!analyticsData) {
      doc.fontSize(16).text('Team not found', 100, 100);
      doc.end();
      return;
    }

    const team = analyticsData.team;
    const summary = analyticsData.summary;

    // Header
    doc.fontSize(24).text('Team Analytics Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Team Info
    doc.fontSize(18).text(`Team: ${team.name}`);
    doc.fontSize(12);
    doc.text(`Project: ${team.project.name} (${team.project.key})`);
    doc.text(`Status: ${team.status}`);
    if (team.leader) {
      doc.text(`Leader: ${team.leader.fullName} (${team.leader.email})`);
    }
    doc.moveDown();

    // Summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Members: ${summary.totalMembers}`);
    doc.text(`Total Tickets: ${summary.totalTickets}`);
    doc.text(`Open Tickets: ${summary.openTickets}`);
    doc.text(`Closed Tickets: ${summary.closedTickets}`);
    doc.text(`Completion Rate: ${summary.completionRate}%`);
    doc.text(`Average Handling Time: ${summary.avgHandlingTimeHours} hours`);
    doc.moveDown();

    // Velocity
    if (analyticsData.velocity && analyticsData.velocity.average) {
      doc.fontSize(16).text('Velocity', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Average Velocity: ${analyticsData.velocity.average} story points per sprint`);
      doc.moveDown();
    }

    // Member Performance
    if (analyticsData.memberPerformance && analyticsData.memberPerformance.length > 0) {
      doc.addPage();
      doc.fontSize(16).text('Member Performance', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(10);

      analyticsData.memberPerformance.forEach((member, index) => {
        if (index > 0 && index % 5 === 0) {
          doc.addPage();
        }
        doc.fontSize(12).text(`${member.user.fullName}`, { bold: true });
        doc.fontSize(10);
        doc.text(`Role: ${member.role || 'N/A'}`);
        doc.text(`Assigned Tickets: ${member.stats.assignedTickets}`);
        doc.text(`Completed Tickets: ${member.stats.completedTickets}`);
        doc.text(`In Progress: ${member.stats.inProgress}`);
        doc.text(`Time Spent: ${member.stats.timeSpent} hours`);
        doc.text(`Story Points: ${member.stats.storyPointsCompleted}`);
        doc.text(`Completion Rate: ${member.stats.completionRate}%`);
        doc.moveDown();
      });
    }

    // Footer
    doc.fontSize(8).text(
      'Generated by CMS Analytics System',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Error exporting team PDF:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};

/**
 * Export sprint analytics to PDF
 * GET /api/export/sprint/:id/pdf
 */
exports.exportSprintPDF = async (req, res) => {
  try {
    const { id } = req.params;

    const doc = new PDFDocument({ margin: 50 });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=sprint-${id}-analytics.pdf`);
    doc.pipe(res);

    // Fetch sprint analytics data
    const analyticsData = await new Promise((resolve) => {
      const originalRes = {
        status: (code) => ({
          json: (data) => {
            if (code === 200) resolve(data);
            else resolve(null);
          }
        }),
        json: (data) => resolve(data)
      };
      analyticsController.getSprintAnalytics({ params: { id }, query: req.query, user: req.user }, originalRes);
    });

    if (!analyticsData) {
      doc.fontSize(16).text('Sprint not found', 100, 100);
      doc.end();
      return;
    }

    const sprint = analyticsData.sprint;
    const summary = analyticsData.summary;

    // Header
    doc.fontSize(24).text('Sprint Analytics Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Generated: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(2);

    // Sprint Info
    doc.fontSize(18).text(`Sprint: ${sprint.name}`);
    doc.fontSize(12);
    doc.text(`Project: ${sprint.project.name} (${sprint.project.key})`);
    doc.text(`Team: ${sprint.team.name}`);
    doc.text(`Status: ${sprint.status}`);
    doc.text(`Start Date: ${sprint.startDate || 'N/A'}`);
    doc.text(`End Date: ${sprint.endDate || 'N/A'}`);
    if (sprint.goal) {
      doc.text(`Goal: ${sprint.goal}`);
    }
    doc.moveDown();

    // Summary
    doc.fontSize(16).text('Summary', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text(`Total Tickets: ${summary.totalTickets}`);
    doc.text(`Completed: ${summary.completedTickets}`);
    doc.text(`In Progress: ${summary.inProgressTickets}`);
    doc.text(`To Do: ${summary.todoTickets}`);
    doc.text(`Completion Rate: ${summary.completionRate}%`);
    doc.moveDown();

    // Story Points
    if (analyticsData.storyPoints) {
      doc.fontSize(16).text('Story Points', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Committed: ${analyticsData.storyPoints.committed}`);
      doc.text(`Completed: ${analyticsData.storyPoints.completed}`);
      doc.text(`Remaining: ${analyticsData.storyPoints.remaining}`);
      doc.text(`Completion Rate: ${analyticsData.storyPoints.completionRate}%`);
      doc.moveDown();
    }

    // Scope
    if (analyticsData.scope) {
      doc.fontSize(16).text('Scope Management', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Initial Tickets: ${analyticsData.scope.initialTickets}`);
      doc.text(`Added Tickets: ${analyticsData.scope.addedTickets}`);
      doc.text(`Scope Change: ${analyticsData.scope.scopeChangePercent}%`);
      doc.moveDown();
    }

    // Time Tracking
    if (analyticsData.timeTracking) {
      doc.fontSize(16).text('Time Tracking', { underline: true });
      doc.moveDown(0.5);
      doc.fontSize(11);
      doc.text(`Estimated Hours: ${analyticsData.timeTracking.estimatedHours}`);
      doc.text(`Spent Hours: ${analyticsData.timeTracking.spentHours}`);
      doc.text(`Remaining Hours: ${analyticsData.timeTracking.remainingHours}`);
      doc.text(`Variance: ${analyticsData.timeTracking.variance} hours`);
      doc.moveDown();
    }

    // Breakdown
    doc.fontSize(16).text('Ticket Breakdown', { underline: true });
    doc.moveDown(0.5);
    doc.fontSize(11);
    doc.text('By Type:');
    Object.entries(analyticsData.breakdown.byType).forEach(([type, count]) => {
      doc.text(`  ${type}: ${count}`);
    });
    doc.moveDown(0.5);
    doc.text('By Status:');
    Object.entries(analyticsData.breakdown.byStatus).forEach(([status, count]) => {
      doc.text(`  ${status}: ${count}`);
    });

    // Footer
    doc.fontSize(8).text(
      'Generated by CMS Analytics System',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    doc.end();
  } catch (error) {
    console.error('Error exporting sprint PDF:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};

/**
 * Export analytics to CSV
 * GET /api/export/project/:id/csv
 */
exports.exportProjectCSV = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch analytics data
    const analyticsData = await new Promise((resolve) => {
      const originalRes = {
        status: (code) => ({
          json: (data) => {
            if (code === 200) resolve(data);
            else resolve(null);
          }
        }),
        json: (data) => resolve(data)
      };
      analyticsController.getProjectAnalytics({ params: { id }, query: req.query, user: req.user }, originalRes);
    });

    if (!analyticsData) {
      return res.status(404).json({ message: 'Project not found' });
    }

    // Set CSV headers
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=project-${id}-analytics.csv`);

    // Build CSV content
    let csv = 'Project Analytics Report\n\n';
    csv += `Project,${analyticsData.project.name}\n`;
    csv += `Key,${analyticsData.project.key}\n`;
    csv += `Status,${analyticsData.project.status}\n\n`;

    csv += 'Summary\n';
    csv += 'Metric,Value\n';
    csv += `Total Tickets,${analyticsData.summary.totalTickets}\n`;
    csv += `Open Tickets,${analyticsData.summary.openTickets}\n`;
    csv += `Closed Tickets,${analyticsData.summary.closedTickets}\n`;
    csv += `Overdue Tickets,${analyticsData.summary.overdueTickets}\n`;
    csv += `Completion Rate,${analyticsData.summary.completionRate}%\n`;
    csv += `Avg Resolution Time,${analyticsData.summary.avgResolutionTimeHours} hours\n\n`;

    csv += 'Tickets by Status\n';
    csv += 'Status,Count\n';
    Object.entries(analyticsData.breakdown.byStatus).forEach(([status, count]) => {
      csv += `${status},${count}\n`;
    });
    csv += '\n';

    csv += 'Tickets by Priority\n';
    csv += 'Priority,Count\n';
    Object.entries(analyticsData.breakdown.byPriority).forEach(([priority, count]) => {
      csv += `${priority},${count}\n`;
    });

    res.send(csv);
  } catch (error) {
    console.error('Error exporting CSV:', error);
    res.status(500).json({ message: 'Error generating CSV', error: error.message });
  }
};

/**
 * Export ticket details to PDF
 * GET /api/export/ticket/:id/pdf
 */
exports.exportTicketPDF = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch ticket with all related data
    const ticket = await Ticket.findByPk(id, {
      include: [
        { model: User, as: 'assignee', attributes: ['id', 'email', 'fullName'] },
        { model: User, as: 'reporter', attributes: ['id', 'email', 'fullName'] },
        { model: Project, as: 'project', attributes: ['id', 'name', 'key'] },
        { model: Team, as: 'team', attributes: ['id', 'name'] },
        { model: Sprint, as: 'sprint', attributes: ['id', 'name', 'status'] },
      ],
    });

    if (!ticket) {
      return res.status(404).json({ message: 'Ticket not found' });
    }

    // Fetch history
    const history = await TicketHistory.findAll({
      where: { ticketId: id },
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'fullName'] }],
      order: [['createdAt', 'DESC']],
      limit: 20,
    });

    // Fetch time logs
    const timeLogs = await TimeLog.findAll({
      where: { ticketId: id },
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'fullName'] }],
      order: [['loggedAt', 'DESC']],
    });

    const totalTime = timeLogs.reduce((sum, log) => sum + parseFloat(log.timeSpent), 0);

    // Fetch comments
    const comments = await Comment.findAll({
      where: { ticket_id: id },
      include: [{ model: User, as: 'user', attributes: ['id', 'email', 'fullName'] }],
      order: [['createdAt', 'DESC']],
      limit: 10,
    });

    // Create PDF
    const doc = new PDFDocument({ margin: 50 });

    // Set response headers
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=ticket-${id}-${Date.now()}.pdf`);

    // Pipe PDF to response
    doc.pipe(res);

    // Header
    doc.fontSize(24).fillColor('#2563eb').text('Ticket Details', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('#666').text(`Generated on ${new Date().toLocaleString()}`, { align: 'center' });
    doc.moveDown(2);

    // Ticket Info Section
    doc.fontSize(16).fillColor('#000').text(`Ticket #${ticket.id}: ${ticket.title}`);
    doc.moveDown();

    // Basic Info Table
    const leftColumn = 70;
    const rightColumn = 300;
    let yPos = doc.y;

    doc.fontSize(10).fillColor('#444');
    doc.text('Status:', leftColumn, yPos, { width: 200, continued: false });
    doc.fillColor('#000').text(ticket.status, rightColumn, yPos);
    yPos += 20;

    doc.fillColor('#444').text('Priority:', leftColumn, yPos);
    doc.fillColor('#000').text(ticket.priority, rightColumn, yPos);
    yPos += 20;

    doc.fillColor('#444').text('Type:', leftColumn, yPos);
    doc.fillColor('#000').text(ticket.type, rightColumn, yPos);
    yPos += 20;

    if (ticket.severity) {
      doc.fillColor('#444').text('Severity:', leftColumn, yPos);
      doc.fillColor('#000').text(ticket.severity, rightColumn, yPos);
      yPos += 20;
    }

    if (ticket.assignee) {
      doc.fillColor('#444').text('Assignee:', leftColumn, yPos);
      doc.fillColor('#000').text(ticket.assignee.fullName || ticket.assignee.email, rightColumn, yPos);
      yPos += 20;
    }

    if (ticket.reporter) {
      doc.fillColor('#444').text('Reporter:', leftColumn, yPos);
      doc.fillColor('#000').text(ticket.reporter.fullName || ticket.reporter.email, rightColumn, yPos);
      yPos += 20;
    }

    if (ticket.project) {
      doc.fillColor('#444').text('Project:', leftColumn, yPos);
      doc.fillColor('#000').text(`${ticket.project.name} (${ticket.project.key})`, rightColumn, yPos);
      yPos += 20;
    }

    if (ticket.team) {
      doc.fillColor('#444').text('Team:', leftColumn, yPos);
      doc.fillColor('#000').text(ticket.team.name, rightColumn, yPos);
      yPos += 20;
    }

    if (ticket.sprint) {
      doc.fillColor('#444').text('Sprint:', leftColumn, yPos);
      doc.fillColor('#000').text(`${ticket.sprint.name} (${ticket.sprint.status})`, rightColumn, yPos);
      yPos += 20;
    }

    doc.fillColor('#444').text('Created:', leftColumn, yPos);
    doc.fillColor('#000').text(new Date(ticket.createdAt).toLocaleString(), rightColumn, yPos);
    yPos += 20;

    if (ticket.dueDate) {
      doc.fillColor('#444').text('Due Date:', leftColumn, yPos);
      doc.fillColor('#000').text(new Date(ticket.dueDate).toLocaleString(), rightColumn, yPos);
      yPos += 20;
    }

    doc.moveDown(2);

    // Description
    doc.fontSize(14).fillColor('#000').text('Description');
    doc.moveDown(0.5);
    doc.fontSize(10).fillColor('#333').text(ticket.description.replace(/<[^>]*>/g, '').substring(0, 500), {
      align: 'left',
      width: 500,
    });
    doc.moveDown(2);

    // Time Tracking Section
    if (timeLogs.length > 0) {
      doc.fontSize(14).fillColor('#000').text('Time Tracking');
      doc.moveDown(0.5);
      doc.fontSize(10).fillColor('#444').text(`Total Time Logged: ${totalTime.toFixed(2)} hours`);
      doc.moveDown(0.5);

      timeLogs.slice(0, 5).forEach((log) => {
        doc.fontSize(9).fillColor('#666').text(
          `• ${log.user?.fullName || log.user?.email || 'Unknown'} - ${log.timeSpent}h - ${new Date(log.loggedAt).toLocaleDateString()}`,
          { indent: 20 }
        );
        if (log.description) {
          doc.fontSize(8).fillColor('#888').text(`  ${log.description}`, { indent: 30 });
        }
        doc.moveDown(0.3);
      });

      doc.moveDown();
    }

    // Activity History Section
    if (history.length > 0) {
      doc.fontSize(14).fillColor('#000').text('Recent Activity');
      doc.moveDown(0.5);

      history.slice(0, 10).forEach((entry) => {
        doc.fontSize(9).fillColor('#666').text(
          `• ${entry.user?.fullName || entry.user?.email || 'System'} - ${entry.action} - ${new Date(entry.createdAt).toLocaleDateString()}`,
          { indent: 20 }
        );
        if (entry.description) {
          doc.fontSize(8).fillColor('#888').text(`  ${entry.description}`, { indent: 30 });
        }
        doc.moveDown(0.3);
      });

      doc.moveDown();
    }

    // Comments Section
    if (comments.length > 0) {
      doc.addPage();
      doc.fontSize(14).fillColor('#000').text('Recent Comments');
      doc.moveDown(0.5);

      comments.forEach((comment) => {
        doc.fontSize(10).fillColor('#444').text(`${comment.user?.fullName || comment.user?.email || 'Unknown'}:`);
        doc.fontSize(9).fillColor('#666').text(comment.comment.substring(0, 200), { indent: 20 });
        doc.fontSize(8).fillColor('#888').text(`Posted: ${new Date(comment.createdAt).toLocaleDateString()}`, { indent: 20 });
        doc.moveDown(0.8);
      });
    }

    // Footer
    doc.fontSize(8).fillColor('#999').text(
      'This document was generated by OTBL CMS',
      50,
      doc.page.height - 50,
      { align: 'center' }
    );

    // Finalize PDF
    doc.end();
  } catch (error) {
    console.error('Error exporting ticket PDF:', error);
    res.status(500).json({ message: 'Error generating PDF', error: error.message });
  }
};
