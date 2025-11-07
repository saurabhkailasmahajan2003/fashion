import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingBag, Users, Store, PlusCircle, Pencil, Trash2, Truck } from 'lucide-react';

export default function AdminNav() {
  const navItems = [
    { path: '/admin', label: 'Dashboard', Icon: LayoutDashboard },
    { path: '/admin/products', label: 'Products', Icon: Package },
    { path: '/admin/products/add', label: 'Add Product', Icon: PlusCircle },
    { path: '/admin/products/edit', label: 'Edit Products', Icon: Pencil },
    { path: '/admin/products/remove', label: 'Remove Products', Icon: Trash2 },
    { path: '/admin/orders', label: 'Orders', Icon: ShoppingBag },
    { path: '/admin/orders/status', label: 'Change Delivery Status', Icon: Truck },
    { path: '/admin/users', label: 'Users', Icon: Users }
  ];

  return (
    <nav className="space-y-1 py-6">
      {navItems.map(item => (
        <NavLink
          key={item.path}
          to={item.path}
          className={({ isActive }) =>
            `flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              isActive
                ? 'bg-gray-700 text-white'
                : 'text-gray-300 hover:bg-gray-700 hover:text-white'
            }`
          }
          end={item.path === '/admin'}
        >
          <item.Icon size={18} className="mr-3" />
          {item.label}
        </NavLink>
      ))}
      
      <NavLink
        to="/"
        className="flex items-center px-4 py-2 text-sm font-medium text-gray-300 hover:bg-gray-700 hover:text-white rounded-md transition-colors"
      >
        <Store size={18} className="mr-3" />
        View Store
      </NavLink>
    </nav>
  );
}