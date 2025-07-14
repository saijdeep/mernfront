import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import io from "socket.io-client";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import "../styles/Chat.css";
import Cookies from "js-cookie";

const Chat = () => {
    const { userId } = useParams();
    const navigate = useNavigate();
    const currentUser = useSelector((state) => state.user);
    // GUARD: If userId is missing, show error
    if (!userId) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="bg-red-100 text-red-700 px-6 py-4 rounded-lg shadow">
                    Invalid chat URL. No user selected.
                </div>
            </div>
        );
    }
    const [chatUser, setChatUser] = useState(null);
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [sending, setSending] = useState(false);
    const [roomId, setRoomId] = useState(null);
    const messagesEndRef = useRef(null);
    const socketRef = useRef(null);
    const [isTyping, setIsTyping] = useState(false);
    const [isOnline, setIsOnline] = useState(false);

    useEffect(() => {
        let isMounted = true;
        const fetchChatUser = async () => {
            try {
                const response = await axios.get(`${BASE_URL}/user/${userId}`, {
                    withCredentials: true
                });
                if (isMounted) setChatUser(response.data);
            } catch (err) {
                if (isMounted) setError("Failed to load user information");
            }
        };

        const getOrCreateRoom = async () => {
            try {
                const response = await axios.post(
                    `${BASE_URL}/chat/room`,
                    { participantId: userId },
                    { withCredentials: true }
                );
                return response.data._id || response.data.id || response.data._id || response.data.room?._id || response.data.room?.id;
            } catch (err) {
                if (isMounted) setError("Failed to get chat room");
                return null;
            }
        };

        const fetchMessages = async (roomId) => {
            try {
                const response = await axios.get(`${BASE_URL}/chat/messages/${roomId}`, {
                    withCredentials: true
                });
                if (isMounted) setMessages(response.data || []);
            } catch (err) {
                if (isMounted) setError("Failed to load messages");
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        (async () => {
            setLoading(true);
            setError("");
            await fetchChatUser();
            const room = await getOrCreateRoom();
            if (!room) return;
            setRoomId(room);
            await fetchMessages(room);

            // Connect to socket and join room
            const token = Cookies.get("token");
            console.log("Socket.IO auth token:", token); // Debug log
            socketRef.current = io(BASE_URL, {
                auth: { token },
                withCredentials: true
            });
            socketRef.current.emit("join_room", room);

            socketRef.current.on("new_message", (message) => {
                setMessages((prev) => [...prev, message]);
            });
            socketRef.current.on("user_typing", (data) => {
                if (data.userId === userId) setIsTyping(data.isTyping);
            });
            socketRef.current.on("user_joined", (data) => {
                if (data.userId === userId) setIsOnline(true);
            });
            socketRef.current.on("user_left", (data) => {
                if (data.userId === userId) setIsOnline(false);
            });
        })();

        return () => {
            isMounted = false;
            if (socketRef.current) {
                socketRef.current.disconnect();
            }
        };
    }, [userId, currentUser._id]);

    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim() || sending || !roomId) return;
        setSending(true);
        setError("");
        // Optimistic update: add message to UI immediately with sender name
        const tempMessage = {
            content: newMessage,
            sender: {
                _id: currentUser._id,
                firstName: currentUser.firstName,
                lastName: currentUser.lastName
            },
            createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, tempMessage]);
        try {
            socketRef.current.emit("send_message", { roomId, content: newMessage });
            setNewMessage("");
        } catch (err) {
            setError("Failed to send message");
        } finally {
            setSending(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex justify-center items-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
            </div>
        );
    }

    return (
        <div className="chat-container">
            {/* Chat Header */}
            <div className="bg-white shadow-sm p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-6 w-6 text-gray-600"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M10 19l-7-7m0 0l7-7m-7 7h18"
                            />
                        </svg>
                    </button>
                    <div className="flex items-center gap-2">
                        <img
                            src={chatUser?.photoUrl || "https://via.placeholder.com/40"}
                            alt={chatUser?.firstName}
                            className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                            <h2 className="font-semibold text-gray-800">
                                {chatUser?.firstName} {chatUser?.lastName}
                            </h2>
                            <p className="text-sm text-gray-500">{chatUser?.branch}</p>
                            <p className="text-xs text-green-500 min-h-[18px]">
                                {isTyping ? 'Typing...' : isOnline ? 'Online' : ''}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Container */}
            <div className="messages-container bg-gray-50">
                {error && (
                    <div className="text-center text-red-500 py-2 bg-red-50">{error}</div>
                )}
                {messages.map((message, index) => {
                    // Robust sender check
                    const senderId = typeof message.sender === 'object' ? message.sender._id : message.sender;
                    let senderName = 'Unknown';
                    if (typeof message.sender === 'object' && message.sender.firstName) {
                        senderName = message.sender.firstName;
                    } else if (senderId === currentUser._id) {
                        senderName = currentUser.firstName;
                    }
                    const isSent = senderId === currentUser._id;
                    let sentTime = '-';
                    let deliveredTime = '-';
                    if (message.createdAt) {
                        const dateObj = new Date(message.createdAt);
                        if (!isNaN(dateObj.getTime())) {
                            sentTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    }
                    if (message.deliveredAt) {
                        const dateObj = new Date(message.deliveredAt);
                        if (!isNaN(dateObj.getTime())) {
                            deliveredTime = dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        }
                    }
                    return (
                        <div
                            key={index}
                            className={`message ${isSent ? 'sent' : 'received'}`}
                        >
                            <div className="flex items-center gap-2 mb-1">
                                <span className="font-semibold text-xs text-blue-300">{senderName}</span>
                            </div>
                            <div className="message-content relative pb-2">
                                {message.content}
                            </div>
                            {/* Time and tick icon below bubble, centered */}
                            <div className="flex justify-center items-center gap-1 text-xs text-gray-400 mt-1">
                                {isSent && (
                                    <svg className="inline w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                                {(deliveredTime !== '-' && deliveredTime) ? (
                                    <span className="text-green-500">{deliveredTime}</span>
                                ) : (sentTime !== '-' && sentTime) ? (
                                    <span className="text-gray-400">{sentTime}</span>
                                ) : null}
                            </div>
                        </div>
                    );
                })}
                <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="message-form">
                <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                    disabled={sending}
                />
                <button
                    type="submit"
                    disabled={!newMessage.trim() || sending}
                    className="send-button"
                >
                    {sending ? (
                        <div className="animate-spin rounded-full h-5 w-5 border-2 border-white"></div>
                    ) : (
                        <>
                            Send
                            <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                            >
                                <path
                                    fillRule="evenodd"
                                    d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                                    clipRule="evenodd"
                                />
                            </svg>
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default Chat; 