import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.config';

// Project status type
export type ProjectStatus = 'planning' | 'in-progress' | 'on-hold' | 'completed' | 'cancelled';

// Project attributes interface
interface ProjectAttributes {
  id: number;
  name: string;
  description?: string;
  customerId: number;
  startDate: Date;
  deadline?: Date;
  completedDate?: Date;
  status: ProjectStatus;
  progress: number;
  sellerId: number;
  managerId: number;
  team?: string[];
  services: string[];
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Project creation attributes
interface ProjectCreationAttributes extends Optional<ProjectAttributes, 'id' | 'description' | 'deadline' | 'completedDate' | 'team' | 'notes' | 'createdAt' | 'updatedAt'> {}

// Project model class
class Project extends Model<ProjectAttributes, ProjectCreationAttributes> implements ProjectAttributes {
  public id!: number;
  public name!: string;
  public description!: string;
  public customerId!: number;
  public startDate!: Date;
  public deadline!: Date;
  public completedDate!: Date;
  public status!: ProjectStatus;
  public progress!: number;
  public sellerId!: number;
  public managerId!: number;
  public team!: string[];
  public services!: string[];
  public notes!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Project model
Project.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    customerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    startDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    deadline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    completedDate: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('planning', 'in-progress', 'on-hold', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'planning',
    },
    progress: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
        max: 100,
      },
    },
    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    managerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    team: {
      type: DataTypes.JSON,
      allowNull: true,
      defaultValue: [],
    },
    services: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'projects',
    timestamps: true,
  }
);

export default Project;
