import { useEntries } from '../../hooks';
import { DAYS } from '../../constants';

// Different vibrant gradient colors for each stat
const gradientBackgrounds = [
  'linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%)',  // Coral to Orange
  'linear-gradient(135deg, #00d2d3 0%, #01a3a4 100%)',  // Teal
  'linear-gradient(135deg, #a55eea 0%, #8854d0 100%)',  // Purple
  'linear-gradient(135deg, #26de81 0%, #20bf6b 100%)',  // Green
];

export function Statistics() {
  const { entries } = useEntries();

  // Calculate total entries
  const totalEntries = entries.length;
  
  // Calculate total hours - sum of (end - start) for each entry
  const totalHours = entries.reduce((acc, entry) => {
    const startParts = entry.startTime.split(':');
    const endParts = entry.endTime.split(':');
    const start = parseInt(startParts[0]) + parseInt(startParts[1]) / 60;
    const end = parseInt(endParts[0]) + parseInt(endParts[1]) / 60;
    const duration = end - start;
    return acc + duration;
  }, 0);

  // Calculate days used (unique days)
  const daysUsed = new Set(entries.map(e => e.day)).size;

  // Find busiest day
  const dayCounts = DAYS.map(day => ({
    day: day.short,
    count: entries.filter(e => e.day === day.id).length,
  }));
  const busiestDay = dayCounts.reduce((a, b) => a.count > b.count ? a : b, dayCounts[0]);

  const stats = [
    { label: 'Total Entries', value: totalEntries || '-', gradientIndex: 0 },
    { label: 'Total Hours', value: totalHours ? totalHours.toFixed(1) + 'h' : '-', gradientIndex: 1 },
    { label: 'Days Used', value: daysUsed || '-', gradientIndex: 2 },
    { label: 'Busiest Day', value: busiestDay?.count ? busiestDay.day : '-', gradientIndex: 3 },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="p-2 md:p-4 text-white text-center"
          style={{ 
            borderRadius: 0,
            background: gradientBackgrounds[stat.gradientIndex],
          }}
        >
          <div className="text-lg md:text-2xl font-bold">{stat.value}</div>
          <div className="text-[10px] md:text-sm opacity-90">{stat.label}</div>
        </div>
      ))}
    </div>
  );
}
