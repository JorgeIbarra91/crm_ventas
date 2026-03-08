'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { createBrowserClient } from '@/lib/supabaseBrowser';
import { LogOut, LayoutDashboard, Users, ShoppingCart, ListTodo, Settings, Menu, X } from 'lucide-react';
interface Profile {
  full_name: string | null;
  avatar_url: string | null;
  role: string | null;
}

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const supabase = createBrowserClient();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    async function getProfile() {
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();

      if (!user) {
        setError('User not authenticated.');
        setLoading(false);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select(`full_name, avatar_url, role`)
        .eq('id', user.id)
        .single();

      if (error) {
        setError(error.message);
      } else {
        setProfile(data);
      }
      setLoading(false);
    }
    getProfile();
  }, []);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      alert('Error logging out: ' + error.message);
    } else {
      router.push('/login');
    }
  };

  const navItems = [
    { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Clients', href: '/clients', icon: Users },
    { name: 'Sales', href: '/sales', icon: ShoppingCart },
    { name: 'Tasks', href: '/tasks', icon: ListTodo },
    { name: 'Settings', href: '/settings', icon: Settings },
  ];

  if (loading) return null; // Or a loading spinner
  if (error) return <div className="text-red-500 p-4">{error}</div>; // Or a more elaborate error display

  return (
    <>
      {/* Mobile Menu Button */}
      <div className="lg:hidden flex justify-between items-center p-4 bg-zinc-800 text-slate-100 shadow-md">
        <button onClick={() => setIsOpen(!isOpen)} className="text-slate-100">
          {isOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
        <span className="text-lg font-semibold">CRM Dashboard</span>
      </div>

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 transition-transform duration-200 ease-in-out
                   lg:relative z-40 w-64 bg-zinc-900 border-r border-zinc-700 flex flex-col`}
      >
        {/* Logo and Name */}
        <div className="flex items-center justify-center h-16 border-b border-zinc-700 text-slate-100 text-xl font-bold">
          Sales CRM
        </div>

        {/* User Profile */}
        {profile && (
          <div className="p-4 border-b border-zinc-700 text-center">
            {profile.avatar_url && (
              <img
                src={profile.avatar_url}
                alt="User Avatar"
                className="w-16 h-16 rounded-full mx-auto mb-2 object-cover"
              />
            )}
            <p className="text-lg font-semibold text-slate-100">{profile.full_name || 'User'}</p>
            <p className="text-sm text-slate-400 capitalize">{profile.role || 'Sales Rep'}</p>
          </div>
        )}

        {/* Navigation */}
        <nav className="flex-1 px-2 py-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link key={item.name} href={item.href} className={`
                flex items-center px-3 py-2 rounded-md text-base font-medium
                ${isActive
                  ? 'bg-blue-700 text-white shadow-md'
                  : 'text-slate-300 hover:bg-zinc-700 hover:text-white'}
                transition-colors duration-150 ease-in-out
              `}>
                <Icon className="h-5 w-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-zinc-700">
          <button
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 rounded-md text-base font-medium text-red-400 hover:bg-zinc-700 hover:text-red-300
                       transition-colors duration-150 ease-in-out"
          >
            <LogOut className="h-5 w-5 mr-3" />
            Logout
          </button>
        </div>
      </aside>
    </>
  );
}