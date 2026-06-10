import { Pill } from 'lucide-react';

export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  const sizes = { sm: 'h-5 w-5', md: 'h-8 w-8', lg: 'h-12 w-12' };
  const textSizes = { sm: 'text-xs', md: 'text-sm', lg: 'text-base' };

  const content = (
    <div className="flex flex-col items-center gap-3">
      <div className="relative">
        <div className={`${sizes[size]} animate-spin rounded-full border-[3px] border-primary-100 border-t-primary-600`} />
        <Pill className="absolute left-1/2 top-1/2 h-3.5 w-3.5 -translate-x-1/2 -translate-y-1/2 text-primary-500 animate-pulse" />
      </div>
      <p className={`${textSizes[size]} font-medium text-slate-400 animate-pulse`}>Loading...</p>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        {content}
      </div>
    );
  }

  return <div className="flex justify-center py-12">{content}</div>;
}
