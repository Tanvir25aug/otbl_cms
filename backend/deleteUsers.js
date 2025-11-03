const { User } = require('./src/models');
const sequelize = require('./src/config/database');

const deleteUsers = async () => {
  try {
    await User.destroy({ where: {}, truncate: true, cascade: true });
    console.log('All users deleted.');
  } catch (error) {
    console.error('Error deleting users:', error);
  } finally {
    await sequelize.close();
  }
};

deleteUsers();
