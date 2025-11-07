import { useEffect, useMemo, useState } from 'react';
import AdminLayout from '../../components/layouts/AdminLayout';
import { getAllOrders } from '../../api/ordersAPI';
import { fetchProducts } from '../../api/productAPI';
import { getUsers } from '../../api/userAPI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

function StatCard({ title, value, delta = '+0', color = 'from-emerald-600 to-emerald-400', spark = [] }) {
  return (
    <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="mt-1 text-2xl font-semibold text-gray-900">{value}</div>
      <div className="mt-1 text-xs text-emerald-700">{delta}</div>
      {spark.length > 0 ? (
        <div className="mt-3 h-10">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={spark}>
              <Bar dataKey="v" fill="url(#g)" radius={[6,6,0,0]} />
              <XAxis dataKey="k" hide tick={false} />
              <YAxis hide />
            </BarChart>
          </ResponsiveContainer>
          <svg width={0} height={0}>
            <defs>
              <linearGradient id="g" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#059669" />
                <stop offset="100%" stopColor="#34d399" />
              </linearGradient>
            </defs>
          </svg>
        </div>
      ) : null}
    </div>
  );
}

export default function AdminAnalytics() {
  const [orders, setOrders] = useState([]);
  const [products, setProducts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const [o, p, u] = await Promise.all([
          getAllOrders(),
          fetchProducts({ limit: 100 }),
          getUsers()
        ]);
        setOrders(Array.isArray(o) ? o : o?.orders || []);
        setProducts(Array.isArray(p?.products) ? p.products : []);
        setUsers(Array.isArray(u) ? u : []);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const { income, orderCount, expenses, profit, weeklyData, topProduct, recent, leaderboard } = useMemo(() => {
    const paidOrders = orders.filter(o => o.isPaid);
    const income = paidOrders.reduce((s, o) => s + (o.totalPrice || o.total || 0), 0);
    const orderCount = orders.length;
    const shipping = orders.reduce((s, o) => s + (o.shippingPrice || 0), 0);
    const discounts = 0; // placeholder until discount model exists
    const expenses = shipping + discounts;
    const profit = income * 0.25 - shipping; // placeholder margin 25%

    // weekly chart
    const byDay = { Sun:0, Mon:0, Tue:0, Wed:0, Thu:0, Fri:0, Sat:0 };
    paidOrders.forEach(o => {
      const d = new Date(o.paidAt || o.createdAt || Date.now());
      const day = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d.getDay()];
      byDay[day] += (o.totalPrice || o.total || 0);
    });
    const weeklyData = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(k => ({ name: k, income: Math.round(byDay[k]), expense: Math.round(byDay[k]*0.2) }));

    // top product (by count in orders)
    const countMap = new Map();
    orders.forEach(o => o.orderItems?.forEach(it => {
      countMap.set(it.product || it._id || it.id || it.name, (countMap.get(it.product || it._id || it.id || it.name) || 0) + (it.qty || 1));
    }));
    let tp = null, max = -1;
    products.forEach(p => {
      const c = countMap.get(p._id) || 0;
      if (c > max) { max = c; tp = p; }
    });

    // recent orders
    const recent = [...orders].sort((a,b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0,5);

    // leaderboard by spend
    const spend = new Map();
    paidOrders.forEach(o => {
      const uid = (o.user && (o.user._id || o.user)) || 'unknown';
      spend.set(uid, (spend.get(uid) || 0) + (o.totalPrice || o.total || 0));
    });
    const leaderboard = users
      .map(u => ({ user: u, total: spend.get(u._id) || 0 }))
      .sort((a,b) => b.total - a.total)
      .slice(0,5);

    return { income, orderCount, expenses, profit, weeklyData, topProduct: tp, recent, leaderboard };
  }, [orders, products, users]);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h1 className="text-2xl font-bold text-gray-900">Analytic Overview</h1>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Income" value={`₹${income.toLocaleString()}`} delta={'+10%'} spark={[{k:'1',v:2},{k:'2',v:5},{k:'3',v:3},{k:'4',v:6}]}/>
          <StatCard title="Orders" value={orderCount} delta={'+3%'} spark={[{k:'1',v:4},{k:'2',v:3},{k:'3',v:5},{k:'4',v:6}]}/>
          <StatCard title="Profit" value={`₹${Math.max(0,profit).toLocaleString()}`} delta={'+2%'} />
          <StatCard title="Expenses" value={`₹${expenses.toLocaleString()}`} delta={'+'} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Statistics Chart */}
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <div className="text-lg font-semibold text-gray-900">Statistic</div>
              <div className="text-sm text-gray-500">Weekly</div>
            </div>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <XAxis dataKey="name" stroke="#9CA3AF"/>
                  <YAxis stroke="#9CA3AF"/>
                  <Tooltip formatter={(v,name)=>[`₹${v.toLocaleString()}`, name]} />
                  <Bar dataKey="income" fill="url(#gi)" radius={[6,6,0,0]} />
                  <Bar dataKey="expense" fill="url(#ge)" radius={[6,6,0,0]} />
                  <defs>
                    <linearGradient id="gi" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" />
                      <stop offset="100%" stopColor="#34d399" />
                    </linearGradient>
                    <linearGradient id="ge" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#93c5fd" />
                      <stop offset="100%" stopColor="#60a5fa" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Top Product Card */}
          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="text-lg font-semibold text-gray-900 mb-2">Top Product</div>
            {topProduct ? (
              <div className="rounded-xl overflow-hidden bg-emerald-50 border border-emerald-100">
                <img src={topProduct.images?.[0] || topProduct.image || '/images/placeholder.png'} alt={topProduct.name} className="w-full h-40 object-cover" />
                <div className="p-3">
                  <div className="font-semibold">{topProduct.name}</div>
                  <div className="text-sm text-gray-500">{topProduct.brand}</div>
                  <div className="mt-1 text-emerald-700 font-semibold">₹{topProduct.price?.toLocaleString?.() || topProduct.price}</div>
                </div>
              </div>
            ) : <div className="text-sm text-gray-500">No data</div>}
          </div>
        </div>

        {/* Transactions & Customers */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="text-lg font-semibold text-gray-900 mb-2">Transactions</div>
            <div className="overflow-auto">
              <table className="min-w-full text-sm">
                <thead className="text-gray-500">
                  <tr>
                    <th className="text-left py-2 pr-4">Order</th>
                    <th className="text-left py-2 pr-4">Customer</th>
                    <th className="text-left py-2 pr-4">Items</th>
                    <th className="text-left py-2 pr-4">Total</th>
                    <th className="text-left py-2 pr-4">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map(o => (
                    <tr key={o._id} className="border-t border-gray-100">
                      <td className="py-2 pr-4">#{String(o._id).slice(-8)}</td>
                      <td className="py-2 pr-4">{o.user?.name || o.user?.email || '—'}</td>
                      <td className="py-2 pr-4">{o.orderItems?.reduce((s,it)=>s+(it.qty||1),0) || 0}</td>
                      <td className="py-2 pr-4">₹{(o.totalPrice || o.total || 0).toLocaleString()}</td>
                      <td className="py-2 pr-4"><span className={`px-2 py-1 rounded-full text-xs ${o.isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-yellow-100 text-yellow-800'}`}>{o.isPaid ? 'Paid' : 'Pending'}</span></td>
                    </tr>
                  ))}
                  {recent.length === 0 && (
                    <tr><td colSpan={5} className="py-6 text-center text-gray-500">No recent orders</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="bg-white border border-gray-100 rounded-2xl p-4 shadow-sm">
            <div className="text-lg font-semibold text-gray-900 mb-2">Customer</div>
            <div className="space-y-3">
              {leaderboard.map(({ user, total }) => (
                <div key={user._id} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold">{(user.name||user.email||'U').charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="text-sm font-medium text-gray-900">{user.name || '—'}</div>
                      <div className="text-xs text-gray-500">{user.email}</div>
                    </div>
                  </div>
                  <div className="text-sm font-semibold">₹{total.toLocaleString()}</div>
                </div>
              ))}
              {leaderboard.length === 0 && (
                <div className="text-sm text-gray-500">No customer data</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
