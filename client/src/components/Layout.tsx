import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useI18n, LanguageSelector } from "@/lib/i18n";
import { useAdminCheck } from "@/hooks/use-admin";
import { Button } from "@/components/ui/button";
import { 
  LayoutDashboard, 
  FolderPlus, 
  Settings2, 
  LogOut, 
  Menu,
  CreditCard,
  ShieldCheck,
} from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import QuotaBar from "@/components/QuotaBar";

export default function Layout({ children }: { children: React.ReactNode }) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { t } = useI18n();
  const [open, setOpen] = useState(false);
  const { data: adminCheck } = useAdminCheck();

  const NavLink = ({ href, icon: Icon, label }: { href: string; icon: any; label: string }) => {
    const isActive = location === href;
    return (
      <Link href={href}>
        <div className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 cursor-pointer ${
          isActive 
            ? "bg-primary text-primary-foreground font-medium shadow-md shadow-primary/20" 
            : "text-muted-foreground hover:bg-secondary hover:text-foreground"
        }`}>
          <Icon className="w-5 h-5" />
          <span>{label}</span>
        </div>
      </Link>
    );
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      <div className="p-6">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white font-bold text-xl shadow-lg">
            A
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Academic</h1>
            <p className="text-xs text-muted-foreground">Writing Assistant</p>
          </div>
        </div>
        
        <nav className="space-y-2">
          <NavLink href="/" icon={LayoutDashboard} label={t("nav.dashboard")} />
          <NavLink href="/projects/new" icon={FolderPlus} label={t("nav.newProject")} />
          <NavLink href="/billing" icon={CreditCard} label="Facturation" />
          <NavLink href="/settings" icon={Settings2} label={t("nav.settings")} />
          {adminCheck?.isAdmin && (
            <NavLink href="/admin" icon={ShieldCheck} label="Super Admin" />
          )}
        </nav>

        <div className="mt-6 px-2">
          <LanguageSelector variant="minimal" />
        </div>

        <div className="mt-6">
          <QuotaBar />
        </div>
      </div>

      <div className="mt-auto p-6 border-t border-border/50">
        <div className="flex items-center gap-3 mb-4 px-2">
          <Avatar className="w-8 h-8 border border-border">
            <AvatarImage src={user?.profileImageUrl || undefined} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {user?.firstName?.[0] || "U"}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-medium truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-xs text-muted-foreground truncate">{user?.email}</p>
          </div>
        </div>
        <Button 
          variant="outline" 
          className="w-full justify-start gap-2 text-muted-foreground"
          onClick={() => logout()}
          data-testid="button-signout"
        >
          <LogOut className="w-4 h-4" />
          {t("nav.signOut")}
        </Button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/30 flex">
      <aside className="hidden lg:block w-64 bg-background border-r border-border fixed h-full z-10">
        <SidebarContent />
      </aside>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden fixed top-4 left-4 z-50">
            <Menu className="w-6 h-6" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-64">
          <SidebarContent />
        </SheetContent>
      </Sheet>

      <main className="flex-1 lg:ml-64 p-4 md:p-8 pt-16 lg:pt-8 min-h-screen">
        <div className="max-w-6xl mx-auto animate-in fade-in duration-500">
          {children}
        </div>
      </main>
    </div>
  );
}
