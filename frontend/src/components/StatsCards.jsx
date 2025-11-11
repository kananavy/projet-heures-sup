import React from 'react';
import StatsCard from './StatsCard';

export default function StatsCards({ teachers }) {
  const stats = React.useMemo(() => {
    const totalTeachers = teachers.length;
    const totalHeuresNormales = teachers.reduce((sum, t) => sum + (t.heuresNormales || 0), 0);
    const totalHeuresSuppl = teachers.reduce((sum, t) => sum + (t.heuresSupplementaires || 0), 0);
    const totalVolumePrevu = teachers.reduce((sum, t) => sum + (t.volumeHoraire || 0), 0);
    const totalCours = teachers.reduce((sum, t) => sum + (t.cours?.length || 0), 0);
    const teachersWithOvertime = teachers.filter(t => (t.heuresSupplementaires || 0) > 0).length;
    
    return {
      totalTeachers,
      totalHeuresNormales,
      totalHeuresSuppl,
      totalVolumePrevu,
      totalCours,
      teachersWithOvertime,
      avgHeuresParEnseignant: totalTeachers > 0 ? ((totalHeuresNormales + totalHeuresSuppl) / totalTeachers).toFixed(1) : 0,
      tauxRealisation: totalVolumePrevu > 0 ? (((totalHeuresNormales + totalHeuresSuppl) / totalVolumePrevu) * 100).toFixed(1) : 0
    };
  }, [teachers]);

  const statCards = [
    {
      title: "Enseignants",
      value: stats.totalTeachers,
      subtitle: "enseignants actifs",
      type: "primary",
      icon: "👨‍🏫"
    },
    {
      title: "Heures normales",
      value: `${stats.totalHeuresNormales}h`,
      subtitle: "heures dans le volume",
      type: "success",
      icon: "✅"
    },
    {
      title: "Heures supplémentaires",
      value: `${stats.totalHeuresSuppl}h`,
      subtitle: `${stats.teachersWithOvertime} enseignant(s) concerné(s)`,
      type: stats.totalHeuresSuppl > 0 ? "warning" : "success",
      icon: stats.totalHeuresSuppl > 0 ? "⚠️" : "✅"
    },
    {
      title: "Total cours",
      value: stats.totalCours,
      subtitle: "cours enregistrés",
      type: "primary",
      icon: "📚"
    },
    {
      title: "Volume prévu",
      value: `${stats.totalVolumePrevu}h`,
      subtitle: "heures planifiées",
      type: "primary",
      icon: "📋"
    },
    {
      title: "Taux réalisation",
      value: `${stats.tauxRealisation}%`,
      subtitle: "du volume prévu",
      type: parseFloat(stats.tauxRealisation) > 100 ? "warning" : "success",
      icon: parseFloat(stats.tauxRealisation) > 100 ? "📈" : "🎯",
      trend: {
        type: parseFloat(stats.tauxRealisation) > 100 ? "up" : "right",
        value: `${stats.tauxRealisation}%`
      }
    },
    {
      title: "Moyenne par enseignant",
      value: `${stats.avgHeuresParEnseignant}h`,
      subtitle: "heures par enseignant",
      type: "primary",
      icon: "📊"
    }
  ];

  return (
    <div className="stats-grid">
      {statCards.map((stat, index) => (
        <StatsCard
          key={index}
          title={stat.title}
          value={stat.value}
          subtitle={stat.subtitle}
          type={stat.type}
          icon={stat.icon}
          trend={stat.trend}
        />
      ))}
    </div>
  );
}