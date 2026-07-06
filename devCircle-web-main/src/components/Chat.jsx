import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useParams } from "react-router-dom";
import { createSocketConnection } from "../utils/socket";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { BASE_URL } from "../utils/constants";
import {
  markNotificationRead,
  setNotifications,
} from "../utils/notificationSlice";

const formatMessageTime = (timestamp) => {
  if (!timestamp) return "";

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(timestamp));
};

const getId = (id) => {
  if (!id) return "";
  if (typeof id === "string") return id;
  if (id.$oid) return id.$oid;
  return id.toString();
};

const Chat = () => {
  const { targetUserId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [isChatLoaded, setIsChatLoaded] = useState(false);
  const user = useSelector((store) => store.user);
  const dispatch = useDispatch();
  const userId = user?._id;
  const socketRef = useRef(null);
  const messagesContainerRef = useRef(null);
  const unreadDividerCountRef = useRef(0);

  const fetchChatMessages = useCallback(async () => {
    setIsChatLoaded(false);

    try {
      const notificationsRes = await axios.get(BASE_URL + "/notifications", {
        withCredentials: true,
      });
      const latestNotifications = notificationsRes.data.data || [];
      dispatch(setNotifications(latestNotifications));
    } catch (err) {
      console.error(err);
    }

    const chat = await axios.get(BASE_URL + "/chat/" + targetUserId, {
      withCredentials: true,
    });

    unreadDividerCountRef.current = chat?.data?.unreadCount || 0;

    const chatMessages = chat?.data?.messages.map((msg) => {
      const { senderId, text, createdAt, isSeen, _id } = msg;
      return {
        _id: getId(_id),
        senderId: getId(senderId?._id || senderId),
        firstName: senderId?.firstName,
        lastName: senderId?.lastName,
        text,
        createdAt,
        isSeen,
      };
    });
    setMessages(chatMessages);
    setIsChatLoaded(true);
    dispatch(markNotificationRead(targetUserId));
  }, [dispatch, targetUserId]);

  useEffect(() => {
    fetchChatMessages();
  }, [fetchChatMessages]);

  useLayoutEffect(() => {
    const messagesContainer = messagesContainerRef.current;
    if (!messagesContainer) return;

    messagesContainer.scrollTop = messagesContainer.scrollHeight;
  }, [targetUserId, messages.length]);

  useEffect(() => {
    if (!userId || !isChatLoaded) {
      return;
    }
    const socket = createSocketConnection();
    socketRef.current = socket; //change
    // As soon as the page loaded, the socket connection is made and joinChat event is emitted
    socket.emit("joinChat", {
      targetUserId,
    });

    socket.on("messageReceived", ({
      firstName,
      lastName,
      senderId,
      _id,
      text,
      createdAt,
      isSeen,
    }) => {
      console.log(firstName + " :  " + text);
      setMessages((messages) => [
        ...messages,
        { firstName, lastName, senderId, _id, text, createdAt, isSeen },
      ]);
    });

    socket.on("messagesSeen", ({ messageIds }) => {
      const seenMessageIds = messageIds.map(getId);

      setMessages((messages) =>
        messages.map((message) =>
          seenMessageIds.includes(getId(message._id))
            ? { ...message, isSeen: true }
            : message
        )
      );
    });

    return () => {
      socket.disconnect();
    };
  }, [isChatLoaded, userId, targetUserId, user?.firstName]);

  const sendMessage = () => {
    const socket = socketRef.current;
    if (!socket || !newMessage.trim()) return;
    socket.emit("sendMessage", {
      targetUserId,
      text: newMessage,
    });
    setNewMessage("");
  };

  const ownUserId = getId(userId);
  const unreadMessageStartIndex = useMemo(() => {
    const unreadCount = unreadDividerCountRef.current;
    if (!unreadCount) return -1;

    const targetMessageIndexes = messages.reduce((indexes, message, index) => {
      if (getId(message.senderId) === targetUserId) {
        indexes.push(index);
      }

      return indexes;
    }, []);

    if (targetMessageIndexes.length === 0) return -1;

    const dividerIndex = Math.max(targetMessageIndexes.length - unreadCount, 0);
    return targetMessageIndexes[dividerIndex];
  }, [messages, targetUserId]);

  const latestSeenOwnMessageId = messages.reduce((latestMessageId, message) => {
    if (getId(message.senderId) === ownUserId && message.isSeen) {
      return getId(message._id);
    }

    return latestMessageId;
  }, "");

  return (
    <div className="app-container">
      <div className="surface-card mx-auto flex h-[72vh] max-w-4xl flex-col overflow-hidden rounded-lg">
        <div className="border-b border-white/10 px-5 py-4">
          <h1 className="text-2xl font-black text-slate-50">Chat</h1>
        </div>
        <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-5">
        {messages.map((msg, index) => {
          const isOwnMessage = getId(msg.senderId) === ownUserId;
          const shouldShowUnreadDivider = index === unreadMessageStartIndex;
          const shouldShowSeen =
            isOwnMessage &&
            msg.isSeen &&
            getId(msg._id) === latestSeenOwnMessageId;

          return (
            <div key={msg._id || index}>
              {shouldShowUnreadDivider && (
                <div className="my-4 flex justify-center">
                  <span className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-slate-300 shadow">
                    {unreadDividerCountRef.current} unread{" "}
                    {unreadDividerCountRef.current === 1
                      ? "message"
                      : "messages"}
                  </span>
                </div>
              )}
              <div className={"chat " + (isOwnMessage ? "chat-end" : "chat-start")}>
                <div className="chat-header">
                  {`${msg.firstName}  ${msg.lastName}`}
                  <time className="text-xs opacity-50">
                    {" "}
                    {formatMessageTime(msg.createdAt)}
                  </time>
                </div>
                <div
                  className={
                    "chat-bubble " +
                    (isOwnMessage
                      ? "bg-cyan-400 text-slate-950"
                      : "bg-white/10 text-slate-100")
                  }
                >
                  {msg.text}
                </div>
                {shouldShowSeen && (
                  <div className="chat-footer opacity-50">Seen</div>
                )}
              </div>
            </div>
          );
        })}
        </div>
        <div className="flex items-center gap-3 border-t border-white/10 p-4">
          <input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            className="field-input flex-1"
            placeholder="Type a message"
          />
          <button onClick={sendMessage} className="primary-action">
            Send
          </button>
        </div>
      </div>
    </div>
  );
};
export default Chat;
