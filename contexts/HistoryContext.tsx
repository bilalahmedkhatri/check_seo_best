import React, { createContext, useState, useCallback, useContext, ReactNode } from 'react';

interface Action {
  undo: () => void;
  redo: () => void;
}

interface HistoryContextType {
  undo: () => void;
  redo: () => void;
  pushAction: (action: Action) => void;
  canUndo: boolean;
  canRedo: boolean;
  clearHistory: () => void;
}

const HistoryContext = createContext<HistoryContextType | undefined>(undefined);

export const HistoryProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [undoStack, setUndoStack] = useState<Action[]>([]);
  const [redoStack, setRedoStack] = useState<Action[]>([]);

  const canUndo = undoStack.length > 0;
  const canRedo = redoStack.length > 0;

  const pushAction = useCallback((action: Action) => {
    setUndoStack(prev => [...prev, action]);
    setRedoStack([]); // Clear redo stack on new action
  }, []);

  const undo = useCallback(() => {
    if (!canUndo) return;
    const lastAction = undoStack[undoStack.length - 1];
    lastAction.undo();
    setUndoStack(prev => prev.slice(0, prev.length - 1));
    setRedoStack(prev => [lastAction, ...prev]);
  }, [undoStack, canUndo]);

  const redo = useCallback(() => {
    if (!canRedo) return;
    const nextAction = redoStack[0];
    nextAction.redo();
    setRedoStack(prev => prev.slice(1));
    setUndoStack(prev => [...prev, nextAction]);
  }, [redoStack, canRedo]);
  
  const clearHistory = useCallback(() => {
      setUndoStack([]);
      setRedoStack([]);
  }, []);

  return (
    <HistoryContext.Provider value={{ undo, redo, pushAction, canUndo, canRedo, clearHistory }}>
      {children}
    </HistoryContext.Provider>
  );
};

export const useHistory = () => {
  const context = useContext(HistoryContext);
  if (context === undefined) {
    throw new Error('useHistory must be used within a HistoryProvider');
  }
  return context;
};
