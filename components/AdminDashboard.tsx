import React, { useState, useEffect, useMemo } from 'react';
import type { Session } from '@supabase/supabase-js';
import { getAdminDashboardStats, getAllUsers, getUserGrowthData, getPlanDistribution, getAdminActivityFeed, manageSubscription, updateUserStatus } from '../services/geminiService';
import type { AdminDashboardStats, UserRecord, UserGrowthDataPoint, PlanDistribution, ActivityEvent } from '../types';
import { BotIcon } from './icons/BotIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BarChart } from './charts/BarChart';
import { DonutChart } from './charts/DonutChart';
import { SearchIcon } from './icons/SearchIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { Pagination } from './Pagination';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { PLANS } from '../constants';
import { XIcon } from './icons/XIcon';
import { BellIcon } from './icons/BellIcon';
import { UserCircleIcon } from './icons/UserCircleIcon';
import { UserDetailsModal } from './UserDetailsModal';
import { MinusCircleIcon } from './icons/MinusCircleIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { UserOffIcon } from './icons/UserOffIcon';
import { UserCheckIcon } from './icons/UserCheckIcon';
import { KeyIcon } from './icons/KeyIcon';
import { ApiAccessModal } from './ApiAccessModal';


const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; }> = ({ icon, title, value }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex items-center space-x-4">
    <div className="bg-violet-100 dark:bg-violet-900/50 p-3 rounded-full">
      {icon}
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const SkeletonStatCard: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex items-center space-x-4 animate-pulse">
        <div className="bg-gray-200 dark:bg-gray-700 p-3 rounded-full w-12 h-12"></div>
        <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
        </div>
    </div>
);

const SkeletonChart: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm animate-pulse">
        <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
        <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
    </div>
);

const planColors: { [key: string]: string } = {
  None: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-600/20',
  Starter: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300 ring-1 ring-inset ring-yellow-500/10 dark:ring-yellow-600/20',
  Basic: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 ring-1 ring-inset ring-blue-500/10 dark:ring-blue-600/20',
  Pro: 'bg-violet-100 text-violet-800 dark:bg-violet-900/50 dark:text-violet-300 ring-1 ring-inset ring-violet-500/10 dark:ring-violet-600/20',
};

const subscriptionStatusColors: { [key: string]: string } = {
  active: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300',
  trialing: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300',
  past_due: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-300',
  unpaid: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300',
  canceled: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  incomplete: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
  default: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y ago";
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "mo ago";
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d ago";
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h ago";
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m ago";
    return Math.floor(seconds) + "s ago";
};

const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
    });
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(value);
};

interface AdminDashboardProps {
  session: Session;
}

type SortableColumn = keyof Omit<UserRecord, 'raw_user_meta_data' | 'id'>;


export const AdminDashboard: React.FC<AdminDashboardProps> = ({ session }) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthDataPoint[] | null>(null);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution | null>(null);
  const [activityFeed, setActivityFeed] = useState<ActivityEvent[]>([]);
  
  const [isLoading, setIsLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [planFilter, setPlanFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [isBulkActionLoading, setIsBulkActionLoading] = useState(false);

  const [modal, setModal] = useState<'changePlan' | 'cancelSub' | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedUserForDetails, setSelectedUserForDetails] = useState<UserRecord | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedUserIds, setSelectedUserIds] = useState<Set<string>>(new Set());
  
  const [sortConfig, setSortConfig] = useState<{ key: SortableColumn; direction: 'ascending' | 'descending' }>({ key: 'joinedAt', direction: 'descending' });
  const [showApiModal, setShowApiModal] = useState(false);
  
  const USERS_PER_PAGE = 10;

  const fetchAllData = async () => {
    setIsLoading(true);
    setUpdateError(null); 
    try {
        const [statsData, usersData, growthData, planData, activityData] = await Promise.all([
            getAdminDashboardStats(),
            getAllUsers(),
            getUserGrowthData(),
            getPlanDistribution(),
            getAdminActivityFeed()
        ]);
        setStats(statsData);
        setAllUsers(usersData);
        setUserGrowth(growthData);
        setPlanDistribution(planData);
        setActivityFeed(activityData);
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "An unknown error occurred. Please refresh.";
        setUpdateError(errorMessage);
    } finally {
        setIsLoading(false);
    }
  };

  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session]);
  
  const handleSubscriptionChange = async (newPriceId: string) => {
    if (!selectedUser) return;
    setUpdateError(null);
    setActionLoading(selectedUser.id);
    setModal(null);

    try {
        await manageSubscription(selectedUser.id, 'change', newPriceId);
        await fetchAllData();
    } catch (error: any) {
        setUpdateError(error.message);
    } finally {
        setActionLoading(null);
    }
  };

  const handleSubscriptionCancel = async () => {
    if (!selectedUser) return;
    setUpdateError(null);
    setActionLoading(selectedUser.id);
    setModal(null);

    try {
        await manageSubscription(selectedUser.id, 'cancel');
        await fetchAllData();
    } catch (error: any) {
        setUpdateError(error.message);
    } finally {
        setActionLoading(null);
    }
  };

  const openModal = (type: 'changePlan' | 'cancelSub', user: UserRecord) => {
      setSelectedUser(user);
      setModal(type);
      setActiveMenu(null);
  };

  const handleViewDetails = (user: UserRecord) => {
    setSelectedUserForDetails(user);
    setIsDetailsModalOpen(true);
  };
  
  const handleUserStatusUpdate = async (userIds: string[], status: 'Active' | 'Suspended') => {
      setUpdateError(null);
      try {
          await updateUserStatus(userIds, status);
          setAllUsers(prevUsers => prevUsers.map(u => userIds.includes(u.id) ? { ...u, status } : u));
      } catch (error: any) {
          setUpdateError(error.message);
      }
  };
  
  const handleBulkAction = async (status: 'Active' | 'Suspended') => {
      setIsBulkActionLoading(true);
      await handleUserStatusUpdate(Array.from(selectedUserIds), status);
      setSelectedUserIds(new Set());
      setIsBulkActionLoading(false);
  };

  const handleIndividualStatusUpdate = async (user: UserRecord) => {
      setActiveMenu(null);
      setActionLoading(user.id);
      const newStatus = user.status === 'Active' ? 'Suspended' : 'Active';
      await handleUserStatusUpdate([user.id], newStatus);
      setActionLoading(null);
  };
  
  const filteredUsers = useMemo(() => {
    return allUsers
      .filter(user => user.email.toLowerCase().includes(searchQuery.toLowerCase()))
      .filter(user => planFilter === 'all' || user.plan === planFilter)
      .filter(user => statusFilter === 'all' || user.subscriptionStatus === statusFilter);
  }, [allUsers, searchQuery, planFilter, statusFilter]);
  
  const sortedAndFilteredUsers = useMemo(() => {
    let sortableItems = [...filteredUsers];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        
        if (aValue === null || aValue === undefined) return 1;
        if (bValue === null || bValue === undefined) return -1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [filteredUsers, sortConfig]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return sortedAndFilteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [sortedAndFilteredUsers, currentPage]);

  const totalPages = Math.ceil(sortedAndFilteredUsers.length / USERS_PER_PAGE);
  
  const requestSort = (key: SortableColumn) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };
  
  const handleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedUserIds(new Set(paginatedUsers.map(u => u.id)));
    } else {
      setSelectedUserIds(new Set());
    }
  };

  const subscriptionStatusOptions = useMemo(() => {
    const statuses = new Set(allUsers.map(u => u.subscriptionStatus).filter(Boolean));
    return Array.from(statuses);
  }, [allUsers]);

  const renderActivityIcon = (type: ActivityEvent['type']) => {
    switch (type) {
      case 'user_signup':
        return <UserCircleIcon className="w-5 h-5 text-green-500" />;
      case 'chatbot_created':
        return <BotIcon className="w-5 h-5 text-blue-500" />;
      case 'subscription_started':
        return <CurrencyDollarIcon className="w-5 h-5 text-yellow-500" />;
      case 'subscription_canceled':
        return <MinusCircleIcon className="w-5 h-5 text-red-500" />;
      default:
        return <BellIcon className="w-5 h-5 text-gray-500" />;
    }
  };
  
  const SortableHeader: React.FC<{ columnKey: SortableColumn; children: React.ReactNode }> = ({ columnKey, children }) => (
    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
      <button onClick={() => requestSort(columnKey)} className="flex items-center gap-1 group">
        {children}
        {sortConfig.key === columnKey ? (
          sortConfig.direction === 'ascending' ? <ArrowUpIcon className="w-3 h-3" /> : <ArrowDownIcon className="w-3 h-3" />
        ) : (
          <ArrowDownIcon className="w-3 h-3 opacity-0 group-hover:opacity-50" />
        )}
      </button>
    </th>
  );
  
  const isAdminPro = allUsers.find(u => u.id === session.user.id)?.plan === 'Pro';

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

      {updateError && (
          <div className="bg-red-100 dark:bg-red-900/30 border-l-4 border-red-500 text-red-800 dark:text-red-300 p-4 rounded-md shadow-lg" role="alert">
              <div className="flex">
                  <div className="py-1 flex-shrink-0">
                      <svg className="fill-current h-6 w-6 text-red-500 mr-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M2.93 17.07A10 10 0 1 1 17.07 2.93 10 10 0 0 1 2.93 17.07zM11.414 10l2.829-2.828-1.415-1.415L10 8.586 7.172 5.757 5.757 7.172 8.586 10l-2.829 2.828 1.415 1.415L10 11.414l2.828 2.829 1.415-1.415L11.414 10z"/></svg>
                  </div>
                  <div className="flex-grow">
                      <p className="font-bold">Dashboard Failed to Load</p>
                      <p className="text-sm mt-1">There was a critical error fetching the required data. This is often due to a database configuration issue.</p>
                      <p className="mt-2 font-mono text-xs bg-red-200 dark:bg-red-900/50 p-2 rounded whitespace-pre-wrap">{updateError}</p>
                      <p className="text-sm mt-2">
                          <strong>How to fix:</strong> Please carefully review the SQL setup instructions in the comments of the <code>services/geminiService.ts</code> file. Ensure you have run the scripts for the <code>all_users</code> and <code>all_chatbots</code> views, including the critical <strong><code>GRANT SELECT</code></strong> commands.
                      </p>
                  </div>
                  <button onClick={() => setUpdateError(null)} className="ml-4 -mt-2 -mr-2 p-1.5 self-start flex-shrink-0" aria-label="Dismiss">
                      <XIcon className="w-5 h-5"/>
                  </button>
              </div>
          </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <> <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /> </>
        ) : stats && (
          <>
            <StatCard icon={<UsersIcon className="w-6 h-6 text-primary" />} title="Total Users" value={stats.totalUsers.toLocaleString()} />
            <StatCard icon={<BotIcon className="w-6 h-6 text-primary" />} title="Total Chatbots" value={stats.totalChatbots.toLocaleString()} />
            <StatCard icon={<ChatBubbleIcon className="w-6 h-6 text-primary" />} title="Total Conversations" value={stats.totalConversations.toLocaleString()} />
            <StatCard icon={<CurrencyDollarIcon className="w-6 h-6 text-primary" />} title="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">View, search, and manage all users.</p>
                    </div>
                    <div className="w-full md:w-auto flex flex-col sm:flex-row gap-2">
                        <div className="relative w-full sm:w-48">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
                            <input type="text" placeholder="Search email..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm transition dark:text-white" />
                        </div>
                        <select value={planFilter} onChange={e => setPlanFilter(e.target.value)} className="w-full sm:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm transition dark:text-white">
                            <option value="all">All Plans</option>
                            {PLANS.map(p => <option key={p.name} value={p.name}>{p.name}</option>)}
                        </select>
                        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="w-full sm:w-auto bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm transition dark:text-white">
                            <option value="all">All Statuses</option>
                            {subscriptionStatusOptions.map(s => <option key={s} value={s} className="capitalize">{s?.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                </div>
            </div>
            {selectedUserIds.size > 0 && (
                <div className="p-4 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-700/50 flex items-center justify-between animate-fade-in">
                    <p className="text-sm font-semibold">{selectedUserIds.size} user{selectedUserIds.size > 1 ? 's' : ''} selected</p>
                    <div className="flex items-center gap-2">
                        <button disabled={isBulkActionLoading} onClick={() => handleBulkAction('Suspended')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 dark:text-red-300 bg-red-100 dark:bg-red-900/40 rounded-md hover:bg-red-200 dark:hover:bg-red-900/60 disabled:opacity-50">
                            <UserOffIcon className="w-4 h-4" /> Suspend
                        </button>
                        <button disabled={isBulkActionLoading} onClick={() => handleBulkAction('Active')} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-green-600 dark:text-green-300 bg-green-100 dark:bg-green-900/40 rounded-md hover:bg-green-200 dark:hover:bg-green-900/60 disabled:opacity-50">
                            <UserCheckIcon className="w-4 h-4" /> Activate
                        </button>
                    </div>
                </div>
            )}
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700/50">
                      <tr>
                          <th scope="col" className="p-4"><input type="checkbox" onChange={handleSelectAll} checked={selectedUserIds.size > 0 && selectedUserIds.size === paginatedUsers.length} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" /></th>
                          <SortableHeader columnKey="email">User</SortableHeader>
                          <SortableHeader columnKey="plan">Plan</SortableHeader>
                          <SortableHeader columnKey="subscriptionStatus">Subscription</SortableHeader>
                          <SortableHeader columnKey="renewalDate">Renews On</SortableHeader>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Access</th>
                          <SortableHeader columnKey="joinedAt">Joined At</SortableHeader>
                          <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                      </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                      {isLoading ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={8} className="p-4"><div className="animate-pulse h-12 bg-gray-100 dark:bg-gray-700/50 rounded-md"></div></td></tr>) : 
                        paginatedUsers.map(user => (
                          <tr key={user.id} className={`transition-colors ${selectedUserIds.has(user.id) ? 'bg-violet-50 dark:bg-violet-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'} ${user.status === 'Suspended' ? 'opacity-60' : ''}`}>
                              <td className="p-4"><input type="checkbox" checked={selectedUserIds.has(user.id)} onChange={() => handleSelectUser(user.id)} className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary dark:bg-gray-700 dark:border-gray-600" /></td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <button onClick={() => handleViewDetails(user)} className="text-sm font-medium text-gray-900 dark:text-white hover:underline text-left truncate" title={user.email}>{user.email}</button>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${planColors[user.plan]}`}>{user.plan}</span></td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium capitalize ${subscriptionStatusColors[user.subscriptionStatus || 'default']}`}>
                                  {user.subscriptionStatus?.replace('_', ' ') || 'N/A'}
                                </span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.renewalDate || '—'}</td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${user.status === 'Active' ? 'bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300' : 'bg-red-100 dark:bg-red-900/50 text-red-800 dark:text-red-300'}`}>{user.status}</span>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{formatDate(user.joinedAt)}</td>
                              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                {actionLoading === user.id ? ( <svg className="animate-spin h-5 w-5 text-primary mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ) : (
                                  <div className="relative inline-block text-left">
                                      <button onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)} disabled={user.id === session.user.id} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" aria-haspopup="true" aria-expanded={activeMenu === user.id}>
                                          <MoreVerticalIcon className="w-5 h-5" /><span className="sr-only">Actions</span>
                                      </button>
                                      {activeMenu === user.id && (
                                          <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none z-10" role="menu">
                                              <div className="py-1" role="none">
                                                  <button onClick={() => openModal('changePlan', user)} className="w-full text-left flex items-center gap-3 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">Change Plan</button>
                                                  <button onClick={() => handleIndividualStatusUpdate(user)} className={`w-full text-left flex items-center gap-3 px-4 py-2 text-sm ${user.status === 'Active' ? 'text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40' : 'text-green-600 dark:text-green-400 hover:bg-green-50 dark:hover:bg-green-900/40'}`} role="menuitem">
                                                      {user.status === 'Active' ? <><UserOffIcon className="w-4 h-4" /> Suspend User</> : <><UserCheckIcon className="w-4 h-4" /> Activate User</>}
                                                  </button>
                                                  <button onClick={() => openModal('cancelSub', user)} disabled={user.plan === 'None' || user.subscriptionStatus === 'canceled'} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" role="menuitem">Cancel Subscription</button>
                                              </div>
                                          </div>
                                      )}
                                  </div>
                                )}
                              </td>
                          </tr>
                      ))}
                  </tbody>
              </table>
            </div>
            {totalPages > 1 && ( <div className="p-4 border-t border-gray-200 dark:border-gray-700"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalResults={sortedAndFilteredUsers.length} itemsPerPage={USERS_PER_PAGE}/></div> )}
        </div>

        <div className="lg:col-span-1 space-y-8">
            {isLoading ? <SkeletonChart /> : userGrowth && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">New Users (Last 7 Days)</h2>
                  <BarChart data={userGrowth} />
              </div>
            )}
            {isLoading ? <SkeletonChart /> : planDistribution && (
              <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
                  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Plan Distribution</h2>
                  <DonutChart data={planDistribution} />
              </div>
            )}
            {isAdminPro && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3"><KeyIcon className="w-6 h-6 text-primary" /><h3 className="text-xl font-bold text-gray-900 dark:text-white">API Access</h3></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Your Pro plan includes programmatic access to manage your chatbots.</p>
                    <button onClick={() => setShowApiModal(true)} className="w-full mt-6 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">Manage API Keys &rarr;</button>
                </div>
            )}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2"><BellIcon className="w-6 h-6 text-primary"/> Recent Activity</h2>
                {isLoading ? <div className="animate-pulse space-y-3"> <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div> <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div> <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-md"></div> </div> :
                  <ul className="space-y-4">
                    {activityFeed.map(event => (
                      <li key={event.id} className="flex items-start gap-3">
                          <div className="flex-shrink-0 mt-1">
                              {renderActivityIcon(event.type)}
                          </div>
                          <div>
                              <p className="text-sm text-gray-800 dark:text-gray-200 leading-tight"><span className="font-semibold">{event.userEmail}</span> {event.description}</p>
                              <p className="text-xs text-gray-500 dark:text-gray-400">{formatTimeAgo(event.timestamp)}</p>
                          </div>
                      </li>
                    ))}
                  </ul>
                }
            </div>
        </div>
      </div>
      
      {showApiModal && <ApiAccessModal onClose={() => setShowApiModal(false)} />}
      {isDetailsModalOpen && selectedUserForDetails && (
        <UserDetailsModal user={selectedUserForDetails} onClose={() => setIsDetailsModalOpen(false)} />
      )}
      {modal === 'changePlan' && selectedUser && ( <ChangePlanModal user={selectedUser} onConfirm={handleSubscriptionChange} onClose={() => setModal(null)} /> )}
      {modal === 'cancelSub' && selectedUser && ( <CancelSubscriptionModal user={selectedUser} onConfirm={handleSubscriptionCancel} onClose={() => setModal(null)} /> )}
    </div>
  );
};

const ChangePlanModal: React.FC<{ user: UserRecord; onConfirm: (newPriceId: string) => void; onClose: () => void; }> = ({ user, onConfirm, onClose }) => {
    const [selectedPriceId, setSelectedPriceId] = useState('');
    const availablePlans = PLANS.filter(p => p.id !== 'free' && p.name !== user.plan);
    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true">
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-lg w-full m-4 transform transition-all animate-slide-up">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 dark:text-white">Change Subscription Plan</h3>
                        <p className="mt-1 text-gray-600 dark:text-gray-400">For user: <span className="font-semibold">{user.email}</span></p>
                    </div>
                    <button onClick={onClose} className="p-2 text-gray-400 hover:text-gray-800 dark:hover:text-white rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6" /></button>
                </div>
                <div className="mt-6">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Current Plan: <span className="font-semibold text-primary">{user.plan}</span></p>
                    <fieldset className="mt-4">
                        <legend className="text-base font-semibold text-gray-900 dark:text-white">Select a new plan:</legend>
                        <div className="mt-2 space-y-3">
                            {availablePlans.map(plan => (
                                <label key={plan.id} className={`relative flex items-center p-4 rounded-lg border-2 cursor-pointer transition-all ${selectedPriceId === plan.id ? 'border-primary bg-violet-50 dark:bg-violet-900/30' : 'border-gray-300 dark:border-gray-600 hover:border-primary/70'}`}>
                                    <input type="radio" name="plan" value={plan.id} onChange={(e) => setSelectedPriceId(e.target.value)} className="h-4 w-4 text-primary focus:ring-primary border-gray-300" />
                                    <div className="ml-3 text-sm">
                                        <span className="font-bold text-gray-900 dark:text-white">{plan.name}</span>
                                        <span className="text-gray-500 dark:text-gray-400 ml-2">{plan.price}/{plan.priceDetail.split(' ')[1]}</span>
                                    </div>
                                </label>
                            ))}
                        </div>
                    </fieldset>
                </div>
                <div className="mt-8 flex justify-end gap-x-4">
                    <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                    <button type="button" onClick={() => onConfirm(selectedPriceId)} disabled={!selectedPriceId} className="px-6 py-2.5 text-sm font-semibold text-white bg-primary rounded-lg shadow-sm hover:bg-primary-dark disabled:bg-gray-400">Confirm Change</button>
                </div>
            </div>
        </div>
    );
};

const CancelSubscriptionModal: React.FC<{ user: UserRecord; onConfirm: () => void; onClose: () => void; }> = ({ user, onConfirm, onClose }) => (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full m-4 text-center transform transition-all animate-slide-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50">
                <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Cancel Subscription?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Are you sure you want to cancel the <span className="font-semibold">{user.plan}</span> plan for <span className="font-semibold">{user.email}</span>?
                The subscription will remain active until the end of the current billing period on <span className="font-semibold">{user.renewalDate}</span>.
            </p>
            <div className="mt-6 flex justify-center gap-x-4">
                <button type="button" onClick={onClose} className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">No, keep it</button>
                <button type="button" onClick={onConfirm} className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700">Yes, cancel</button>
            </div>
        </div>
    </div>
);