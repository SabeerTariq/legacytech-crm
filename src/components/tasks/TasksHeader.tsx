
import React from "react";
import { Button } from "@/components/ui/button";
import { CalendarIcon, Filter, PlusCircle } from "lucide-react";

interface TasksHeaderProps {
  onNewTask: () => void;
}

const TasksHeader = ({ onNewTask }: TasksHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-3xl font-bold">Tasks</h1>
      <div className="flex items-center gap-2">
        <Button variant="outline">
          <Filter className="mr-2 h-4 w-4" />
          Filter
        </Button>
        <Button variant="outline">
          <CalendarIcon className="mr-2 h-4 w-4" />
          Calendar
        </Button>
        <Button onClick={onNewTask}>
          <PlusCircle className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>
    </div>
  );
};

export default TasksHeader;
