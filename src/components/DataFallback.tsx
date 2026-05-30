import React from 'react';
import { AlertCircle, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DataFallbackProps {
    title?: string;
    message?: string;
    onRetry?: () => void;
    className?: string;
}

export const DataFallback: React.FC<DataFallbackProps> = ({ 
    title = "Failed to load data", 
    message = "An error occurred while fetching information. Please try again.",
    onRetry,
    className = ""
}) => {
    return (
        <div className={`flex flex-col items-center justify-center p-8 text-slate-300 border border-red-500/20 rounded-xl bg-red-500/5 backdrop-blur-sm animate-in fade-in ${className}`}>
            <AlertCircle className="w-10 h-10 text-red-400 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
            <p className="text-sm text-slate-400 text-center max-w-sm mb-6">{message}</p>
            {onRetry && (
                <Button 
                    onClick={onRetry} 
                    variant="outline" 
                    className="bg-white/5 border-white/10 hover:bg-white/10"
                >
                    <RefreshCcw className="w-4 h-4 mr-2" />
                    Retry
                </Button>
            )}
        </div>
    );
};

export default DataFallback;
