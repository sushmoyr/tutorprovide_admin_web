import {
  LayoutDashboard,
  Users,
  GraduationCap,
  UserCheck,
  Shield,
  BookOpen,
  FileText,
  CreditCard,
  Receipt,
  Settings,
  Building2,
  Award,
  BadgeCheck,
  MapPin,
  Layers,
  Newspaper,
  HelpCircle,
  Image,
  Flag,
  Megaphone,
  Gift,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  permission?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

export const sidebarNav: NavGroup[] = [
  {
    label: "",
    items: [
      { title: "sidebar.dashboard", href: "/", icon: LayoutDashboard },
    ],
  },
  {
    label: "sidebar.administration",
    items: [
      { title: "sidebar.users", href: "/users", icon: Users },
      { title: "sidebar.tutors", href: "/tutors", icon: GraduationCap },
      { title: "sidebar.guardians", href: "/guardians", icon: UserCheck },
      { title: "sidebar.employees", href: "/employees", icon: Building2 },
      { title: "sidebar.tuitions", href: "/tuitions", icon: BookOpen },
      { title: "sidebar.posts", href: "/posts", icon: FileText },
      { title: "sidebar.premiumRequests", href: "/premium-requests", icon: Award },
      { title: "sidebar.verificationRequests", href: "/verification-requests", icon: BadgeCheck },
    ],
  },
  {
    label: "sidebar.configuration",
    items: [
      { title: "sidebar.divisions", href: "/divisions", icon: MapPin },
      { title: "sidebar.districts", href: "/districts", icon: MapPin },
      { title: "sidebar.areas", href: "/areas", icon: MapPin },
      { title: "sidebar.categories", href: "/categories", icon: Layers },
      { title: "sidebar.subjects", href: "/subjects", icon: BookOpen },
      { title: "sidebar.classes", href: "/classes", icon: GraduationCap },
      { title: "sidebar.curriculum", href: "/curriculum", icon: BookOpen },
      { title: "sidebar.departments", href: "/departments", icon: Building2 },
      { title: "sidebar.designations", href: "/designations", icon: Building2 },
    ],
  },
  {
    label: "sidebar.content",
    items: [
      { title: "sidebar.blogs", href: "/blogs", icon: Newspaper },
      { title: "sidebar.faqs", href: "/faqs", icon: HelpCircle },
      { title: "sidebar.galleries", href: "/galleries", icon: Image },
      { title: "sidebar.banners", href: "/banners", icon: Flag },
      { title: "sidebar.ads", href: "/ads", icon: Megaphone },
      { title: "sidebar.notices", href: "/notices", icon: Megaphone },
    ],
  },
  {
    label: "sidebar.settings",
    items: [
      { title: "sidebar.invoices", href: "/invoices", icon: Receipt },
      { title: "sidebar.payments", href: "/payments", icon: CreditCard },
      { title: "sidebar.coupons", href: "/coupons", icon: Gift },
      { title: "sidebar.roles", href: "/roles", icon: Shield },
      { title: "sidebar.permissions", href: "/permissions", icon: Shield },
      { title: "sidebar.settings", href: "/settings", icon: Settings },
    ],
  },
];
