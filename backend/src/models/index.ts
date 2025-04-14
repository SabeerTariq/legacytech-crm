import sequelize from '../config/database.config';
import Customer from './customer.model';
import User from './user.model';
import Sale from './sale.model';
import Project from './project.model';
import Lead from './lead.model';
import Message from './message.model';

// Define model associations

// User associations
User.hasMany(Sale, { foreignKey: 'sellerId', as: 'sales' });
User.hasMany(Project, { foreignKey: 'sellerId', as: 'soldProjects' });
User.hasMany(Project, { foreignKey: 'managerId', as: 'managedProjects' });
User.hasMany(Lead, { foreignKey: 'assignedTo', as: 'leads' });
User.hasMany(Message, { foreignKey: 'senderId', as: 'sentMessages' });
User.hasMany(Message, { foreignKey: 'receiverId', as: 'receivedMessages' });

// Customer associations
Customer.hasMany(Sale, { foreignKey: 'customerId', as: 'sales' });
Customer.hasMany(Project, { foreignKey: 'customerId', as: 'projects' });

// Sale associations
Sale.belongsTo(Customer, { foreignKey: 'customerId' });
Sale.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });

// Project associations
Project.belongsTo(Customer, { foreignKey: 'customerId' });
Project.belongsTo(User, { foreignKey: 'sellerId', as: 'seller' });
Project.belongsTo(User, { foreignKey: 'managerId', as: 'manager' });

// Lead associations
Lead.belongsTo(User, { foreignKey: 'assignedTo', as: 'assignedUser' });

// Message associations
Message.belongsTo(User, { foreignKey: 'senderId', as: 'sender' });
Message.belongsTo(User, { foreignKey: 'receiverId', as: 'receiver' });

// Export models
export {
  Customer,
  User,
  Sale,
  Project,
  Lead,
  Message
};

// Export sequelize instance
export default sequelize;
