
import React from "react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import TasksTabContent from "./TasksTabContent";
import { KanbanColumn } from "@/components/projects/ProjectKanban";

interface TasksTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  allTaskColumns: KanbanColumn[];
  departmentColumns: Record<string, KanbanColumn[]>;
}

const TasksTabs = ({
  activeTab,
  onTabChange,
  allTaskColumns,
  departmentColumns,
}: TasksTabsProps) => {
  return (
    <Tabs defaultValue="all" value={activeTab} onValueChange={onTabChange}>
      <TabsList className="mb-4">
        <TabsTrigger value="all">All Tasks</TabsTrigger>
        <TabsTrigger value="design">Design</TabsTrigger>
        <TabsTrigger value="development">Development</TabsTrigger>
        <TabsTrigger value="marketing">Marketing</TabsTrigger>
        <TabsTrigger value="content">Content</TabsTrigger>
      </TabsList>

      <TabsContent value="all" className="space-y-6">
        <TasksTabContent title="All Department Tasks" columns={allTaskColumns} />
      </TabsContent>

      <TabsContent value="design">
        <TasksTabContent title="Design Department Tasks" columns={departmentColumns.design} />
      </TabsContent>

      <TabsContent value="development">
        <TasksTabContent title="Development Department Tasks" columns={departmentColumns.development} />
      </TabsContent>

      <TabsContent value="marketing">
        <TasksTabContent title="Marketing Department Tasks" columns={departmentColumns.marketing} />
      </TabsContent>

      <TabsContent value="content">
        <TasksTabContent title="Content Department Tasks" columns={departmentColumns.content} />
      </TabsContent>
    </Tabs>
  );
};

export default TasksTabs;
