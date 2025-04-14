import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.config';
import bcrypt from 'bcrypt';

// User roles
export type UserRole = 'admin' | 'sales' | 'project_manager';

// User attributes interface
interface UserAttributes {
  id: number;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  avatar?: string;
  active: boolean;
  lastLogin?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for User creation attributes
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'active' | 'lastLogin' | 'createdAt' | 'updatedAt'> {}

// User model class
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public name!: string;
  public email!: string;
  public password!: string;
  public role!: UserRole;
  public avatar!: string;
  public active!: boolean;
  public lastLogin!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;

  // Method to check if password is correct
  public async comparePassword(candidatePassword: string): Promise<boolean> {
    return bcrypt.compare(candidatePassword, this.password);
  }
}

// Initialize User model
User.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM('admin', 'sales', 'project_manager'),
      allowNull: false,
      defaultValue: 'sales',
    },
    avatar: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
    },
    lastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'users',
    timestamps: true,
    hooks: {
      // Hash password before saving
      beforeCreate: async (user: User) => {
        if (user.password) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
      beforeUpdate: async (user: User) => {
        if (user.changed('password')) {
          const salt = await bcrypt.genSalt(10);
          user.password = await bcrypt.hash(user.password, salt);
        }
      },
    },
  }
);

export default User;
