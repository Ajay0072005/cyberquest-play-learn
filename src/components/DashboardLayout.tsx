import { TopNav } from '@/components/TopNav';
import { BackButton } from '@/components/BackButton';

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-background flex flex-col w-full">
      <TopNav />
      <main className="flex-1 pb-20 md:pb-6">
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
