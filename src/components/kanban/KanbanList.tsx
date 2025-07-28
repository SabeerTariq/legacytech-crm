import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreHorizontal, Edit, Trash2, X, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';
import { Card, CardContent } from '../ui/card';
import { Badge } from '../ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { supabase } from '../../integrations/supabase/client';
import { toast } from 'sonner';
import KanbanCard from './KanbanCard';

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

interface KanbanListProps {
  list: TaskList;
  cards: TaskCard[];
  onAddCard: (card: TaskCard) => void;
  onUpdateCard: (card: TaskCard) => void;
  onDeleteCard: (cardId: string) => void;
  onDeleteList: (listId: string) => void;
  onUpdateList: (list: TaskList) => void;
}

const KanbanList: React.FC<KanbanListProps> = ({
  list,
  cards,
  onAddCard,
  onUpdateCard,
  onDeleteCard,
  onDeleteList,
  onUpdateList
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isAddingCard, setIsAddingCard] = useState(false);
  const [listName, setListName] = useState(list.name);
  const [newCardData, setNewCardData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    due_date: ''
  });

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `list-${list.id}`,
    data: {
      type: 'list',
      list,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setListName(e.target.value);
  };

  const handleNameBlur = async () => {
    if (listName.trim() !== list.name) {
      try {
        const { data, error } = await supabase
          .from('task_lists')
          .update({ name: listName.trim() })
          .eq('id', list.id)
          .select()
          .single();

        if (error) throw error;
        onUpdateList(data);
        toast.success('List name updated');
      } catch (error) {
        console.error('Error updating list name:', error);
        setListName(list.name);
        toast.error('Failed to update list name');
      }
    }
    setIsEditing(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleNameBlur();
    } else if (e.key === 'Escape') {
      setListName(list.name);
      setIsEditing(false);
    }
  };

  const handleDeleteList = async () => {
    try {
      const { error } = await supabase
        .from('task_lists')
        .delete()
        .eq('id', list.id);

      if (error) throw error;
      onDeleteList(list.id);
      toast.success('List deleted successfully');
    } catch (error) {
      console.error('Error deleting list:', error);
      toast.error('Failed to delete list');
    }
  };

  const handleCreateCard = async () => {
    if (!newCardData.title.trim()) {
      toast.error('Card title is required');
      return;
    }

    try {
      const listCards = cards.filter(card => card.list_id === list.id);
      const newPosition = listCards.length + 1;

      const { data, error } = await supabase
        .from('task_cards')
        .insert({
          list_id: list.id,
          title: newCardData.title.trim(),
          description: newCardData.description.trim() || null,
          priority: newCardData.priority,
          due_date: newCardData.due_date || null,
          position: newPosition,
          created_by: (await supabase.auth.getUser()).data.user?.id
        })
        .select()
        .single();

      if (error) throw error;
      
      onAddCard(data);
      setNewCardData({ title: '', description: '', priority: 'medium', due_date: '' });
      setIsAddingCard(false);
      toast.success('Card created successfully');
    } catch (error) {
      console.error('Error creating card:', error);
      toast.error('Failed to create card');
    }
  };

  const handleCancelAddCard = () => {
    setNewCardData({ title: '', description: '', priority: 'medium', due_date: '' });
    setIsAddingCard(false);
  };

  const cardCount = cards.length;
  const wipLimit = list.wip_limit;
  const isOverLimit = wipLimit && cardCount > wipLimit;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 border border-gray-200"
    >
      {/* List Header - Draggable */}
      <div 
        {...attributes}
        {...listeners}
        className="flex items-center justify-between mb-4 cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-2 flex-1">
          <GripVertical className="h-4 w-4 text-gray-400" />
          {isEditing ? (
            <input
              type="text"
              value={listName}
              onChange={handleNameChange}
              onBlur={handleNameBlur}
              onKeyDown={handleKeyPress}
              className="flex-1 px-2 py-1 text-sm font-medium bg-white border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
              autoFocus
            />
          ) : (
            <h3 
              className="text-sm font-medium text-gray-900 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
              onClick={() => setIsEditing(true)}
            >
              {list.name}
            </h3>
          )}
          <Badge variant="secondary" className="text-xs">
            {cardCount}
            {wipLimit && `/${wipLimit}`}
          </Badge>
          {isOverLimit && (
            <Badge variant="destructive" className="text-xs">
              Over Limit
            </Badge>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setIsEditing(true)}>
              <Edit className="h-4 w-4 mr-2" />
              Rename List
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setIsAddingCard(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Card
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleDeleteList} className="text-red-600">
              <Trash2 className="h-4 w-4 mr-2" />
              Delete List
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Cards Container */}
      <div className="space-y-2 min-h-[200px]">
        <SortableContext 
          items={cards.map(card => `card-${card.id}`)}
          strategy={verticalListSortingStrategy}
        >
          {cards.map((card) => (
            <KanbanCard
              key={card.id}
              card={card}
              onUpdate={onUpdateCard}
              onDelete={onDeleteCard}
            />
          ))}
        </SortableContext>
      </div>

      {/* Add Card Form */}
      {isAddingCard ? (
        <Card className="mt-3">
          <CardContent className="p-3">
            <div className="space-y-3">
              <Input
                placeholder="Enter card title..."
                value={newCardData.title}
                onChange={(e) => setNewCardData(prev => ({ ...prev, title: e.target.value }))}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateCard();
                  } else if (e.key === 'Escape') {
                    handleCancelAddCard();
                  }
                }}
                autoFocus
              />
              
              <Textarea
                placeholder="Add a description..."
                value={newCardData.description}
                onChange={(e) => setNewCardData(prev => ({ ...prev, description: e.target.value }))}
                rows={2}
              />
              
              <div className="flex gap-2">
                <Select
                  value={newCardData.priority}
                  onValueChange={(value) => setNewCardData(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger className="w-24">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="urgent">Urgent</SelectItem>
                  </SelectContent>
                </Select>
                
                <Input
                  type="date"
                  value={newCardData.due_date}
                  onChange={(e) => setNewCardData(prev => ({ ...prev, due_date: e.target.value }))}
                  className="flex-1"
                />
              </div>
              
              <div className="flex gap-2">
                <Button size="sm" onClick={handleCreateCard}>
                  Add Card
                </Button>
                <Button size="sm" variant="outline" onClick={handleCancelAddCard}>
                  Cancel
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Add Card Button */
        <Button
          onClick={() => setIsAddingCard(true)}
          variant="ghost"
          size="sm"
          className="w-full mt-3 text-gray-500 hover:text-gray-700 hover:bg-gray-100"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Card
        </Button>
      )}
    </div>
  );
};

export default KanbanList; 