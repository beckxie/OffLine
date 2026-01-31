import { useState, useEffect } from 'react';

interface MemoryStatus {
  used: string;
  limit: string;
  isSupported: boolean;
}

export function useMemoryStatus() {
  const [status, setStatus] = useState<MemoryStatus>({
    used: '0MB',
    limit: '0MB',
    isSupported: false,
  });

  useEffect(() => {
    // Check if performance.memory is supported (Chrome/Edge)
    const perf = (performance as any).memory;
    if (!perf) return;

    const updateMemory = () => {
      const used = Math.round(perf.usedJSHeapSize / 1024 / 1024);
      const limit = Math.round(perf.jsHeapSizeLimit / 1024 / 1024);

      setStatus({
        used: `${used} MB`,
        limit: `${limit} MB`,
        isSupported: true,
      });
    };

    updateMemory();
    const interval = setInterval(updateMemory, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, []);

  return status;
}
