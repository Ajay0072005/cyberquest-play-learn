import { useState } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { cn } from '@/lib/utils';
import { Settings, KeyRound, UserCog, SlidersHorizontal } from 'lucide-react';
import AccountDetails from '@/components/settings/AccountDetails';
import PasswordSecurity from '@/components/settings/PasswordSecurity';
import Preferences from '@/components/settings/Preferences';

const settingsTabs = [
  { id: 'account', label: 'Account Details', icon: UserCog },
  { id: 'preferences', label: 'Preferences', icon: SlidersHorizontal },
  { id: 'password', label: 'Password and Security', icon: KeyRound },
] as const;

type SettingsTab = (typeof settingsTabs)[number]['id'];

const ProfileSettings = () => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('account');

  return (
    <DashboardLayout>
      <div className="flex gap-6 max-w-6xl mx-auto min-h-[600px]">
        {/* Settings Sidebar */}
        <aside className="w-64 shrink-0 hidden md:block">
          <div className="sticky top-6">
            <div className="flex items-center gap-2 px-3 py-3 mb-2">
              <Settings className="h-5 w-5 text-primary" />
              <span className="font-bold text-foreground">Manage account</span>
            </div>
            <div className="border-l-2 border-primary ml-3 pl-0">
              <nav className="space-y-0.5">
                {settingsTabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={cn(
                      "w-full text-left px-4 py-2.5 text-sm transition-colors",
                      activeTab === tab.id
                        ? "text-foreground font-semibold bg-primary/10 border-l-2 border-primary -ml-[2px]"
                        : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                    )}
                  >
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>
          </div>
        </aside>

        {/* Mobile Tab Selector */}
        <div className="md:hidden w-full">
          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {settingsTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-colors",
                  activeTab === tab.id
                    ? "bg-primary/20 text-primary border border-primary/30 font-medium"
                    : "bg-card text-muted-foreground border border-border hover:text-foreground"
                )}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </button>
            ))}
          </div>
          <div>
            {activeTab === 'account' && <AccountDetails />}
            {activeTab === 'preferences' && <Preferences />}
            {activeTab === 'password' && <PasswordSecurity />}
          </div>
        </div>

        {/* Desktop Content */}
        <div className="flex-1 hidden md:block">
          {activeTab === 'account' && <AccountDetails />}
          {activeTab === 'preferences' && <Preferences />}
          {activeTab === 'password' && <PasswordSecurity />}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfileSettings;
