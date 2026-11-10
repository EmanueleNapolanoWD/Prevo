"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { CirclePlusIcon, MailIcon } from "lucide-react";
import { useRouter } from "next/navigation";

interface NavMainProps {
  items: {
    title: string;
    url: string;
    icon?: React.ReactNode;
  }[];
  slug: string;
}

export function NavMain({ items, slug }: NavMainProps) {
  const router = useRouter();

  const handleClick = () => {
    if (!slug) {
      console.error("ATTENZIONE: Lo slug è vuoto o undefined!");
      return;
    }
    router.push(`/${slug}/quotes/create`);
  };

  return (
    <SidebarGroup>
      <SidebarGroupContent className="flex flex-col gap-2">
        <SidebarMenu>
          <SidebarMenuItem className="flex items-center gap-2">
            <SidebarMenuButton
              tooltip="Quick Create"
              className="min-w-10 rounded-md bg-primary text-primary-foreground font-medium duration-200 ease-linear hover:bg-primary/80 hover:text-primary-foreground focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 active:bg-primary/80 active:text-primary-foreground"
              onClick={handleClick}
            >
              <CirclePlusIcon />
              <span>Crea Preventivo</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        <SidebarMenu>
          {items.map((item) => (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                tooltip={item.title}
                render={<Link href={item.url} />}
              >
                {item.icon}
                <span>{item.title}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  );
}
