const sequelize = require('./src/config/database');

async function createCommentAttachmentsTable() {
  try {
    await sequelize.query(`
      CREATE TABLE IF NOT EXISTS comment_attachments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        commentId INTEGER NOT NULL,
        fileName VARCHAR(255) NOT NULL,
        originalName VARCHAR(255) NOT NULL,
        filePath VARCHAR(255) NOT NULL,
        fileSize INTEGER NOT NULL,
        mimeType VARCHAR(255) NOT NULL,
        userId INTEGER NOT NULL,
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY(commentId) REFERENCES Comments(id) ON DELETE CASCADE,
        FOREIGN KEY(userId) REFERENCES Users(id)
      );
    `);
    console.log('✅ comment_attachments table created successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error creating table:', error);
    process.exit(1);
  }
}

createCommentAttachmentsTable();
