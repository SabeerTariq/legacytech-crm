
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, Search, Calendar, CheckSquare, Clock, Archive } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Mock project data
const MOCK_PROJECTS = [
  {
    id: '1',
    name: 'Website Redesign - Smith Enterprises',
    customer: {
      id: '1',
      name: 'John Smith',
      businessName: 'Smith Enterprises',
    },
    startDate: '2024-01-15',
    deadline: '2024-03-20',
    status: 'completed',
    progress: 100,
    frontSeller: 'Admin User',
    projectManager: 'Project Manager',
    team: ['Designer 1', 'Developer 1', 'QA 1'],
    services: ['Website Design', 'SEO Services'],
  },
  {
    id: '2',
    name: 'Social Media Management - Johnson Digital',
    customer: {
      id: '2',
      name: 'Sarah Johnson',
      businessName: 'Johnson Digital',
    },
    startDate: '2024-02-01',
    deadline: '2024-12-31',
    status: 'in-progress',
    progress: 40,
    frontSeller: 'Sales Rep',
    projectManager: 'Project Manager',
    team: ['Content Creator 1', 'Designer 2'],
    services: ['Social Media Management', 'Content Creation'],
  },
  {
    id: '3',
    name: 'Mobile App Development - Wong Innovations',
    customer: {
      id: '3',
      name: 'Michael Wong',
      businessName: 'Wong Innovations',
    },
    startDate: '2024-03-01',
    deadline: '2024-06-30',
    status: 'in-progress',
    progress: 25,
    frontSeller: 'Sales Rep',
    projectManager: 'Project Manager',
    team: ['Designer 3', 'Developer 2', 'Developer 3'],
    services: ['Mobile App Development'],
  },
];

export const ProjectsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // Filter projects based on search term
  const filteredProjects = MOCK_PROJECTS.filter((project) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      project.name.toLowerCase().includes(searchLower) ||
      project.customer.name.toLowerCase().includes(searchLower) ||
      project.customer.businessName.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="page-header mb-0">
          <h1 className="page-title">Projects</h1>
          <p className="page-description">Manage and track all your ongoing projects</p>
        </div>
        
        <Button className="shrink-0">
          <PlusIcon className="h-4 w-4 mr-2" />
          New Project
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all" className="flex items-center">
            <CheckSquare className="h-4 w-4 mr-2" />
            All Projects
          </TabsTrigger>
          <TabsTrigger value="active" className="flex items-center">
            <Clock className="h-4 w-4 mr-2" />
            Active
          </TabsTrigger>
          <TabsTrigger value="completed" className="flex items-center">
            <Archive className="h-4 w-4 mr-2" />
            Completed
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-6">
          <div className="relative mb-6">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="grid gap-4">
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <Card key={project.id} className="overflow-hidden">
                  <div className={`h-1 ${
                    project.status === 'completed' 
                      ? 'bg-green-500' 
                      : project.status === 'in-progress'
                      ? 'bg-blue-500'
                      : 'bg-yellow-500'
                  }`} 
                  style={{ width: `${project.progress}%` }}
                  />
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div>
                        <h3 className="font-medium text-lg">{project.name}</h3>
                        <p className="text-muted-foreground">{project.customer.businessName}</p>
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3">
                        <span className={`inline-block px-3 py-1 text-xs rounded-full ${
                          project.status === 'completed' 
                            ? 'bg-green-100 text-green-800' 
                            : project.status === 'in-progress'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {project.status.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                        </span>
                        
                        <div className="flex items-center text-sm">
                          <Calendar className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>Due: {new Date(project.deadline).toLocaleDateString()}</span>
                        </div>
                        
                        <Button variant="outline" size="sm">View Details</Button>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Services</p>
                        <p>{project.services.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Team</p>
                        <p className="truncate">{project.team.join(', ')}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Project Manager</p>
                        <p>{project.projectManager}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="text-center p-8">
                <p className="text-muted-foreground">No projects found</p>
              </div>
            )}
          </div>
        </div>
      </Tabs>
    </div>
  );
};
