import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.config';

// Customer attributes interface
interface CustomerAttributes {
  id: number;
  name: string;
  businessName: string;
  email: string;
  phone: string;
  address?: string;
  joinDate: Date;
  status: 'active' | 'inactive' | 'lead';
  source: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Customer creation attributes
interface CustomerCreationAttributes extends Optional<CustomerAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Customer model class
class Customer extends Model<CustomerAttributes, CustomerCreationAttributes> implements CustomerAttributes {
  public id!: number;
  public name!: string;
  public businessName!: string;
  public email!: string;
  public phone!: string;
  public address!: string;
  public joinDate!: Date;
  public status!: 'active' | 'inactive' | 'lead';
  public source!: string;
  public notes!: string;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Customer model
Customer.init(
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
    phone: {
      type: DataTypes.STRING(20),
      allowNull: false,
    },
    address: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    joinDate: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    status: {
      type: DataTypes.ENUM('active', 'inactive', 'lead'),
      allowNull: false,
      defaultValue: 'lead',
    },
    source: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    tableName: 'customers',
    timestamps: true,
  }
);

export default Customer;
