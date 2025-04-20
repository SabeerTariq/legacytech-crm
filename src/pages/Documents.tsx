import React, { useState, useEffect } from 'react';
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { FileIcon, FolderIcon, SearchIcon, UploadIcon, PlusIcon } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface Document {
  id: string;
  name: string;
  type: string;
  size: number;
  updated_at: string;
  category: string;
  url: string;
}

interface Folder {
  id: string;
  name: string;
  document_count: number;
}

const DocumentsPage = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [documents, setDocuments] = useState<Document[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDocuments = async () => {
      try {
        const { data, error } = await supabase
          .from('documents')
          .select('*')
          .order('updated_at', { ascending: false });

        if (error) throw error;
        setDocuments(data || []);
      } catch (error) {
        console.error('Error fetching documents:', error);
        toast.error('Failed to load documents');
      } finally {
        setIsLoading(false);
      }
    };

    const fetchFolders = async () => {
      try {
        const { data, error } = await supabase
          .from('folders')
          .select('*')
          .order('name');

        if (error) throw error;
        setFolders(data || []);
      } catch (error) {
        console.error('Error fetching folders:', error);
        toast.error('Failed to load folders');
      }
    };

    fetchDocuments();
    fetchFolders();
  }, []);

  // Filter documents based on search
  const filteredDocuments = documents.filter(doc => 
    doc.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getFileIcon = (type: string) => {
    return <FileIcon className="h-4 w-4" />;
  };

  const getFileBadge = (category: string) => {
    const variants: Record<string, any> = {
      "marketing": { variant: "default", text: "Marketing" },
      "sales": { variant: "secondary", text: "Sales" },
      "finance": { variant: "outline", text: "Finance" },
      "design": { variant: "destructive", text: "Design" },
      "project": { variant: "default", text: "Project" }
    };
    
    const info = variants[category] || { variant: "default", text: category };
    
    return <Badge variant={info.variant}>{info.text}</Badge>;
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <MainLayout>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">Documents</h1>
          <div className="flex space-x-2">
            <Button>
              <PlusIcon className="h-4 w-4 mr-2" />
              New Folder
            </Button>
            <Button>
              <UploadIcon className="h-4 w-4 mr-2" />
              Upload
            </Button>
          </div>
        </div>

        <div className="flex items-center">
          <div className="relative flex-1">
            <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search documents..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all" className="w-full">
          <TabsList>
            <TabsTrigger value="all">All Files</TabsTrigger>
            <TabsTrigger value="recent">Recent</TabsTrigger>
            <TabsTrigger value="shared">Shared</TabsTrigger>
          </TabsList>
          <TabsContent value="all" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              {folders.map((folder) => (
                <Card key={folder.id} className="hover:bg-accent cursor-pointer transition-colors">
                  <CardContent className="p-4 flex flex-col items-center text-center">
                    <FolderIcon className="h-10 w-10 text-blue-500 mb-2" />
                    <h3 className="font-medium">{folder.name}</h3>
                    <p className="text-xs text-muted-foreground">{folder.document_count} files</p>
                  </CardContent>
                </Card>
              ))}
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Files</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[300px]">Name</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Last Modified</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {isLoading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          Loading documents...
                        </TableCell>
                      </TableRow>
                    ) : filteredDocuments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center">
                          No documents found
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredDocuments.map((doc) => (
                        <TableRow key={doc.id}>
                          <TableCell className="font-medium flex items-center">
                            {getFileIcon(doc.type)}
                            <span className="ml-2">{doc.name}</span>
                          </TableCell>
                          <TableCell>{getFileBadge(doc.category)}</TableCell>
                          <TableCell>{formatFileSize(doc.size)}</TableCell>
                          <TableCell className="text-right">
                            {new Date(doc.updated_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="recent">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Recent documents will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="shared">
            <Card>
              <CardContent className="p-6">
                <p className="text-muted-foreground">Shared documents will appear here</p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </MainLayout>
  );
};

export default DocumentsPage;
