import { useState, useEffect } from 'react';
import DashboardLayout from '../../components/layout/DashboardLayout';
import { adminAPI } from '../../services/adminService';
import { Search, Check, X, Trash2, ToggleLeft, ToggleRight } from 'lucide-react';
import {useAdmin } from '../../context/AdminContext';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

const AdminUsers = () => {
  
  const {filters, setFilters, status, setStatus} = useAdmin();
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0
  });
  const queryClient = useQueryClient();
  const {data, isLoading:loading, isError,refetch} = useQuery({
    queryKey : ['adminUsers', filters, pagination.currentPage],
    queryFn: async ()=>{
      const response = await adminAPI.getUsers({
        page: pagination.currentPage,
        limit: 10,
        ... filters
      });
      if (response.success) {
        setPagination({
          currentPage: response.currentPage,
          totalPages: response. totalPages,
          totalUsers:  response.totalUsers
        });
        return response.users;
      }
    },
    staleTime: 60*1000,
    refetchOnMount: true,
    refetchOnWindowFocus:false,
    retry:2
  })

  const users = data || [];


  const verifyUserMutation = useMutation({
    mutationFn: async (userId) => {
      return await adminAPI.verifyUser(userId);
    },
    onSuccess: (_,userId)=>{
      if (response.success) {
        alert('User verified successfully!');
        queryClient.invalidateQueries(['adminUsers']);
      }
    },
    onError: (error) => {
      alert(error.response?.data?. message || 'Failed to verify user');
    }
  })

  const toggleStatusMutation = useMutation({
    mutationFn: async (userId) => {
      return await adminAPI.toggleUserStatus(userId);
    },
    onSuccess: (response) => {
      if (response.success) {
        alert(response.message);
        queryClient.invalidateQueries(['adminUsers']);
      }
    },
    onError: (error) => {
      alert(error.response?.data?. message || 'Failed to update user');
    }
  });

  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      return await adminAPI.deleteUser(userId);
    },
    onSuccess: (response) => {
      if (response.success) {
        alert('User deleted successfully!');
        queryClient.invalidateQueries(['adminUsers']);
      }
    },
    onError: (error) => {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  });

  const handleVerify = async (userId) => {
    if (!window.confirm('Verify this user?')) return;
    verifyUserMutation.mutate(userId);
  };
  
  const handleToggleStatus = async (userId) => {
    if (!window. confirm('Toggle user status?')) return;
    toggleStatusMutation.mutate(userId);
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('you want to delete this user?')) return;
    deleteUserMutation.mutate(userId);
  };

   const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, currentPage: newPage }));
  };

  const getRoleBadge = (role) => {
    const styles = {
      restaurant: 'bg-blue-100 text-blue-700',
      ngo: 'bg-green-100 text-green-700',
      admin: 'bg-purple-100 text-purple-700'
    };
    return styles[role] || 'bg-gray-100 text-gray-700';
  };

  return (
    <DashboardLayout role="admin">
      <div className="p-4 sm:p-6 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-2">User Management</h1>
          <p className="text-sm sm:text-base text-gray-600">Manage and verify platform users</p>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl p-4 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={filters.search}
                  onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                  placeholder="Search by email or name..."
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Role Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Role</label>
              <select
                value={filters.role}
                onChange={(e) => setFilters({ ... filters, role: e.target. value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All Roles</option>
                <option value="restaurant">Restaurant</option>
                <option value="ngo">NGO</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Status</label>
              <select
                value={filters.status}
                onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus: ring-green-500 focus:border-transparent outline-none"
              >
                <option value="all">All Status</option>
                <option value="verified">Verified</option>
                <option value="unverified">Unverified</option>
              </select>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Joined
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
                      </div>
                    </td>
                  </tr>
                ) : users.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="px-6 py-12 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                ) : (
                  users.map((user) => (
                    <tr key={user._id} className="hover:bg-gray-50">
                      <td className="px-6 py-4">
                        <div>
                          <p className="font-medium text-gray-900">{user.organizationName || user.name}</p>
                          <p className="text-sm text-gray-500">{user.email}</p>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getRoleBadge(user.role)}`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col gap-1">
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user.isVerified ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                          }`}>
                            {user.isVerified ?  '✓ Verified' : '⏳ Unverified'}
                          </span>
                          <span className={`px-2 py-1 rounded text-xs font-semibold ${
                            user. isActive ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'
                          }`}>
                            {user.isActive ?  '● Active' : '○ Inactive'}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString('en-IN', {
                          day: '2-digit',
                          month: 'short',
                          year: 'numeric'
                        })}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {! user.isVerified && (
                            <button
                              onClick={() => handleVerify(user._id)}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                              title="Verify user"
                            >
                              <Check size={18} />
                            </button>
                          )}
                          <button
                            onClick={() => handleToggleStatus(user._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title={user.isActive ? 'Deactivate' : 'Activate'}
                          >
                            {user.isActive ? <ToggleRight size={18} /> : <ToggleLeft size={18} />}
                          </button>
                          {user.role !== 'admin' && (
                            <button
                              onClick={() => handleDelete(user._id)}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                              title="Delete user"
                            >
                              <Trash2 size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
              <p className="text-sm text-gray-600">
                Showing {users.length} of {pagination.totalUsers} users
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination. currentPage === 1}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Previous
                </button>
                <span className="px-4 py-2 text-sm font-medium">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <button
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                  className="px-4 py-2 border border-gray-300 rounded-lg hover: bg-gray-50 disabled: opacity-50 disabled:cursor-not-allowed text-sm font-medium"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};

export default AdminUsers;