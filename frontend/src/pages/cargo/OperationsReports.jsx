import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';
import { useEffect, useState } from 'react';
import { fetchOperationsReport } from '../../lib/cargoApi';
import PageFooter from '../../components/layout/PageFooter';

function normalizeReport(data = {}) {
  const kpisRaw = data.kpis || data.summary?.kpiCards || data.kpiCards || [];
  const kpis = (kpisRaw || []).map(k => ({
    label: k.label ?? k.title ?? k.name ?? k.key ?? '',
    value: k.value ?? k.amount ?? k.val ?? k.v ?? '',
    trend: k.trend ?? k.change ?? k.delta ?? '',
    trendUp: (k.trendUp !== undefined) ? k.trendUp : (k.positive !== undefined ? k.positive : true),
  }));

  const weeklyRaw = data.weeklyTrend || data.trend || data.weekly || [];
  const weeklyTrend = (weeklyRaw || []).map(item => ({
    day: item.day || item.date || item.dayLabel || item.label || '',
    value: item.value ?? item.count ?? item.shipments ?? item.qty ?? item.amount ?? 0,
  }));

  const breakdownRaw = data.deliveryBreakdown || data.breakdown || data.delivery || [];
  const deliveryBreakdown = (breakdownRaw || []).map(item => ({
    name: item.name || item.label || item.key || item.keyName || '',
    count: Number(item.count ?? item.value ?? item.qty ?? 0) || 0,
    color: item.color || item.colour || item.colourHex || item.colour || '#9ca3af',
  }));

  return { kpis, weeklyTrend, deliveryBreakdown };
}

function KPICard({ label, value, trend, trendUp }) {
  return (
    <div className="card p-6 shadow-card">
      <p className="text-sm text-on-surface-variant font-medium">{label}</p>
      <p className="text-numeric-kpi text-on-surface mt-2">{value}</p>
      <p className={`text-sm font-semibold mt-2 ${trendUp ? 'text-green-600' : 'text-amber-500'}`}>
        {trend}
      </p>
    </div>
  );
}

export default function OperationsReports() {
  const [report, setReport] = useState({ kpis: [], weeklyTrend: [], deliveryBreakdown: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [lastGeneratedAt, setLastGeneratedAt] = useState('');
  const [generationCount, setGenerationCount] = useState(0);

  const loadReport = async ({ showMessage = false } = {}) => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchOperationsReport();
      setReport(normalizeReport(data));
      setLastGeneratedAt(new Date().toLocaleString());
      setGenerationCount((count) => count + 1);
      if (showMessage) {
        setMessage('Report refreshed successfully.');
      }
    } catch (err) {
      setError(err.message || 'Failed to load operations report.');
      if (showMessage) {
        setMessage('');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, []);

  const { kpis, weeklyTrend, deliveryBreakdown } = report;
  const totalShipments = deliveryBreakdown.reduce((sum, d) => sum + d.count, 0);
  const breakdownWithPercentages = deliveryBreakdown.map(item => ({
    ...item,
    percentage: totalShipments > 0 ? Math.round((item.count / totalShipments) * 100) : 0,
  }));

  return (
    <div className="max-w-[1200px] mx-auto animate-slide-up">
      <div className="mb-6">
        <h1 className="page-title">Operations Reports Dashboard</h1>
        <button
          type="button"
          className="btn-accent text-sm py-2 px-5 mt-4"
          onClick={() => loadReport({ showMessage: true })}
          disabled={loading}
        >
          {loading ? 'Generating...' : 'Generate New Report'}
        </button>
        {lastGeneratedAt && (
          <p className="mt-3 text-sm text-on-surface-variant">
            Generated {generationCount > 1 ? `${generationCount} times` : 'once'} · Last updated {lastGeneratedAt}
          </p>
        )}
      </div>

      {loading && <p className="mb-4 text-sm text-on-surface-variant">Loading report data...</p>}
      {error && <p className="mb-4 text-sm text-error">{error}</p>}
      {message && <p className="mb-4 text-sm text-green-700">{message}</p>}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
        {kpis.map(kpi => (
          <KPICard key={kpi.label} {...kpi} />
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Weekly Shipment Volume Trend */}
        <div className="lg:col-span-2 card p-6 shadow-card">
          <h2 className="text-headline-md font-semibold text-on-surface mb-1">Weekly Shipment Volume Trend</h2>
          <p className="text-sm text-on-surface-variant mb-6">Last 7 days performance</p>
          <div className="h-64">
            {weeklyTrend && weeklyTrend.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weeklyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e4e2e3" />
                  <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#44474c' }} />
                  <YAxis tick={{ fontSize: 12, fill: '#44474c' }} />
                  <Tooltip
                    contentStyle={{ borderRadius: '8px', border: '1px solid #c4c6cd', fontSize: '13px' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#009adb"
                    strokeWidth={2.5}
                    dot={{ fill: '#009adb', r: 5 }}
                    activeDot={{ r: 7 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">No trend data available.</div>
            )}
          </div>
        </div>

        {/* Delivery Status Breakdown */}
        <div className="card p-6 shadow-card">
          <h2 className="text-headline-md font-semibold text-on-surface mb-1">Delivery Status Breakdown</h2>
          <p className="text-sm text-on-surface-variant mb-4">Current distribution</p>
          <div className="h-48 relative">
            {deliveryBreakdown && deliveryBreakdown.length > 0 && totalShipments > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={deliveryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={80}
                      paddingAngle={2}
                      dataKey="count"
                    >
                      {deliveryBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-xl font-bold text-on-surface">{totalShipments.toLocaleString()}</p>
                  <p className="text-xs text-on-surface-variant">Total</p>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-sm text-on-surface-variant">No delivery data available.</div>
            )}
          </div>
          <div className="space-y-2 mt-4">
            {breakdownWithPercentages.map(item => (
              <div key={item.name} className="flex items-center gap-2 text-sm">
                <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
                <span className="text-on-surface">{item.name}</span>
                <span className="text-on-surface-variant ml-auto">{item.percentage}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <PageFooter />
    </div>
  );
}
