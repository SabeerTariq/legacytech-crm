
import React from "react";
import { Lead } from "./LeadsList";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { DollarSign } from "lucide-react";

interface LeadsPipelineProps {
  leads: Lead[];
}

const LeadsPipeline: React.FC<LeadsPipelineProps> = ({ leads }) => {
  // Group leads by status
  const groupedLeads = leads.reduce<Record<string, Lead[]>>((acc, lead) => {
    if (!acc[lead.status]) {
      acc[lead.status] = [];
    }
    acc[lead.status].push(lead);
    return acc;
  }, {});

  // Define stages and their order
  const stages: { label: string; value: Lead["status"] }[] = [
    { label: "New", value: "new" },
    { label: "Contacted", value: "contacted" },
    { label: "Qualified", value: "qualified" },
    { label: "Proposal", value: "proposal" },
    { label: "Negotiation", value: "negotiation" },
    { label: "Won", value: "won" },
  ];

  // Calculate value for each stage
  const stageValues = stages.map(stage => {
    const stageLeads = groupedLeads[stage.value] || [];
    const count = stageLeads.length;
    const totalValue = stageLeads.reduce((sum, lead) => sum + (lead.value ? Number(lead.value) : 0), 0);
    return {
      ...stage,
      count,
      value: totalValue,
    };
  });

  return (
    <div className="overflow-x-auto">
      <div className="min-w-[900px] flex gap-4">
        {stages.map((stage) => {
          const stageLeads = groupedLeads[stage.value] || [];
          const stageInfo = stageValues.find(s => s.value === stage.value);
          
          return (
            <div key={stage.value} className="w-64 flex-shrink-0">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-semibold">{stage.label}</h3>
                <Badge variant="outline">{stageLeads.length}</Badge>
              </div>
              
              {stageInfo && stageInfo.value > 0 && (
                <div className="mb-3 text-sm flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="h-3.5 w-3.5" />
                  <span>${stageInfo.value.toLocaleString()}</span>
                </div>
              )}
              
              <div className="space-y-3">
                {stageLeads.map((lead) => (
                  <Card key={lead.id} className="hover:shadow-md transition-shadow cursor-pointer">
                    <CardContent className="p-3">
                      <div className="font-medium">{lead.name}</div>
                      <div className="text-sm text-muted-foreground mb-2">{lead.company}</div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-5 w-5">
                            <AvatarImage src={lead.assignedTo.avatar} />
                            <AvatarFallback className="text-xs">{lead.assignedTo.initials}</AvatarFallback>
                          </Avatar>
                          {lead.value && <span className="text-xs font-medium">${lead.value}</span>}
                        </div>
                        <Badge variant="outline" className="text-xs">{lead.source}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default LeadsPipeline;
