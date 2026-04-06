import { DashboardSidebar } from '@/components/DashboardSidebar';
import { BackButton } from '@/components/BackButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex w-full">
      <DashboardSidebar />
      <main className="flex-1 ml-16 md:ml-64 transition-all duration-300">
        <div className="container mx-auto px-4 py-6 max-w-7xl">
          <div className="mb-4">
            <BackButton />
          </div>
          {children}
        </div>
      </main>
    </div>
  );
};
