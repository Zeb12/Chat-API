
import { useState, useCallback } from 'react';

type CopyStatus = 'idle' | 'copied' | 'error';

export function useCopyToClipboard(): [CopyStatus, (text: string) => void] {
  const [copyStatus, setCopyStatus] = useState<CopyStatus>('idle');

  const copy = useCallback((text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setCopyStatus('copied');
        setTimeout(() => setCopyStatus('idle'), 2000);
      },
      () => {
        setCopyStatus('error');
        setTimeout(() => setCopyStatus('idle'), 2000);
      }
    );
  }, []);

  return [copyStatus, copy];
}
