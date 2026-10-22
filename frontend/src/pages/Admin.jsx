import { useEffect, useState } from "react";
import { FiLock, FiLogOut, FiRefreshCw, FiUsers, FiEye, FiClock } from "react-icons/fi";
import { Link } from "react-router-dom";
import { adminLogin, fetchVisits } from "../lib/api";

const TOKEN_KEY = "portfolio-admin-token";

function StatCard({ icon, label, value }) {
  return (
    <div className="glass flex items-center gap-4 rounded-2xl p-5">
      <span className="rounded-xl bg-gradient-to-br from-primary/15 to-primary-2/15 p-3 text-primary">
        {icon}
      </span>
      <div>
        <div className="text-2xl font-bold text-text">{value}</div>
        <div className="text-xs text-muted">{label}</div>
      </div>
    </div>
  );
}

function LoginForm({ onSubmit, error, loading }) {
  const [password, setPassword] = useState("");
  return (
    <div className="flex min-h-screen items-center justify-center bg-bg px-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          onSubmit(password);
        }}
        className="glass w-full max-w-sm rounded-2xl p-8"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="rounded-xl bg-gradient-to-br from-primary/15 to-primary-2/15 p-3 text-primary">
            <FiLock />
          </span>
          <div>
            <h1 className="font-semibold text-text">Admin Access</h1>
            <p className="text-xs text-muted">Sign in to view visitor activity</p>
          </div>
        </div>
        <input
          type="password"
          autoFocus
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Admin password"
          className="w-full rounded-xl border border-border bg-surface px-4 py-3 text-sm text-text outline-none focus:border-primary"
        />
        {error && <p className="mt-3 text-sm text-red-500">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="mt-4 w-full rounded-xl bg-gradient-to-r from-primary to-primary-2 px-6 py-3 text-sm font-semibold text-on-accent transition hover:opacity-90 disabled:opacity-60"
        >
          {loading ? "Checking..." : "Sign In"}
        </button>
        <Link to="/" className="mt-4 block text-center text-xs text-muted hover:text-primary">
          ← Back to portfolio
        </Link>
      </form>
    </div>
  );
}

export default function Admin() {
  const [token, setToken] = useState(() => {
    try {
      return sessionStorage.getItem(TOKEN_KEY) || "";
    } catch {
      return "";
    }
  });
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = async (authToken) => {
    setLoading(true);
    setError("");
    try {
      const result = await fetchVisits(authToken);
      setData(result);
    } catch (err) {
      if (err?.response?.status === 401) {
        setError("Session expired. Please sign in again.");
        setToken("");
        try {
          sessionStorage.removeItem(TOKEN_KEY);
        } catch {}
      } else {
        setError(err?.response?.data?.message || "Couldn't load visitor data.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) load(token);
  }, [token]);

  const handleLogin = async (password) => {
    setLoading(true);
    setError("");
    try {
      await adminLogin(password);
      try {
        sessionStorage.setItem(TOKEN_KEY, password);
      } catch {}
      setToken(password);
    } catch (err) {
      setError(err?.response?.data?.message || "Couldn't sign in.");
      setLoading(false);
    }
  };

  const handleLogout = () => {
    try {
      sessionStorage.removeItem(TOKEN_KEY);
    } catch {}
    setToken("");
    setData(null);
  };

  if (!token) {
    return <LoginForm onSubmit={handleLogin} error={error} loading={loading} />;
  }

  return (
    <div className="min-h-screen bg-bg px-6 py-10 text-text">
      <div className="mx-auto max-w-6xl">
        <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Visitor Log</h1>
            <p className="text-sm text-muted">Who's been checking out your portfolio</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => load(token)}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text hover:border-primary hover:text-primary"
            >
              <FiRefreshCw className={loading ? "animate-spin" : ""} /> Refresh
            </button>
            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm text-text hover:border-red-400 hover:text-red-500"
            >
              <FiLogOut /> Logout
            </button>
          </div>
        </div>

        {error && (
          <div className="glass mb-6 rounded-xl p-4 text-sm text-red-500">{error}</div>
        )}

        {data && (
          <>
            <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
              <StatCard icon={<FiEye />} label="Total Visits" value={data.stats.totalVisits} />
              <StatCard icon={<FiUsers />} label="Unique Visitors" value={data.stats.uniqueVisitors} />
              <StatCard icon={<FiClock />} label="Visits (24h)" value={data.stats.visitsLast24h} />
            </div>

            <div className="glass overflow-hidden rounded-2xl">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[720px] text-left text-sm">
                  <thead className="border-b border-border text-xs uppercase tracking-wide text-muted">
                    <tr>
                      <th className="px-5 py-3">Time</th>
                      <th className="px-5 py-3">IP Address</th>
                      <th className="px-5 py-3">Page</th>
                      <th className="px-5 py-3">Referrer</th>
                      <th className="px-5 py-3">Browser / Device</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.visits.map((v) => (
                      <tr key={v.id} className="border-b border-border/60 last:border-0">
                        <td className="px-5 py-3 whitespace-nowrap text-muted">
                          {new Date(v.timestamp).toLocaleString()}
                        </td>
                        <td className="px-5 py-3 font-mono text-xs">{v.ip}</td>
                        <td className="px-5 py-3">{v.path}</td>
                        <td className="px-5 py-3 text-muted">{v.referrer || "direct"}</td>
                        <td className="max-w-[260px] truncate px-5 py-3 text-muted" title={v.userAgent}>
                          {v.isBot ? "🤖 " : ""}
                          {v.userAgent}
                        </td>
                      </tr>
                    ))}
                    {data.visits.length === 0 && (
                      <tr>
                        <td colSpan={5} className="px-5 py-10 text-center text-muted">
                          No visits recorded yet.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}

        <Link to="/" className="mt-8 inline-block text-sm text-muted hover:text-primary">
          ← Back to portfolio
        </Link>
      </div>
    </div>
  );
}
