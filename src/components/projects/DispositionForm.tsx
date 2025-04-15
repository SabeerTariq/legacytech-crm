
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Upload } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DispositionFormProps {
  onSubmit?: (data: any) => void;
}

const DispositionForm: React.FC<DispositionFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agreement, setAgreement] = useState<File | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      toast({
        title: "Form submitted",
        description: "The sales disposition form has been submitted successfully.",
      });
      if (onSubmit) {
        // Get form data and pass to onSubmit
        onSubmit({
          // Form data would be collected here
          agreement: agreement?.name || "None",
        });
      }
    }, 1500);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setAgreement(e.target.files[0]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Sales Disposition Form</CardTitle>
        <CardDescription>
          Complete this form with project details and scope of work
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="client-name">Client Name</Label>
              <Input id="client-name" placeholder="Enter client name" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="project-name">Project Name</Label>
              <Input id="project-name" placeholder="Enter project name" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="project-type">Project Type</Label>
              <Select>
                <SelectTrigger id="project-type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Web Design</SelectLabel>
                    <SelectItem value="website">Website</SelectItem>
                    <SelectItem value="landing-page">Landing Page</SelectItem>
                    <SelectItem value="e-commerce">E-Commerce</SelectItem>
                  </SelectGroup>
                  <SelectGroup>
                    <SelectLabel>Marketing</SelectLabel>
                    <SelectItem value="seo">SEO</SelectItem>
                    <SelectItem value="ppc">PPC Campaign</SelectItem>
                    <SelectItem value="social-media">Social Media</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="budget">Budget</Label>
              <Input id="budget" placeholder="$0.00" type="number" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="timeline">Timeline (weeks)</Label>
              <Input id="timeline" placeholder="0" type="number" />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="scope">Scope of Work</Label>
            <Textarea
              id="scope"
              placeholder="Describe the project scope and deliverables..."
              className="min-h-[150px]"
            />
          </div>

          <div className="space-y-2">
            <Label>Project Manager</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Assign a project manager" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="alex">Alex Johnson</SelectItem>
                <SelectItem value="maria">Maria Garcia</SelectItem>
                <SelectItem value="james">James Smith</SelectItem>
                <SelectItem value="sarah">Sarah Wilson</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Upload Agreement</Label>
            <div className="flex items-center gap-4">
              <div className="grid w-full max-w-sm items-center gap-1.5">
                <Label htmlFor="agreement" className="sr-only">
                  Agreement
                </Label>
                <Input
                  id="agreement"
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                />
              </div>
              <Button type="button" variant="outline" size="icon">
                <Upload className="h-4 w-4" />
              </Button>
            </div>
            {agreement && (
              <p className="text-xs text-muted-foreground">
                Selected: {agreement.name}
              </p>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox id="terms" />
            <Label htmlFor="terms" className="text-sm">
              I confirm that all details are accurate and the client has approved the scope of work
            </Label>
          </div>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" type="button">
            Save Draft
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Submitting..." : "Submit and Create Project"}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default DispositionForm;
