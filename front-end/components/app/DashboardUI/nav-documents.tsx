"use client";

import { SidebarGroup, SidebarGroupContent, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from "@/components/ui/sidebar";

type NavDocumentsProps = {
  items: { name: string; url: string; icon: React.ReactNode }[];
};

export function NavDocuments({ items }: NavDocumentsProps) {
  return (
    <SidebarGroup className="flex-1">
      <SidebarGroupContent>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.name}>
              <SidebarMenuButton tooltip={item.name}>{item.icon}</SidebarMenuButton>
              <a href={item.url}>{item.name}</a>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
