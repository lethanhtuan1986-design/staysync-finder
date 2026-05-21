import { Link, useLocation } from 'react-router-dom';
import { Home, Search, Heart, MapPin, BadgePercent } from 'lucide-react';

const navItems = [
  { to: '/', icon: Home },
  { to: '/search', icon: Search },
  { to: '/search/map', icon: MapPin },
  { to: '/promotions', icon: BadgePercent },
  { to: '/saved', icon: Heart },
];

export const MobileBottomNav = () => {
  const location = useLocation();

  const isActive = (to: string) => {
    if (to.includes('?')) {
      return location.pathname + location.search === to || location.pathname === to.split('?')[0];
    }
    return location.pathname === to;
  };

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-14">
        {navItems.map((item) => {
          const active = isActive(item.to);
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex items-center justify-center flex-1 h-full transition-colors ${
                active ? 'text-primary' : 'text-muted-foreground'
              }`}
            >
              <item.icon size={20} />
            </Link>
          );
        })}
      </div>
    </nav>
  );
};
