import * as Network from "expo-network";
import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;

    const check = async () => {
      const state = await Network.getNetworkStateAsync();
      if (active) {
        setIsConnected(Boolean(state.isConnected));
      }
    };

    void check();
    const interval = setInterval(() => {
      void check();
    }, 10000);

    return () => {
      active = false;
      clearInterval(interval);
    };
  }, []);

  return {
    isConnected,
    label:
      isConnected === null
        ? "Checking local network..."
        : isConnected
          ? "Connected to local school network"
          : "No local network connection"
  };
}
