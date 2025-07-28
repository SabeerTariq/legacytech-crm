import React from "react";
import { Button } from "@/components/ui/button";
import { Plus, Bot } from "lucide-react";

interface LeadsHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onAddClick: () => void;
  onScraperClick?: () => void;
  isLeadScraper?: boolean;
  selectedMonth: number;
  onMonthChange: (value: string) => void;
}

const LeadsHeader: React.FC<LeadsHeaderProps> = ({
  onAddClick,
  onScraperClick,
  isLeadScraper = false,
  selectedMonth,
  onMonthChange,
}) => {
  const monthOptions = [
    { value: "0", label: "All Time" },
    { value: "1", label: "Last Month" },
    { value: "2", label: "2 Months Ago" },
    { value: "3", label: "3 Months Ago" },
    { value: "6", label: "6 Months Ago" },
  ];

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Manage and track your sales leads
        </p>
      </div>
      
      <div className="flex items-center gap-2">
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          className="px-3 py-2 border border-input bg-background rounded-md text-sm"
        >
          {monthOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        {isLeadScraper && onScraperClick && (
          <Button onClick={onScraperClick} variant="outline">
            <Bot className="mr-2 h-4 w-4" />
            Lead Scraper
          </Button>
        )}
        
        <Button onClick={onAddClick}>
          <Plus className="mr-2 h-4 w-4" />
          Add Lead
        </Button>
      </div>
    </div>
  );
};

export default LeadsHeader;
