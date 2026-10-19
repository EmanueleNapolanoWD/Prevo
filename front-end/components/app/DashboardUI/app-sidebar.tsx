"use client"

import * as React from "react"
import Link from "next/link"
import {
  LayoutDashboardIcon,
  FileTextIcon,
  UsersIcon,
  PackageIcon,
  SparklesIcon,
  ChartBarIcon,
  UsersRoundIcon,
  PlugIcon,
  Settings2Icon,
  CircleHelpIcon,
  SearchIcon,
  DatabaseIcon,
  FileChartColumnIcon,
  FileIcon,
  CommandIcon,
} from "lucide-react"

import { NavDocuments } from "@/components/app/DashboardUI/nav-documents"
import { NavMain } from "@/components/app/DashboardUI/nav-main"
import { NavSecondary } from "@/components/app/DashboardUI/nav-secondary"
import { NavUser } from "@/components/app/DashboardUI/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import type { SidebarCompany, SidebarUser } from "@/types/auth"

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  slug: string
  user: SidebarUser
  company: SidebarCompany
}

export function AppSidebar({ slug, user, company, ...props }: AppSidebarProps) {
  const base = `/${slug}`

  const navMain = [
    { title: "Dashboard", url: base, icon: <LayoutDashboardIcon /> },
    { title: "Preventivi", url: `${base}/quotes`, icon: <FileTextIcon /> },
    { title: "Clienti", url: `${base}/clients`, icon: <UsersIcon /> },
    { title: "Catalogo", url: `${base}/products`, icon: <PackageIcon /> },
    { title: "Assistente AI", url: `${base}/assistente`, icon: <SparklesIcon /> },
    { title: "Report", url: `${base}/report`, icon: <ChartBarIcon /> },
    { title: "Team", url: `${base}/team`, icon: <UsersRoundIcon /> },
    { title: "Integrazioni", url: `${base}/integrazioni`, icon: <PlugIcon /> },
  ]

  const navSecondary = [
    { title: "Impostazioni", url: `${base}/settings`, icon: <Settings2Icon /> },
    { title: "Aiuto", url: "#", icon: <CircleHelpIcon /> },
    { title: "Cerca", url: "#", icon: <SearchIcon /> },
  ]

  const documents = [
    { name: "Data Library", url: "#", icon: <DatabaseIcon /> },
    { name: "Reports", url: "#", icon: <FileChartColumnIcon /> },
    { name: "Word Assistant", url: "#", icon: <FileIcon /> },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              className="data-[slot=sidebar-menu-button]:p-1.5!"
              render={<Link href={base} />}
            >
              <CommandIcon className="size-5!" />
              <span className="truncate text-base font-semibold">
                {company.name}
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navMain} />
        <NavDocuments items={documents} />
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={user} />
      </SidebarFooter>
    </Sidebar>
  )
}