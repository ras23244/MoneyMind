import React, { useState } from 'react';
import { useUser } from '../context/UserContext';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';

dayjs.extend(relativeTime);

const PRIORITY_COLOR = {
    high: 'border-l-4 border-red-500 bg-red-50',
    medium: 'border-l-4 border-yellow-500 bg-yellow-50',
    low: 'border-l-4 border-blue-500 bg-blue-50',
};

const ICON_MAP = {
    budget_created: '📊',
    budget_updated: '📊',
    budget_deleted: '📊',
    bill_created: '💳',
    bill_paid: '✅',
    bill_due: '⏰',
    goal_created: '🎯',
    goal_progress: '📈',
    goal_deleted: '🎯',
    transaction_income: '💰',
    account_linked: '🔗',
    account_unlinked: '🔗',
};

export default function NotificationBell() {
    const { notifications, user, markNotificationRead, markAllRead, deleteNotification } = useUser();
    const [showInbox, setShowInbox] = useState(false);
    const [removingIds, setRemovingIds] = useState(new Set());

    const unreadCount = (notifications || []).filter((n) => !n.read).length || (notifications || []).length;

    const handleMarkRead = (notifId) => {
        // animate swipe out then mark read on server and remove from list
        setRemovingIds((s) => new Set([...s, notifId]));
        setTimeout(async () => {
            await markNotificationRead(notifId);
            setRemovingIds((s) => {
                const next = new Set(s);
                next.delete(notifId);
                return next;
            });
        }, 300);
    };

    const handleMarkAllRead = () => {
        const ids = (notifications || []).map((n) => n.id);
        // animate all unread
        setRemovingIds(new Set(ids));
        setTimeout(async () => {
            await markAllRead();
            setRemovingIds(new Set());
        }, 300);
    };

    const handleDelete = (notifId) => {
        setRemovingIds((s) => new Set([...s, notifId]));
        setTimeout(async () => {
            await deleteNotification(notifId);
            setRemovingIds((s) => {
                const next = new Set(s);
                next.delete(notifId);
                return next;
            });
        }, 300);
    };

    if (!user) return null;

    return (
        <div className="relative">
            {/* Bell Icon Button */}
            <button
                onClick={() => setShowInbox(!showInbox)}
                className="relative p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                aria-label="Notifications"
            >
                <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15 17h5l-1.405-1.405A2.032 2.032 0 0018 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                </svg>
                {unreadCount > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1 -translate-y-1 bg-red-600 rounded-full">
                        {unreadCount}
                    </span>
                )}
            </button>

            {/* Inbox Dropdown */}
            {showInbox && (
                <div className="absolute right-0 mt-2 w-96 bg-white dark:bg-gray-900 rounded-lg shadow-xl z-50 border border-gray-200 dark:border-gray-700">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <h3 className="text-lg font-semibold">Notifications</h3>
                        {unreadCount > 0 && (
                            <button
                                onClick={handleMarkAllRead}
                                className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400"
                            >
                                Mark all read
                            </button>
                        )}
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {(!notifications || notifications.length === 0) ? (
                            <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                                No notifications yet
                            </div>
                        ) : (
                            notifications.map((notif) => {
                                const removing = removingIds.has(notif.id);
                                return (
                                    <div
                                        key={notif.id}
                                        className={`p-3 border-b border-gray-100 dark:border-gray-800 transition-transform duration-300 ${PRIORITY_COLOR[notif.priority] || PRIORITY_COLOR.low} ${removing ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
                                        style={{ transform: removing ? 'translateX(100%)' : 'translateX(0)' }}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-xl">{ICON_MAP[notif.type] || '📢'}</span>
                                                    <div>
                                                        <p className="font-medium text-sm">{notif.title}</p>
                                                        {notif.body && (
                                                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                                {notif.body}
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                                                            {dayjs(notif.createdAt).fromNow()}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2 ml-2">
                                                {!notif.read && (
                                                    <button
                                                        onClick={() => handleMarkRead(notif.id)}
                                                        className="text-xs px-2 py-1 rounded bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 hover:bg-blue-200"
                                                        title="Mark as read"
                                                    >
                                                        ✓
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => handleDelete(notif.id)}
                                                    className="text-xs px-2 py-1 rounded bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 hover:bg-red-200"
                                                    title="Delete"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                        <button
                            onClick={() => setShowInbox(false)}
                            className="text-sm text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
