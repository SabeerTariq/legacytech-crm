import { Request, Response, NextFunction } from 'express';
import { SaleService } from '../services/sale.service';

export class SaleController {
  private saleService: SaleService;

  constructor() {
    this.saleService = new SaleService();
  }

  /**
   * Get all sales
   */
  public getAllSales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sales = await this.saleService.getAllSales();
      
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

  /**
   * Get sale by ID
   */
  public getSaleById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const sale = await this.saleService.getSaleById(Number(id));
      
      return res.status(200).json({
        status: 'success',
        data: {
          sale
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new sale
   */
  public createSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // If no sellerId is provided, use the current user's ID
      if (!req.body.sellerId && req.user) {
        req.body.sellerId = req.user.id;
      }
      
      const newSale = await this.saleService.createSale(req.body);
      
      return res.status(201).json({
        status: 'success',
        data: {
          sale: newSale
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a sale
   */
  public updateSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedSale = await this.saleService.updateSale(Number(id), req.body);
      
      return res.status(200).json({
        status: 'success',
        data: {
          sale: updatedSale
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a sale
   */
  public deleteSale = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.saleService.deleteSale(Number(id));
      
      return res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get sales by customer ID
   */
  public getSalesByCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const sales = await this.saleService.getSalesByCustomer(Number(customerId));
      
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

  /**
   * Get sales by seller ID
   */
  public getSalesBySeller = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { sellerId } = req.params;
      const sales = await this.saleService.getSalesBySeller(Number(sellerId));
      
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

  /**
   * Get sales for the current user
   */
  public getMySales = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const sales = await this.saleService.getSalesBySeller(req.user.id);
      
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
