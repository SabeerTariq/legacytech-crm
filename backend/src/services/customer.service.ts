import { Customer } from '../models';
import { ApiError } from '../middleware/error.middleware';

export class CustomerService {
  /**
   * Get all customers
   */
  public async getAllCustomers() {
    return await Customer.findAll();
  }

  /**
   * Get customer by ID
   */
  public async getCustomerById(id: number) {
    const customer = await Customer.findByPk(id);
    
    if (!customer) {
      throw new ApiError(404, `Customer with ID ${id} not found`);
    }
    
    return customer;
  }

  /**
   * Create a new customer
   */
  public async createCustomer(customerData: any) {
    return await Customer.create(customerData);
  }

  /**
   * Update a customer
   */
  public async updateCustomer(id: number, customerData: any) {
    const customer = await this.getCustomerById(id);
    
    return await customer.update(customerData);
  }

  /**
   * Delete a customer
   */
  public async deleteCustomer(id: number) {
    const customer = await this.getCustomerById(id);
    
    await customer.destroy();
    return true;
  }
}
