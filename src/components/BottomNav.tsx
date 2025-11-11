import { Home, Utensils, Dumbbell, TrendingUp, MessageCircle } from 'lucide-react';
import { NavLink } from '@/components/NavLink';

export default function BottomNav() {
  const navItems = [
    { icon: Home, label: 'Home', path: '/dashboard' },
    { icon: Utensils, label: 'Meals', path: '/meals' },
    { icon: Dumbbell, label: 'Workout', path: '/workout' },
    { icon: TrendingUp, label: 'Progress', path: '/progress' },
    { icon: MessageCircle, label: 'Chat', path: '/chat' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border z-50">
      <div className="flex justify-around items-center h-16 max-w-screen-xl mx-auto">
        {navItems.map(({ icon: Icon, label, path }) => (
          <NavLink
            key={path}
            to={path}
            className="flex flex-col items-center justify-center flex-1 h-full gap-1 text-muted-foreground hover:text-primary transition-colors"
            activeClassName="text-primary font-semibold"
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs">{label}</span>
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
