import { createContext, useContext, useState, type ReactNode } from 'react';

interface SelectionState {
  selectedIds: Set<number>;
  nSelect: number | null;
}

interface SelectionContextType {
  selection: SelectionState;
  setSelection: (s: SelectionState) => void;
}

const SelectionContext = createContext<SelectionContextType | undefined>(undefined);

export function SelectionProvider({ children }: { children: ReactNode }) {
  const [selection, setSelection] = useState<SelectionState>({
    selectedIds: new Set(),
    nSelect: null
  });
  const setSelectionWrapper = (s: SelectionState) => setSelection(s);
  return (
    <SelectionContext.Provider value={{ selection, setSelection: setSelectionWrapper }}>
      {children}
    </SelectionContext.Provider>
  );
}

export function useSelection() {
  const ctx = useContext(SelectionContext);
  if (!ctx) throw new Error('useSelection must be used inside SelectionProvider');
  return ctx;
}
