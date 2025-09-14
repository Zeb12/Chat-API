import React from 'react';
import type { Session } from '@supabase/supabase-js';
import { getDashboardStats, getChatbots } from '../services/geminiService';
import type { DashboardStats, ChatbotRecord, Plan } from '../types';
import { BotIcon } from './icons/BotIcon';
import { ChartBarIcon } from './icons/ChartBarIcon';
import { ChatBubbleIcon } from './icons/ChatBubbleIcon';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { Pricing } from './Pricing';
import { UpgradeIcon } from './icons/UpgradeIcon';
import { EmptyState } from './EmptyState';
import { ConversationChart } from './ConversationChart';
import { CogIcon } from './icons/CogIcon';
import { PLANS } from '../constants';

interface DashboardProps {
  session: Session;
  onNavigateToWizard: () => void;
  onSubscribe: (planId: string) => void;
  isLoading: boolean;
}

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

const SkeletonChatbotCard: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm animate-pulse">
        <div className="flex justify-between items-start">
            <div className="flex-1 space-y-2">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
            <div className="flex items-center space-x-1">
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
                <div className="h-8 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
        </div>
        <div className="mt-4 border-t border-gray-200/80 dark:border-gray-700 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6">
            <div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
             <div className="sm:col-span-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded-md w-full"></div>
            </div>
        </div>
        <div className="mt-4 border-t border-gray-200/80 dark:border-gray-700 pt-4 flex justify-end">
            <div className="h-9 bg-gray-200 dark:bg-gray-700 rounded-md w-28"></div>
        </div>
    </div>
);


export const Dashboard: React.FC<DashboardProps> = ({ session, onNavigateToWizard, onSubscribe, isLoading: isSubscribing }) => {
  const [stats, setStats] = React.useState<DashboardStats | null>(null);
  const [chatbots, setChatbots] = React.useState<ChatbotRecord[] | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [showPricing, setShowPricing] = React.useState(false);
  const [currentPlan, setCurrentPlan] = React.useState<Plan>(PLANS[0]);
  const SKELETON_COUNT = 3;

  React.useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const [statsData, chatbotsData] = await Promise.all([
          getDashboardStats(),
          getChatbots(),
        ]);
        setStats(statsData);
        setChatbots(chatbotsData);

        // Determine the user's current plan based on their session metadata
        const userPlanId = session.user.user_metadata?.subscription_plan_id;
        const userSubStatus = session.user.user_metadata?.subscription_status;

        let activePlan = PLANS[0]; // Default to free plan

        // Only check for paid plans if the subscription is active or trialing
        if (userSubStatus === 'active' || userSubStatus === 'trialing') {
            const subscribedPlan = PLANS.find(p => p.id === userPlanId);
            if (subscribedPlan) {
                activePlan = subscribedPlan;
            }
        }
        setCurrentPlan(activePlan);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
    });
  }

  const getDisplayName = () => {
    const user = session.user;
    const fullName = user.user_metadata?.full_name;
    if (typeof fullName === 'string' && fullName.trim()) {
      return fullName.split(' ')[0];
    }
    return user.email?.split('@')[0] || null;
  }
  
  const displayName = getDisplayName();
  
  const hasReachedLimit = stats ? stats.totalChatbots >= currentPlan.maxChatbots : false;

  return (
    <div className="max-w-7xl mx-auto animate-fade-in space-y-8">
      
      <div className="bg-white dark:bg-gray-800 p-6 sm:p-8 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Welcome back{displayName ? `, ${displayName}` : ''}!
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1 flex items-center gap-x-2">
              Here's your dashboard.
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/50 text-green-800 dark:text-green-300 ring-1 ring-inset ring-green-600/20 dark:ring-green-500/30">
                Plan: {currentPlan.name}
              </span>
            </p>
        </div>
        <div className="flex items-center space-x-2 sm:space-x-4 flex-shrink-0 w-full sm:w-auto">
             <button
                onClick={() => setShowPricing(!showPricing)}
                className="w-1/2 sm:w-auto inline-flex items-center justify-center px-4 py-2.5 text-sm font-semibold text-primary dark:text-violet-300 bg-violet-100 dark:bg-violet-900/50 rounded-lg hover:bg-violet-200 dark:hover:bg-violet-900/80 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
             >
                <UpgradeIcon className="w-5 h-5 mr-2 -ml-1" />
                {showPricing ? 'Hide Plans' : 'Upgrade'}
             </button>
            <button
                onClick={onNavigateToWizard}
                disabled={hasReachedLimit}
                title={hasReachedLimit ? `You've reached the chatbot limit for the ${currentPlan.name} plan. Please upgrade to create more.` : 'Create a new chatbot'}
                className="w-1/2 sm:w-auto inline-flex items-center justify-center px-5 py-2.5 text-sm font-semibold text-white bg-primary border border-transparent rounded-lg shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <PlusIcon className="w-5 h-5 mr-2 -ml-1" />
                New Chatbot
            </button>
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {isLoading ? (
            <>
                <SkeletonStatCard />
                <SkeletonStatCard />
                <SkeletonStatCard />
            </>
        ) : stats && (
            <>
                <StatCard icon={<BotIcon className="w-6 h-6 text-primary" />} title="Total Chatbots" value={stats.totalChatbots.toString()} />
                <StatCard icon={<ChatBubbleIcon className="w-6 h-6 text-primary" />} title="Total Conversations" value={stats.totalConversations.toLocaleString()} />
                <StatCard icon={<ChartBarIcon className="w-6 h-6 text-primary" />} title="Avg. Response Rate" value={`${stats.responseRate}%`} />
            </>
        )}
      </div>

      <div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">My Chatbots</h2>
        
        {isLoading ? (
            <div className="grid grid-cols-1 gap-6">
                {[...Array(SKELETON_COUNT)].map((_, i) => <SkeletonChatbotCard key={i} />)}
            </div>
        ) : chatbots && chatbots.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
                {chatbots.map((bot) => (
                    <div key={bot.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200/80 dark:border-gray-700 shadow-sm transition-all hover:shadow-lg hover:border-primary-light/50 dark:hover:border-primary-light/30">
                        <div className="flex justify-between items-start">
                            <div>
                                <p className="text-xl font-semibold text-primary">{bot.name}</p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Created on {formatDate(bot.createdAt)}</p>
                            </div>
                            <div className="flex items-center space-x-1">
                                <button className="p-2 text-gray-400 hover:text-primary rounded-full hover:bg-violet-100 dark:hover:bg-violet-900/50 transition-colors" aria-label={`Settings for ${bot.name}`}>
                                    <CogIcon className="w-5 h-5" />
                                </button>
                                <button className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full transition-colors" aria-label={`Delete ${bot.name}`}>
                                    <TrashIcon className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="mt-4 border-t border-gray-200/80 dark:border-gray-700 pt-4 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
                            <div>
                                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Monthly Conversations</p>
                                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{bot.monthlyConversations.toLocaleString()}</p>
                            </div>
                            <div className="sm:col-span-2">
                               <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">7-Day Trend</p>
                               <ConversationChart data={bot.conversationTrend} className="w-full h-12 text-primary" />
                            </div>
                        </div>
                        
                        <div className="mt-4 border-t border-gray-200/80 dark:border-gray-700 pt-4 flex justify-end">
                            <button className="px-4 py-2 text-sm font-semibold text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors">
                                View Script
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        ) : (
            <EmptyState onActionClick={onNavigateToWizard} />
        )}
      </div>
      
      {showPricing && (
        <div className="animate-fade-in">
          <Pricing onSubscribe={onSubscribe} isEmbedded={true} isLoading={isSubscribing} />
        </div>
      )}
    </div>
  );
};