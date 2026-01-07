"use client";

import React, { createContext, useContext, useState } from "react";

interface OrbActivationContextType {
  isOrbActive: boolean;
  activateOrb: () => void;
  deactivateOrb: () => void;
}

const OrbActivationContext = createContext<OrbActivationContextType | null>(null);

export function useOrbActivation() {
  const context = useContext(OrbActivationContext);
  if (!context) {
    throw new Error("useOrbActivation must be used within an OrbActivationProvider");
  }
  return context;
}

export function OrbActivationProvider({ children }: { children: React.ReactNode }) {
  const [isOrbActive, setIsOrbActive] = useState(false);

  const activateOrb = () => setIsOrbActive(true);
  const deactivateOrb = () => setIsOrbActive(false);

  return (
    <OrbActivationContext.Provider value={{
      isOrbActive,
      activateOrb,
      deactivateOrb,
    }}>
      {children}
    </OrbActivationContext.Provider>
  );
}




