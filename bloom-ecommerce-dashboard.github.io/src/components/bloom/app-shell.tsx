import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, type ElementType } from "react";
import {
  LayoutDashboard,
  Package,
  Database,
  Tags,
  Layers3,
  BadgePercent,
  Warehouse,
  Ruler,
  SlidersHorizontal,
  ShoppingCart,
  Users,
  PanelsTopLeft,
  Settings,
  Search,
  Bell,
  Moon,
  Sun,
  ChevronDown,
  ChevronLeft,
  Menu,
  LogOut,
  LockKeyhole,
  Waves,
  ArrowUpRight,
  CalendarDays,
  ChartNoAxesCombined,
  Store,
  LayoutGrid,
  Building2,
  Boxes,
  Factory,
  FileSpreadsheet,
  Boxes as BatchesIcon,
  MapPin,
  Percent,
  UserCheck,
  Receipt,
  CreditCard,
  Banknote,
  RotateCcw,
  TrendingUp,
  History,
  PackagePlus,
  ArrowLeftRight,
  AlertTriangle,
  PackageX,
  Truck,
  ClipboardList,
  Hammer,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "./auth-context";
import { useTheme } from "./theme-context";
import { Tooltip, TooltipTrigger, TooltipContent } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

const masters = [
  { to: "/categories", label: "Categories", icon: Tags },
  { to: "/sub-categories", label: "Sub-Categories", icon: Layers3 },
  { to: "/brands", label: "Brands", icon: BadgePercent },
  { to: "/units", label: "Units", icon: Ruler },
  { to: "/taxes", label: "Taxes", icon: BadgePercent },
  { to: "/warehouses", label: "Warehouses", icon: Warehouse },
  { to: "/attributes", label: "Attributes", icon: SlidersHorizontal },
  { to: "/master/batches", label: "Batch Master", icon: BatchesIcon },
  { to: "/master/locations", label: "Storage Locations", icon: MapPin },
  { to: "/master/commissions", label: "Commission Master", icon: Percent },
] as const;

const vendorLinks = [
  { to: "/vendors", label: "Vendor Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/vendors/registrations", label: "Registrations", icon: UserCheck },
  { to: "/vendors/list", label: "All Vendors", icon: Building2 },
  { to: "/vendors/products", label: "Vendor Products", icon: Package },
  { to: "/vendors/orders", label: "Vendor Orders", icon: ShoppingCart },
  { to: "/vendors/transactions", label: "Transactions", icon: Receipt },
  { to: "/vendors/payments", label: "Payments", icon: CreditCard },
  { to: "/vendors/settlements", label: "Settlements", icon: Banknote },
  { to: "/vendors/returns", label: "Returns", icon: RotateCcw },
  { to: "/vendors/performance", label: "Performance", icon: TrendingUp },
  { to: "/vendors/activity", label: "Activity Logs", icon: History },
] as const;

const inventoryLinks = [
  { to: "/inventory", label: "Overview", icon: LayoutDashboard, exact: true },
  { to: "/inventory/stock", label: "Product Stock", icon: Package },
  { to: "/inventory/add-stock", label: "Add Stock", icon: PackagePlus },
  { to: "/inventory/adjustment", label: "Stock Adjustment", icon: SlidersHorizontal },
  { to: "/inventory/movements", label: "Stock Movement", icon: ArrowLeftRight },
  { to: "/inventory/low-stock", label: "Low Stock", icon: AlertTriangle },
  { to: "/inventory/out-of-stock", label: "Out of Stock", icon: PackageX },
  { to: "/inventory/transfer", label: "Stock Transfer", icon: Truck },
  { to: "/inventory/history", label: "Stock History", icon: History },
] as const;

const productionLinks = [
  { to: "/production", label: "Production Dashboard", icon: LayoutDashboard, exact: true },
  { to: "/production/list", label: "Production Orders", icon: ClipboardList },
  { to: "/production/new", label: "Create Production", icon: Hammer },
  { to: "/production/batches", label: "Production Batches", icon: Boxes },
  { to: "/production/history", label: "Production History", icon: History },
] as const;

const reportLinks = [
  { to: "/reports", label: "Reports Overview", icon: FileSpreadsheet, exact: true },
  { to: "/reports/sales", label: "Vendor Sales", icon: TrendingUp },
  { to: "/reports/orders", label: "Vendor Orders", icon: ShoppingCart },
  { to: "/reports/inventory", label: "Inventory Report", icon: Boxes },
  { to: "/reports/production", label: "Production Report", icon: Factory },
  { to: "/reports/transactions", label: "Transactions", icon: Receipt },
  { to: "/reports/settlements", label: "Settlements", icon: Banknote },
  { to: "/reports/returns", label: "Returns Report", icon: RotateCcw },
] as const;

export function AppShell({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(true);
  const [mobile, setMobile] = useState(false);
  const [masterOpen, setMasterOpen] = useState(false);
  const [vendorsOpen, setVendorsOpen] = useState(() => location.pathname.startsWith("/vendors"));
  const [inventoryOpen, setInventoryOpen] = useState(() => location.pathname.startsWith("/inventory"));
  const [productionOpen, setProductionOpen] = useState(() => location.pathname.startsWith("/production"));
  const [reportsOpen, setReportsOpen] = useState(() => location.pathname.startsWith("/reports"));
  const { dark, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const nav = (to: string, label: string, Icon?: ElementType, exact?: boolean) => {
    const active = exact ? location.pathname === to : location.pathname.startsWith(to);
    const link = (
      <Link
        key={to}
        to={to}
        onClick={() => setMobile(false)}
        className={cn(
          "group flex h-11 items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-all duration-200",
          active
            ? "bg-primary text-primary-foreground shadow-[0_8px_28px_color-mix(in_oklab,var(--foreground)_10%,transparent)]"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          collapsed && "mx-auto w-11 justify-center px-0",
        )}
      >
        {Icon && <Icon className="size-5 shrink-0" />}
        {!collapsed && <span className="truncate">{label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip key={to}>
          <TooltipTrigger asChild>{link}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }

    return link;
  };

  const groupButton = (
    label: string,
    Icon: ElementType,
    isOpen: boolean,
    toggleOpen: () => void,
    routePrefix: string,
  ) => {
    const active = location.pathname.startsWith(routePrefix);
    const btn = (
      <button
        className={cn(
          "flex h-11 w-full items-center gap-3 rounded-2xl px-3 text-sm font-medium transition-colors",
          active
            ? "bg-primary/10 text-foreground font-semibold"
            : "text-muted-foreground hover:bg-accent hover:text-foreground",
          collapsed && "mx-auto w-11 justify-center px-0",
        )}
        onClick={() => {
          if (collapsed) {
            setCollapsed(false);
            toggleOpen();
          } else {
            toggleOpen();
          }
        }}
      >
        <Icon className="size-5 shrink-0" />
        {!collapsed && (
          <>
            <span className="flex-1 text-left">{label}</span>
            <ChevronDown className={cn("size-4 transition-transform", isOpen && "rotate-180")} />
          </>
        )}
      </button>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{btn}</TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            {label}
          </TooltipContent>
        </Tooltip>
      );
    }
    return btn;
  };

  return (
    <div className="min-h-screen bg-background">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex flex-col border-r bg-sidebar transition-[width,transform] duration-200",
          collapsed ? "w-20" : "w-64",
          mobile ? "translate-x-0" : "max-lg:-translate-x-full",
        )}
      >
        <div className={cn("flex h-20 items-center gap-3 px-4", collapsed && "justify-center")}>
          <div className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-primary-foreground">
            <Waves className="size-6" />
          </div>
          {!collapsed && <span className="text-xl font-semibold">Bloom</span>}
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="ml-auto hidden lg:inline-flex"
                onClick={() => setCollapsed(!collapsed)}
                aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                <ChevronLeft className={cn("transition-transform", collapsed && "rotate-180")} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side={collapsed ? "right" : "bottom"} sideOffset={10}>
              {collapsed ? "Expand sidebar" : "Collapse sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
        <nav className="flex-1 space-y-1 overflow-y-auto no-scrollbar px-3 py-4">
          {nav("/dashboard", "Dashboard", LayoutDashboard, true)}

          {/* Vendors Group */}
          <div>
            {groupButton("Vendors", Building2, vendorsOpen, () => setVendorsOpen(!vendorsOpen), "/vendors")}
            {vendorsOpen && !collapsed && (
              <div className="ml-5 my-1 space-y-0.5 border-l pl-3">
                {vendorLinks.map((x) => nav(x.to, x.label, x.icon, "exact" in x && x.exact))}
              </div>
            )}
          </div>

          {/* Inventory Group */}
          <div>
            {groupButton("Inventory", Boxes, inventoryOpen, () => setInventoryOpen(!inventoryOpen), "/inventory")}
            {inventoryOpen && !collapsed && (
              <div className="ml-5 my-1 space-y-0.5 border-l pl-3">
                {inventoryLinks.map((x) => nav(x.to, x.label, x.icon, "exact" in x && x.exact))}
              </div>
            )}
          </div>

          {/* Production Group */}
          <div>
            {groupButton("Production", Factory, productionOpen, () => setProductionOpen(!productionOpen), "/production")}
            {productionOpen && !collapsed && (
              <div className="ml-5 my-1 space-y-0.5 border-l pl-3">
                {productionLinks.map((x) => nav(x.to, x.label, x.icon, "exact" in x && x.exact))}
              </div>
            )}
          </div>

          {/* Reports Group */}
          <div>
            {groupButton("Reports", FileSpreadsheet, reportsOpen, () => setReportsOpen(!reportsOpen), "/reports")}
            {reportsOpen && !collapsed && (
              <div className="ml-5 my-1 space-y-0.5 border-l pl-3">
                {reportLinks.map((x) => nav(x.to, x.label, x.icon, "exact" in x && x.exact))}
              </div>
            )}
          </div>

          {/* Master Data Group */}
          <div>
            {groupButton("Master Data", Database, masterOpen, () => setMasterOpen(!masterOpen), "/master")}
            {masterOpen && !collapsed && (
              <div className="ml-5 my-1 space-y-0.5 border-l pl-3">
                {masters.map((x) => nav(x.to, x.label, x.icon))}
              </div>
            )}
          </div>

          <div className="pt-2 border-t my-2" />

          {nav("/platform", "B2C Platform", LayoutGrid)}
          {nav("/products", "Products", Package)}
          {nav("/orders", "Orders", ShoppingCart)}
          {nav("/sales", "Sales", ChartNoAxesCombined)}
          {nav("/customers", "Customers", Users)}
          {nav("/cms", "CMS", PanelsTopLeft)}
          {nav("/storefront", "Storefront", Store)}
          {nav("/settings", "Settings", Settings)}
        </nav>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="absolute bottom-5 left-1/2 -translate-x-1/2"
              onClick={() => {
                logout();
                navigate({ to: "/" });
              }}
              aria-label="Sign out"
            >
              <LogOut />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right" sideOffset={10}>
            Sign out
          </TooltipContent>
        </Tooltip>
      </aside>
      <div className={cn("transition-[padding] duration-200", collapsed ? "lg:pl-20" : "lg:pl-64")}>
        <header className="sticky top-0 z-30 flex h-20 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur-xl lg:px-8">
          <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobile(true)}>
            <Menu />
          </Button>
          <div className="relative hidden w-full max-w-sm md:block">
            <Search className="absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <input
              className="h-11 w-full rounded-full border bg-muted/60 pl-11 pr-4 text-sm outline-none transition focus:border-ring/60 focus:ring-2 focus:ring-ring/20"
              placeholder="Search"
            />
          </div>
          <p className="hidden items-center gap-2 text-sm text-muted-foreground xl:flex">
            <CalendarDays className="size-4" />
            Today, Friday, 18 September
          </p>
          <div className="ml-auto flex items-center gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="bloom-icon-button"
                  onClick={toggleTheme}
                  aria-label="Toggle theme"
                >
                  {dark ? <Sun /> : <Moon />}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>
                {dark ? "Light mode" : "Dark mode"}
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="icon" className="bloom-icon-button">
                  <Link to="/settings" aria-label="Settings">
                    <Settings />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>
                Settings
              </TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button asChild variant="ghost" size="icon" className="bloom-icon-button">
                  <Link to="/settings/notifications" aria-label="Notifications">
                    <Bell />
                  </Link>
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" sideOffset={8}>
                Notifications
              </TooltipContent>
            </Tooltip>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-10 overflow-hidden rounded-full bg-blue-soft text-blue font-semibold"
                >
                  <span className="text-xs">
                    {user?.firstName && user?.lastName
                      ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
                      : user?.name
                        ? user.name.slice(0, 2).toUpperCase()
                        : "AD"}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-60 rounded-2xl p-2">
                <DropdownMenuLabel className="p-2">
                  <span className="block font-semibold leading-tight">{user?.name || "Administrator"}</span>
                  {user?.email && (
                    <span className="block text-xs font-normal text-muted-foreground truncate mt-0.5">
                      {user.email}
                    </span>
                  )}
                  <span className="mt-1.5 inline-block text-[11px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                    {user?.role || "Admin"}
                  </span>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => {
                    logout();
                    navigate({ to: "/" });
                  }}
                >
                  <LogOut />
                  Sign out
                  <ArrowUpRight className="ml-auto" />
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </header>
        <main className="mx-auto max-w-[1600px] p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
      {mobile && (
        <button
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-background/70 backdrop-blur-sm lg:hidden"
          onClick={() => setMobile(false)}
        />
      )}
    </div>
  );
}
