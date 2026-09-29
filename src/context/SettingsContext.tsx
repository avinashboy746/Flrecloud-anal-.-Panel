import React, { createContext, useContext, useState, useEffect } from "react";
import axios from "axios";

export const SettingsContext = createContext<any>(null);

export const SettingsProvider = ({ children }: { children: React.ReactNode }) => {
  const [panelName, setPanelName] = useState<string>("FireCloud");

  const fetchSettings = async () => {
    try {
      const res = await axios.get("/api/config");
      if (res.data.panelName) {
        setPanelName(res.data.panelName);
      }
    } catch (e) {
      try {
        const res2 = await axios.get("/api/system/settings");
        if (res2.data.panelName) {
          setPanelName(res2.data.panelName);
        }
      } catch (err) {}
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return (
    <SettingsContext.Provider value={{ panelName, setPanelName, fetchSettings }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
