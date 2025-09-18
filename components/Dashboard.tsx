import React from 'react';
import type { Session } from '@supabase/supabase-js';
import { getDashboardStats, getChatbots, deleteChatbot } from '../services/geminiService';
import type { DashboardStats, ChatbotRecord, Plan, ChatbotConfig } from '../types';
import { BotIcon } from './icons/BotIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Pricing } from './Pricing';
import { UpgradeIcon } from './icons/UpgradeIcon';
import { EmptyState } from './EmptyState';
import { CogIcon } from './icons/CogIcon';
import { PLANS, NO_PLAN } from '../constants';
import { KeyIcon } from './icons/KeyIcon';
import { ApiAccessModal } from './ApiAccessModal';
import { OnboardingGuide } from './OnboardingGuide';
import { SparklesIcon } from './icons/SparklesIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';
import { BellIcon } from './icons/BellIcon';
import { ConversationChart } from './ConversationChart';
import { SearchIcon } from './icons/SearchIcon';
import { CodeBracketIcon } from './icons/CodeBracketIcon';


interface DashboardProps {
  session: Session;
  onCreateNewChatbot: () => void;
  onSubscribe: (planId: string) => void;
  isLoading: boolean;
  onViewScript: (config: ChatbotConfig) => void;
}

const StatCard: React.FC<{ icon: React.ReactNode; title: string; value: string; trend?: string; trendDirection?: 'up' | 'down'; }> = ({ icon, title, value, trend, trendDirection }) => (
  <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex flex-col justify-between">
      <div className="flex items-center space-x-4">
          <div className="bg-violet-100 dark:bg-violet-900/50 p-3 rounded-full">
              {icon}
          </div>
          <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
          </div>
      </div>
      {trend && (
          <div className="mt-4 flex items-center space-x-1">
              {trendDirection === 'up' ? <ArrowUpIcon className="w-4 h-4 text-green-500" /> : <ArrowDownIcon className="w-4 h-4 text-red-500" />}
              <span className={`text-xs font-medium ${trendDirection === 'up' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>{trend}</span>
              <span className="text-xs text-gray-500 dark:text-gray-400">vs last month</span>
          </div>
      )}
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

const ChatbotCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex flex-col p-6 animate-pulse">
        <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            <div className="flex-1 space-y-2">
                <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
        </div>
        <div className="mt-4 flex-grow space-y-2">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
            <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
        <div className="mt-4 flex gap-2">
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-lg flex-1"></div>
            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="h-9 w-9 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
        </div>
    </div>
);

export const Dashboard: React.FC<DashboardProps> = ({ session, onCreateNewChatbot, onSubscribe, isLoading: isSubscribing, onViewScript }) => {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [chatbots, setChatbots] = React.useState<ChatbotRecord[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showPricing, setShowPricing] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState<Plan>(NO_PLAN);
  const [showApiModal, setShowApiModal] = React.useState(false);
  const [confirmDelete, setConfirmDelete] = React.useState<ChatbotRecord | null>(null);
  const [deleteError, setDeleteError] = React.useState<string | null>(null);
  const [showOnboarding, setShowOnboarding] = React.useState(false);
  
  // New state for search and sort
  const [searchQuery, setSearchQuery] = React.useState('');
  const [sortOption, setSortOption] = React.useState<'newest' | 'oldest' | 'conversations'>('newest');

  React.useEffect(() => {
    const hasDismissedOnboarding = localStorage.getItem('hasDismissedOnboarding');
    if (!hasDismissedOnboarding) {
        setShowOnboarding(true);
    }
    
    const fetchData = async (userId: string) => {
      setIsLoading(true);
      try {
        const [statsData, chatbotsData] = await Promise.all([
          getDashboardStats(userId),
          getChatbots(userId),
        ]);
        setStats(statsData);
        setChatbots(chatbotsData);

        const userPlanId = session.user.user_metadata?.subscription_plan_id;
        const userSubStatus = session.user.user_metadata?.subscription_status;

        let activePlan: Plan = NO_PLAN; 
        if (userSubStatus === 'active' || userSubStatus === 'trialing') {
            const subscribedPlan = PLANS.find(p => p.id === userPlanId);
            if (subscribedPlan) activePlan = subscribedPlan;
        }
        setCurrentPlan(activePlan);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user?.id) {
      fetchData(session.user.id);
    } else {
      setIsLoading(false);
    }
  }, [session]);
  
  const handleDismissOnboarding = () => {
    localStorage.setItem('hasDismissedOnboarding', 'true');
    setShowOnboarding(false);
  };

  const handleDelete = async (chatbotId: string) => {
    setDeleteError(null);
    try {
        await deleteChatbot(chatbotId);
        setChatbots(prev => prev ? prev.filter(bot => bot.id !== chatbotId) : null);
        setStats(prev => prev ? { ...prev, totalChatbots: Math.max(0, prev.totalChatbots - 1) } : null);
        setConfirmDelete(null);
    } catch (err: any) {
        setDeleteError(err.message || 'An unexpected error occurred.');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  const getDisplayName = () => {
    const user = session.user;
    const fullName = user.user_metadata?.full_name;
    if (typeof fullName === 'string' && fullName.trim()) return fullName.split(' ')[0];
    return user.email?.split('@')[0] || null;
  }

  const sortedAndFilteredChatbots = React.useMemo(() => {
    if (!chatbots) return [];
    
    return chatbots
        .filter(bot => bot.name.toLowerCase().includes(searchQuery.toLowerCase()))
        .sort((a, b) => {
            switch(sortOption) {
                case 'oldest':
                    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                case 'conversations':
                    return b.monthlyConversations - a.monthlyConversations;
                case 'newest':
                default:
                    return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
        });
  }, [chatbots, searchQuery, sortOption]);
  
  const displayName = getDisplayName();
  const hasReachedLimit = stats ? stats.totalChatbots >= currentPlan.maxChatbots : true;
  const isProPlan = currentPlan.name === 'Pro';
  const usagePercentage = currentPlan.maxChatbots === Infinity || !stats ? 0 : (stats.totalChatbots / currentPlan.maxChatbots) * 100;

  // Mock data for new UI elements
  const trends = React.useMemo(() => ({
    chatbots: { value: '+2', dir: 'up' as const },
    conversations: { value: '+15.3%', dir: 'up' as const },
    responseRate: { value: '-1.2%', dir: 'down' as const }
  }), []);

  const recentActivity = React.useMemo(() => !chatbots || chatbots.length === 0 ? [] : [
    { icon: <ChatBubbleIcon className="w-5 h-5 text-blue-500" />, text: `New conversations on '${chatbots[0].name}'`, time: '2h ago' },
    { icon: <BotIcon className="w-5 h-5 text-green-500" />, text: `New chatbot '${chatbots[0].name}' created`, time: '1d ago' },
    { icon: <SparklesIcon className="w-5 h-5 text-violet-500" />, text: `Appearance updated for 'Support Bot'`, time: '3d ago' },
  ], [chatbots]);

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back{displayName ? `, ${displayName}` : ''}!
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-1">Here's your dashboard.</p>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-5 gap-8 items-start">
        <div className="xl:col-span-3 space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {isLoading ? (
                <><SkeletonStatCard /><SkeletonStatCard /><SkeletonStatCard /></>
            ) : stats && (
                <>
                    <StatCard icon={<BotIcon className="w-6 h-6 text-primary" />} title="Total Chatbots" value={stats.totalChatbots.toString()} trend={trends.chatbots.value} trendDirection={trends.chatbots.dir} />
                    <StatCard icon={<ChatBubbleIcon className="w-6 h-6 text-primary" />} title="Total Conversations" value={stats.totalConversations.toLocaleString()} trend={trends.conversations.value} trendDirection={trends.conversations.dir} />
                    <StatCard icon={<ChartBarIcon className="w-6 h-6 text-primary" />} title="Avg. Response Rate" value={`${stats.responseRate}%`} trend={trends.responseRate.value} trendDirection={trends.responseRate.dir} />
                </>
            )}
          </div>

          <div data-tour-id="chatbot-list">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                      <h2 className="text-2xl font-bold text-gray-900 dark:text-white">My Chatbots</h2>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Manage your created chatbots and view their performance.</p>
                  </div>
                  <button
                      onClick={onCreateNewChatbot}
                      disabled={hasReachedLimit}
                      title={hasReachedLimit ? `You've reached the chatbot limit for the ${currentPlan.name} plan.` : 'Create a new chatbot'}
                      data-tour-id="new-chatbot-button"
                      className="inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                      <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                      New Chatbot
                  </button>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="relative flex-grow">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon className="h-5 w-5 text-gray-400" /></div>
                      <input type="text" placeholder="Search chatbots..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="block w-full pl-10 pr-3 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm placeholder-gray-400 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm transition dark:text-white" />
                  </div>
                  <select value={sortOption} onChange={(e) => setSortOption(e.target.value as any)} className="w-full sm:w-48 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-primary-light sm:text-sm transition dark:text-white">
                      <option value="newest">Sort by: Newest</option>
                      <option value="oldest">Sort by: Oldest</option>
                      <option value="conversations">Sort by: Most Conversations</option>
                  </select>
              </div>

              {isLoading ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {[...Array(3)].map((_, i) => <ChatbotCardSkeleton key={i} />)}
                  </div>
              ) : sortedAndFilteredChatbots.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                      {sortedAndFilteredChatbots.map(bot => (
                        <div key={bot.id} className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex flex-col p-6 transition-all hover:shadow-lg hover:border-primary/50">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full flex-shrink-0 flex items-center justify-center overflow-hidden" style={{ backgroundColor: bot.config.appearance.colors.primary }}>
                                        {bot.config.appearance.logo ? (
                                            <img src={bot.config.appearance.logo} alt={`${bot.name} logo`} className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xl font-bold text-white">{bot.name.charAt(0).toUpperCase()}</span>
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{bot.name}</h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Created {formatDate(bot.createdAt)}</p>
                                    </div>
                                </div>
                                <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>Active
                                </div>
                            </div>

                            <div className="mt-4 flex-grow">
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">7-Day Trend</p>
                                <div className="flex items-center gap-4">
                                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{bot.monthlyConversations.toLocaleString()}</p>
                                    <ConversationChart data={bot.conversationTrend} className="text-primary/70 h-8 w-full" />
                                </div>
                            </div>
                            
                            <div className="mt-6 flex items-center justify-end gap-2 border-t border-gray-200/80 dark:border-gray-700 pt-4">
                                <button onClick={() => onViewScript(bot.config)} className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 text-sm font-semibold text-primary dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/80 transition-colors">
                                    <CodeBracketIcon className="w-4 h-4" /> View Script
                                </button>
                                <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors" title="Settings">
                                    <CogIcon className="w-5 h-5" />
                                </button>
                                <button onClick={() => setConfirmDelete(bot)} className="p-2 text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors" title="Delete">
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>
                      ))}
                  </div>
              ) : (
                  <EmptyState onActionClick={onCreateNewChatbot} />
              )}
          </div>
        </div>

        <div className="xl:col-span-2 space-y-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm" data-tour-id="upgrade-button">
                 <div className="flex items-center gap-3">
                    <CreditCardIcon className="w-6 h-6 text-primary" />
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">Your Plan</h3>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">You are on the <span className="font-semibold text-gray-800 dark:text-gray-200">{currentPlan.name}</span> plan.</p>
                {stats && currentPlan.maxChatbots !== Infinity && (
                    <div className="mt-4">
                        <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300 mb-1"><span>Chatbots Used</span><span>{stats.totalChatbots} / {currentPlan.maxChatbots}</span></div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2"><div className="bg-primary h-2 rounded-full" style={{ width: `${usagePercentage}%` }}></div></div>
                    </div>
                )}
                <button onClick={() => setShowPricing(!showPricing)} className="w-full mt-6 inline-flex items-center justify-center px-4 py-2 text-sm font-semibold text-primary dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/80 transition-colors"><UpgradeIcon className="w-5 h-5 mr-2 -ml-1" />{showPricing ? 'Hide Plans' : 'Upgrade Plan'}</button>
            </div>
            {showOnboarding && chatbots && (<OnboardingGuide chatbotsCount={chatbots.length} onCreateNewChatbot={onCreateNewChatbot} onDismiss={handleDismissOnboarding} />)}
            {isProPlan && (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm animate-fade-in">
                    <div className="flex items-center gap-3"><KeyIcon className="w-6 h-6 text-primary" /><h3 className="text-xl font-bold text-gray-900 dark:text-white">API Access</h3></div>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">Your Pro plan includes programmatic access to manage your chatbots.</p>
                    <button onClick={() => setShowApiModal(true)} className="w-full mt-6 text-sm font-semibold text-primary hover:text-primary-dark transition-colors">Manage API Keys &rarr;</button>
                </div>
            )}
            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-3"><BellIcon className="w-6 h-6 text-primary" /><h3 className="text-xl font-bold text-gray-900 dark:text-white">Recent Activity</h3></div>
                <ul className="mt-4 space-y-4">
                    {recentActivity.map((item, index) => (
                        <li key={index} className="flex items-start gap-4">
                            <div className="bg-slate-100 dark:bg-gray-700/50 p-2 rounded-full mt-0.5">{item.icon}</div>
                            <div>
                                <p className="text-sm text-gray-800 dark:text-gray-200">{item.text}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">{item.time}</p>
                            </div>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
      </div>
      
      {showPricing && (
        <div className="animate-fade-in"><Pricing onSubscribe={onSubscribe} isEmbedded={true} isLoading={isSubscribing} /></div>
      )}
      {showApiModal && <ApiAccessModal onClose={() => setShowApiModal(false)} />}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 animate-fade-in" role="dialog" aria-modal="true">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 sm:p-8 max-w-md w-full m-4 text-center transform transition-all animate-slide-up">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/50"><svg className="h-6 w-6 text-red-600 dark:text-red-400" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" /></svg></div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white mt-4">Delete Chatbot?</h3>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Are you sure you want to delete the chatbot "{confirmDelete.name}"? This action cannot be undone.</p>
            {deleteError && <p className="mt-4 text-sm text-red-600 dark:text-red-400">{deleteError}</p>}
            <div className="mt-6 flex justify-center gap-x-4">
                <button type="button" onClick={() => setConfirmDelete(null)} className="px-6 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600">Cancel</button>
                <button type="button" onClick={() => handleDelete(confirmDelete.id)} className="px-6 py-2.5 text-sm font-semibold text-white bg-red-600 rounded-lg shadow-sm hover:bg-red-700">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};