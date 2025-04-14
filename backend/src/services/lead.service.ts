import { Lead, User, Customer } from '../models';
import { ApiError } from '../middleware/error.middleware';
import { CustomerService } from './customer.service';

export class LeadService {
  private customerService: CustomerService;

  constructor() {
    this.customerService = new CustomerService();
  }

  /**
   * Get all leads
   */
  public async getAllLeads() {
    return await Lead.findAll({
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
  }

  /**
   * Get lead by ID
   */
  public async getLeadById(id: number) {
    const lead = await Lead.findByPk(id, {
      include: [
        {
          model: User,
          as: 'assignedUser',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!lead) {
      throw new ApiError(404, `Lead with ID ${id} not found`);
    }
    
    return lead;
  }

  /**
   * Create a new lead
   */
  public async createLead(leadData: any) {
    // Validate assigned user exists
    const user = await User.findByPk(leadData.assignedTo);
    if (!user) {
      throw new ApiError(404, `User with ID ${leadData.assignedTo} not found`);
    }

    return await Lead.create(leadData);
  }

  /**
   * Update a lead
   */
  public async updateLead(id: number, leadData: any) {
    const lead = await this.getLeadById(id);
    
    // If changing assigned user, validate user exists
    if (leadData.assignedTo && leadData.assignedTo !== lead.assignedTo) {
      const user = await User.findByPk(leadData.assignedTo);
      if (!user) {
        throw new ApiError(404, `User with ID ${leadData.assignedTo} not found`);
      }
    }
    
    return await lead.update(leadData);
  }

  /**
   * Delete a lead
   */
  public async deleteLead(id: number) {
    const lead = await this.getLeadById(id);
    
    await lead.destroy();
    return true;
  }

  /**
   * Update lead status
   */
  public async updateLeadStatus(id: number, status: string) {
    const lead = await this.getLeadById(id);
    
    return await lead.update({ status });
  }

  /**
   * Convert lead to customer
   */
  public async convertToCustomer(id: number) {
    const lead = await this.getLeadById(id);
    
    // Create new customer from lead data
    const customerData = {
      name: lead.name,
      businessName: lead.businessName || lead.name,
      email: lead.email,
      phone: lead.phone,
      address: lead.address,
      joinDate: new Date(),
      status: 'active',
      source: lead.source,
      notes: lead.notes
    };
    
    // Create customer
    const customer = await this.customerService.createCustomer(customerData);
    
    // Update lead status to 'won'
    await lead.update({ status: 'won' });
    
    return {
      lead,
      customer
    };
  }

  /**
   * Get leads by assigned user
   */
  public async getLeadsByUser(userId: number) {
    return await Lead.findAll({
      where: { assignedTo: userId }
    });
  }
}
