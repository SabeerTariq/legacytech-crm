import { Request, Response, NextFunction } from 'express';
import { UserService } from '../services/user.service';

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Get all users
   */
  public getAllUsers = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const users = await this.userService.getAllUsers();

      return res.status(200).json({
        status: 'success',
        data: {
          users
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get user by ID
   */
  public getUserById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const user = await this.userService.getUserById(Number(id));

      return res.status(200).json({
        status: 'success',
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new user
   */
  public createUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newUser = await this.userService.createUser(req.body);

      return res.status(201).json({
        status: 'success',
        data: {
          user: newUser
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a user
   */
  public updateUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedUser = await this.userService.updateUser(Number(id), req.body);

      return res.status(200).json({
        status: 'success',
        data: {
          user: updatedUser
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a user
   */
  public deleteUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.userService.deleteUser(Number(id));

      return res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  };
}
