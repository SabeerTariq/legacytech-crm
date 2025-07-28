import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Building2, Phone, Mail, Settings } from "lucide-react";
// Authentication removed - no user context needed
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Brand {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo_url?: string;
  is_active: boolean;
}

interface BrandSelectorProps {
  onBrandChange?: (brand: Brand) => void;
  showDetails?: boolean;
}

const BrandSelector: React.FC<BrandSelectorProps> = ({ 
  onBrandChange, 
  showDetails = false 
}) => {
  // User context removed - no authentication needed
  const { toast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Default brands from your system
  const defaultBrands: Brand[] = [
    {
      id: "ada",
      name: "American Digital Agency",
      email: "contact@americandigitalagency.com",
      phone: "+1 (555) 123-4567",
      is_active: true,
    },
    {
      id: "skyline",
      name: "Skyline",
      email: "hello@skyline.com",
      phone: "+1 (555) 234-5678",
      is_active: true,
    },
    {
      id: "aztech",
      name: "AZ TECH",
      email: "info@aztech.com",
      phone: "+1 (555) 345-6789",
      is_active: true,
    },
    {
      id: "oscs",
      name: "OSCS",
      email: "contact@oscs.com",
      phone: "+1 (555) 456-7890",
      is_active: true,
    },
  ];

  useEffect(() => {
    fetchBrands();
  }, []);

  const fetchBrands = async () => {
    setIsLoading(true);
    try {
      // For now, use default brands
      // In the future, this would fetch from a brands table
      setBrands(defaultBrands);
      
      // Get user's last selected brand from localStorage or user preferences
      const lastBrandId = localStorage.getItem('selectedBrandId');
      if (lastBrandId) {
        const brand = defaultBrands.find(b => b.id === lastBrandId);
        if (brand) {
          setSelectedBrand(brand);
          onBrandChange?.(brand);
        }
      } else {
        // Default to first brand
        setSelectedBrand(defaultBrands[0]);
        onBrandChange?.(defaultBrands[0]);
      }
    } catch (error) {
      console.error('Error fetching brands:', error);
      toast({
        title: "Error",
        description: "Failed to load brand information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrandChange = (brandId: string) => {
    const brand = brands.find(b => b.id === brandId);
    if (brand) {
      setSelectedBrand(brand);
      localStorage.setItem('selectedBrandId', brandId);
      onBrandChange?.(brand);
      
      toast({
        title: "Brand switched",
        description: `Now working as ${brand.name}`,
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent"></div>
      </div>
    );
  }

  if (!showDetails) {
    return (
      <div className="flex items-center gap-2">
        <Building2 className="h-4 w-4 text-muted-foreground" />
        <Select value={selectedBrand?.id} onValueChange={handleBrandChange}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Select brand" />
          </SelectTrigger>
          <SelectContent>
            {brands.map((brand) => (
              <SelectItem key={brand.id} value={brand.id}>
                {brand.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
    );
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Working Brand
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium">Select Brand</label>
          <Select value={selectedBrand?.id} onValueChange={handleBrandChange}>
            <SelectTrigger>
              <SelectValue placeholder="Choose your working brand" />
            </SelectTrigger>
            <SelectContent>
              {brands.map((brand) => (
                <SelectItem key={brand.id} value={brand.id}>
                  {brand.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectedBrand && (
          <div className="space-y-3 p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Brand Identity</span>
              <Badge variant="secondary">{selectedBrand.name}</Badge>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{selectedBrand.email}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{selectedBrand.phone}</span>
              </div>
            </div>

            <div className="pt-2 border-t">
              <p className="text-xs text-muted-foreground">
                This brand will be used for all outgoing calls and emails
              </p>
            </div>
          </div>
        )}

        <Button variant="outline" size="sm" className="w-full">
          <Settings className="h-4 w-4 mr-2" />
          Manage Brands
        </Button>
      </CardContent>
    </Card>
  );
};

export default BrandSelector; 