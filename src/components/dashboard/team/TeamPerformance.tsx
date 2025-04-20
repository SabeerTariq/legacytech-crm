
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DepartmentCard from "./DepartmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TeamPerformance = () => {
  const departments = [
    "Design",
    "Development",
    "Marketing",
    "Content",
    "Business Development",
    "Project Management",
  ];

  // Group departments by type
  const productionDepartments = departments.filter(d => 
    ["Design", "Development", "Marketing", "Content"].includes(d)
  );
  
  const businessDepartments = departments.filter(d => 
    ["Business Development", "Project Management"].includes(d)
  );

  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="production" className="space-y-4">
          <TabsList>
            <TabsTrigger value="production">Production Teams</TabsTrigger>
            <TabsTrigger value="business">Business Teams</TabsTrigger>
          </TabsList>
          
          <TabsContent value="production" className="space-y-6">
            {productionDepartments.map((department) => (
              <DepartmentCard key={department} department={department} />
            ))}
          </TabsContent>
          
          <TabsContent value="business" className="space-y-6">
            {businessDepartments.map((department) => (
              <DepartmentCard key={department} department={department} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TeamPerformance;
