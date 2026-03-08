'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useTerminalStore } from '@/stores/terminal-store';
import { TerminalInstance } from '@/components/terminal/terminal-instance';

interface BashTerminalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BashTerminalModal({ open, onOpenChange }: BashTerminalModalProps) {
  const [terminalId, setTerminalId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const terminalIdRef = useRef<string | null>(null);
  const { createCommandTerminal, destroyCommandTerminal } = useTerminalStore();

  const cleanup = useCallback(() => {
    if (terminalIdRef.current) {
      destroyCommandTerminal(terminalIdRef.current);
      terminalIdRef.current = null;
    }
    setTerminalId(null);
    setLoading(true);
  }, [destroyCommandTerminal]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const init = async () => {
      setLoading(true);
      const id = await createCommandTerminal();
      if (cancelled || !id) return;
      terminalIdRef.current = id;
      setTerminalId(id);
      setLoading(false);
    };

    init();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      cleanup();
    }
    onOpenChange(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="w-[90vw] max-w-[900px] h-[80vh] p-0 flex flex-col z-[9999]">
        <DialogHeader className="p-4 pb-2 shrink-0">
          <DialogTitle>Bash Console</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative mx-4 mb-4">
          {loading ? (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Starting shell...
            </div>
          ) : terminalId ? (
            <TerminalInstance terminalId={terminalId} isVisible={true} />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  );
}
