import React, { useState } from 'react';
import { Edit, Settings, Users, BarChart3, Trash2, Archive, Download, Share2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../ui/dialog';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';

interface TaskBoard {
  id: string;
  name: string;
  description?: string;
  board_type: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface KanbanBoardHeaderProps {
  board: TaskBoard;
  onUpdateBoard: (board: TaskBoard) => void;
  onDeleteBoard?: () => void;
}

const KanbanBoardHeader: React.FC<KanbanBoardHeaderProps> = ({ board, onUpdateBoard, onDeleteBoard }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [editData, setEditData] = useState({
    name: board.name,
    description: board.description || ''
  });

  const handleSave = async () => {
    if (!editData.name.trim()) {
      toast.error('Board name is required');
      return;
    }

    try {
      const { data, error } = await supabase
        .from('task_boards')
        .update({
          name: editData.name.trim(),
          description: editData.description.trim() || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', board.id)
        .select()
        .single();

      if (error) throw error;

      onUpdateBoard(data);
      setIsEditing(false);
      toast.success('Board updated successfully');
    } catch (error) {
      console.error('Error updating board:', error);
      toast.error('Failed to update board');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      setEditData({ name: board.name, description: board.description || '' });
      setIsEditing(false);
    }
  };

  const handleDeleteBoard = async () => {
    try {
      // First delete all cards in all lists
      const { error: cardsError } = await supabase
        .from('task_cards')
        .delete()
        .in('list_id', 
          (await supabase
            .from('task_lists')
            .select('id')
            .eq('board_id', board.id)
          ).data?.map(list => list.id) || []
        );

      if (cardsError) throw cardsError;

      // Then delete all lists
      const { error: listsError } = await supabase
        .from('task_lists')
        .delete()
        .eq('board_id', board.id);

      if (listsError) throw listsError;

      // Finally delete the board
      const { error: boardError } = await supabase
        .from('task_boards')
        .delete()
        .eq('id', board.id);

      if (boardError) throw boardError;

      toast.success('Board deleted successfully');
      onDeleteBoard?.();
    } catch (error) {
      console.error('Error deleting board:', error);
      toast.error('Failed to delete board');
    }
  };

  const handleArchiveBoard = async () => {
    try {
      const { error } = await supabase
        .from('task_boards')
        .update({ is_archived: true })
        .eq('id', board.id);

      if (error) throw error;

      onUpdateBoard({ ...board, is_archived: true });
      toast.success('Board archived successfully');
    } catch (error) {
      console.error('Error archiving board:', error);
      toast.error('Failed to archive board');
    }
  };

  const handleExportBoard = () => {
    // Create a JSON export of the board data
    const boardData = {
      board,
      lists: [], // This would be populated with actual list data
      cards: []  // This would be populated with actual card data
    };
    
    const dataStr = JSON.stringify(boardData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${board.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_board.json`;
    link.click();
    URL.revokeObjectURL(url);
    
    toast.success('Board exported successfully');
  };

  return (
    <div className="border-b border-gray-200 bg-white px-6 py-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isEditing ? (
            <div className="flex items-center gap-2">
              <Input
                value={editData.name}
                onChange={(e) => setEditData(prev => ({ ...prev, name: e.target.value }))}
                onKeyDown={handleKeyPress}
                className="text-xl font-semibold border-gray-300 focus:ring-2 focus:ring-blue-500"
                autoFocus
              />
              <Button size="sm" onClick={handleSave}>
                Save
              </Button>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => {
                  setEditData({ name: board.name, description: board.description || '' });
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <h1 className="text-xl font-semibold text-gray-900">{board.name}</h1>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsEditing(true)}
                className="h-6 w-6 p-0"
              >
                <Edit className="h-4 w-4" />
              </Button>
            </div>
          )}
          
          <Badge variant="outline" className="capitalize">
            {board.board_type}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Users className="h-4 w-4 mr-2" />
            Members
          </Button>
          
          <Button variant="outline" size="sm">
            <BarChart3 className="h-4 w-4 mr-2" />
            Analytics
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <Settings className="h-4 w-4 mr-2" />
                Settings
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Board
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleExportBoard}>
                <Download className="h-4 w-4 mr-2" />
                Export Board
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleArchiveBoard}>
                <Archive className="h-4 w-4 mr-2" />
                Archive Board
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={() => setShowDeleteDialog(true)}
                className="text-red-600"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Board
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {board.description && (
        <p className="text-sm text-gray-600 mt-2">{board.description}</p>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Board</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete "{board.name}"? This action cannot be undone and will permanently delete all lists and cards in this board.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteBoard}>
              Delete Board
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default KanbanBoardHeader; 