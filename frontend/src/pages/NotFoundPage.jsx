import { Link } from 'react-router-dom';
import { Pill, ArrowLeft } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-br from-slate-50 via-primary-50/20 to-teal-50/20 px-4">
      <div className="animate-fade-in-up text-center">
        {/* Animated 404 */}
        <div className="relative mb-8">
          <span className="text-[10rem] font-black leading-none text-slate-100 sm:text-[14rem]">404</span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-float rounded-2xl bg-gradient-to-br from-primary-500 to-teal-500 p-5 shadow-2xl shadow-primary-200/50">
              <Pill className="h-10 w-10 text-white" />
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-slate-900">Page Not Found</h1>
        <p className="mt-3 text-slate-500">The page you're looking for doesn't exist or has been moved.</p>
        <Link
          to="/"
          className="btn-primary mt-8 inline-flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
