
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DepartmentCard from "./DepartmentCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TeamPerformance = () => {
  const departments = [
    "Development",
    "Front Sales",
    "HR",
    "Marketing",
    "Other",
    "Production",
    "Upseller"
  ];

  // Group departments by type
  const productionDepartments = departments.filter(d => 
    ["Development", "Production"].includes(d)
  );
  
  const businessDepartments = departments.filter(d => 
    ["Front Sales", "Marketing", "Upseller"].includes(d)
  );
  
  const supportDepartments = departments.filter(d => 
    ["HR", "Other"].includes(d)
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
            <TabsTrigger value="support">Support Teams</TabsTrigger>
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
          
          <TabsContent value="support" className="space-y-6">
            {supportDepartments.map((department) => (
              <DepartmentCard key={department} department={department} />
            ))}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default TeamPerformance;
