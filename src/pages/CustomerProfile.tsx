import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, ArrowLeft, UploadCloud, Tag, ListChecks } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

interface Customer {
  id: string;
  customer_name: string;
  email: string;
  phone_number: string;
  business_name: string;
  service_sold: string;
  gross_value: number;
  sale_date: string;
  created_at: string;
}

interface Note {
  id: string;
  note: string;
  created_at: string;
  author_id: string;
}

const CustomerProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteInput, setNoteInput] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [tags, setTags] = useState<{ id: string; tag: string }[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [files, setFiles] = useState<{ id: string; file_url: string; file_name: string }[]>([]);
  const [fileUploading, setFileUploading] = useState(false);
  const [tasks, setTasks] = useState<Database["public"]["Tables"]["customer_tasks"]["Row"][]>([]);
  const [taskInput, setTaskInput] = useState({ title: "", description: "", due_date: "" });
  const [taskSubmitting, setTaskSubmitting] = useState(false);

  useEffect(() => {
    if (id) {
      fetchCustomer();
      fetchNotes();
      fetchTags();
      fetchFiles();
      fetchTasks();
    }
    // eslint-disable-next-line
  }, [id]);

  const fetchCustomer = async () => {
    setLoading(true);
    
    try {
      // Check if user is authenticated
      if (!user) {
        toast({
          title: "Authentication Required",
          description: "Please log in to access customer profiles.",
          variant: "destructive",
        });
        navigate('/login');
        return;
      }

      // First, check if the user has permission to access this customer
      if (user?.employee?.department === 'Upseller') {
        // For upsellers, check if this customer is assigned to them through projects
        const { data: assignedProjects, error: projectsError } = await supabase
          .from('projects')
          .select('sales_disposition_id')
          .eq('assigned_pm_id', user.employee.id)
          .eq('sales_disposition_id', id);

        if (projectsError) throw projectsError;

        if (!assignedProjects || assignedProjects.length === 0) {
          // Customer not assigned to this upseller
          toast({
            title: "Access Denied",
            description: "You can only access customers assigned to your projects.",
            variant: "destructive",
          });
          navigate('/customers');
          return;
        }
      } else if (user?.employee?.department === 'Front Sales') {
        // For front sales users, check if this customer was created by them
        const { data: customerData, error: customerError } = await supabase
          .from('sales_dispositions')
          .select('user_id')
          .eq('id', id)
          .single();

        if (customerError) throw customerError;

        if (customerData.user_id !== user.id) {
          // Customer not created by this front sales user
          toast({
            title: "Access Denied",
            description: "You can only access customers you converted from leads.",
            variant: "destructive",
          });
          navigate('/customers');
          return;
        }
      }

      const { data, error } = await supabase
        .from("sales_dispositions")
        .select("*")
        .eq("id", id)
        .single();
        
      if (error) throw error;
      setCustomer(data);
    } catch (error) {
      console.error('Error fetching customer:', error);
      toast({
        title: "Error",
        description: "Failed to load customer profile",
        variant: "destructive",
      });
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  const fetchNotes = async () => {
    const { data } = await supabase
      .from('customer_notes')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false });
    setNotes((data as Note[]) || []);
  };

  const handleAddNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteInput.trim() || !user?.id) return;
    setSubmitting(true);
    const { error } = await supabase
      .from('customer_notes')
      .insert({
        customer_id: id!,
        note: noteInput,
        author_id: user.id,
      });
    setSubmitting(false);
    if (!error) {
      setNoteInput("");
      fetchNotes();
    }
  };

  const fetchTags = async () => {
    const { data } = await supabase
      .from('customer_tags')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false });
    setTags(data || []);
  };
  const handleAddTag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tagInput.trim()) return;
    await supabase.from('customer_tags').insert({ customer_id: id, tag: tagInput });
    setTagInput("");
    fetchTags();
  };
  const fetchFiles = async () => {
    const { data } = await supabase
      .from('customer_files')
      .select('*')
      .eq('customer_id', id)
      .order('uploaded_at', { ascending: false });
    setFiles(data || []);
  };
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !user?.id) return;
    setFileUploading(true);
    const file = e.target.files[0];
    // Assume you have a Supabase Storage bucket named 'customer-files'
    const { data, error } = await supabase.storage.from('customer-files').upload(`${id}/${file.name}`, file);
    if (!error && data) {
      const file_url = data.path;
      await supabase.from('customer_files').insert({ customer_id: id, file_url, file_name: file.name, uploaded_by: user.id });
      fetchFiles();
    }
    setFileUploading(false);
  };
  const fetchTasks = async () => {
    const { data } = await supabase
      .from('customer_tasks')
      .select('*')
      .eq('customer_id', id)
      .order('created_at', { ascending: false });
    setTasks(data || []);
  };
  const handleAddTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.title.trim() || !user?.id) return;
    setTaskSubmitting(true);
    await supabase.from('customer_tasks').insert({
      customer_id: id,
      title: taskInput.title,
      description: taskInput.description,
      due_date: taskInput.due_date || null,
      assigned_to: null,
      created_by: user.id,
    });
    setTaskInput({ title: "", description: "", due_date: "" });
    setTaskSubmitting(false);
    fetchTasks();
  };

  if (loading || !customer) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading customer...</span>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto py-8">
      <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4 flex items-center gap-2">
        <ArrowLeft className="h-4 w-4" /> Back
      </Button>
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">{customer.customer_name}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="mb-2"><span className="font-semibold">Email:</span> {customer.email}</div>
              <div className="mb-2"><span className="font-semibold">Phone:</span> {customer.phone_number}</div>
              <div className="mb-2"><span className="font-semibold">Business:</span> {customer.business_name}</div>
            </div>
            <div>
              <div className="mb-2"><span className="font-semibold">Service Sold:</span> {customer.service_sold}</div>
              <div className="mb-2"><span className="font-semibold">Gross Value:</span> ${customer.gross_value}</div>
              <div className="mb-2"><span className="font-semibold">Sale Date:</span> {new Date(customer.sale_date).toLocaleDateString()}</div>
            </div>
          </div>
        </CardContent>
      </Card>
      <Tabs defaultValue="details" className="w-full">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
          <TabsTrigger value="tags"><Tag className="h-4 w-4 mr-1" />Tags</TabsTrigger>
          <TabsTrigger value="files"><UploadCloud className="h-4 w-4 mr-1" />Files</TabsTrigger>
          <TabsTrigger value="tasks"><ListChecks className="h-4 w-4 mr-1" />Tasks</TabsTrigger>
        </TabsList>
        <TabsContent value="details">
          <div className="p-4">Customer details and future enhancements go here.</div>
        </TabsContent>
        <TabsContent value="notes">
          <div className="p-4">
            <form onSubmit={handleAddNote} className="flex flex-col gap-2 mb-4">
              <Textarea
                value={noteInput}
                onChange={e => setNoteInput(e.target.value)}
                placeholder="Add a note..."
                rows={3}
                required
              />
              <Button type="submit" disabled={submitting || !noteInput.trim()}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Add Note"}
              </Button>
            </form>
            <div className="space-y-4">
              {notes.length === 0 ? (
                <div className="text-muted-foreground">No notes yet.</div>
              ) : (
                notes.map(note => (
                  <Card key={note.id} className="bg-gray-50">
                    <CardContent className="py-2 px-4">
                      <div className="text-sm whitespace-pre-line">{note.note}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {new Date(note.created_at).toLocaleString()}
                      </div>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tags">
          <div className="p-4">
            <form onSubmit={handleAddTag} className="flex gap-2 mb-4">
              <Input value={tagInput} onChange={e => setTagInput(e.target.value)} placeholder="Add tag..." />
              <Button type="submit">Add</Button>
            </form>
            <div className="flex flex-wrap gap-2">
              {tags.map(tag => (
                <span key={tag.id} className="bg-purple-100 text-purple-800 px-3 py-1 rounded-full text-sm">{tag.tag}</span>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="files">
          <div className="p-4">
            <input type="file" onChange={handleFileUpload} disabled={fileUploading} />
            <div className="mt-4 space-y-2">
              {files.map(file => (
                <div key={file.id} className="flex items-center gap-2">
                  <a href={`https://YOUR_SUPABASE_PROJECT.supabase.co/storage/v1/object/public/customer-files/${file.file_url}`} target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">{file.file_name}</a>
                </div>
              ))}
            </div>
          </div>
        </TabsContent>
        <TabsContent value="tasks">
          <div className="p-4">
            <form onSubmit={handleAddTask} className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-4">
              <Input value={taskInput.title} onChange={e => setTaskInput({ ...taskInput, title: e.target.value })} placeholder="Task title" required />
              <Input value={taskInput.due_date} onChange={e => setTaskInput({ ...taskInput, due_date: e.target.value })} placeholder="Due date (YYYY-MM-DD)" type="date" />
              <Input value={taskInput.description} onChange={e => setTaskInput({ ...taskInput, description: e.target.value })} placeholder="Description" />
              <Button type="submit" disabled={taskSubmitting}>Add Task</Button>
            </form>
            <div className="space-y-2">
              {tasks.map(task => (
                <Card key={task.id} className="bg-gray-50">
                  <CardContent className="py-2 px-4">
                    <div className="font-semibold">{task.title}</div>
                    <div className="text-xs text-muted-foreground">Due: {task.due_date ? new Date(task.due_date).toLocaleDateString() : 'N/A'}</div>
                    <div className="text-sm mt-1">{task.description}</div>
                    <div className="text-xs text-muted-foreground mt-1">Status: {task.status}</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default CustomerProfile; 