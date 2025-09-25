import React, { createContext, useState } from 'react';
import { Navigate } from 'react-router-dom';

import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar-shadcn';
import { useIsMobile } from '@/hooks/use-mobile';
import { AiCreditsLimitAlert } from '@/features/billing/components/ai-credits-limit-alert';
import { TaskLimitAlert } from '@/features/billing/components/task-limit-alert';
import { WelcomeTrialDialog } from '@/features/billing/components/trial-dialog';
import { UpgradeDialog } from '@/features/billing/components/upgrade-dialog';
import { flagsHooks } from '@/hooks/flags-hooks';
import { projectHooks } from '@/hooks/project-hooks';
import { ApFlagId, isNil } from '@activepieces/shared';

import { authenticationSession } from '../../lib/authentication-session';

import { ProjectDashboardSidebar } from './sidebar/dashboard';

const ProjectChangedRedirector = ({
  currentProjectId,
  children,
}: {
  currentProjectId: string;
  children: React.ReactNode;
}) => {
  projectHooks.useReloadPageIfProjectIdChanged(currentProjectId);
  return children;
};

export const CloseTaskLimitAlertContext = createContext({
  isAlertClosed: false,
  setIsAlertClosed: (_isAlertClosed: boolean) => {},
});

export function ProjectDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isAlertClosed, setIsAlertClosed] = useState(false);
  const isMobile = useIsMobile();

  const currentProjectId = authenticationSession.getProjectId();
  const { data: showBilling } = flagsHooks.useFlag<boolean>(
    ApFlagId.SHOW_BILLING,
  );

  if (isNil(currentProjectId) || currentProjectId === '') {
    return <Navigate to="/sign-in" replace />;
  }

  return (
    <ProjectChangedRedirector currentProjectId={currentProjectId}>
      <CloseTaskLimitAlertContext.Provider
        value={{
          isAlertClosed,
          setIsAlertClosed,
        }}
      >
        <SidebarProvider>
          <ProjectDashboardSidebar />
          <SidebarInset className={`relative overflow-auto px-4 pb-4`}>
            {isMobile && (
              <div className="flex items-center gap-2 py-2 border-b mb-4">
                <SidebarTrigger />
                <div className="h-7 w-px bg-border" />
                <h1 className="text-lg font-semibold">Menu</h1>
              </div>
            )}
            <div className="flex flex-col gap-2 mt-2">
              <TaskLimitAlert />
              <AiCreditsLimitAlert />
            </div>

            {children}
          </SidebarInset>
        </SidebarProvider>

        {showBilling && <WelcomeTrialDialog />}
        <UpgradeDialog />
      </CloseTaskLimitAlertContext.Provider>
    </ProjectChangedRedirector>
  );
}
