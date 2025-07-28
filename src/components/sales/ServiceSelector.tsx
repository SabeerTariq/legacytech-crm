import React, { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Checkbox } from "@/components/ui/checkbox";
import { 
  Search, 
  FileText, 
  CreditCard, 
  Calendar,
  DollarSign,
  Clock,
  CheckCircle,
  Plus,
  X
} from "lucide-react";
import type { Service, ServiceSelection, ServiceType, ServiceCategory } from "@/types/upsell";

interface ServiceSelectorProps {
  onServicesChange: (services: ServiceSelection[]) => void;
  selectedServices: ServiceSelection[];
  showServiceTypes?: boolean;
}

const ServiceSelector: React.FC<ServiceSelectorProps> = ({
  onServicesChange,
  selectedServices,
  showServiceTypes = true
}) => {
  const { toast } = useToast();
  const [services, setServices] = useState<Service[]>([]);
  const [filteredServices, setFilteredServices] = useState<Service[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | "all">("all");
  const [loading, setLoading] = useState(false);

  // Load services
  useEffect(() => {
    loadServices();
  }, []);

  const loadServices = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("services")
        .select("*")
        .order("name");

      if (error) throw error;

      // Transform data to match Service interface
      const transformedServices: Service[] = (data || []).map((service: any) => ({
        id: service.id,
        name: service.name,
        service_type: service.service_type || 'project',
        billing_frequency: service.billing_frequency,
        category: service.category || 'development',
        price: service.price || 0,
        description: service.description,
        created_at: service.created_at,
        updated_at: service.updated_at
      }));

      setServices(transformedServices);
      setFilteredServices(transformedServices);
    } catch (error) {
      console.error("Error loading services:", error);
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter services based on search term and category
  useEffect(() => {
    let filtered = services;

    // Filter by search term
    if (searchTerm.trim()) {
      filtered = filtered.filter(service =>
        service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        service.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(service => service.category === selectedCategory);
    }

    setFilteredServices(filtered);
  }, [searchTerm, selectedCategory, services]);

  const handleServiceToggle = (service: Service) => {
    const isSelected = selectedServices.some(s => s.serviceId === service.id);
    
    if (isSelected) {
      // Remove service
      const updatedServices = selectedServices.filter(s => s.serviceId !== service.id);
      onServicesChange(updatedServices);
    } else {
      // Add service
      const newService: ServiceSelection = {
        serviceId: service.id,
        serviceName: service.name,
        serviceType: service.service_type,
        billingFrequency: service.billing_frequency,
        category: service.category,
        price: service.price,
        details: "",
        quantity: 1
      };
      onServicesChange([...selectedServices, newService]);
    }
  };

  const updateServiceDetails = (serviceId: string, field: keyof ServiceSelection, value: string | number) => {
    const updatedServices = selectedServices.map(service =>
      service.serviceId === serviceId ? { ...service, [field]: value } : service
    );
    onServicesChange(updatedServices);
  };

  const removeService = (serviceId: string) => {
    const updatedServices = selectedServices.filter(s => s.serviceId !== serviceId);
    onServicesChange(updatedServices);
  };

  const getServiceTypeIcon = (serviceType: ServiceType) => {
    switch (serviceType) {
      case 'project':
        return <FileText className="h-4 w-4" />;
      case 'recurring':
        return <CreditCard className="h-4 w-4" />;
      case 'one-time':
        return <Clock className="h-4 w-4" />;
      default:
        return <FileText className="h-4 w-4" />;
    }
  };

  const getServiceTypeColor = (serviceType: ServiceType) => {
    switch (serviceType) {
      case 'project':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'recurring':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'one-time':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getCategoryColor = (category: ServiceCategory) => {
    switch (category) {
      case 'hosting':
        return 'bg-purple-100 text-purple-800';
      case 'domain':
        return 'bg-indigo-100 text-indigo-800';
      case 'ssl':
        return 'bg-yellow-100 text-yellow-800';
      case 'development':
        return 'bg-blue-100 text-blue-800';
      case 'design':
        return 'bg-pink-100 text-pink-800';
      case 'marketing':
        return 'bg-green-100 text-green-800';
      case 'email':
        return 'bg-cyan-100 text-cyan-800';
      case 'consultation':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const categories: ServiceCategory[] = ['hosting', 'domain', 'ssl', 'development', 'design', 'marketing', 'email', 'consultation'];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Select Services
          {showServiceTypes && (
            <Badge variant="secondary" className="ml-2">
              Mixed Service Types
            </Badge>
          )}
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Choose services to upsell. Services are categorized by type and billing frequency.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Search and Filter */}
        <div className="space-y-2">
          <Label htmlFor="serviceSearch">Search Services</Label>
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="serviceSearch"
              placeholder="Search services..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="space-y-2">
          <Label>Filter by Category</Label>
          <div className="flex flex-wrap gap-2">
            <Button
              variant={selectedCategory === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory("all")}
            >
              All Categories
            </Button>
            {categories.map((category) => (
              <Button
                key={category}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(category)}
                className={selectedCategory === category ? getCategoryColor(category) : ""}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </Button>
            ))}
          </div>
        </div>

        {/* Service Type Legend */}
        {showServiceTypes && (
          <div className="space-y-2">
            <Label>Service Types</Label>
            <div className="flex gap-4 text-sm">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <span>Project-based</span>
              </div>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                <span>Recurring</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-orange-600" />
                <span>One-time</span>
              </div>
            </div>
          </div>
        )}

        {/* Services List */}
        <div className="space-y-2">
          <Label>Available Services</Label>
          {loading ? (
            <div className="text-center py-4">Loading services...</div>
          ) : filteredServices.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              {searchTerm ? "No services found matching your search" : "No services available"}
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredServices.map((service) => {
                const isSelected = selectedServices.some(s => s.serviceId === service.id);
                return (
                  <div
                    key={service.id}
                    className={`p-4 border rounded-lg transition-colors ${
                      isSelected ? 'border-primary bg-primary/5' : 'hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3 flex-1">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={() => handleServiceToggle(service)}
                        />
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{service.name}</span>
                            {showServiceTypes && (
                              <Badge variant="outline" className={`text-xs ${getServiceTypeColor(service.service_type)}`}>
                                {getServiceTypeIcon(service.service_type)}
                                <span className="ml-1">{service.service_type}</span>
                              </Badge>
                            )}
                            <Badge variant="outline" className={`text-xs ${getCategoryColor(service.category)}`}>
                              {service.category}
                            </Badge>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            ${service.price.toLocaleString()}
                            {service.billing_frequency && service.billing_frequency !== 'one-time' && (
                              <span> / {service.billing_frequency}</span>
                            )}
                          </div>
                          {service.description && (
                            <div className="text-sm text-muted-foreground">{service.description}</div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Selected Services */}
        {selectedServices.length > 0 && (
          <div className="space-y-4">
            <Separator />
            <div>
              <Label>Selected Services ({selectedServices.length})</Label>
              <div className="space-y-2 mt-2">
                {selectedServices.map((service) => (
                  <div key={service.serviceId} className="p-3 border rounded-lg bg-muted/30">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{service.serviceName}</span>
                          <Badge variant="outline" className={`text-xs ${getServiceTypeColor(service.serviceType)}`}>
                            {getServiceTypeIcon(service.serviceType)}
                            <span className="ml-1">{service.serviceType}</span>
                          </Badge>
                        </div>
                        <div className="text-sm text-muted-foreground mt-1">
                          ${service.price.toLocaleString()}
                          {service.billingFrequency && service.billingFrequency !== 'one-time' && (
                            <span> / {service.billingFrequency}</span>
                          )}
                        </div>
                        <div className="mt-2">
                          <Label htmlFor={`details-${service.serviceId}`} className="text-xs">
                            Service Details
                          </Label>
                          <Input
                            id={`details-${service.serviceId}`}
                            value={service.details}
                            onChange={(e) => updateServiceDetails(service.serviceId, 'details', e.target.value)}
                            placeholder="Add specific requirements or notes..."
                            className="mt-1"
                          />
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => removeService(service.serviceId)}
                        className="ml-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ServiceSelector; 