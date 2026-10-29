import React, { useState } from 'react';
import { Wifi, Copy, Check, Smartphone, Info } from 'lucide-react';

export const LanShareBanner: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const currentUrl = typeof window !== 'undefined' ? window.location.origin : '';
  const hostname = typeof window !== 'undefined' ? window.location.hostname : 'localhost';
  const isLocalhost = hostname === 'localhost' || hostname === '127.0.0.1';

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(currentUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="bg-gradient-to-r from-wood-800 via-wood-700 to-wood-800 text-wood-50 px-4 py-2.5 shadow-md border-b border-wood-600/40 text-sm">
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2.5">
        <div className="flex items-center gap-2 text-center sm:text-left">
          <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-lg shrink-0">
            <Wifi className="w-4 h-4 animate-pulse" />
          </div>
          <div>
            <span className="font-semibold text-amber-300">Office Wi-Fi Access:</span>{' '}
            <span>Employees can join and register from mobile phones at:</span>{' '}
            <code className="bg-wood-900/80 text-amber-200 px-2 py-0.5 rounded font-mono font-semibold text-xs sm:text-sm border border-wood-600">
              {currentUrl}
            </code>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isLocalhost && (
            <span className="hidden md:inline-flex items-center gap-1 text-xs text-amber-200/80 bg-wood-900/60 px-2 py-0.5 rounded">
              <Info className="w-3.5 h-3.5" /> Open via Host LAN IP (e.g. 192.168.x.x) for phones
            </span>
          )}
          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 bg-amber-600 hover:bg-amber-500 text-white font-medium text-xs px-3 py-1.5 rounded-md transition shadow-sm"
            title="Copy URL to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-green-200" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Link</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

