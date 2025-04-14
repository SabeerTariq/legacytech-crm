import { Request, Response, NextFunction } from 'express';
import { LeadService } from '../services/lead.service';

export class LeadController {
  private leadService: LeadService;

  constructor() {
    this.leadService = new LeadService();
  }

  /**
   * Get all leads
   */
  public getAllLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leads = await this.leadService.getAllLeads();
      
      return res.status(200).json({
        status: 'success',
        results: leads.length,
        data: {
          leads
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get lead by ID
   */
  public getLeadById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const lead = await this.leadService.getLeadById(Number(id));
      
      return res.status(200).json({
        status: 'success',
        data: {
          lead
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new lead
   */
  public createLead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // If no assignedTo is provided, use the current user's ID
      if (!req.body.assignedTo && req.user) {
        req.body.assignedTo = req.user.id;
      }
      
      const newLead = await this.leadService.createLead(req.body);
      
      return res.status(201).json({
        status: 'success',
        data: {
          lead: newLead
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a lead
   */
  public updateLead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedLead = await this.leadService.updateLead(Number(id), req.body);
      
      return res.status(200).json({
        status: 'success',
        data: {
          lead: updatedLead
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a lead
   */
  public deleteLead = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.leadService.deleteLead(Number(id));
      
      return res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update lead status
   */
  public updateLeadStatus = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({
          status: 'error',
          message: 'Status is required'
        });
      }
      
      const lead = await this.leadService.updateLeadStatus(Number(id), status);
      
      return res.status(200).json({
        status: 'success',
        data: {
          lead
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Convert lead to customer
   */
  public convertToCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const result = await this.leadService.convertToCustomer(Number(id));
      
      return res.status(200).json({
        status: 'success',
        data: result
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get leads by assigned user
   */
  public getLeadsByUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { userId } = req.params;
      const leads = await this.leadService.getLeadsByUser(Number(userId));
      
      return res.status(200).json({
        status: 'success',
        results: leads.length,
        data: {
          leads
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get leads for the current user
   */
  public getMyLeads = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const leads = await this.leadService.getLeadsByUser(req.user.id);
      
      return res.status(200).json({
        status: 'success',
        results: leads.length,
        data: {
          leads
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
