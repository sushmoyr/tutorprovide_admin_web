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
  Globe,
  Wallet,
  MessageSquare,
  History,
  Video,
  Scale,
  UsersRound,
  FolderOpen,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
}

export interface NavGroup {
  id: string;
  label: string;
  icon: LucideIcon;
  items: NavItem[];
}

export const topItems: NavItem[] = [
  { title: "sidebar.dashboard", href: "/", icon: LayoutDashboard },
  { title: "sidebar.activityLog", href: "/activity-log", icon: History },
];

export const sidebarGroups: NavGroup[] = [
  {
    id: "tuition-profile",
    label: "sidebar.tuitionProfile",
    icon: BookOpen,
    items: [
      { title: "sidebar.posts", href: "/posts", icon: FileText },
      { title: "sidebar.employees", href: "/employees", icon: Building2 },
      { title: "sidebar.guardians", href: "/guardians", icon: UserCheck },
      { title: "sidebar.tutors", href: "/tutors", icon: GraduationCap },
      { title: "sidebar.premiumRequests", href: "/premium-requests", icon: Award },
      { title: "sidebar.verificationRequests", href: "/verification-requests", icon: BadgeCheck },
    ],
  },
  {
    id: "employee-config",
    label: "sidebar.employeeConfig",
    icon: Building2,
    items: [
      { title: "sidebar.departments", href: "/departments", icon: Building2 },
      { title: "sidebar.designations", href: "/designations", icon: Building2 },
    ],
  },
  {
    id: "location",
    label: "sidebar.location",
    icon: MapPin,
    items: [
      { title: "sidebar.divisions", href: "/divisions", icon: MapPin },
      { title: "sidebar.districts", href: "/districts", icon: MapPin },
      { title: "sidebar.areas", href: "/areas", icon: MapPin },
      { title: "sidebar.livingLocations", href: "/living-locations", icon: MapPin },
    ],
  },
  {
    id: "tuition-config",
    label: "sidebar.tuitionConfig",
    icon: Layers,
    items: [
      { title: "sidebar.categories", href: "/categories", icon: Layers },
      { title: "sidebar.curriculum", href: "/curriculum", icon: BookOpen },
      { title: "sidebar.classes", href: "/classes", icon: GraduationCap },
      { title: "sidebar.subjects", href: "/subjects", icon: BookOpen },
    ],
  },
  {
    id: "billing",
    label: "sidebar.billing",
    icon: Wallet,
    items: [
      { title: "sidebar.invoices", href: "/invoices", icon: Receipt },
      { title: "sidebar.payments", href: "/payments", icon: CreditCard },
    ],
  },
  {
    id: "user-role",
    label: "sidebar.userRole",
    icon: Shield,
    items: [
      { title: "sidebar.roles", href: "/roles", icon: Shield },
      { title: "sidebar.permissions", href: "/permissions", icon: Shield },
    ],
  },
  {
    id: "website-config",
    label: "sidebar.websiteConfig",
    icon: Globe,
    items: [
      { title: "sidebar.banners", href: "/banners", icon: Flag },
      { title: "sidebar.coupons", href: "/coupons", icon: Gift },
      { title: "sidebar.counters", href: "/counters", icon: Settings },
      { title: "sidebar.partners", href: "/partners", icon: Users },
      { title: "sidebar.faqs", href: "/faqs", icon: HelpCircle },
      { title: "sidebar.welcomeGreetings", href: "/welcome-greetings", icon: MessageSquare },
      { title: "sidebar.ads", href: "/ads", icon: Megaphone },
      { title: "sidebar.walkthroughs", href: "/walkthroughs", icon: BookOpen },
      { title: "sidebar.notices", href: "/notices", icon: Megaphone },
      { title: "sidebar.feedbacks", href: "/feedbacks", icon: HelpCircle },
      { title: "sidebar.settings", href: "/settings", icon: Settings },
    ],
  },
  {
    id: "blog-gallery",
    label: "sidebar.blogGallery",
    icon: Newspaper,
    items: [
      { title: "sidebar.blogs", href: "/blogs", icon: Newspaper },
      { title: "sidebar.blogCategories", href: "/blog-categories", icon: FolderOpen },
      { title: "sidebar.galleries", href: "/galleries", icon: Image },
    ],
  },
  {
    id: "content",
    label: "sidebar.content",
    icon: FileText,
    items: [
      { title: "sidebar.terms", href: "/terms", icon: Scale },
      { title: "sidebar.policies", href: "/policies", icon: FileText },
      { title: "sidebar.videoTutorials", href: "/video-tutorials", icon: Video },
      { title: "sidebar.teams", href: "/teams", icon: UsersRound },
    ],
  },
];
