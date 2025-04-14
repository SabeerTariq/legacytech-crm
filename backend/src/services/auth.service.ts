import jwt from 'jsonwebtoken';
import { User } from '../models';
import { config } from '../config/env.config';
import { ApiError } from '../middleware/error.middleware';
import { UserService } from './user.service';

export class AuthService {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  /**
   * Generate JWT token
   */
  private generateToken(userId: number): string {
    return jwt.sign({ id: userId }, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn
    });
  }

  /**
   * Login user
   */
  public async login(email: string, password: string) {
    // Check if email and password exist
    if (!email || !password) {
      throw new ApiError(400, 'Please provide email and password');
    }

    // Find user by email
    const user = await this.userService.findByEmail(email);

    // Check if user exists and password is correct
    if (!user || !(await user.comparePassword(password))) {
      throw new ApiError(401, 'Incorrect email or password');
    }

    // Check if user is active
    if (!user.active) {
      throw new ApiError(401, 'Your account has been deactivated. Please contact an administrator.');
    }

    // Generate token
    const token = this.generateToken(user.id);

    // Update last login time
    await user.update({ lastLogin: new Date() });

    // Remove password from output
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return {
      token,
      user: userWithoutPassword
    };
  }

  /**
   * Register new user
   */
  public async register(userData: any) {
    // Check if email already exists
    const existingUser = await this.userService.findByEmail(userData.email);
    if (existingUser) {
      throw new ApiError(400, 'Email already in use');
    }

    // Create new user
    const newUser = await this.userService.createUser(userData);

    // Generate token
    const token = this.generateToken(newUser.id);

    return {
      token,
      user: newUser
    };
  }

  /**
   * Get current user by ID
   */
  public async getCurrentUser(userId: number) {
    return await this.userService.getUserById(userId);
  }
}
