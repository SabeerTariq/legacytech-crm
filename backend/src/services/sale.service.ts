import { Sale, Customer, User } from '../models';
import { ApiError } from '../middleware/error.middleware';

export class SaleService {
  /**
   * Get all sales
   */
  public async getAllSales() {
    return await Sale.findAll({
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'businessName', 'email']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
  }

  /**
   * Get sale by ID
   */
  public async getSaleById(id: number) {
    const sale = await Sale.findByPk(id, {
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'businessName', 'email']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!sale) {
      throw new ApiError(404, `Sale with ID ${id} not found`);
    }
    
    return sale;
  }

  /**
   * Create a new sale
   */
  public async createSale(saleData: any) {
    // Validate customer exists
    const customer = await Customer.findByPk(saleData.customerId);
    if (!customer) {
      throw new ApiError(404, `Customer with ID ${saleData.customerId} not found`);
    }

    // Validate seller exists
    const seller = await User.findByPk(saleData.sellerId);
    if (!seller) {
      throw new ApiError(404, `Seller with ID ${saleData.sellerId} not found`);
    }

    return await Sale.create(saleData);
  }

  /**
   * Update a sale
   */
  public async updateSale(id: number, saleData: any) {
    const sale = await this.getSaleById(id);
    
    // If changing customer, validate customer exists
    if (saleData.customerId && saleData.customerId !== sale.customerId) {
      const customer = await Customer.findByPk(saleData.customerId);
      if (!customer) {
        throw new ApiError(404, `Customer with ID ${saleData.customerId} not found`);
      }
    }

    // If changing seller, validate seller exists
    if (saleData.sellerId && saleData.sellerId !== sale.sellerId) {
      const seller = await User.findByPk(saleData.sellerId);
      if (!seller) {
        throw new ApiError(404, `Seller with ID ${saleData.sellerId} not found`);
      }
    }
    
    return await sale.update(saleData);
  }

  /**
   * Delete a sale
   */
  public async deleteSale(id: number) {
    const sale = await this.getSaleById(id);
    
    await sale.destroy();
    return true;
  }

  /**
   * Get sales by customer ID
   */
  public async getSalesByCustomer(customerId: number) {
    return await Sale.findAll({
      where: { customerId },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
  }

  /**
   * Get sales by seller ID
   */
  public async getSalesBySeller(sellerId: number) {
    return await Sale.findAll({
      where: { sellerId },
      include: [
        {
          model: Customer,
          attributes: ['id', 'name', 'businessName', 'email']
        }
      ]
    });
  }
}
