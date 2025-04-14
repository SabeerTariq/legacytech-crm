import { Model, DataTypes, Optional } from 'sequelize';
import sequelize from '../config/database.config';

// Sale attributes interface
interface SaleAttributes {
  id: number;
  date: Date;
  customerId: number;
  services: string[];
  otherServices?: string;
  turnaroundTime: string;
  serviceTenure: string;
  paymentMode: string;
  salesSource: string;
  leadSource: string;
  saleType: string;
  grossValue: number;
  cashIn: number;
  remaining: number;
  tax?: number;
  sellerId: number;
  agreement?: string;
  status: 'completed' | 'pending' | 'cancelled';
  createdAt?: Date;
  updatedAt?: Date;
}

// Interface for Sale creation attributes
interface SaleCreationAttributes extends Optional<SaleAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

// Sale model class
class Sale extends Model<SaleAttributes, SaleCreationAttributes> implements SaleAttributes {
  public id!: number;
  public date!: Date;
  public customerId!: number;
  public services!: string[];
  public otherServices!: string;
  public turnaroundTime!: string;
  public serviceTenure!: string;
  public paymentMode!: string;
  public salesSource!: string;
  public leadSource!: string;
  public saleType!: string;
  public grossValue!: number;
  public cashIn!: number;
  public remaining!: number;
  public tax!: number;
  public sellerId!: number;
  public agreement!: string;
  public status!: 'completed' | 'pending' | 'cancelled';

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

// Initialize Sale model
Sale.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    customerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'customers',
        key: 'id',
      },
    },
    services: {
      type: DataTypes.JSON,
      allowNull: false,
      defaultValue: [],
    },
    otherServices: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    turnaroundTime: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    serviceTenure: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    paymentMode: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    salesSource: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    leadSource: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    saleType: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    grossValue: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    cashIn: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    remaining: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: true,
    },
    sellerId: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id',
      },
    },
    agreement: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('completed', 'pending', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
  },
  {
    sequelize,
    tableName: 'sales',
    timestamps: true,
  }
);

export default Sale;
