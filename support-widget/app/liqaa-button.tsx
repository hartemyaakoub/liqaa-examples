'use client';

import { useState } from 'react';
import { LIQAA, type LIQAAClient } from '@liqaa/js';

export function SupportButton({ pk }: { pk: string }) {
  const [state, setState] = useState<'idle' | 'connecting' | 'in-call' | 'error'>('idle');
  const [client, setClient] = useState<LIQAAClient | null>(null);
  const [error, setError] = useState('');

  async function start() {
    setState('connecting');
    setError('');
    try {
      const r = await fetch('/api/sdk-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ room: 'support', user: 'guest@web' }),
      });
      if (!r.ok) throw new Error(await r.text());
      const { sdkToken } = await r.json();

      const c = await LIQAA.init({
        publicKey: pk,
        sdkToken,
        accent: '#1d4ed8',
        onCallEnded: () => setState('idle'),
      });
      setClient(c);
      await c.startCall('support@you.com', 'Support agent');
      setState('in-call');
    } catch (e: any) {
      setState('error');
      setError(e.message || 'Could not start the call');
    }
  }

  return (
    <button
      onClick={start}
      disabled={state === 'connecting' || state === 'in-call'}
      style={{
        position: 'fixed', bottom: 24, right: 24,
        padding: '14px 22px', borderRadius: 999, border: 0,
        background: '#0a0d18', color: '#fff', fontWeight: 700, fontSize: 14,
        boxShadow: '0 12px 40px rgba(0,0,0,.18)', cursor: 'pointer',
        display: 'flex', alignItems: 'center', gap: 10,
      }}
    >
      {state === 'idle' && <>🎥 Talk to a human</>}
      {state === 'connecting' && <>⏳ Connecting…</>}
      {state === 'in-call' && <>🔴 In call</>}
      {state === 'error' && <>⚠️ {error.slice(0, 40)}</>}
    </button>
  );
}
