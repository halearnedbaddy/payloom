import { useState } from 'react';
import { 
  HomeIcon, BarChartIcon, PackageIcon, ShoppingCartIcon, SettingsIcon 
} from '@/components/icons';
import { 
  Users, Megaphone, DollarSign, MessageCircle, Star, HelpCircle, 
  ChevronDown, ChevronRight, Lock, Box
} from 'lucide-react';

export type StoreTab = 
  | 'dashboard'
  | 'orders'
  | 'products' | 'products-all' | 'products-categories' | 'products-bulk' | 'products-recommendations'
  | 'inventory' | 'inventory-stock' | 'inventory-locations' | 'inventory-transfers' | 'inventory-suppliers' | 'inventory-reorder'
  | 'customers' | 'customers-all' | 'customers-segments' | 'customers-analytics' | 'customers-loyalty'
  | 'marketing' | 'marketing-email' | 'marketing-sms' | 'marketing-cart-recovery' | 'marketing-loyalty' | 'marketing-discounts' | 'marketing-social'
  | 'analytics' | 'analytics-overview' | 'analytics-forecasting' | 'analytics-customer-insights' | 'analytics-traffic' | 'analytics-insights' | 'analytics-market-intelligence' | 'analytics-custom-reports'
  | 'financial' | 'financial-accounting' | 'financial-tax' | 'financial-payment-options' | 'financial-health'
  | 'live-chat'
  | 'reviews'
  | 'store-settings' | 'store-settings-general' | 'store-settings-domain' | 'store-settings-theme' | 'store-settings-seo' | 'store-settings-payment' | 'store-settings-shipping' | 'store-settings-tax' | 'store-settings-integrations' | 'store-settings-legal' | 'store-settings-webhooks' | 'store-settings-languages' | 'store-settings-invoices'
  | 'support' | 'support-help' | 'support-tickets' | 'support-account-manager';

type PlanTier = 'free' | 'pro' | 'business' | 'enterprise';

interface NavItem {
  id: StoreTab;
  label: string;
  icon?: React.ComponentType<any>;
  plan?: PlanTier;
  children?: NavItem[];
}

interface StoreSidebarProps {
  activeTab: StoreTab;
  onTabChange: (tab: StoreTab) => void;
  storeName?: string;
}

const planBadge: Record<PlanTier, { label: string; color: string }> = {
  free: { label: '', color: '' },
  pro: { label: 'Pro+', color: 'bg-amber-500/20 text-amber-400' },
  business: { label: 'Biz+', color: 'bg-blue-500/20 text-blue-400' },
  enterprise: { label: 'Ent', color: 'bg-purple-500/20 text-purple-400' },
};

const navItems: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: HomeIcon },
  { id: 'orders', label: 'Orders', icon: ShoppingCartIcon },
  {
    id: 'products', label: 'Products', icon: PackageIcon,
    children: [
      { id: 'products-all', label: 'All Products' },
      { id: 'products-categories', label: 'Categories' },
      { id: 'products-bulk', label: 'Bulk Operations', plan: 'pro' },
      { id: 'products-recommendations', label: 'Recommendations', plan: 'business' },
    ],
  },
  {
    id: 'inventory', label: 'Inventory', icon: Box, plan: 'pro',
    children: [
      { id: 'inventory-stock', label: 'Stock Management' },
      { id: 'inventory-locations', label: 'Locations', plan: 'business' },
      { id: 'inventory-transfers', label: 'Transfers', plan: 'business' },
      { id: 'inventory-suppliers', label: 'Suppliers' },
      { id: 'inventory-reorder', label: 'Reorder' },
    ],
  },
  {
    id: 'customers', label: 'Customers', icon: Users,
    children: [
      { id: 'customers-all', label: 'All Customers' },
      { id: 'customers-segments', label: 'Segments', plan: 'pro' },
      { id: 'customers-analytics', label: 'Analytics' },
      { id: 'customers-loyalty', label: 'Loyalty Program', plan: 'business' },
    ],
  },
  {
    id: 'marketing', label: 'Marketing', icon: Megaphone, plan: 'pro',
    children: [
      { id: 'marketing-email', label: 'Email Campaigns' },
      { id: 'marketing-sms', label: 'SMS Marketing', plan: 'business' },
      { id: 'marketing-cart-recovery', label: 'Cart Recovery' },
      { id: 'marketing-loyalty', label: 'Loyalty Program', plan: 'business' },
      { id: 'marketing-discounts', label: 'Discounts & Promos' },
      { id: 'marketing-social', label: 'Social Media' },
    ],
  },
  {
    id: 'analytics', label: 'Analytics', icon: BarChartIcon, plan: 'pro',
    children: [
      { id: 'analytics-overview', label: 'Overview' },
      { id: 'analytics-forecasting', label: 'Forecasting', plan: 'business' },
      { id: 'analytics-customer-insights', label: 'Customer Insights' },
      { id: 'analytics-traffic', label: 'Traffic & Conversion' },
      { id: 'analytics-insights', label: 'Automated Insights', plan: 'business' },
      { id: 'analytics-market-intelligence', label: 'Market Intelligence', plan: 'enterprise' },
      { id: 'analytics-custom-reports', label: 'Custom Reports', plan: 'enterprise' },
    ],
  },
  {
    id: 'financial', label: 'Financial', icon: DollarSign, plan: 'business',
    children: [
      { id: 'financial-accounting', label: 'Accounting' },
      { id: 'financial-tax', label: 'Tax Settings' },
      { id: 'financial-payment-options', label: 'Payment Options' },
      { id: 'financial-health', label: 'Financial Health' },
    ],
  },
  { id: 'live-chat', label: 'Live Chat', icon: MessageCircle, plan: 'business' },
  { id: 'reviews', label: 'Reviews', icon: Star, plan: 'pro' },
  {
    id: 'store-settings', label: 'Store Settings', icon: SettingsIcon,
    children: [
      { id: 'store-settings-general', label: 'General' },
      { id: 'store-settings-domain', label: 'Domain' },
      { id: 'store-settings-theme', label: 'Theme & Branding' },
      { id: 'store-settings-seo', label: 'SEO' },
      { id: 'store-settings-payment', label: 'Payment' },
      { id: 'store-settings-shipping', label: 'Shipping' },
      { id: 'store-settings-tax', label: 'Tax' },
      { id: 'store-settings-integrations', label: 'Integrations' },
      { id: 'store-settings-legal', label: 'Legal Pages' },
      { id: 'store-settings-webhooks', label: 'Webhooks' },
      { id: 'store-settings-languages', label: 'Languages', plan: 'enterprise' },
      { id: 'store-settings-invoices', label: 'Invoice Templates', plan: 'pro' },
    ],
  },
  {
    id: 'support', label: 'Support', icon: HelpCircle,
    children: [
      { id: 'support-help', label: 'Help Center' },
      { id: 'support-tickets', label: 'Support Tickets' },
      { id: 'support-account-manager', label: 'Account Manager', plan: 'enterprise' },
    ],
  },
];

export function StoreSidebar({ activeTab, onTabChange, storeName }: StoreSidebarProps) {
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(() => {
    const initial = new Set<string>();
    navItems.forEach(item => {
      if (item.children?.some(c => c.id === activeTab) || item.id === activeTab) {
        initial.add(item.id);
      }
    });
    return initial;
  });

  const toggleGroup = (id: string) => {
    setExpandedGroups(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const isChildActive = (item: NavItem) =>
    item.children?.some(c => c.id === activeTab) ?? false;

  const renderPlanBadge = (plan?: PlanTier) => {
    if (!plan || plan === 'free') return null;
    const badge = planBadge[plan];
    return (
      <span className={`ml-auto text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${badge.color} flex items-center gap-0.5`}>
        <Lock size={8} />
        {badge.label}
      </span>
    );
  };

  const renderNavItem = (item: NavItem) => {
    const Icon = item.icon;
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedGroups.has(item.id);
    const isActive = activeTab === item.id || isChildActive(item);

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasChildren) {
              toggleGroup(item.id);
              if (!isChildActive(item)) {
                onTabChange(item.children![0].id);
              }
            } else {
              onTabChange(item.id);
            }
          }}
          className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-sm transition-all duration-150 ${
            isActive
              ? 'bg-primary/15 text-primary font-semibold'
              : 'text-muted-foreground hover:bg-muted hover:text-foreground'
          }`}
        >
          {Icon && <Icon size={17} />}
          <span className="truncate">{item.label}</span>
          {renderPlanBadge(item.plan)}
          {hasChildren && (
            <span className={`${item.plan ? '' : 'ml-auto'} text-muted-foreground`}>
              {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
          )}
        </button>

        {/* Sub-items */}
        {hasChildren && isExpanded && (
          <div className="ml-6 mt-0.5 space-y-0.5 border-l border-border pl-2">
            {item.children!.map(child => {
              const isSubActive = activeTab === child.id;
              return (
                <button
                  key={child.id}
                  onClick={() => onTabChange(child.id)}
                  className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-xs transition-all ${
                    isSubActive
                      ? 'bg-primary/10 text-primary font-medium'
                      : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                  }`}
                >
                  <span className="truncate">{child.label}</span>
                  {renderPlanBadge(child.plan)}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-64 bg-card border-r border-border h-full flex flex-col">
      {/* Store Header */}
      {storeName && (
        <div className="p-4 border-b border-border">
          <h2 className="text-base font-bold text-foreground truncate">{storeName}</h2>
          <p className="text-[10px] text-muted-foreground mt-0.5">Store Dashboard</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5 scrollbar-thin">
        {navItems.map(renderNavItem)}
      </nav>
    </div>
  );
}
