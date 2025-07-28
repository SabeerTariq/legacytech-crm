import React, { useState, useEffect } from 'react';
import { DndContext, DragEndEvent, DragStartEvent, DragOverEvent } from '@dnd-kit/core';
import { SortableContext, horizontalListSortingStrategy } from '@dnd-kit/sortable';
import { supabase } from '../../integrations/supabase/client';
// Authentication removed - no user context needed
import KanbanList from './KanbanList';
import KanbanBoardHeader from './KanbanBoardHeader';
import { Button } from '../ui/button';
import { Plus, PlusCircle } from 'lucide-react';
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

interface TaskList {
  id: string;
  board_id: string;
  name: string;
  position: number;
  color: string;
  wip_limit?: number;
  created_at: string;
}

interface TaskCard {
  id: string;
  list_id: string;
  title: string;
  description?: string;
  position: number;
  due_date?: string;
  priority: string;
  status: string;
  assigned_to?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

interface KanbanBoardProps {
  boardId?: string;
  boardType?: 'project' | 'department' | 'personal';
}

const KanbanBoard: React.FC<KanbanBoardProps> = ({ boardId, boardType = 'project' }) => {
  // User context removed - no authentication needed
  const [board, setBoard] = useState<TaskBoard | null>(null);
  const [lists, setLists] = useState<TaskList[]>([]);
  const [cards, setCards] = useState<TaskCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeId, setActiveId] = useState<string | null>(null);

  // Load board data
  useEffect(() => {
    if (boardId) {
      loadBoardData(boardId);
    } else {
      createDefaultBoard();
    }
  }, [boardId, user]);

  const loadBoardData = async (id: string) => {
    try {
      setLoading(true);
      
      // Load board
      const { data: boardData, error: boardError } = await supabase
        .from('task_boards')
        .select('*')
        .eq('id', id)
        .single();

      if (boardError) throw boardError;
      setBoard(boardData);

      // Load lists
      const { data: listsData, error: listsError } = await supabase
        .from('task_lists')
        .select('*')
        .eq('board_id', id)
        .order('position');

      if (listsError) throw listsError;
      
      // Ensure lists are sorted by position
      const sortedLists = (listsData || []).sort((a, b) => a.position - b.position);
      setLists(sortedLists);

      // Load cards
      const { data: cardsData, error: cardsError } = await supabase
        .from('task_cards')
        .select('*')
        .in('list_id', listsData?.map(l => l.id) || [])
        .order('position');

      if (cardsError) throw cardsError;
      setCards(cardsData || []);

    } catch (error) {
      console.error('Error loading board data:', error);
      toast.error('Failed to load board data');
    } finally {
      setLoading(false);
    }
  };

  const createDefaultBoard = async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Create new board
      const { data: boardData, error: boardError } = await supabase
        .from('task_boards')
        .insert({
          name: 'New Board',
          description: 'A new kanban board',
          board_type: boardType,
          created_by: user.id
        })
        .select()
        .single();

      if (boardError) throw boardError;
      setBoard(boardData);

      // Create default lists
      const defaultLists = [
        { name: 'To Do', color: '#e2e8f0', position: 1 },
        { name: 'In Progress', color: '#fbbf24', position: 2 },
        { name: 'Review', color: '#8b5cf6', position: 3 },
        { name: 'Done', color: '#10b981', position: 4 }
      ];

      const { data: listsData, error: listsError } = await supabase
        .from('task_lists')
        .insert(defaultLists.map(list => ({ ...list, board_id: boardData.id })))
        .select();

      if (listsError) throw listsError;
      setLists(listsData || []);
      setCards([]);

    } catch (error) {
      console.error('Error creating board:', error);
      toast.error('Failed to create board');
    } finally {
      setLoading(false);
    }
  };

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragOver = (event: DragOverEvent) => {
    // Handle drag over logic if needed
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    // Check if it's a card being moved
    if (activeId.startsWith('card-')) {
      const cardId = activeId.replace('card-', '');
      const targetListId = overId.startsWith('list-') ? overId.replace('list-', '') : null;
      
      if (targetListId) {
        await moveCard(cardId, targetListId);
      }
    }
    
    // Check if it's a list being moved
    if (activeId.startsWith('list-')) {
      const listId = activeId.replace('list-', '');
      const targetListId = overId.startsWith('list-') ? overId.replace('list-', '') : null;
      
      if (targetListId && listId !== targetListId) {
        await moveList(listId, targetListId);
      }
    }
  };

  const moveCard = async (cardId: string, targetListId: string) => {
    try {
      // Update card's list_id
      const { error } = await supabase
        .from('task_cards')
        .update({ list_id: targetListId })
        .eq('id', cardId);

      if (error) throw error;

      // Update local state
      setCards(prev => prev.map(card => 
        card.id === cardId ? { ...card, list_id: targetListId } : card
      ));

      // Log activity
      await supabase.from('task_activities').insert({
        board_id: board?.id,
        card_id: cardId,
        user_id: user?.id,
        action: 'moved',
        details: { from_list: 'previous', to_list: targetListId }
      });

      toast.success('Card moved successfully');
    } catch (error) {
      console.error('Error moving card:', error);
      toast.error('Failed to move card');
    }
  };

  const moveList = async (listId: string, targetListId: string) => {
    try {
      const activeList = lists.find(list => list.id === listId);
      const targetList = lists.find(list => list.id === targetListId);
      
      if (!activeList || !targetList) return;

      // Calculate new positions
      const activeIndex = lists.findIndex(list => list.id === listId);
      const targetIndex = lists.findIndex(list => list.id === targetListId);
      
      let newPosition: number;
      if (activeIndex < targetIndex) {
        // Moving right
        newPosition = targetList.position + 1;
      } else {
        // Moving left
        newPosition = targetList.position - 1;
      }

      // Update the moved list's position
      const { data: updatedList, error } = await supabase
        .from('task_lists')
        .update({ position: newPosition })
        .eq('id', listId)
        .select()
        .single();

      if (error) throw error;

      // Update local state instead of reloading
      setLists(prev => prev.map(list => 
        list.id === listId ? updatedList : list
      ).sort((a, b) => a.position - b.position));

      toast.success('List moved successfully');
    } catch (error) {
      console.error('Error moving list:', error);
      toast.error('Failed to move list');
    }
  };

  const addNewList = async () => {
    if (!board) return;

    try {
      const newPosition = lists.length + 1;
      const { data, error } = await supabase
        .from('task_lists')
        .insert({
          board_id: board.id,
          name: 'New List',
          position: newPosition,
          color: '#e2e8f0'
        })
        .select()
        .single();

      if (error) throw error;
      setLists(prev => [...prev, data]);
      toast.success('New list added');
    } catch (error) {
      console.error('Error adding list:', error);
      toast.error('Failed to add list');
    }
  };

  const addNewCard = async (card: TaskCard) => {
    setCards(prev => [...prev, card]);
  };

  const updateCard = (updatedCard: TaskCard) => {
    setCards(prev => prev.map(card => card.id === updatedCard.id ? updatedCard : card));
  };

  const deleteCard = (cardId: string) => {
    setCards(prev => prev.filter(card => card.id !== cardId));
  };

  const updateList = (updatedList: TaskList) => {
    setLists(prev => prev.map(list => list.id === updatedList.id ? updatedList : list));
  };

  const deleteList = (listId: string) => {
    setLists(prev => prev.filter(list => list.id !== listId));
    // Also delete all cards in this list
    setCards(prev => prev.filter(card => card.list_id !== listId));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Loading board...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">Please log in to access the Kanban board</div>
      </div>
    );
  }

  if (!board) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg">No board found. Creating new board...</div>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      <KanbanBoardHeader 
        board={board} 
        onUpdateBoard={(updatedBoard) => setBoard(updatedBoard)}
        onDeleteBoard={() => {
          // Navigate back to board selection or create new board
          window.location.href = '/kanban';
        }}
      />
      
      <div className="flex-1 overflow-x-auto p-4">
        <DndContext
          onDragStart={handleDragStart}
          onDragOver={handleDragOver}
          onDragEnd={handleDragEnd}
        >
          <div className="flex gap-4 h-full">
            <SortableContext 
              items={lists.map(list => `list-${list.id}`)}
              strategy={horizontalListSortingStrategy}
            >
              {lists.map((list) => (
                <KanbanList
                  key={list.id}
                  list={list}
                  cards={cards.filter(card => card.list_id === list.id)}
                  onAddCard={addNewCard}
                  onUpdateCard={updateCard}
                  onDeleteCard={deleteCard}
                  onDeleteList={deleteList}
                  onUpdateList={updateList}
                />
              ))}
            </SortableContext>
            
            <div className="flex-shrink-0">
              <Button
                onClick={addNewList}
                variant="outline"
                className="h-12 w-64 border-dashed border-2 border-gray-300 hover:border-gray-400"
              >
                <PlusCircle className="mr-2 h-4 w-4" />
                Add List
              </Button>
            </div>
          </div>
        </DndContext>
      </div>
    </div>
  );
};

export default KanbanBoard; 