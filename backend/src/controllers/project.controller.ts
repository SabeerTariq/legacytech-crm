import { Request, Response, NextFunction } from 'express';
import { ProjectService } from '../services/project.service';

export class ProjectController {
  private projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  /**
   * Get all projects
   */
  public getAllProjects = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const projects = await this.projectService.getAllProjects();
      
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
   * Get project by ID
   */
  public getProjectById = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const project = await this.projectService.getProjectById(Number(id));
      
      return res.status(200).json({
        status: 'success',
        data: {
          project
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Create a new project
   */
  public createProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const newProject = await this.projectService.createProject(req.body);
      
      return res.status(201).json({
        status: 'success',
        data: {
          project: newProject
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Update a project
   */
  public updateProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const updatedProject = await this.projectService.updateProject(Number(id), req.body);
      
      return res.status(200).json({
        status: 'success',
        data: {
          project: updatedProject
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Delete a project
   */
  public deleteProject = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      await this.projectService.deleteProject(Number(id));
      
      return res.status(204).json({
        status: 'success',
        data: null
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Assign team members to a project
   */
  public assignTeam = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      const { team } = req.body;
      
      if (!team || !Array.isArray(team)) {
        return res.status(400).json({
          status: 'error',
          message: 'Team members must be provided as an array'
        });
      }
      
      const project = await this.projectService.assignTeam(Number(id), team);
      
      return res.status(200).json({
        status: 'success',
        data: {
          project
        }
      });
    } catch (error) {
      next(error);
    }
  };

  /**
   * Get projects by customer ID
   */
  public getProjectsByCustomer = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { customerId } = req.params;
      const projects = await this.projectService.getProjectsByCustomer(Number(customerId));
      
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
   * Get projects by manager ID
   */
  public getProjectsByManager = async (req: Request, res: Response, next: NextFunction) => {
    try {
      const { managerId } = req.params;
      const projects = await this.projectService.getProjectsByManager(Number(managerId));
      
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
}
