'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Check if General project already exists
    const [existingProjects] = await queryInterface.sequelize.query(
      `SELECT id FROM Projects WHERE key = 'GENERAL';`
    );

    if (existingProjects.length === 0) {
      // Create General project
      await queryInterface.bulkInsert('Projects', [{
        name: 'General',
        key: 'GENERAL',
        description: 'General tickets accessible to all staff members (except role=User). This is a special project for company-wide issues and requests.',
        status: 'Active',
        startDate: new Date(),
        createdBy: null,
        createdAt: new Date(),
        updatedAt: new Date()
      }]);

      console.log('✅ General project created successfully');
    } else {
      console.log('ℹ️ General project already exists');
    }

    // Auto-assign all existing users (except role='User') to General project
    const [generalProject] = await queryInterface.sequelize.query(
      `SELECT id FROM Projects WHERE key = 'GENERAL';`
    );

    if (generalProject.length > 0) {
      const projectId = generalProject[0].id;

      // Get all users except role='User'
      const [users] = await queryInterface.sequelize.query(
        `SELECT id FROM Users WHERE role != 'User';`
      );

      if (users.length > 0) {
        const projectMembers = users.map(user => ({
          projectId: projectId,
          userId: user.id,
          role: 'member',
          createdAt: new Date(),
          updatedAt: new Date()
        }));

        await queryInterface.bulkInsert('ProjectMembers', projectMembers);
        console.log(`✅ Assigned ${users.length} users to General project`);
      }
    }

    // Assign all existing tickets without a project to General
    const [generalProject2] = await queryInterface.sequelize.query(
      `SELECT id FROM Projects WHERE key = 'GENERAL';`
    );

    if (generalProject2.length > 0) {
      const projectId = generalProject2[0].id;

      await queryInterface.sequelize.query(
        `UPDATE Tickets SET projectId = ${projectId} WHERE projectId IS NULL;`
      );

      console.log('✅ Assigned orphan tickets to General project');
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all members from General project
    const [generalProject] = await queryInterface.sequelize.query(
      `SELECT id FROM Projects WHERE key = 'GENERAL';`
    );

    if (generalProject.length > 0) {
      const projectId = generalProject[0].id;

      await queryInterface.bulkDelete('ProjectMembers', {
        projectId: projectId
      });
    }

    // Delete General project
    await queryInterface.bulkDelete('Projects', {
      key: 'GENERAL'
    });
  }
};
