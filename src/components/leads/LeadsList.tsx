
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Plus, BarChart3, List, Filter } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LeadsPipeline from "./LeadsPipeline";

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  status: "new" | "contacted" | "qualified" | "proposal" | "negotiation" | "won" | "lost";
  source: string;
  assignedTo: {
    name: string;
    avatar?: string;
    initials: string;
  };
  date: string;
  value?: number;
}

interface LeadsListProps {
  leads: Lead[];
  onAddLeadClick?: () => void;
}

const LeadsList: React.FC<LeadsListProps> = ({ leads, onAddLeadClick }) => {
  const [viewMode, setViewMode] = useState<"table" | "pipeline" | "kanban">("table");
  
  const statusColors: Record<Lead["status"], string> = {
    new: "bg-purple-500",
    contacted: "bg-blue-500",
    qualified: "bg-indigo-500",
    proposal: "bg-amber-500",
    negotiation: "bg-orange-500",
    won: "bg-green-500",
    lost: "bg-red-500",
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Leads</CardTitle>
        <div className="flex items-center gap-2">
          <div className="bg-muted rounded-md p-1 flex">
            <Button
              variant={viewMode === "table" ? "default" : "ghost"}
              size="sm"
              className="px-2 h-8"
              onClick={() => setViewMode("table")}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "pipeline" ? "default" : "ghost"}
              size="sm"
              className="px-2 h-8"
              onClick={() => setViewMode("pipeline")}
            >
              <Filter className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === "kanban" ? "default" : "ghost"}
              size="sm"
              className="px-2 h-8"
              onClick={() => setViewMode("kanban")}
            >
              <BarChart3 className="h-4 w-4" />
            </Button>
          </div>
          <Button size="sm" onClick={onAddLeadClick}>
            <Plus className="mr-2 h-4 w-4" />
            Add Lead
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === "table" && (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Company</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Assigned To</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {leads.map((lead) => (
                <TableRow key={lead.id}>
                  <TableCell>
                    <div className="font-medium">{lead.name}</div>
                    <div className="text-sm text-muted-foreground">{lead.email}</div>
                  </TableCell>
                  <TableCell>{lead.company}</TableCell>
                  <TableCell>
                    <Badge className={`${statusColors[lead.status]} text-white`}>
                      {lead.status.charAt(0).toUpperCase() + lead.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>{lead.source}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Avatar className="h-6 w-6">
                        <AvatarImage src={lead.assignedTo.avatar} />
                        <AvatarFallback>{lead.assignedTo.initials}</AvatarFallback>
                      </Avatar>
                      <span>{lead.assignedTo.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{lead.date}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>View Details</DropdownMenuItem>
                        <DropdownMenuItem>Edit Lead</DropdownMenuItem>
                        <DropdownMenuItem>Convert to Project</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-500">Delete Lead</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
        
        {viewMode === "pipeline" && <LeadsPipeline leads={leads} />}
        
        {viewMode === "kanban" && (
          <div className="h-96 flex items-center justify-center border border-dashed rounded-md">
            <div className="text-muted-foreground">Kanban Board View (Coming Soon)</div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default LeadsList;
