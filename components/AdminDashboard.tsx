
import React, { useState, useEffect, useMemo } from 'react';
import type { User } from '@supabase/supabase-js';
import { getAdminDashboardStats, getAllUsers, getUserGrowthData, getPlanDistribution, updateUserRole, supabase, manageSubscription, getPlans, updatePlan } from '../services/geminiService';
import type { AdminDashboardStats, UserRecord, UserGrowthDataPoint, PlanDistribution, Plan } from '../types';
import { BotIcon } from './icons/BotIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { UsersIcon } from './icons/UsersIcon';
import { BarChart } from './charts/BarChart';
import { DonutChart } from './charts/DonutChart';
import { SearchIcon } from './icons/SearchIcon';
import { MoreVerticalIcon } from './icons/MoreVerticalIcon';
import { Pagination } from './Pagination';
import { CurrencyDollarIcon } from './icons/CurrencyDollarIcon';
import { StripeIcon } from './icons/StripeIcon';
import { XIcon } from './icons/XIcon';
import { PlanEditorModal } from './PlanEditorModal';

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
  Free: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 ring-1 ring-inset ring-gray-500/10 dark:ring-gray-600/20',
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

const formatDate = (dateString: string) => {
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
    onNavigateToStripeConnect: () => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ onNavigateToStripeConnect }) => {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null);
  const [allUsers, setAllUsers] = useState<UserRecord[]>([]);
  const [userGrowth, setUserGrowth] = useState<UserGrowthDataPoint[] | null>(null);
  const [planDistribution, setPlanDistribution] = useState<PlanDistribution | null>(null);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [arePlansDynamic, setArePlansDynamic] = useState<boolean>(false);
  
  const [isLoading, setIsLoading] = useState(true);
  const [isUsersLoading, setIsUsersLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [updateError, setUpdateError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // State for modals
  const [modal, setModal] = useState<'changePlan' | 'cancelSub' | 'editPlan' | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserRecord | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  const USERS_PER_PAGE = 5;

  const fetchAllData = async () => {
      setIsLoading(true);
      setIsUsersLoading(true);
      try {
          const [usersData, plansResponse, growthData, distributionData] = await Promise.all([
              getAllUsers(),
              getPlans(),
              getUserGrowthData(),
              getPlanDistribution(),
          ]);
          setAllUsers(usersData);
          setPlans(plansResponse.plans);
          setArePlansDynamic(plansResponse.isDynamic);
          setUserGrowth(growthData);
          setPlanDistribution(distributionData);

          const statsData = await getAdminDashboardStats(plansResponse.plans);
          setStats(statsData);

      } catch (error) {
          console.error("Failed to fetch admin data:", error);
          setUpdateError("Failed to load dashboard data. Please refresh.");
      } finally {
          setIsLoading(false);
          setIsUsersLoading(false);
      }
  };

  useEffect(() => {
    const getCurrentUser = async () => {
        if (supabase) {
            const { data: { user } } = await supabase.auth.getUser();
            setCurrentUser(user);
        }
    };
    getCurrentUser();
    fetchAllData();
  }, []);
  
  const handleRoleChange = async (userId: string, newRole: 'User' | 'Admin') => {
    setUpdateError(null);
    setActiveMenu(null);
    setActionLoading(userId);

    const originalUsers = [...allUsers];
    setAllUsers(prevUsers => prevUsers.map(u => (u.id === userId ? { ...u, role: newRole } : u)));

    try {
        await updateUserRole(userId, newRole);
    } catch (error: any) {
        console.error("Failed to update role:", error);
        setUpdateError(error.message || "An unexpected error occurred.");
        setAllUsers(originalUsers);
    } finally {
        setActionLoading(null);
    }
  };

  const handleSubscriptionChange = async (newPriceId: string) => {
    if (!selectedUser) return;
    setUpdateError(null);
    setActionLoading(selectedUser.id);
    setModal(null);

    try {
        await manageSubscription(selectedUser.id, 'change', newPriceId);
        await fetchAllData();
    } catch (error: any) {
        console.error("Failed to change subscription:", error);
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
        console.error("Failed to cancel subscription:", error);
        setUpdateError(error.message);
    } finally {
        setActionLoading(null);
    }
  };

  const handlePlanUpdate = async (updatedPlan: Plan) => {
    setUpdateError(null);
    try {
        await updatePlan(updatedPlan);
        setModal(null);
        // Refetch plans to update UI
        setPlans(prevPlans => prevPlans.map(p => p.id === updatedPlan.id ? updatedPlan : p));
    } catch (error: any) {
        console.error("Failed to update plan:", error);
        setUpdateError(error.message);
        // Re-throw to keep the modal open and show error
        throw error;
    }
  };

  const openModal = (type: 'changePlan' | 'cancelSub' | 'editPlan', data: UserRecord | Plan) => {
      if (type === 'editPlan') {
        setSelectedPlan(data as Plan);
      } else {
        setSelectedUser(data as UserRecord);
      }
      setModal(type);
      setActiveMenu(null);
  };

  const filteredUsers = useMemo(() => {
    return allUsers.filter(user =>
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allUsers, searchQuery]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * USERS_PER_PAGE;
    return filteredUsers.slice(startIndex, startIndex + USERS_PER_PAGE);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.ceil(filteredUsers.length / USERS_PER_PAGE);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>

       {!arePlansDynamic && !isLoading && (
        <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-500/30 p-6 rounded-2xl">
          <h2 className="text-xl font-bold text-yellow-900 dark:text-yellow-100">Dynamic Plans Disabled</h2>
          <p className="text-yellow-700 dark:text-yellow-300 mt-1">
            The application is using fallback pricing data. To enable editing plans from this dashboard, you need to create the 'plans' table in your database.
          </p>
          <p className="text-yellow-700 dark:text-yellow-300 mt-2 text-sm">
            Please run the SQL script found in the comments of the <code>services/geminiService.ts</code> file in your Supabase SQL Editor.
          </p>
        </div>
      )}

      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-500/30 p-6 rounded-2xl flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
              <h2 className="text-xl font-bold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  <StripeIcon className="w-6 h-6" />
                  Accept Payments with Stripe
              </h2>
              <p className="text-blue-700 dark:text-blue-300 mt-1 max-w-2xl">
                  Follow our step-by-step guide to connect your Stripe account, create subscription plans, and enable checkout.
              </p>
          </div>
          <button
              onClick={onNavigateToStripeConnect}
              className="bg-blue-600 text-white font-semibold px-5 py-2.5 rounded-lg shadow-sm hover:bg-blue-700 transition-colors flex-shrink-0 w-full sm:w-auto"
          >
              View Setup Guide
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {isLoading ? (
          <>
            <SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard />
          </>
        ) : stats && (
          <>
            <StatCard icon={<UsersIcon className="w-6 h-6 text-primary" />} title="Total Users" value={stats.totalUsers.toLocaleString()} />
            <StatCard icon={<BotIcon className="w-6 h-6 text-primary" />} title="Total Chatbots" value={stats.totalChatbots.toLocaleString()} />
            <StatCard icon={<ChatBubbleIcon className="w-6 h-6 text-primary" />} title="Total Conversations" value={stats.totalConversations.toLocaleString()} />
            <StatCard icon={<CurrencyDollarIcon className="w-6 h-6 text-primary" />} title="Monthly Revenue" value={formatCurrency(stats.monthlyRevenue)} />
          </>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="lg:col-span-3">
          {isLoading ? <SkeletonChart /> : userGrowth && (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">New Users (Last 7 Days)</h2>
                <BarChart data={userGrowth} />
            </div>
          )}
        </div>
        <div className="lg:col-span-2">
           {isLoading ? <SkeletonChart /> : planDistribution && (
             <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm h-full">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Plan Distribution</h2>
                <DonutChart data={planDistribution} />
            </div>
           )}
        </div>
      </div>
      
       {/* Site Management Section */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Site Management: Pricing Plans</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Edit the subscription plans that appear on your website's pricing page.</p>
        </div>
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {isLoading ? (
            <div className="p-6 text-center text-gray-500">Loading plans...</div>
          ) : (
            plans.map(plan => (
              <div key={plan.id} className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">{plan.name} {plan.featured && <span className="text-xs font-medium text-primary bg-violet-100 dark:bg-violet-900/50 px-2 py-1 rounded-full ml-2">Featured</span>}</h3>
                  <p className="text-gray-600 dark:text-gray-400">{plan.price} {plan.priceDetail}</p>
                </div>
                <button 
                  onClick={() => openModal('editPlan', plan)}
                  disabled={!arePlansDynamic}
                  title={!arePlansDynamic ? "Database 'plans' table not found. See warning above." : "Edit Plan"}
                  className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Edit Plan
                </button>
              </div>
            ))
          )}
        </div>
      </div>


      <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Management</h2>
                    {updateError && (
                        <div className="mt-2 text-sm text-red-600 dark:text-red-400" role="alert">
                            <p><strong>Update Failed:</strong> {updateError}</p>
                        </div>
                    )}
                </div>
                <div className="relative w-full sm:max-w-xs">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input type="text" placeholder="Search by email..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm transition dark:text-white" />
                </div>
            </div>
        </div>
        {isUsersLoading ? (
            <div className="p-6 animate-pulse">
                {[...Array(USERS_PER_PAGE)].map((_, i) => ( <div key={i} className="flex justify-between items-center py-3 border-b border-gray-200 dark:border-gray-700"> <div className="flex-1 space-y-2"> <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div> <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div> </div> <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-4"></div> <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-16 mx-4"></div> <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div> </div> ))}
            </div>
        ) : (
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead className="bg-gray-50 dark:bg-gray-700/50">
                        <tr>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Plan</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Subscription Status</th>
                            <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Next Renewal</th>
                            <th scope="col" className="relative px-6 py-3"><span className="sr-only">Actions</span></th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {paginatedUsers.map(user => (
                            <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <div className="text-sm font-medium text-gray-900 dark:text-white">{user.email}</div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Joined: {formatDate(user.joinedAt)}</div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    <span className={`px-2.5 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${planColors[user.plan]}`}>{user.plan}</span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                    {user.subscriptionStatus ? (
                                        <span className={`capitalize inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${subscriptionStatusColors[user.subscriptionStatus] || subscriptionStatusColors.default}`}>
                                            {user.subscriptionStatus.replace('_', ' ')}
                                        </span>
                                    ) : ( <span className="text-xs text-gray-500 dark:text-gray-400">—</span> )}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">{user.renewalDate || '—'}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                    {actionLoading === user.id ? ( <svg className="animate-spin h-5 w-5 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ) : (
                                    <div className="relative inline-block text-left">
                                        <button onClick={() => setActiveMenu(activeMenu === user.id ? null : user.id)} disabled={user.id === currentUser?.id} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed" aria-haspopup="true" aria-expanded={activeMenu === user.id}>
                                            <MoreVerticalIcon className="w-5 h-5" /><span className="sr-only">Actions for {user.email}</span>
                                        </button>
                                        {activeMenu === user.id && (
                                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black dark:ring-gray-700 ring-opacity-5 focus:outline-none z-10" role="menu" aria-orientation="vertical">
                                                <div className="py-1" role="none">
                                                    <button onClick={() => openModal('changePlan', user)} disabled={user.plan === 'Free'} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-50" role="menuitem">Change Plan</button>
                                                    <button onClick={() => openModal('cancelSub', user)} disabled={user.plan === 'Free' || user.subscriptionStatus === 'canceled'} className="w-full text-left block px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/40 disabled:opacity-50" role="menuitem">Cancel Subscription</button>
                                                    <div className="border-t border-gray-200 dark:border-gray-700 my-1"></div>
                                                    <button onClick={() => handleRoleChange(user.id, user.role === 'Admin' ? 'User' : 'Admin')} className="w-full text-left block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700" role="menuitem">{user.role === 'Admin' ? 'Make User' : 'Make Admin'}</button>
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
        )}
        {totalPages > 1 && ( <div className="p-4 border-t border-gray-200 dark:border-gray-700"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} totalResults={filteredUsers.length} itemsPerPage={USERS_PER_PAGE}/></div> )}
      </div>

      {/* Modals */}
      {modal === 'changePlan' && selectedUser && (
        <ChangePlanModal user={selectedUser} plans={plans} onConfirm={handleSubscriptionChange} onClose={() => setModal(null)} />
      )}
      {modal === 'cancelSub' && selectedUser && (
        <CancelSubscriptionModal user={selectedUser} onConfirm={handleSubscriptionCancel} onClose={() => setModal(null)} />
      )}
      {modal === 'editPlan' && selectedPlan && (
        <PlanEditorModal plan={selectedPlan} onSave={handlePlanUpdate} onClose={() => setModal(null)} />
      )}
    </div>
  );
};

// Modal Components
const ChangePlanModal: React.FC<{ user: UserRecord; plans: Plan[]; onConfirm: (newPriceId: string) => void; onClose: () => void; }> = ({ user, plans, onConfirm, onClose }) => {
    const [selectedPriceId, setSelectedPriceId] = useState('');
    const availablePlans = plans.filter(p => p.id !== 'free' && p.name !== user.plan);

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
              <svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
              </svg>
            </div>
            <h3 id="confirmation-dialog-title" className="text-2xl font-bold text-gray-900 dark:text-white mt-4">
              Cancel Subscription?
            </h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
                Are you sure you want to cancel the subscription for <span className="font-semibold">{user.email}</span>? This action will set the subscription to cancel at the end of the current billing period and cannot be undone through this interface.
            </p>
            <div className="mt-6 flex justify-center gap-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-light"
              >
                No, Keep Active
              </button>
              <button
                type="button"
                onClick={onConfirm}
                className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 border border-transparent rounded-lg shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Yes, Cancel Subscription
              </button>
            </div>
        </div>
    </div>
);