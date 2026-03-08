'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTerminalStore } from '@/stores/terminal-store';
import { getSocket } from '@/lib/socket-service';
import { TerminalInstance } from '@/components/terminal/terminal-instance';

interface ClaudeCodeTerminalModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onComplete?: () => void;
}

type ModalState = 'loading' | 'active' | 'exited' | 'error';

export function ClaudeCodeTerminalModal({ open, onOpenChange, onComplete }: ClaudeCodeTerminalModalProps) {
  const [state, setState] = useState<ModalState>('loading');
  const [terminalId, setTerminalId] = useState<string | null>(null);
  const [exitCode, setExitCode] = useState<number | null>(null);
  const terminalIdRef = useRef<string | null>(null);
  const { createCommandTerminal, destroyCommandTerminal } = useTerminalStore();

  const cleanup = useCallback(() => {
    if (terminalIdRef.current) {
      destroyCommandTerminal(terminalIdRef.current);
      terminalIdRef.current = null;
    }
    setTerminalId(null);
    setState('loading');
    setExitCode(null);
  }, [destroyCommandTerminal]);

  useEffect(() => {
    if (!open) return;

    let cancelled = false;

    const init = async () => {
      setState('loading');
      const id = await createCommandTerminal('claude');
      if (cancelled || !id) {
        if (!cancelled) setState('error');
        return;
      }
      terminalIdRef.current = id;
      setTerminalId(id);
      setState('active');

      // Listen for exit
      const socket = getSocket();
      const handleExit = (data: { terminalId: string; exitCode: number }) => {
        if (data.terminalId === id) {
          setExitCode(data.exitCode);
          if (data.exitCode === 0) {
            setState('exited');
            onComplete?.();
          } else {
            setState('error');
          }
          socket.off('terminal:exit', handleExit);
        }
      };
      socket.on('terminal:exit', handleExit);
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
          <DialogTitle>Claude Code CLI</DialogTitle>
        </DialogHeader>

        <div className="flex-1 min-h-0 relative mx-4 mb-4">
          {state === 'loading' && (
            <div className="flex items-center justify-center h-full text-muted-foreground">
              Starting Claude Code CLI...
            </div>
          )}

          {state === 'active' && terminalId && (
            <TerminalInstance terminalId={terminalId} isVisible={true} />
          )}

          {state === 'exited' && (
            <div className="flex flex-col items-center justify-center h-full gap-4">
              <div className="text-green-600 dark:text-green-400 font-medium text-lg">
                Claude Code setup complete!
              </div>
              <Button onClick={() => handleOpenChange(false)}>Close</Button>
            </div>
          )}

          {state === 'error' && (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-8 text-center">
              <div className="text-destructive font-medium text-lg">
                Claude Code CLI not found
              </div>
              <div className="text-sm text-muted-foreground space-y-2">
                <p>The <code className="bg-muted px-1 py-0.5 rounded">claude</code> command could not be started{exitCode !== null ? ` (exit code ${exitCode})` : ''}.</p>
                <p>Install it with:</p>
                <pre className="bg-muted p-3 rounded-md text-left">npm install -g @anthropic-ai/claude-code</pre>
                <p>Then try again from the header button.</p>
              </div>
              <Button onClick={() => handleOpenChange(false)}>Close</Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
