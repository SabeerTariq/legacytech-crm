
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ProjectKanban from "@/components/projects/ProjectKanban";
import { KanbanColumn } from "@/components/projects/ProjectKanban";

interface TasksTabContentProps {
  title: string;
  columns: KanbanColumn[];
}

const TasksTabContent = ({ title, columns }: TasksTabContentProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <ProjectKanban initialColumns={columns} />
      </CardContent>
    </Card>
  );
};

export default TasksTabContent;
