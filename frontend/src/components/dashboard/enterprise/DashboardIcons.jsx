import {
  BadgeCheck,
  BarChart3,
  ClipboardCheck,
  ClipboardList,
  Clock,
  Cog,
  Factory,
  Gauge,
  IndianRupee,
  Package,
  Receipt,
  Settings,
  ShoppingCart,
  XCircle,
} from "lucide-react";

const ICON_MAP = {
  ShoppingCart,
  PrecisionManufacturing: Cog,
  Settings,
  Speed: Gauge,
  PendingActions: Clock,
  Verified: BadgeCheck,
  Cancel: XCircle,
  CurrencyRupee: IndianRupee,
  Assignment: ClipboardList,
  Inventory: Package,
  Factory,
  FactCheck: ClipboardCheck,
  Receipt,
  Assessment: BarChart3,
};

export function DashboardIcon({ name, className = "h-5 w-5", style }) {
  const Icon = ICON_MAP[name] || Settings;
  return <Icon className={className} style={style} aria-hidden />;
}

export default DashboardIcon;
