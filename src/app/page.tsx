'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import TopBar from '@/components/TopBar';
import { useProgress } from '@/hooks/useProgress';
import { formations, serviceColors, serviceNames, priorityColors } from '@/lib/formations';

export default function Dashboard() {
  const { progress, getFormationProgress, getBestScore } = useProgress();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const services = ['seo-and-growth', 'paid-campaigns', 'llc-formation-and-structuring'] as const;

  // Calculate global stats
  const completedFormations = formations.filter((f) => {
    const formationProgress = progress[f.id];
    if (!formationProgress) return false;
    return f.modules.every((_, idx) => formationProgress[idx]?.completed);
  }).length;

  const globalProgress = Math.round((completedFormations / formations.length) * 100);

  const totalModules = formations.reduce((acc, f) => acc + f.modules.length, 0);
  const completedModules = Object.values(progress).reduce((acc, formation) => {
    return acc + Object.values(formation).filter((m) => m.completed).length;
  }, 0);

  const allScores: number[] = [];
  Object.values(progress).forEach((formation) => {
    Object.values(formation).forEach((module) => {
      if (module.attempts > 0) {
        allScores.push(module.score);
      }
    });
  });
  const avgScore = allScores.length > 0
    ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length)
    : 0;

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="min-h-screen bg-background">
      <TopBar />

      <main className="pt-24 pb-12 px-4 max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12"
        >
          <h1 className="text-4xl md:text-5xl font-bold font-syne text-white mb-4">
            Bienvenue, <span style={{ color: serviceColors['seo-and-growth'] }}>Tiavina</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl">
            Maîtrisez les formations pour devenir expert en SEO, Growth, Paid Campaigns et création de LLC.
          </p>
        </motion.div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="card p-6"
          >
            <div className="text-3xl font-bold font-syne text-white">{globalProgress}%</div>
            <div className="text-gray-400 text-sm">Progression globale</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="card p-6"
          >
            <div className="text-3xl font-bold font-syne text-white">{completedFormations}/{formations.length}</div>
            <div className="text-gray-400 text-sm">Formations complétées</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
            className="card p-6"
          >
            <div className="text-3xl font-bold font-syne text-white">{completedModules}/{totalModules}</div>
            <div className="text-gray-400 text-sm">Modules terminés</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4 }}
            className="card p-6"
          >
            <div className="text-3xl font-bold font-syne text-white">{avgScore}%</div>
            <div className="text-gray-400 text-sm">Score moyen</div>
          </motion.div>
        </div>

        {/* Global Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mb-12"
        >
          <div className="flex justify-between items-center mb-2">
            <span className="text-white font-medium">Progression globale sur 8 formations</span>
            <span className="text-white font-bold">{globalProgress}%</span>
          </div>
          <div className="h-4 bg-card-bg rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-[#1DA1F2] via-[#FF2D78] to-[#0088CC]"
              initial={{ width: 0 }}
              animate={{ width: `${globalProgress}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </motion.div>

        {/* Formations by Service */}
        {services.map((service, serviceIndex) => (
          <motion.section
            key={service}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 + serviceIndex * 0.1 }}
            className="mb-12"
          >
            <div className="flex items-center gap-3 mb-6">
              <div
                className="w-1 h-8 rounded-full"
                style={{ backgroundColor: serviceColors[service] }}
              />
              <h2 className="text-2xl font-bold font-syne text-white">
                {serviceNames[service]}
              </h2>
              <span className="text-gray-500 text-sm">
                ({formations.filter((f) => f.service === service).length} formations)
              </span>
            </div>

            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            >
              {formations
                .filter((f) => f.service === service)
                .map((formation) => {
                  const formationProgress = mounted
                    ? getFormationProgress(formation.id, formation.modules.length)
                    : 0;
                  const bestScore = mounted ? getBestScore(formation.id, 0) : 0;

                  return (
                    <motion.div key={formation.id} variants={item}>
                      <Link href={`/formation/${formation.id}`}>
                        <div
                          className="card h-full cursor-pointer group"
                          style={{
                            borderColor: `${serviceColors[formation.service]}33`,
                          }}
                        >
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex-1">
                              <span
                                className="px-2 py-1 text-xs font-medium rounded-full"
                                style={{
                                  backgroundColor: `${priorityColors[formation.priority]}22`,
                                  color: priorityColors[formation.priority],
                                }}
                              >
                                {formation.priority === 'high' ? 'Haute' :
                                 formation.priority === 'medium' ? 'Moyenne' : 'Basse'}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">{formation.duration}</span>
                          </div>

                          <h3 className="text-lg font-bold font-syne text-white mb-2">
                            {formation.title}
                          </h3>
                          <p className="text-sm text-gray-400 mb-4 line-clamp-2">
                            {formation.description}
                          </p>

                          <div className="flex items-center justify-between">
                            <span className="text-xs text-gray-500">{formation.level}</span>
                            <span className="text-xs text-gray-500">{formation.modules.length} modules</span>
                          </div>

                          {/* Progress Bar */}
                          <div className="mt-4">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-gray-400">Progression</span>
                              <span style={{ color: serviceColors[formation.service] }}>
                                {formationProgress}%
                              </span>
                            </div>
                            <div className="h-1.5 bg-card-bg rounded-full overflow-hidden">
                              <motion.div
                                className="h-full"
                                style={{ backgroundColor: serviceColors[formation.service] }}
                                initial={{ width: 0 }}
                                animate={{ width: `${formationProgress}%` }}
                                transition={{ duration: 0.5 }}
                              />
                            </div>
                          </div>

                          {bestScore > 0 && (
                            <div className="mt-3 text-xs text-gray-500">
                              Best score: <span className="text-white">{bestScore}%</span>
                            </div>
                          )}
                        </div>
                      </Link>
                    </motion.div>
                  );
                })}
            </motion.div>
          </motion.section>
        ))}

        {/* Certificate Section - Show when all 11 formations are completed */}
        {globalProgress === 100 && mounted && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-12 p-8 rounded-2xl bg-gradient-to-br from-[#1DA1F2]/20 via-[#FF2D78]/20 to-[#0088CC]/20 border border-[#1DA1F2]/30"
          >
            <div className="text-center">
              <div className="text-6xl mb-4">🏆</div>
              <h2 className="text-3xl font-bold font-syne text-white mb-2">
                Félicitations !
              </h2>
              <p className="text-xl text-gray-300 mb-4">
                Tu as complété toutes les formations de SD Academy
              </p>
              <p className="text-gray-400">
                Tu es maintenant un expert en SEO, Growth, Paid Campaigns et création de LLC
              </p>
            </div>
          </motion.div>
        )}
      </main>
    </div>
  );
}
