
import React from "react";

const TasksLoading = () => {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Loading tasks...</p>
      </div>
    </div>
  );
};

export default TasksLoading;
