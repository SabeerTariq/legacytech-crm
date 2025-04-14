import { Request, Response, NextFunction } from 'express';
import { CustomerService } from '../services/customer.service';
import { ProjectService } from '../services/project.service';
import { SaleService } from '../services/sale.service';

export class CustomerController {
  private customerService: CustomerService;
  private projectService: ProjectService;
  private saleService: SaleService;

  constructor() {
    this.customerService = new CustomerService();
    this.projectService = new ProjectService();
    this.saleService = new SaleService();
  }

  /**
   * Get all customers
   */
  public getAllCustomers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const customers = await this.customerService.getAllCustomers();

      return res.status(200).json({
        status: 'success',
        results: customers.length,
        data: {
          customers
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer by ID
   */
  public getCustomerById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const customer = await this.customerService.getCustomerById(Number(id));

      return res.status(200).json({
        status: 'success',
        data: {
          customer
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new customer
   */
  public createCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newCustomer = await this.customerService.createCustomer(req.body);

      return res.status(201).json({
        status: 'success',
        data: {
          customer: newCustomer
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a customer
   */
  public updateCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedCustomer = await this.customerService.updateCustomer(Number(id), req.body);

      return res.status(200).json({
        status: 'success',
        data: {
          customer: updatedCustomer
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a customer
   */
  public deleteCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.customerService.deleteCustomer(Number(id));

      return res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer projects
   */
  public getCustomerProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const projects = await this.projectService.getProjectsByCustomer(Number(id));

      return res.status(200).json({
        status: 'success',
        results: projects.length,
        data: {
          projects
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get customer sales
   */
  public getCustomerSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const sales = await this.saleService.getSalesByCustomer(Number(id));

      return res.status(200).json({
        status: 'success',
        results: sales.length,
        data: {
          sales
        }
      });
    } catch (error) {
      next(error);
    }
  };
}
