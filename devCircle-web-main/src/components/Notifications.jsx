import axios from "axios";
import {
  Bell,
  CheckCircle2,
  Crown,
  MessageCircle,
  UserPlus,
  Users,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { BASE_URL } from "../utils/constants";
import {
  getNotificationSenderId,
  markNotificationRead,
  markNotificationReadById,
  setNotifications,
} from "../utils/notificationSlice";

const formatNotificationTime = (timestamp) => {
  if (!timestamp) return "";

  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(timestamp));
};

const Notifications = () => {
  const notifications = useSelector((store) => store.notifications);
  const [isLoading, setIsLoading] = useState(notifications.length === 0);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await axios.get(BASE_URL + "/notifications", {
        withCredentials: true,
      });

      dispatch(setNotifications(res.data.data));
    } catch (err) {
      console.error(err);
      dispatch(setNotifications([]));
    } finally {
      setIsLoading(false);
    }
  }, [dispatch]);

  useEffect(() => {
    fetchNotifications();
  }, [fetchNotifications]);

  const openChat = async (senderUserId) => {
    try {
      await axios.patch(
        BASE_URL + "/notifications/read/" + senderUserId,
        {},
        { withCredentials: true }
      );
      dispatch(markNotificationRead(senderUserId));
    } catch (err) {
      console.error(err);
    }

    navigate("/chat/" + senderUserId);
  };

  const openNotification = async (notification) => {
    const senderUserId = getNotificationSenderId(notification);

    if (notification.type === "message" && senderUserId) {
      openChat(senderUserId);
      return;
    }

    try {
      await axios.patch(
        BASE_URL + "/notifications/read-by-id/" + notification._id,
        {},
        { withCredentials: true }
      );
      dispatch(markNotificationReadById(notification._id));
    } catch (err) {
      console.error(err);
    }

    navigate(notification.actionUrl || "/notifications");
  };

  if (isLoading) {
    return (
      <div className="app-container flex justify-center">
        <div className="soft-panel rounded-lg px-6 py-4 font-semibold text-slate-300">
          Loading...
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="app-container">
        <div className="soft-panel mx-auto max-w-3xl rounded-lg p-8 text-center">
          <Bell className="mx-auto mb-4 text-cyan-300" size={36} />
          <h1 className="text-2xl font-black text-slate-50">
            No notifications found
          </h1>
          <p className="page-subtitle">
          Requests, messages, premium updates, and connection activity will appear here.
        </p>
        </div>
      </div>
    );
  }

  return (
    <div className="app-container max-w-4xl">
      <div className="mb-7 text-center">
        <h1 className="page-title">Notifications</h1>
        <p className="page-subtitle">
          Messages, requests, and premium updates in one place.
        </p>
      </div>

      {notifications.map((notification) => {
        const sender = notification.senderId;
        const senderName = [sender?.firstName, sender?.lastName]
          .filter(Boolean)
          .join(" ");
        const notificationTitle =
          notification.title ||
          (senderName
            ? `${senderName} sent you a notification`
            : "New notification");
        const notificationMessage =
          notification.message || notification.latestMessage;
        const unreadLabel =
          notification.type === "message" && notification.unreadCount > 1
            ? `${notification.unreadCount} messages`
            : "new";
        const Icon =
          notification.type === "connection_request"
            ? UserPlus
            : notification.type === "request_accepted"
            ? Users
            : notification.type === "premium"
            ? Crown
            : MessageCircle;

        return (
          <button
            key={notification._id}
            onClick={() => openNotification(notification)}
            className="soft-panel mb-4 flex w-full items-center gap-4 rounded-lg p-4 text-left transition hover:border-cyan-300/40 hover:bg-white/[0.07]"
          >
            {sender?.photoUrl ? (
              <img
                alt={senderName}
                className="h-16 w-16 rounded-full object-cover ring-2 ring-cyan-300/50"
                src={sender.photoUrl}
              />
            ) : (
              <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-cyan-300/10 text-cyan-200">
                <Icon size={30} />
              </div>
            )}

            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-xl font-black text-slate-50">
                  {notificationTitle}
                </h2>
                {!notification.isRead && (
                  <span className="badge border-0 bg-cyan-300 text-slate-950">
                    {unreadLabel}
                  </span>
                )}
              </div>
              <p className="mt-1 truncate text-sm text-slate-400">
                {notificationMessage}
              </p>
              <p className="mt-2 text-xs text-slate-500">
                {formatNotificationTime(notification.lastMessageAt)}
              </p>
            </div>

            {notification.isRead ? (
              <CheckCircle2 className="shrink-0 text-emerald-300" size={26} />
            ) : (
              <Icon className="shrink-0 text-cyan-300" size={28} />
            )}
          </button>
        );
      })}
    </div>
  );
};

export default Notifications;
