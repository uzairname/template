import { useAuth } from '@/hooks/use-auth'
import { trpc } from '@/utils/trpc/client'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@repo/ui/components/dropdown-menu'
import { Separator } from '@repo/ui/components/separator'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  useSidebar,
} from '@repo/ui/components/sidebar'
import { BadgeCheck, LogIn, LogOut, User, UserCheck, UserPlus } from 'lucide-react'
import { useEffect } from 'react'
import { LoginDialog } from './auth/login-dialog'
import { SignupDialog } from './auth/signup-dialog'

function AppSidebarContent() {
  const { isMobile } = useSidebar()
  const { user, signOut } = useAuth()
  const utils = trpc.useUtils()
  const { data: roleData } = trpc.userAdmin.getCurrentRole.useQuery(undefined, {
    enabled: !!user, // Only fetch if user is logged in
    retry: false, // Don't retry on auth errors
    refetchOnWindowFocus: false, // Don't refetch on window focus to avoid unnecessary calls
    staleTime: Infinity, // Keep data fresh to avoid unnecessary refetches
  })

  // Reset role query when user logs out or changes
  useEffect(() => {
    if (!user) {
      // User logged out: reset the query to clear cached data without triggering refetch
      utils.userAdmin.getCurrentRole.reset()
    }
    // When user logs in, the enabled flag will automatically trigger a fetch
    // No need to manually invalidate
  }, [user?.id, utils])

  return (
    <>
      <Sidebar collapsible="offcanvas" variant="inset">
        <SidebarHeader>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
                <span className="text-base font-semibold">Template, Inc.</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarHeader>
        <SidebarContent></SidebarContent>
        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    size="lg"
                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  >
                    <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                        {user ? <UserCheck className="h-4 w-4" /> : <User className="h-4 w-4" />}
                      </div>
                      <div className="grid flex-1 text-left text-sm leading-tight">
                        <span className="truncate font-semibold">
                          {user ? user.user_metadata.name || 'User' : 'Not signed in'}
                        </span>
                        <span className="truncate text-xs text-sidebar-foreground/70">
                          {user ? user.email : 'Guest'}
                        </span>
                      </div>
                    </div>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>

                <DropdownMenuContent
                  className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg"
                  side={isMobile ? 'bottom' : 'right'}
                  align="end"
                  sideOffset={4}
                >
                  {user ? (
                    <>
                      {roleData && (
                        <>
                          <DropdownMenuLabel className="flex items-center gap-2 text-xs font-normal text-muted-foreground">
                            <BadgeCheck className="w-4 h-4" />
                            Role: {roleData.roleLabel}
                          </DropdownMenuLabel>
                          <DropdownMenuSeparator />
                        </>
                      )}
                      <DropdownMenuItem onClick={signOut}>
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign out
                      </DropdownMenuItem>
                    </>
                  ) : (
                    <DropdownMenuGroup>
                      <LoginDialog>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <LogIn className="w-4 h-4 mr-2" />
                          Sign in
                        </DropdownMenuItem>
                      </LoginDialog>
                      <SignupDialog>
                        <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                          <UserPlus className="w-4 h-4 mr-2" />
                          Sign up
                        </DropdownMenuItem>
                      </SignupDialog>
                    </DropdownMenuGroup>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
          <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
            <SidebarTrigger className="-ml-1" />
            <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
          </div>
        </header>
      </SidebarInset>
    </>
  )
}

export default function AppSidebar() {
  return (
    <SidebarProvider>
      <AppSidebarContent />
    </SidebarProvider>
  )
}
