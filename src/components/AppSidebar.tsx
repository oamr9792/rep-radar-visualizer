
import React from 'react';
import { FileText, BarChart3, Settings } from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  SidebarTrigger,
} from '@/components/ui/sidebar';

interface AppSidebarProps {
  savedReports: Record<string, any[]>;
  onLoadReport: (keyword: string) => void;
  selectedKeyword: string;
}

export function AppSidebar({ savedReports, onLoadReport, selectedKeyword }: AppSidebarProps) {
  const reportKeywords = Object.keys(savedReports);

  return (
    <Sidebar className="w-64">
      <SidebarHeader className="p-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Reports</h2>
          <SidebarTrigger />
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Saved Reports</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {reportKeywords.length === 0 ? (
                <div className="text-sm text-muted-foreground p-2">
                  No saved reports yet. Track a keyword to get started.
                </div>
              ) : (
                reportKeywords.map((keyword) => (
                  <SidebarMenuItem key={keyword}>
                    <SidebarMenuButton
                      onClick={() => onLoadReport(keyword)}
                      isActive={selectedKeyword === keyword}
                      className="w-full justify-start"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      <span className="truncate">{keyword}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Analytics</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <BarChart3 className="mr-2 h-4 w-4" />
                  <span>Trends</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
