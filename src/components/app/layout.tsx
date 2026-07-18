import * as React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Shirt,
  Calendar,
  Bookmark,
  Settings,
  LogOut,
  Menu,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/contexts/AuthContext";
import { cn } from "@/lib/utils";

const NAV = [
  { to: "/dashboard", label: "Today", icon: LayoutDashboard },
  { to: "/wardrobe", label: "Wardrobe", icon: Shirt },
  { to: "/ootd", label: "OOTD", icon: Calendar },
  { to: "/outfits", label: "Outfits", icon: Bookmark },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

export function AppLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const initials = (profile?.email ?? "U").slice(0, 2).toUpperCase();

  const onLogout = () => {
    logout();
    navigate("/", { replace: true });
  };

  return (
    <div className="bg-background min-h-svh">
      {/* Desktop sidebar */}
      <aside className="bg-card fixed inset-y-0 left-0 hidden w-60 flex-col border-r p-4 md:flex">
        <Brand />
        <nav className="mt-6 flex flex-col gap-1">
          {NAV.map((n) => (
            <SideLink key={n.to} {...n} />
          ))}
        </nav>
        <div className="mt-auto space-y-3">
          <Separator />
          <div className="flex items-center gap-2">
            <Avatar className="size-8">
              <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1 text-xs">
              <p className="truncate font-medium">{profile?.email}</p>
              <p className="text-muted-foreground">
                {profile?.preferences.savedLocations[0]?.label ||
                  profile?.preferences.savedLocations[0]?.name ||
                  "No location"}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start"
            onClick={onLogout}
          >
            <LogOut className="mr-2 size-4" /> Sign out
          </Button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="bg-background/80 sticky top-0 z-30 flex items-center justify-between border-b px-4 py-3 backdrop-blur md:hidden">
        <Brand />
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Menu">
              <Menu className="size-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetHeader>
              <SheetTitle>Layer Up</SheetTitle>
            </SheetHeader>
            <nav className="mt-4 flex flex-col gap-1 px-4">
              {NAV.map((n) => (
                <SideLink key={n.to} {...n} />
              ))}
              <Separator className="my-2" />
              <Button
                variant="ghost"
                className="justify-start"
                onClick={onLogout}
              >
                <LogOut className="mr-2 size-4" /> Sign out
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </header>

      <main className="md:ml-60 md:pl-0">
        <div className="mx-auto w-full max-w-5xl p-4 pb-24 md:p-8 md:pb-12">
          <Outlet />
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav className="bg-background/95 fixed inset-x-0 bottom-0 z-30 grid grid-cols-5 border-t backdrop-blur md:hidden">
        {NAV.map((n) => (
          <NavLink
            key={n.to}
            to={n.to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center justify-center gap-0.5 py-2 text-[10px] font-medium",
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )
            }
          >
            <n.icon className="size-5" />
            {n.label}
          </NavLink>
        ))}
      </nav>
    </div>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2">
      <div className="bg-primary flex size-8 items-center justify-center overflow-hidden rounded-lg">
        <img
          src="/layer.png"
          alt="Layer Up"
          className="size-full object-cover"
        />
      </div>
      <span className="text-base font-semibold tracking-tight">LayerUp</span>
    </div>
  );
}

function SideLink({
  to,
  label,
  icon: Icon,
}: {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
          isActive
            ? "bg-secondary text-secondary-foreground"
            : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
        )
      }
    >
      <Icon className="size-4" />
      {label}
    </NavLink>
  );
}
