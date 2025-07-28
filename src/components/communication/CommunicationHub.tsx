import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Phone,
  Mail,
  MessageSquare,
  Clock,
  User,
  Building2,
  Send,
  PhoneCall,
  PhoneOff,
  Mic,
  MicOff,
  Video,
  VideoOff,
  Calendar,
  FileText,
  History,
  Star,
} from "lucide-react";
// Authentication removed - no user context needed
import { useToast } from "@/hooks/use-toast";
import BrandSelector from "@/components/layout/BrandSelector";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone: string;

  lead_id?: string;
  customer_id?: string;
}

interface CommunicationHubProps {
  contact: Contact;
  onCommunicationComplete?: (type: 'call' | 'email' | 'sms', details: any) => void;
}

interface Brand {
  id: string;
  name: string;
  email: string;
  phone: string;
  logo_url?: string;
  is_active: boolean;
}

const CommunicationHub: React.FC<CommunicationHubProps> = ({
  contact,
  onCommunicationComplete,
}) => {
  // User context removed - no authentication needed
  const { toast } = useToast();
  const [selectedBrand, setSelectedBrand] = useState<Brand | null>(null);
  const [isCallActive, setIsCallActive] = useState(false);
  const [isEmailOpen, setIsEmailOpen] = useState(false);
  const [isSMSOpen, setIsSMSOpen] = useState(false);
  const [emailData, setEmailData] = useState({
    subject: "",
    body: "",
    template: "",
  });
  const [smsData, setSmsData] = useState({
    message: "",
    template: "",
  });
  const [callNotes, setCallNotes] = useState("");
  const [callDuration, setCallDuration] = useState(0);
  const [callStartTime, setCallStartTime] = useState<Date | null>(null);

  // Email templates
  const emailTemplates = [
    { id: "follow-up", name: "Follow-up Email", subject: "Following up on our conversation", body: "Hi [Name],\n\nI hope this email finds you well. I wanted to follow up on our recent conversation about [Topic].\n\n[Custom message here]\n\nBest regards,\n[Your Name]\n[Company Name]" },
    { id: "proposal", name: "Proposal Email", subject: "Proposal for [Service]", body: "Hi [Name],\n\nThank you for your interest in our services. I've prepared a detailed proposal for [Service] that I believe will meet your needs.\n\nPlease find the proposal attached.\n\nBest regards,\n[Your Name]\n[Company Name]" },
    { id: "meeting", name: "Meeting Request", subject: "Meeting Request", body: "Hi [Name],\n\nI'd like to schedule a meeting to discuss [Topic] in more detail.\n\nPlease let me know your availability.\n\nBest regards,\n[Your Name]\n[Company Name]" },
  ];

  // SMS templates
  const smsTemplates = [
    { id: "quick-follow", name: "Quick Follow-up", message: "Hi [Name], just following up on our conversation. When would be a good time to connect?" },
    { id: "meeting-reminder", name: "Meeting Reminder", message: "Hi [Name], reminder about our meeting today at [Time]. Looking forward to it!" },
    { id: "proposal-sent", name: "Proposal Sent", message: "Hi [Name], I've sent the proposal to your email. Please let me know if you have any questions." },
  ];

  useEffect(() => {
    // Initialize with default brand
    const defaultBrand: Brand = {
      id: "ada",
      name: "American Digital Agency",
      email: "contact@americandigitalagency.com",
      phone: "+1 (555) 123-4567",
      is_active: true,
    };
    setSelectedBrand(defaultBrand);
  }, []);

  const handleBrandChange = (brand: Brand) => {
    setSelectedBrand(brand);
  };

  const startCall = async () => {
    if (!selectedBrand) {
      toast({
        title: "No brand selected",
        description: "Please select a brand before making calls",
        variant: "destructive",
      });
      return;
    }

    setIsCallActive(true);
    setCallStartTime(new Date());
    setCallDuration(0);

    // Start call timer
    const timer = setInterval(() => {
      setCallDuration(prev => prev + 1);
    }, 1000);

    // Simulate Dialpad API call
    try {
      // In a real implementation, this would integrate with Dialpad API
      console.log(`Initiating call to ${contact.phone} from ${selectedBrand.phone}`);
      
      toast({
        title: "Call initiated",
        description: `Calling ${contact.name} from ${selectedBrand.name}`,
      });

      // Store timer reference for cleanup
      (window as any).callTimer = timer;
    } catch (error) {
      console.error('Error initiating call:', error);
      toast({
        title: "Call failed",
        description: "Failed to initiate call. Please try again.",
        variant: "destructive",
      });
      setIsCallActive(false);
      clearInterval(timer);
    }
  };

  const endCall = () => {
    setIsCallActive(false);
    if ((window as any).callTimer) {
      clearInterval((window as any).callTimer);
    }

    // Log call details
    const callDetails = {
      contact_id: contact.id,
      duration: callDuration,
      notes: callNotes,
      brand: selectedBrand?.name,
      timestamp: new Date().toISOString(),
    };

    console.log('Call ended:', callDetails);
    
    toast({
      title: "Call ended",
      description: `Call duration: ${Math.floor(callDuration / 60)}:${(callDuration % 60).toString().padStart(2, '0')}`,
    });

    onCommunicationComplete?.('call', callDetails);
  };

  const sendEmail = async () => {
    if (!selectedBrand) {
      toast({
        title: "No brand selected",
        description: "Please select a brand before sending emails",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, this would integrate with Gmail API
      console.log(`Sending email to ${contact.email} from ${selectedBrand.email}`);
      
      const emailDetails = {
        to: contact.email,
        from: selectedBrand.email,
        subject: emailData.subject,
        body: emailData.body,
        brand: selectedBrand.name,
        timestamp: new Date().toISOString(),
      };

      console.log('Email sent:', emailDetails);
      
      toast({
        title: "Email sent",
        description: `Email sent to ${contact.name}`,
      });

      setIsEmailOpen(false);
      setEmailData({ subject: "", body: "", template: "" });
      
      onCommunicationComplete?.('email', emailDetails);
    } catch (error) {
      console.error('Error sending email:', error);
      toast({
        title: "Email failed",
        description: "Failed to send email. Please try again.",
        variant: "destructive",
      });
    }
  };

  const sendSMS = async () => {
    if (!selectedBrand) {
      toast({
        title: "No brand selected",
        description: "Please select a brand before sending SMS",
        variant: "destructive",
      });
      return;
    }

    try {
      // In a real implementation, this would integrate with Twilio or Dialpad SMS
      console.log(`Sending SMS to ${contact.phone} from ${selectedBrand.phone}`);
      
      const smsDetails = {
        to: contact.phone,
        from: selectedBrand.phone,
        message: smsData.message,
        brand: selectedBrand.name,
        timestamp: new Date().toISOString(),
      };

      console.log('SMS sent:', smsDetails);
      
      toast({
        title: "SMS sent",
        description: `SMS sent to ${contact.name}`,
      });

      setIsSMSOpen(false);
      setSmsData({ message: "", template: "" });
      
      onCommunicationComplete?.('sms', smsDetails);
    } catch (error) {
      console.error('Error sending SMS:', error);
      toast({
        title: "SMS failed",
        description: "Failed to send SMS. Please try again.",
        variant: "destructive",
      });
    }
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleTemplateChange = (type: 'email' | 'sms', templateId: string) => {
    if (type === 'email') {
      const template = emailTemplates.find(t => t.id === templateId);
      if (template) {
        setEmailData({
          ...emailData,
          template: templateId,
          subject: template.subject.replace('[Name]', contact.name),
          body: template.body
            .replace('[Name]', contact.name)
            .replace('[Your Name]', user?.user_metadata?.full_name || '')
            .replace('[Company Name]', selectedBrand?.name || ''),
        });
      }
    } else {
      const template = smsTemplates.find(t => t.id === templateId);
      if (template) {
        setSmsData({
          ...smsData,
          template: templateId,
          message: template.message.replace('[Name]', contact.name),
        });
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Brand Selector */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Communication Hub</h3>
        <BrandSelector onBrandChange={handleBrandChange} />
      </div>

      {/* Contact Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {contact.name}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span>{contact.email}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span>{contact.phone}</span>
          </div>

        </CardContent>
      </Card>

      {/* Communication Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Call Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Phone className="h-5 w-5" />
              Phone Call
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isCallActive ? (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-green-600">
                    {formatDuration(callDuration)}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Call in progress
                  </div>
                </div>
                
                <div className="flex justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCallNotes(prev => prev + "\n[Muted]")}
                  >
                    <Mic className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCallNotes(prev => prev + "\n[Video on]")}
                  >
                    <Video className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="call-notes">Call Notes</Label>
                  <Textarea
                    id="call-notes"
                    placeholder="Add notes during the call..."
                    value={callNotes}
                    onChange={(e) => setCallNotes(e.target.value)}
                    rows={3}
                  />
                </div>

                <Button
                  variant="destructive"
                  onClick={endCall}
                  className="w-full"
                >
                  <PhoneOff className="h-4 w-4 mr-2" />
                  End Call
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-sm text-muted-foreground mb-2">
                    Call from {selectedBrand?.phone}
                  </div>
                  <Button
                    onClick={startCall}
                    className="w-full"
                    size="lg"
                  >
                    <PhoneCall className="h-4 w-4 mr-2" />
                    Start Call
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Email Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5" />
              Email
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isEmailOpen} onOpenChange={setIsEmailOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Mail className="h-4 w-4 mr-2" />
                  Compose Email
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Send Email to {contact.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email-template">Template</Label>
                    <Select
                      value={emailData.template}
                      onValueChange={(value) => handleTemplateChange('email', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {emailTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-subject">Subject</Label>
                    <Input
                      id="email-subject"
                      value={emailData.subject}
                      onChange={(e) => setEmailData({ ...emailData, subject: e.target.value })}
                      placeholder="Email subject"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email-body">Message</Label>
                    <Textarea
                      id="email-body"
                      value={emailData.body}
                      onChange={(e) => setEmailData({ ...emailData, body: e.target.value })}
                      placeholder="Email message"
                      rows={8}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsEmailOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={sendEmail}>
                      <Send className="h-4 w-4 mr-2" />
                      Send Email
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>

        {/* SMS Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5" />
              SMS
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Dialog open={isSMSOpen} onOpenChange={setIsSMSOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send SMS
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Send SMS to {contact.name}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="sms-template">Template</Label>
                    <Select
                      value={smsData.template}
                      onValueChange={(value) => handleTemplateChange('sms', value)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select template" />
                      </SelectTrigger>
                      <SelectContent>
                        {smsTemplates.map((template) => (
                          <SelectItem key={template.id} value={template.id}>
                            {template.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="sms-message">Message</Label>
                    <Textarea
                      id="sms-message"
                      value={smsData.message}
                      onChange={(e) => setSmsData({ ...smsData, message: e.target.value })}
                      placeholder="SMS message"
                      rows={4}
                      maxLength={160}
                    />
                    <div className="text-xs text-muted-foreground text-right">
                      {smsData.message.length}/160 characters
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button
                      variant="outline"
                      onClick={() => setIsSMSOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={sendSMS}>
                      <Send className="h-4 w-4 mr-2" />
                      Send SMS
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      </div>

      {/* Communication History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Communication History
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            Communication history will be displayed here
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CommunicationHub; 