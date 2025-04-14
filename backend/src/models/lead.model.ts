import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.config';

// Lead status type
export type LeadStatus = 'new' | 'contacted' | 'qualified' | 'proposal' | 'negotiation' | 'won' | 'lost';

// Lead attributes interface
interface LeadAttributes {
  id: number;
  name: string;
  businessName?: string;
  email: string;
  phone: string;
  address?: string;
  source: string;
  status: LeadStatus;
  assignedTo: number;
  estimatedValue?: number;
  notes?: string;
  lastContact?: Date;
  nextFollowUp?: Date;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Lead creation attributes
interface LeadCreationAttributes extends Optional<LeadAttributes, 'id' | 'businessName' | 'address' | 'estimatedValue' | 'notes' | 'lastContact' | 'nextFollowUp' | 'createdAt' | 'updatedAt'> {}

// Lead model class
class Lead extends Model<LeadAttributes, LeadCreationAttributes> implements LeadAttributes {
  public id!: number;
  public name!: string;
  public businessName!: string;
  public email!: string;
  public phone!: string;
  public address!: string;
  public source!: string;
  public status!: LeadStatus;
  public assignedTo!: number;
  public estimatedValue!: number;
  public notes!: string;
  public lastContact!: Date;
  public nextFollowUp!: Date;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Lead model
Lead.init(
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
    businessName: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        isEmail: true,
      },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('new', 'contacted', 'qualified', 'proposal', 'negotiation', 'won', 'lost'),
      allowNull: false,
      defaultValue: 'new',
    },
    assignedTo: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    estimatedValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    lastContact: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    nextFollowUp: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'leads',
    timestamps: true,
  }
);

export default Lead;
