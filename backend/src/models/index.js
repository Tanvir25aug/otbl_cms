const sequelize = require('../config/database');
const User = require('./User');
const Ticket = require('./Ticket');
const Notification = require('./Notification');
const Content = require('./Content');
const Project = require('./Project');
const TicketLink = require('./TicketLink');
const Team = require('./Team');
const TeamMember = require('./TeamMember');
const UserTeam = require('./UserTeam');
const TeamProject = require('./TeamProject');
const MdmRead = require('./MdmRead');
const DailyBillingReport = require('./DailyBillingReport')(sequelize, require('sequelize').DataTypes);
const MeterReading = require('./MeterReading');
const Comment = require('./Comment');
const Customer = require('./Customer');
const LastBillDate = require('./LastBillDate');
const MeterReplacement = require('./MeterReplacement');
const BatchOperationalReport = require('./BatchOperationalReport')(sequelize, require('sequelize').DataTypes);
const Complaint = require('./Complaint');
const ComplaintCategory = require('./ComplaintCategory');
const TelegramNotificationSetting = require('./TelegramNotificationSetting');
const Sprint = require('./Sprint');
const TicketHistory = require('./TicketHistory');
const TicketAttachment = require('./TicketAttachment');
const CommentAttachment = require('./CommentAttachment');
const TimeLog = require('./TimeLog');
const ProjectMember = require('./ProjectMember');


const models = {
  User,
  Ticket,
  Content,
  MeterReading,
  Comment,
  Customer,
  LastBillDate,
  MeterReplacement,
  Notification,
  Project,
  TicketLink,
  Team,
  TeamMember,
  UserTeam,
  TeamProject,
  MdmRead,
  DailyBillingReport,
  BatchOperationalReport,
  Complaint,
  ComplaintCategory,
  TelegramNotificationSetting,
  Sprint,
  TicketHistory,
  TicketAttachment,
  CommentAttachment,
  TimeLog,
  ProjectMember
};

Comment.belongsTo(Ticket, { foreignKey: 'ticket_id', onDelete: 'CASCADE' });
Ticket.hasMany(Comment, { foreignKey: 'ticket_id' });

Comment.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Comment, { foreignKey: 'user_id' });

// Notification associations (optional)
Notification.belongsTo(User, { foreignKey: 'recipientUserId', as: 'recipientUser' });
Notification.belongsTo(User, { foreignKey: 'actorUserId', as: 'actor' });
Notification.belongsTo(Ticket, { foreignKey: 'ticketId', as: 'ticket' });

// Ticket associations
Ticket.belongsTo(User, { foreignKey: 'assigneeId', as: 'assignee' });
Ticket.belongsTo(User, { foreignKey: 'reporterId', as: 'reporter' });
Ticket.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Ticket.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Ticket.belongsTo(Sprint, { foreignKey: 'sprintId', as: 'sprint' });
Ticket.belongsTo(Ticket, { foreignKey: 'parentId', as: 'parent' });
Ticket.belongsTo(Ticket, { foreignKey: 'epicId', as: 'epic' });
Ticket.hasMany(Ticket, { foreignKey: 'parentId', as: 'subtasks' });
Ticket.hasMany(Ticket, { foreignKey: 'epicId', as: 'stories' });

// TicketLink associations
TicketLink.belongsTo(Ticket, { foreignKey: 'sourceTicketId', as: 'source' });
TicketLink.belongsTo(Ticket, { foreignKey: 'targetTicketId', as: 'target' });

// TicketHistory associations
TicketHistory.belongsTo(Ticket, { foreignKey: 'ticketId', onDelete: 'CASCADE' });
TicketHistory.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Ticket.hasMany(TicketHistory, { foreignKey: 'ticketId', as: 'history' });
User.hasMany(TicketHistory, { foreignKey: 'userId' });

// TimeLog associations
TimeLog.belongsTo(Ticket, { foreignKey: 'ticketId', onDelete: 'CASCADE' });
TimeLog.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Ticket.hasMany(TimeLog, { foreignKey: 'ticketId', as: 'timeLogs' });
User.hasMany(TimeLog, { foreignKey: 'userId' });

// TicketAttachment associations
TicketAttachment.belongsTo(Ticket, { foreignKey: 'ticketId', onDelete: 'CASCADE' });
TicketAttachment.belongsTo(User, { foreignKey: 'userId' });
Ticket.hasMany(TicketAttachment, { foreignKey: 'ticketId', as: 'attachments' });
User.hasMany(TicketAttachment, { foreignKey: 'userId' });

// CommentAttachment associations
CommentAttachment.belongsTo(Comment, { foreignKey: 'commentId', onDelete: 'CASCADE' });
CommentAttachment.belongsTo(User, { foreignKey: 'userId', as: 'uploader' });
Comment.hasMany(CommentAttachment, { foreignKey: 'commentId', as: 'attachments' });
User.hasMany(CommentAttachment, { foreignKey: 'userId', as: 'uploadedCommentAttachments' });

// Sprint associations
Sprint.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
Sprint.belongsTo(Team, { foreignKey: 'teamId', as: 'team' });
Sprint.hasMany(Ticket, { foreignKey: 'sprintId', as: 'tickets' });
Project.hasMany(Sprint, { foreignKey: 'projectId', as: 'sprints' });

// Team relations (legacy - keeping for backward compatibility)
Team.belongsToMany(User, { through: UserTeam, foreignKey: 'teamId', otherKey: 'userId', as: 'legacyUsers' });
User.belongsToMany(Team, { through: UserTeam, foreignKey: 'userId', otherKey: 'teamId', as: 'legacyTeams' });
Team.belongsToMany(Project, { through: TeamProject, foreignKey: 'teamId', otherKey: 'projectId', as: 'legacyProjects' });
Project.belongsToMany(Team, { through: TeamProject, foreignKey: 'projectId', otherKey: 'teamId', as: 'legacyTeams' });

// New Project/Team/TeamMember relations
Project.hasMany(Team, { as: 'teams', foreignKey: 'projectId', onDelete: 'CASCADE' });
Team.belongsTo(Project, { as: 'project', foreignKey: 'projectId' });

Team.belongsTo(User, { as: 'leader', foreignKey: 'leaderId' });
User.hasMany(Team, { as: 'ledTeams', foreignKey: 'leaderId' });

Team.belongsToMany(User, { as: 'members', through: TeamMember, foreignKey: 'teamId', otherKey: 'userId' });
User.belongsToMany(Team, { as: 'teams', through: TeamMember, foreignKey: 'userId', otherKey: 'teamId' });

Project.belongsTo(User, { as: 'creator', foreignKey: 'createdBy' });
User.hasMany(Project, { as: 'createdProjects', foreignKey: 'createdBy' });

// ProjectMember associations (Project-based access control)
ProjectMember.belongsTo(Project, { foreignKey: 'projectId', as: 'project' });
ProjectMember.belongsTo(User, { foreignKey: 'userId', as: 'user' });
Project.hasMany(ProjectMember, { foreignKey: 'projectId', as: 'members' });
User.hasMany(ProjectMember, { foreignKey: 'userId', as: 'projectMemberships' });

// Many-to-Many: Projects <-> Users through ProjectMembers
Project.belongsToMany(User, {
  through: ProjectMember,
  foreignKey: 'projectId',
  otherKey: 'userId',
  as: 'projectUsers'
});
User.belongsToMany(Project, {
  through: ProjectMember,
  foreignKey: 'userId',
  otherKey: 'projectId',
  as: 'assignedProjects'
});

// TelegramNotificationSetting associations
TelegramNotificationSetting.belongsTo(ComplaintCategory, { foreignKey: 'categoryId', as: 'category' });
ComplaintCategory.hasOne(TelegramNotificationSetting, { foreignKey: 'categoryId', as: 'notificationSetting' });

Object.values(models)
  .filter(model => typeof model.associate === 'function')
  .forEach(model => model.associate(models));

module.exports = {
  sequelize,
  ...models
};
