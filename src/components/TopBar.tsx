'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useProgress } from '@/hooks/useProgress';
import { formations } from '@/lib/formations';

export default function TopBar() {
  const [mounted, setMounted] = useState(false);
  const { progress, getTotalCompletedModules, getAverageScore } = useProgress();

  useEffect(() => {
    setMounted(true);
  }, []);

  const totalModules = formations.reduce((acc, f) => acc + f.modules.length, 0);
  const completedModules = mounted ? getTotalCompletedModules() : 0;
  const avgScore = mounted ? getAverageScore() : 0;

  // Calculate progress based on completed formations
  const completedFormations = Object.keys(progress).filter((fid) => {
    const formation = formations.find((f) => f.id === fid);
    if (!formation) return false;
    return formation.modules.every((_, idx) => progress[fid]?.[idx]?.completed);
  }).length;

  const progressPercent = Math.round((completedFormations / formations.length) * 100);

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-card-border">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-brand-identity to-purple-600 flex items-center justify-center">
              <span className="text-white font-bold text-lg font-syne">SD</span>
            </div>
            <div>
              <h1 className="text-lg font-bold font-syne text-white">SD Academy</h1>
              <p className="text-xs text-gray-400">Formation Expert</p>
            </div>
          </Link>

          {/* Progress Bar */}
          <div className="flex-1 max-w-md mx-8">
            <div className="flex items-center justify-between mb-1">
              <span className="text-sm text-gray-400">Progression globale</span>
              <span className="text-sm font-medium text-white">{progressPercent}%</span>
            </div>
            <div className="h-2 bg-card-bg rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-brand-identity to-purple-500"
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>
          </div>

          {/* Role Badge */}
          <div className="flex items-center gap-4">
            {mounted && (
              <div className="hidden md:flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="text-gray-400">Modules:</span>
                  <span className="text-white font-medium">{completedModules}/{totalModules}</span>
                </div>
                {avgScore > 0 && (
                  <div className="flex items-center gap-2">
                    <span className="text-gray-400">Score avg:</span>
                    <span className="text-white font-medium">{avgScore}%</span>
                  </div>
                )}
              </div>
            )}
            <div className="px-3 py-1.5 rounded-lg bg-card-bg border border-card-border">
              <span className="text-sm text-gray-300">Rova</span>
              <span className="text-xs text-gray-400 ml-2">Head of Social Media</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
