
import React, { useState } from "react";
import MainLayout from "@/components/layout/MainLayout";
import LeadsList, { Lead } from "@/components/leads/LeadsList";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Upload, UserPlus } from "lucide-react";
import LeadUploadModal from "@/components/leads/LeadUploadModal";
import LeadAddModal from "@/components/leads/LeadAddModal";

const Leads = () => {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [leads, setLeads] = useState<Lead[]>([
    {
      id: "1",
      name: "John Smith",
      company: "Tech Solutions Inc.",
      email: "john.smith@techsolutions.com",
      phone: "(555) 123-4567",
      status: "new",
      source: "Website Contact Form",
      assignedTo: {
        name: "Alex Johnson",
        initials: "AJ",
      },
      date: "Today",
    },
    {
      id: "2",
      name: "Emily Davis",
      company: "Creative Studios",
      email: "emily@creativestudios.com",
      phone: "(555) 987-6543",
      status: "contacted",
      source: "Referral",
      assignedTo: {
        name: "Maria Garcia",
        initials: "MG",
      },
      date: "Yesterday",
    },
    {
      id: "3",
      name: "Michael Brown",
      company: "Global Retail",
      email: "michael@globalretail.com",
      phone: "(555) 456-7890",
      status: "qualified",
      source: "LinkedIn",
      assignedTo: {
        name: "James Smith",
        initials: "JS",
      },
      date: "3 days ago",
    },
    {
      id: "4",
      name: "Sarah Wilson",
      company: "Health Services",
      email: "sarah@healthservices.com",
      phone: "(555) 789-0123",
      status: "proposal",
      source: "Google Search",
      assignedTo: {
        name: "Sarah Wilson",
        initials: "SW",
      },
      date: "1 week ago",
    },
    {
      id: "5",
      name: "Robert Johnson",
      company: "Financial Advisors",
      email: "robert@financialadvisors.com",
      phone: "(555) 234-5678",
      status: "negotiation",
      source: "Trade Show",
      assignedTo: {
        name: "David Lee",
        initials: "DL",
      },
      date: "2 weeks ago",
    },
    {
      id: "6",
      name: "Jennifer Martinez",
      company: "Restaurant Chain",
      email: "jennifer@restaurantchain.com",
      phone: "(555) 345-6789",
      status: "won",
      source: "Email Campaign",
      assignedTo: {
        name: "Alex Johnson",
        initials: "AJ",
      },
      date: "1 month ago",
    },
  ]);

  const handleUploadComplete = () => {
    // In a real app, we would refresh leads data here
    console.log("Upload completed");
  };

  const handleAddLead = (newLead: Lead) => {
    setLeads(prevLeads => [newLead, ...prevLeads]);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <h1 className="text-3xl font-bold">Leads</h1>
          <div className="flex items-center gap-2">
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search leads..."
                className="w-full sm:w-[200px] pl-8"
              />
            </div>
            <Button 
              variant="outline" 
              className="sm:flex-1" 
              onClick={() => setUploadModalOpen(true)}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload
            </Button>
            <Button 
              className="sm:flex-1"
              onClick={() => setAddModalOpen(true)}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </div>
        </div>

        <LeadsList 
          leads={leads}
          onAddLeadClick={() => setAddModalOpen(true)}
        />
        
        <LeadUploadModal 
          open={uploadModalOpen} 
          onOpenChange={setUploadModalOpen} 
          onUploadComplete={handleUploadComplete}
        />

        <LeadAddModal
          open={addModalOpen}
          onOpenChange={setAddModalOpen}
          onLeadAdded={handleAddLead}
        />
      </div>
    </MainLayout>
  );
};

export default Leads;
