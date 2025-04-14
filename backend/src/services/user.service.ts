import { User } from '../models';
import { ApiError } from '../middleware/error.middleware';

export class UserService {
  /**
   * Get all users
   */
  public async getAllUsers() {
    return await User.findAll({
      attributes: { exclude: ['password'] }
    });
  }

  /**
   * Get user by ID
   */
  public async getUserById(id: number) {
    const user = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    if (!user) {
      throw new ApiError(404, `User with ID ${id} not found`);
    }

    return user;
  }

  /**
   * Create a new user
   */
  public async createUser(userData: any) {
    const newUser = await User.create(userData);

    // Remove password from response
    const userWithoutPassword = newUser.toJSON();
    delete userWithoutPassword.password;

    return userWithoutPassword;
  }

  /**
   * Update a user
   */
  public async updateUser(id: number, userData: any) {
    const user = await this.getUserById(id);

    await user.update(userData);

    // Remove password from response
    const userWithoutPassword = user.toJSON();
    delete userWithoutPassword.password;

    return userWithoutPassword;
  }

  /**
   * Delete a user
   */
  public async deleteUser(id: number) {
    const user = await this.getUserById(id);

    await user.destroy();
    return true;
  }

  /**
   * Find user by email
   */
  public async findByEmail(email: string) {
    return await User.findOne({ where: { email } });
  }
}
