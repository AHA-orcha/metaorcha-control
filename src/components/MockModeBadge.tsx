import { IS_MOCK_MODE } from '@/lib/admin-api';
import { AlertCircle } from 'lucide-react';

export function MockModeBadge() {
  if (!IS_MOCK_MODE) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-in slide-in-from-bottom-5">
      <div className="flex items-center gap-2 bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 text-yellow-900 px-4 py-2.5 rounded-lg shadow-lg backdrop-blur-sm">
        <AlertCircle className="w-5 h-5 text-yellow-600 animate-pulse" />
        <div className="flex flex-col">
          <span className="font-bold text-sm">🎭 Mock Mode</span>
          <span className="text-xs text-yellow-700">Demo data only - backend not connected</span>
        </div>
      </div>
    </div>
  );
}
