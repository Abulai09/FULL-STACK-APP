import { useEffect, useState } from "react";
import { deleteUser, getUsers } from "../../api/admin";
import "../../App.css";

import { getRedisKeys, getRedisInfo, deleteRedisKey } from "../../api/redis";

const TABS = [
  { id: "users", label: "Users" },
  { id: "redis", label: "Redis Monitor" },
];

export default function AdminPanel() {
  const [tab, setTab] = useState("users");

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1 className="admin-title">Admin Dashboard</h1>
      </div>

      {/* Вкладки */}
      <div className="tabs">
        {TABS.map((t) => (
          <button
            key={t.id}
            className={`tab-btn ${tab === t.id ? "active" : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "users" && <UsersTab />}
      {tab === "redis" && <RedisTab />}
    </div>
  );
}

// ─── Users Tab ───────────────────────────────────────────
function UsersTab() {
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (search) {
        if (!isNaN(search)) params.id = search;
        else params.username = search;
      }
      setUsers(await getUsers(params));
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await deleteUser(id);
      fetchUsers();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  return (
    <>
      <div className="section-header">
        <span className="section-meta">{users.length} total</span>
      </div>
      <div className="search-row">
        <input
          placeholder="Search by username or ID…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchUsers()}
        />
        <button onClick={fetchUsers}>Search</button>
      </div>
      <div className="table-wrap">
        <div
          className="t-head"
          style={{ gridTemplateColumns: "60px 1fr 100px 90px" }}
        >
          <span>ID</span>
          <span>Username</span>
          <span>Role</span>
          <span></span>
        </div>
        {loading && <div className="t-empty">Loading…</div>}
        {!loading && users.length === 0 && (
          <div className="t-empty">No users found</div>
        )}
        {!loading &&
          users.map((user) => (
            <div
              className="t-row"
              key={user.id}
              style={{ gridTemplateColumns: "60px 1fr 100px 90px" }}
            >
              <span className="t-id">#{user.id}</span>
              <span className="t-name">{user.username}</span>
              <span
                className={`role-badge ${user.role === "admin" ? "role-admin" : "role-user"}`}
              >
                {user.role || "user"}
              </span>
              <button className="del-btn" onClick={() => handleDelete(user.id)}>
                Delete
              </button>
            </div>
          ))}
      </div>
    </>
  );
}

// ─── Redis Tab ────────────────────────────────────────────
function RedisTab() {
  const [keys, setKeys] = useState([]);
  const [info, setInfo] = useState(null);
  const [pattern, setPattern] = useState("*");
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [keysData, infoData] = await Promise.all([
        getRedisKeys(pattern),
        getRedisInfo(),
      ]);
      setKeys(keysData);
      setInfo(infoData);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (key) => {
    if (!window.confirm(`Delete key "${key}"?`)) return;
    try {
      await deleteRedisKey(key);
      fetchData();
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Форматируем TTL в читаемый вид
  const formatTTL = (ttl) => {
    if (ttl === -1) return "∞ no expiry";
    if (ttl === -2) return "expired";
    if (ttl < 60) return `${ttl}s`;
    if (ttl < 3600) return `${Math.floor(ttl / 60)}m ${ttl % 60}s`;
    if (ttl < 86400)
      return `${Math.floor(ttl / 3600)}h ${Math.floor((ttl % 3600) / 60)}m`;
    return `${Math.floor(ttl / 86400)}d ${Math.floor((ttl % 86400) / 3600)}h`;
  };

  const formatSize = (bytes) => {
    if (!bytes) return "—";
    if (bytes < 1024) return `${bytes}b`;
    return `${(bytes / 1024).toFixed(1)}kb`;
  };

  // Цвет TTL — чем меньше, тем краснее
  const ttlColor = (ttl) => {
    if (ttl === -1) return "ttl-infinite";
    if (ttl < 60) return "ttl-critical";
    if (ttl < 300) return "ttl-warning";
    return "ttl-ok";
  };

  return (
    <>
      {/* Stats */}
      {info && (
        <div className="redis-stats">
          <div className="stat-card">
            <span className="stat-label">Total keys</span>
            <span className="stat-value">{info.total_keys}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Memory used</span>
            <span className="stat-value">{info.used_memory_human}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Clients</span>
            <span className="stat-value">{info.connected_clients}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Commands</span>
            <span className="stat-value">
              {Number(info.total_commands_processed).toLocaleString()}
            </span>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="search-row" style={{ marginTop: "16px" }}>
        <input
          placeholder="Pattern: * or user:* or *:token"
          value={pattern}
          onChange={(e) => setPattern(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && fetchData()}
        />
        <button onClick={fetchData}>Refresh</button>
      </div>

      {/* Keys table */}
      <div className="table-wrap">
        <div
          className="t-head"
          style={{ gridTemplateColumns: "1fr 80px 80px 70px 80px" }}
        >
          <span>Key</span>
          <span>Type</span>
          <span>Size</span>
          <span>TTL</span>
          <span></span>
        </div>
        {loading && <div className="t-empty">Loading…</div>}
        {!loading && keys.length === 0 && (
          <div className="t-empty">No keys found</div>
        )}
        {!loading &&
          keys.map((item) => (
            <div
              className="t-row"
              key={item.key}
              style={{ gridTemplateColumns: "1fr 80px 80px 70px 80px" }}
            >
              <span className="t-key">{item.key}</span>
              <span className="type-badge">{item.type}</span>
              <span className="t-id">{formatSize(item.size)}</span>
              <span className={`ttl-badge ${ttlColor(item.ttl)}`}>
                {formatTTL(item.ttl)}
              </span>
              <button
                className="del-btn"
                onClick={() => handleDelete(item.key)}
              >
                Delete
              </button>
            </div>
          ))}
      </div>
    </>
  );
}
