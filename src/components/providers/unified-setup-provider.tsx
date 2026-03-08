'use client';

import { useState, useEffect } from 'react';
import {
  AgentProviderDialog,
  AGENT_PROVIDER_CONFIG_EVENT,
} from '@/components/auth/agent-provider-dialog';

import { UnifiedSetupWizard } from '@/components/setup/unified-setup-wizard';
import { ClaudeCodeTerminalModal } from '@/components/setup/claude-code-terminal-modal';

/**
 * Check if current hostname is localhost
 */
function isLocalhost(): boolean {
  if (typeof window === 'undefined') return true;
  const hostname = window.location.hostname;
  return hostname === 'localhost' || hostname === '127.0.0.1';
}

/**
 * Unified setup provider that replaces AgentProviderConfigProvider + RemoteAccessKeyProvider.
 * Shows a single setup wizard on first load if any of the three setups are unconfigured.
 * Preserves remote blocking behavior: if non-localhost and no API key, blocks children.
 */
export function UnifiedSetupProvider({ children }: { children: React.ReactNode }) {
  const [showWizard, setShowWizard] = useState(false);
  const [showStandaloneDialog, setShowStandaloneDialog] = useState(false);
  const [showClaudeTerminal, setShowClaudeTerminal] = useState(false);
  const [checked, setChecked] = useState(false);
  const [isLocal, setIsLocal] = useState(true);
  const [remoteNeedsApiKey, setRemoteNeedsApiKey] = useState(false);

  const [status, setStatus] = useState({
    agentProvider: false,
    apiAccessKey: false,
    remoteAccess: false,
  });

  useEffect(() => {
    const local = isLocalhost();
    setIsLocal(local);

    const checkAll = async () => {
      const dismissed = localStorage.getItem('setup_wizard_dismissed') === 'true';

      let agentConfigured = false;
      let apiKeyConfigured = false;
      let tunnelConfigured = false;

      // Check all three in parallel
      const [providerRes, apiKeyRes, tunnelRes] = await Promise.allSettled([
        fetch('/api/settings/provider').then(r => r.json()),
        fetch('/api/settings/api-access-key').then(r => r.json()),
        (async () => {
          const localCompleted = localStorage.getItem('onboarding_completed') === 'true';
          if (localCompleted) return { completed: true };
          const res = await fetch('/api/settings?keys=tunnel_subdomain,tunnel_apikey');
          if (res.status === 401) return { completed: false };
          const data = await res.json();
          return { completed: !!(data.tunnel_subdomain && data.tunnel_apikey) };
        })(),
      ]);

      if (providerRes.status === 'fulfilled') {
        const providers = providerRes.value.providers;
        agentConfigured = !!(
          providers?.custom?.configured ||
          providers?.settings?.configured ||
          providers?.console?.configured ||
          providers?.oauth?.configured
        );
      }

      if (apiKeyRes.status === 'fulfilled') {
        apiKeyConfigured = !!apiKeyRes.value.configured;
      }

      // Also check /api/auth/verify for remote access - if authRequired is true, key is set
      if (!local && !apiKeyConfigured) {
        try {
          const authRes = await fetch('/api/auth/verify');
          const authData = await authRes.json();
          if (authData.authRequired === true) {
            apiKeyConfigured = true;
          }
        } catch {
          // Ignore
        }
      }

      if (tunnelRes.status === 'fulfilled') {
        tunnelConfigured = tunnelRes.value.completed;
      }

      setStatus({
        agentProvider: agentConfigured,
        apiAccessKey: apiKeyConfigured,
        remoteAccess: tunnelConfigured,
      });

      // Remote blocking: if non-localhost and no API key, force wizard open
      if (!local && !apiKeyConfigured) {
        setRemoteNeedsApiKey(true);
        // Auto-complete onboarding for remote access users
        localStorage.setItem('onboarding_completed', 'true');
        setShowWizard(true);
        setChecked(true);
        return;
      }

      // If dismissed, don't auto-show wizard
      if (dismissed) {
        setChecked(true);
        return;
      }

      // Show wizard if API access key or tunnel is unconfigured.
      // Agent provider not being configured alone does not trigger the wizard.
      const anyUnconfigured = !apiKeyConfigured || !tunnelConfigured;
      if (anyUnconfigured) {
        setShowWizard(true);
      }

      // Auto-show Claude Code terminal if ~/.claude doesn't exist and hasn't been shown before
      const claudeSetupShown = localStorage.getItem('claude_code_setup_shown') === 'true';
      if (!claudeSetupShown) {
        try {
          const claudeRes = await fetch('/api/settings/claude-setup');
          const claudeData = await claudeRes.json();
          if (!claudeData.configured) {
            setShowClaudeTerminal(true);
          }
        } catch {
          // Ignore — don't block startup
        }
      }

      setChecked(true);
    };

    checkAll();
  }, []);

  // Listen for global events to open the standalone Agent Provider dialog
  useEffect(() => {
    const handleConfigEvent = () => {
      setShowStandaloneDialog(true);
    };

    window.addEventListener(AGENT_PROVIDER_CONFIG_EVENT, handleConfigEvent);
    return () => {
      window.removeEventListener(AGENT_PROVIDER_CONFIG_EVENT, handleConfigEvent);
    };
  }, []);

  const handleWizardClose = (open: boolean) => {
    // If remote and no API key, don't allow closing
    if (remoteNeedsApiKey && !open) {
      return;
    }
    setShowWizard(open);
  };

  // For remote blocking: don't render children until checked, and block if API key needed
  const shouldBlockChildren = !isLocal && (!checked || remoteNeedsApiKey);

  return (
    <>
      {shouldBlockChildren ? null : children}
      <UnifiedSetupWizard
        open={showWizard}
        onOpenChange={handleWizardClose}
        initialStatus={status}
      />
      <AgentProviderDialog
        open={showStandaloneDialog}
        onOpenChange={setShowStandaloneDialog}
      />
      <ClaudeCodeTerminalModal
        open={showClaudeTerminal}
        onOpenChange={(open) => {
          setShowClaudeTerminal(open);
          if (!open) {
            localStorage.setItem('claude_code_setup_shown', 'true');
          }
        }}
        onComplete={() => {
          localStorage.setItem('claude_code_setup_shown', 'true');
        }}
      />
    </>
  );
}
