"use client";
import { createContext, useContext, useState, ReactNode } from "react";

type ObjectIdContextType = {
  objectIds: string[];
  addObjectId: (id: string) => void;
};

const ObjectIdContext = createContext<ObjectIdContextType | undefined>(undefined);

export function ObjectIdProvider({ children }: { children: ReactNode }) {
  const [objectIds, setObjectIds] = useState<string[]>([]);

  const addObjectId = (id: string) => setObjectIds((prev) => [...prev, id]);

  return (
    <ObjectIdContext.Provider value={{ objectIds, addObjectId }}>
      {children}
    </ObjectIdContext.Provider>
  );
}

export function useObjectIds() {
  const ctx = useContext(ObjectIdContext);
  if (!ctx) throw new Error("useObjectIds must be used inside ObjectIdProvider");
  return ctx;
}
