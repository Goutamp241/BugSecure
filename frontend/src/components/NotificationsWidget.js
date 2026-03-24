import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import API from "../services/api";

const NotificationsWidget = ({ limit = 5 }) => {
  const [items, setItems] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await API.get("/api/notifications", {
        params: { unreadOnly: true, page: 0, pageSize: limit },
      });
      if (res.data.success) {
        setItems(res.data.data || []);
        setUnreadCount(res.data.meta?.total || 0);
      }
    } catch (e) {
      console.error("Failed to load notifications:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleMarkRead = async (id) => {
    try {
      await API.put(`/api/notifications/${id}/read`);
      await fetchNotifications();
    } catch (e) {
      console.error("Failed to mark notification read:", e);
    }
  };

  if (loading) return null;

  return (
    <div className="bg-gray-800 p-4 md:p-6 rounded-lg border border-gray-700 mb-8">
      <div className="flex items-center justify-between gap-3 mb-3">
        <h3 className="text-lg md:text-xl font-bold text-blue-400">
          Notifications
        </h3>
        <span className="text-sm text-gray-300">
          Unread:{" "}
          <span className="text-blue-300 font-semibold">
            {unreadCount}
          </span>
        </span>
      </div>

      {items.length === 0 ? (
        <p className="text-gray-400 text-sm">No new notifications.</p>
      ) : (
        <div className="space-y-3">
          {items.map((n, idx) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.35, delay: idx * 0.03 }}
              className="bg-gray-700/40 border border-gray-600 rounded-lg p-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="font-semibold text-white text-sm md:text-base break-words">
                    {n.title}
                  </p>
                  <p className="text-gray-300 text-xs md:text-sm mt-1 break-words">
                    {n.message}
                  </p>
                  {n.createdAt && (
                    <p className="text-gray-400 text-[11px] mt-1">
                      {n.createdAt}
                    </p>
                  )}
                </div>
                <button
                  onClick={() => handleMarkRead(n.id)}
                  className="px-3 py-1 bg-blue-600 hover:bg-blue-700 rounded-lg font-semibold transition text-xs md:text-sm whitespace-nowrap"
                >
                  Mark read
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsWidget;

