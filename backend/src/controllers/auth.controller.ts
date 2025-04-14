import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { config } from '../config/env.config';

export class AuthController {
  private authService: AuthService;

  constructor() {
    this.authService = new AuthService();
  }

  /**
   * Login user
   */
  public login = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { email, password } = req.body;
      const { token, user } = await this.authService.login(email, password);

      // Set JWT as cookie if in production
      if (config.nodeEnv === 'production') {
        res.cookie('jwt', token, {
          expires: new Date(Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });
      }

      return res.status(200).json({
        status: 'success',
        token,
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Register new user
   */
  public register = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { token, user } = await this.authService.register(req.body);

      // Set JWT as cookie if in production
      if (config.nodeEnv === 'production') {
        res.cookie('jwt', token, {
          expires: new Date(Date.now() + config.jwt.cookieExpiresIn * 24 * 60 * 60 * 1000),
          httpOnly: true,
          secure: req.secure || req.headers['x-forwarded-proto'] === 'https'
        });
      }

      return res.status(201).json({
        status: 'success',
        token,
        data: {
          user
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Logout user
   */
  public logout = (req: Request, res: Response) => {
    res.cookie('jwt', 'loggedout', {
      expires: new Date(Date.now() + 10 * 1000),
      httpOnly: true
    });

    res.status(200).json({
      status: 'success'
    });
  };

  /**
   * Get current user
   */
  public getCurrentUser = async (req: Request, res: Response, next: NextFunction) => {
    try {
      // User should be available from protect middleware
      const user = req.user;

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
}
