import { User } from '../models';
import sequelize from '../config/database.config';

/**
 * Script to create dummy users for each role
 */
async function createDummyUsers() {
  try {
    // Sync database models
    await sequelize.sync();
    console.log('Database synchronized');

    // Create admin user
    const adminUser = await User.findOrCreate({
      where: { email: 'admin@legacytech.com' },
      defaults: {
        name: 'Admin User',
        email: 'admin@legacytech.com',
        password: 'password',
        role: 'admin',
        active: true,
      }
    });
    
    // Create sales user
    const salesUser = await User.findOrCreate({
      where: { email: 'sales@legacytech.com' },
      defaults: {
        name: 'Sales User',
        email: 'sales@legacytech.com',
        password: 'password',
        role: 'sales',
        active: true,
      }
    });
    
    // Create project manager user
    const pmUser = await User.findOrCreate({
      where: { email: 'pm@legacytech.com' },
      defaults: {
        name: 'Project Manager',
        email: 'pm@legacytech.com',
        password: 'password',
        role: 'project_manager',
        active: true,
      }
    });

    console.log('Dummy users created:');
    console.log('Admin:', adminUser[0].get('email'), adminUser[1] ? '(created)' : '(already exists)');
    console.log('Sales:', salesUser[0].get('email'), salesUser[1] ? '(created)' : '(already exists)');
    console.log('Project Manager:', pmUser[0].get('email'), pmUser[1] ? '(created)' : '(already exists)');
    
    console.log('\nLogin credentials:');
    console.log('Admin: admin@legacytech.com / password');
    console.log('Sales: sales@legacytech.com / password');
    console.log('Project Manager: pm@legacytech.com / password');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating dummy users:', error);
    process.exit(1);
  }
}

// Run the script
createDummyUsers();
