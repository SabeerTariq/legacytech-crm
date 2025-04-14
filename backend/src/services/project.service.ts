import { Project, Customer, User } from '../models';
import { ApiError } from '../middleware/error.middleware';

export class ProjectService {
  /**
   * Get all projects
   */
  public async getAllProjects() {
    return await Project.findAll({
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'businessName', 'email']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
  }

  /**
   * Get project by ID
   */
  public async getProjectById(id: number) {
    const project = await Project.findByPk(id, {
      include: [
        {
          model: Customer,
          as: 'customer',
          attributes: ['id', 'name', 'businessName', 'email']
        },
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
    
    if (!project) {
      throw new ApiError(404, `Project with ID ${id} not found`);
    }
    
    return project;
  }

  /**
   * Create a new project
   */
  public async createProject(projectData: any) {
    // Validate customer exists
    const customer = await Customer.findByPk(projectData.customerId);
    if (!customer) {
      throw new ApiError(404, `Customer with ID ${projectData.customerId} not found`);
    }

    // Validate seller exists
    const seller = await User.findByPk(projectData.sellerId);
    if (!seller) {
      throw new ApiError(404, `Seller with ID ${projectData.sellerId} not found`);
    }

    // Validate manager exists
    const manager = await User.findByPk(projectData.managerId);
    if (!manager) {
      throw new ApiError(404, `Manager with ID ${projectData.managerId} not found`);
    }

    return await Project.create(projectData);
  }

  /**
   * Update a project
   */
  public async updateProject(id: number, projectData: any) {
    const project = await this.getProjectById(id);
    
    // If changing customer, validate customer exists
    if (projectData.customerId && projectData.customerId !== project.customerId) {
      const customer = await Customer.findByPk(projectData.customerId);
      if (!customer) {
        throw new ApiError(404, `Customer with ID ${projectData.customerId} not found`);
      }
    }

    // If changing seller, validate seller exists
    if (projectData.sellerId && projectData.sellerId !== project.sellerId) {
      const seller = await User.findByPk(projectData.sellerId);
      if (!seller) {
        throw new ApiError(404, `Seller with ID ${projectData.sellerId} not found`);
      }
    }

    // If changing manager, validate manager exists
    if (projectData.managerId && projectData.managerId !== project.managerId) {
      const manager = await User.findByPk(projectData.managerId);
      if (!manager) {
        throw new ApiError(404, `Manager with ID ${projectData.managerId} not found`);
      }
    }
    
    return await project.update(projectData);
  }

  /**
   * Delete a project
   */
  public async deleteProject(id: number) {
    const project = await this.getProjectById(id);
    
    await project.destroy();
    return true;
  }

  /**
   * Assign team members to a project
   */
  public async assignTeam(id: number, teamMembers: string[]) {
    const project = await this.getProjectById(id);
    
    await project.update({ team: teamMembers });
    return project;
  }

  /**
   * Get projects by customer ID
   */
  public async getProjectsByCustomer(customerId: number) {
    return await Project.findAll({
      where: { customerId },
      include: [
        {
          model: User,
          as: 'seller',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'manager',
          attributes: ['id', 'name', 'email']
        }
      ]
    });
  }

  /**
   * Get projects by manager ID
   */
  public async getProjectsByManager(managerId: number) {
    return await Project.findAll({
      where: { managerId },
      include: [
        {
          model: Customer,
          as: 'customer',
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
}
