import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Users, Shield, ChevronDown } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth, AppRole } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/hooks/use-toast';

interface UserWithRole {
  id: string;
  user_id: string;
  email: string | null;
  display_name: string | null;
  created_at: string;
  role: AppRole;
  role_id: string;
}

const ROLES: AppRole[] = ['user', 'developer', 'admin'];

const AdminPanel = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // Fetch profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*');

      if (rolesError) throw rolesError;

      // Combine profiles with roles
      const usersWithRoles: UserWithRole[] = (profiles || []).map((profile) => {
        const userRole = roles?.find((r) => r.user_id === profile.user_id);
        return {
          id: profile.id,
          user_id: profile.user_id,
          email: profile.email,
          display_name: profile.display_name,
          created_at: profile.created_at,
          role: (userRole?.role as AppRole) || 'user',
          role_id: userRole?.id || '',
        };
      });

      setUsers(usersWithRoles);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch users',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = async (userWithRole: UserWithRole, newRole: AppRole) => {
    if (userWithRole.user_id === user?.id) {
      toast({
        title: 'Warning',
        description: "You cannot change your own role",
        variant: 'destructive',
      });
      return;
    }

    setUpdatingUserId(userWithRole.user_id);

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: newRole })
        .eq('user_id', userWithRole.user_id);

      if (error) throw error;

      setUsers(users.map((u) =>
        u.user_id === userWithRole.user_id ? { ...u, role: newRole } : u
      ));

      toast({
        title: 'Role Updated',
        description: `${userWithRole.email} is now a ${newRole}`,
      });
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: 'Error',
        description: 'Failed to update role',
        variant: 'destructive',
      });
    } finally {
      setUpdatingUserId(null);
    }
  };

  const getRoleBadgeColor = (role: AppRole) => {
    switch (role) {
      case 'admin':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'developer':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-16 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center gap-3 mb-8">
            <div className="w-10 h-10 bg-foreground flex items-center justify-center">
              <Shield className="w-5 h-5 text-background" />
            </div>
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Admin Panel</h1>
              <p className="text-muted-foreground">
                Manage users and their roles
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="border border-border p-4">
              <div className="flex items-center gap-2 text-muted-foreground mb-1">
                <Users className="w-4 h-4" />
                <span className="text-xs font-mono uppercase">Total Users</span>
              </div>
              <p className="text-2xl font-bold">{users.length}</p>
            </div>
            <div className="border border-border p-4">
              <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Developers</div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === 'developer').length}
              </p>
            </div>
            <div className="border border-border p-4">
              <div className="text-xs font-mono uppercase text-muted-foreground mb-1">Admins</div>
              <p className="text-2xl font-bold">
                {users.filter((u) => u.role === 'admin').length}
              </p>
            </div>
          </div>

          {/* User List */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm">
              Loading users...
            </div>
          ) : users.length === 0 ? (
            <div className="text-center py-12 border border-border">
              <p className="text-muted-foreground">No users found</p>
            </div>
          ) : (
            <div className="border border-border">
              {/* Table Header */}
              <div className="grid grid-cols-4 gap-4 p-4 border-b border-border bg-secondary/30 text-xs font-mono uppercase text-muted-foreground">
                <div>User</div>
                <div>Email</div>
                <div>Joined</div>
                <div>Role</div>
              </div>

              {/* Table Body */}
              <AnimatePresence>
                {users.map((userWithRole) => (
                  <motion.div
                    key={userWithRole.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="grid grid-cols-4 gap-4 p-4 border-b border-border last:border-b-0 items-center hover:bg-secondary/10 transition-colors"
                  >
                    <div>
                      <p className="font-medium">
                        {userWithRole.display_name || 'Unnamed User'}
                      </p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {userWithRole.user_id.slice(0, 8)}...
                      </p>
                    </div>
                    <div className="text-sm truncate">
                      {userWithRole.email || '—'}
                    </div>
                    <div className="text-sm text-muted-foreground font-mono">
                      {new Date(userWithRole.created_at).toLocaleDateString()}
                    </div>
                    <div className="relative">
                      <select
                        value={userWithRole.role}
                        onChange={(e) => handleRoleChange(userWithRole, e.target.value as AppRole)}
                        disabled={updatingUserId === userWithRole.user_id || userWithRole.user_id === user?.id}
                        className={`appearance-none w-full px-3 py-1.5 pr-8 border text-sm font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${getRoleBadgeColor(userWithRole.role)}`}
                      >
                        {ROLES.map((role) => (
                          <option key={role} value={role}>
                            {role}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 pointer-events-none" />
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}

          {/* Info */}
          <p className="text-xs text-muted-foreground mt-4 font-mono">
            Note: You cannot change your own role. Role changes take effect on next login.
          </p>
        </div>
      </main>
    </div>
  );
};

export default AdminPanel;
