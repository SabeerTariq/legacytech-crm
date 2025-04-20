
import DepartmentCard from "./DepartmentCard";

const TeamPerformance = () => {
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold tracking-tight">Departments</h2>
      <div className="grid gap-6">
        <DepartmentCard department="Design" />
        <DepartmentCard department="Development" />
        <DepartmentCard department="Marketing" />
        <DepartmentCard department="Content" />
        <DepartmentCard department="Business Development" />
        <DepartmentCard department="Project Management" />
      </div>
    </div>
  );
};

export default TeamPerformance;
