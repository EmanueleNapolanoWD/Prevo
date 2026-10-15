"use client"

import * as React from "react"
import { useParams } from "next/navigation"
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
import Link from "next/link"

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

// Dati statici (senza slug) possono restare fuori dal componente
const user = {
  name: "shadcn",
  email: "m@example.com",
  avatar: "/avatars/shadcn.jpg",
}

export function AppSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { slug } = useParams<{ slug: string }>()
  const base = `/${slug}`

  const navMain = [
    { title: "Dashboard", url: base, icon: <LayoutDashboardIcon /> },
    { title: "Preventivi", url: `${base}/preventivi`, icon: <FileTextIcon /> },
    { title: "Clienti", url: `${base}/clienti`, icon: <UsersIcon /> },
    { title: "Catalogo", url: `${base}/catalogo`, icon: <PackageIcon /> },
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
              <span className="text-base font-semibold">Acme Inc.</span>
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