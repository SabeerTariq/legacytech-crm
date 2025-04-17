
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, UserPlus } from "lucide-react";

interface LeadsHeaderProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  onUploadClick: () => void;
  onAddClick: () => void;
}

const LeadsHeader = ({
  searchQuery,
  onSearchChange,
  onUploadClick,
  onAddClick,
}: LeadsHeaderProps) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
      <h1 className="text-3xl font-bold">Leads</h1>
      <div className="flex items-center gap-2">
        <div className="relative w-full sm:w-auto">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search leads..."
            className="w-full sm:w-[200px] pl-8"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
        <Button 
          variant="outline"
          className="sm:flex-1" 
          onClick={onUploadClick}
        >
          <Upload className="mr-2 h-4 w-4" />
          Upload
        </Button>
        <Button 
          className="sm:flex-1"
          onClick={onAddClick}
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>
    </div>
  );
};

export default LeadsHeader;
