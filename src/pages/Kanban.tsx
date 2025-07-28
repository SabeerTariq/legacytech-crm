import React, { useState, useEffect } from 'react';
// Authentication removed - no user context needed
import { supabase } from '../integrations/supabase/client';
import KanbanBoard from '../components/kanban/KanbanBoard';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { toast } from 'sonner';

const Kanban: React.FC = () => {
  // User context removed - no authentication needed
  const [boards, setBoards] = useState<Array<{
    id: string;
    name: string;
    description: string;
    board_type: string;
    created_by: string;
    created_at: string;
    updated_at: string;
  }>>([]);
  const [selectedBoardId, setSelectedBoardId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Load user's boards
  useEffect(() => {
    if (user) {
      loadUserBoards();
    }
  }, [user]);

  const loadUserBoards = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('task_boards')
        .select('*')
        .eq('created_by', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      setBoards(data || []);
      
      // Select the most recent board if available
      if (data && data.length > 0 && !selectedBoardId) {
        setSelectedBoardId(data[0].id);
      }
    } catch (error) {
      console.error('Error loading boards:', error);
      toast.error('Failed to load boards');
    } finally {
      setLoading(false);
    }
  };

  const createNewBoard = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Create new board
      const { data: boardData, error: boardError } = await supabase
        .from('task_boards')
        .insert({
          name: 'New Board',
          description: 'A new kanban board',
          board_type: 'project',
          created_by: user.id
        })
        .select()
        .single();

      if (boardError) throw boardError;

      // Create default lists
      const defaultLists = [
        { name: 'To Do', color: '#e2e8f0', position: 1 },
        { name: 'In Progress', color: '#fbbf24', position: 2 },
        { name: 'Review', color: '#8b5cf6', position: 3 },
        { name: 'Done', color: '#10b981', position: 4 }
      ];

      const { error: listsError } = await supabase
        .from('task_lists')
        .insert(defaultLists.map(list => ({ ...list, board_id: boardData.id })));

      if (listsError) throw listsError;

      // Reload boards and select the new one
      await loadUserBoards();
      setSelectedBoardId(boardData.id);
      toast.success('New board created successfully!');

    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  const refreshBoards = () => {
    loadUserBoards();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
          <div className="text-lg">Loading boards...</div>
        </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
        {/* Board Selector */}
        <div className="p-4 border-b bg-background">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <h1 className="text-2xl font-bold">Kanban Boards</h1>
              {boards.length > 0 && (
                <select
                  value={selectedBoardId || ''}
                  onChange={(e) => setSelectedBoardId(e.target.value)}
                  className="px-3 py-2 border rounded-md bg-background"
                >
                  {boards.map((board) => (
                    <option key={board.id} value={board.id}>
                      {board.name}
                    </option>
                  ))}
                </select>
              )}
            </div>
            <Button onClick={createNewBoard} disabled={loading}>
              <Plus className="w-4 h-4 mr-2" />
              New Board
            </Button>
          </div>
        </div>

        {/* Kanban Board */}
        {selectedBoardId ? (
          <KanbanBoard boardId={selectedBoardId} />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <p className="text-lg text-muted-foreground mb-4">
                No boards found. Create your first board to get started!
              </p>
              <Button onClick={createNewBoard} disabled={loading}>
                <Plus className="w-4 h-4 mr-2" />
                Create First Board
              </Button>
            </div>
          </div>
        )}
      </div>
  );
};

export default Kanban; 