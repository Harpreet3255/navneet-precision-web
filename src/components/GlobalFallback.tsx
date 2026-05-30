import React from 'react';
import { AlertCircle, RefreshCcw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface GlobalFallbackProps {
    error: Error;
    resetErrorBoundary?: () => void;
}

export const GlobalFallback: React.FC<GlobalFallbackProps> = ({ error, resetErrorBoundary }) => {
    return (
        <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 text-slate-200 font-sans">
            <div className="max-w-md w-full glass-panel border border-red-500/20 rounded-xl p-8 shadow-2xl bg-slate-900/50 backdrop-blur-xl animate-scale-in">
                <div className="flex flex-col items-center text-center space-y-4">
                    <div className="p-4 bg-red-500/10 rounded-full">
                        <AlertCircle className="w-12 h-12 text-red-500" />
                    </div>
                    
                    <h1 className="text-2xl font-bold tracking-tight text-white">Something went wrong</h1>
                    
                    <p className="text-sm text-slate-400">
                        An unexpected error occurred in the application. Our team has been notified.
                    </p>

                    <div className="w-full bg-slate-950/50 rounded p-4 overflow-auto border border-white/5 text-left mt-4 max-h-32">
                        <code className="text-xs text-red-400 font-mono whitespace-pre-wrap">
                            {error.message || 'Unknown error occurred'}
                        </code>
                    </div>

                    <div className="w-full flex sm:flex-row flex-col gap-3 pt-6 mt-2">
                        {resetErrorBoundary && (
                            <Button 
                                onClick={resetErrorBoundary}
                                variant="outline"
                                className="flex-1 bg-white/5 border-white/10 hover:bg-white/10 hover:text-white transition-all flex items-center justify-center gap-2"
                            >
                                <RefreshCcw className="w-4 h-4" />
                                Try Again
                            </Button>
                        )}
                        <Button 
                            onClick={() => window.location.href = '/'}
                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white transition-all flex items-center justify-center gap-2 border-0 shadow-[0_0_15px_rgba(37,99,235,0.3)]"
                        >
                            <Home className="w-4 h-4" />
                            Go Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GlobalFallback;
