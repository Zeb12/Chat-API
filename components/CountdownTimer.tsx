import React, { useState, useEffect } from 'react';

// Target date: October 1st
const TARGET_MONTH = 10;
const TARGET_DAY = 1;

const calculateTimeLeft = () => {
  const now = new Date();
  let targetYear = now.getFullYear();
  let targetDate = new Date(targetYear, TARGET_MONTH - 1, TARGET_DAY);

  if (now > targetDate) {
    targetDate.setFullYear(targetYear + 1);
  }

  const difference = +targetDate - +now;

  let timeLeft = {
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  };

  if (difference > 0) {
    timeLeft = {
      days: Math.floor(difference / (1000 * 60 * 60 * 24)),
      hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
      minutes: Math.floor((difference / 1000 / 60) % 60),
      seconds: Math.floor((difference / 1000) % 60),
    };
  }

  return timeLeft;
};

const TimeBlock: React.FC<{ value: number; label: string }> = ({ value, label }) => (
  <div className="flex flex-col items-center">
    <div className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-gray-800 dark:text-white bg-white/50 dark:bg-gray-700/50 backdrop-blur-sm p-4 rounded-lg shadow-lg w-20 sm:w-24 h-20 sm:h-24 flex items-center justify-center">
      {String(value).padStart(2, '0')}
    </div>
    <div className="mt-2 text-sm sm:text-base font-semibold text-gray-600 dark:text-gray-300 uppercase tracking-wider">{label}</div>
  </div>
);


export const CountdownTimer: React.FC = () => {
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft());

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, []);
  
  const hasLaunched = !Object.values(timeLeft).some(val => val > 0);

  if (hasLaunched) {
      return (
          <div className="text-center p-6 bg-gradient-to-r from-primary-light to-primary rounded-lg shadow-xl animate-fade-in">
              <h3 className="text-3xl font-extrabold text-white">We have launched!</h3>
              <p className="mt-2 text-lg text-violet-100">Welcome to the new era of chatbots.</p>
          </div>
      );
  }

  return (
    <div>
        <h3 className="text-center text-lg font-semibold text-gray-700 dark:text-gray-200 mb-4 tracking-wide lg:text-left">
            🚀 Our Platform Launches In...
        </h3>
        <div className="flex justify-center lg:justify-start items-center space-x-2 sm:space-x-4">
            <TimeBlock value={timeLeft.days} label="Days" />
            <span className="text-3xl lg:text-5xl font-bold text-gray-400 dark:text-gray-500 pb-8">:</span>
            <TimeBlock value={timeLeft.hours} label="Hours" />
            <span className="text-3xl lg:text-5xl font-bold text-gray-400 dark:text-gray-500 pb-8">:</span>
            <TimeBlock value={timeLeft.minutes} label="Minutes" />
            <span className="text-3xl lg:text-5xl font-bold text-gray-400 dark:text-gray-500 pb-8">:</span>
            <TimeBlock value={timeLeft.seconds} label="Seconds" />
        </div>
    </div>
  );
};
