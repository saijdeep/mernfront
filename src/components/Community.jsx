import { useState, useEffect, useRef } from "react";
import { useSelector } from "react-redux";
import { BASE_URL } from "../utils/constants";
import axios from "axios";
import { useLocation, useNavigate } from "react-router-dom";

const Community = () => {
    const location = useLocation();
    const navigate = useNavigate();
    function getTabFromQuery() {
        const params = new URLSearchParams(location.search);
        const tab = params.get("tab");
        if (["event", "internship", "placement"].includes(tab)) return tab;
        return "event";
    }
    const [activeTab, setActiveTab] = useState(getTabFromQuery());
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [newPost, setNewPost] = useState({ title: "", content: "", category: "event", image: "", link: "" });
    const [editingPost, setEditingPost] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const user = useSelector((state) => state.user);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [imagePreview, setImagePreview] = useState("");

    // Sync tab with URL
    useEffect(() => {
        setActiveTab(getTabFromQuery());
    }, [location.search]);

    // Close menu when clicking outside
    const menuRef = useRef();
    useEffect(() => {
        function handleClickOutside(event) {
            if (menuRef.current && !menuRef.current.contains(event.target)) {
                setMenuOpenId(null);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const fetchPosts = async () => {
        try {
            setLoading(true);
            const response = await axios.get(`${BASE_URL}/posts?category=${activeTab}`, {
                withCredentials: true
            });
            setPosts(response.data.data);
        } catch (err) {
            setError(err.response?.data?.error || "Failed to fetch posts");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchPosts();
        setNewPost((prev) => ({ ...prev, category: activeTab }));
    }, [activeTab]);

    const getBackendCategory = (tabId) => {
        if (tabId === "event") return "event";
        if (tabId === "internship") return "internship";
        if (tabId === "placement") return "placement";
        return tabId;
    };

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setNewPost((prev) => ({ ...prev, image: reader.result }));
                setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const backendCategory = newPost.category || getBackendCategory(activeTab);
            const postData = { ...newPost, category: backendCategory };
            if (editingPost) {
                await axios.patch(
                    `${BASE_URL}/posts/${editingPost._id}`,
                    postData,
                    { withCredentials: true }
                );
                setEditingPost(null);
            } else {
                await axios.post(
                    `${BASE_URL}/posts`,
                    postData,
                    { withCredentials: true }
                );
            }
            setNewPost({ title: "", content: "", category: activeTab, image: "", link: "" });
            setImagePreview("");
            setShowModal(false);
            fetchPosts();
        } catch (err) {
            console.error("Post creation error:", err.response?.data || err.message);
            setError(err.response?.data?.error || err.message || "Failed to save post");
        }
    };

    const handleEdit = (post) => {
        setEditingPost(post);
        setNewPost({ title: post.title, content: post.content, category: post.category, image: post.image, link: post.link });
        setShowModal(true);
    };

    const handleDelete = async (postId) => {
        try {
            await axios.delete(`${BASE_URL}/posts/${postId}`, {
                withCredentials: true
            });
            fetchPosts();
        } catch (err) {
            setError(err.response?.data?.error || "Failed to delete post");
        }
    };

    const tabs = [
        { id: "event", label: "Events" },
        { id: "internship", label: "Internships" },
        { id: "placement", label: "Placements" }
    ];

    return (
        <div className="max-w-4xl mx-auto px-4 py-8">
            {/* Tabs */}
            <div className="tabs tabs-boxed mb-6 flex items-center">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`tab ${activeTab === tab.id ? 'tab-active' : ''}`}
                        onClick={() => {
                            navigate(`/community?tab=${tab.id}`);
                            setActiveTab(tab.id);
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
                {/* + Button */}
                <button
                    className="ml-4 btn btn-circle btn-primary text-xl flex items-center justify-center"
                    onClick={() => {
                        setEditingPost(null);
                        setNewPost({ title: "", content: "", category: activeTab, image: "", link: "" });
                        setShowModal(true);
                    }}
                    title="Create Post"
                >
                    +
                </button>
            </div>

            {/* Modal for New/Edit Post */}
            {showModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
                    <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-lg relative">
                        <button
                            className="absolute top-2 right-2 btn btn-sm btn-circle btn-ghost"
                            onClick={() => setShowModal(false)}
                        >
                            ✕
                        </button>
                        <form onSubmit={handleSubmit}>
                            <h3 className="text-xl font-semibold mb-4">
                                {editingPost ? "Edit Post" : "Create New Post"}
                            </h3>
                            <div className="space-y-4">
                                <div>
                                    <input
                                        type="text"
                                        placeholder="Title"
                                        value={newPost.title}
                                        onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                        className="input input-bordered w-full"
                                        required
                                    />
                                </div>
                                <div>
                                    <textarea
                                        placeholder="Content"
                                        value={newPost.content}
                                        onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                        className="textarea textarea-bordered w-full h-24"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Category</label>
                                    <select
                                        className="input input-bordered w-full"
                                        value={newPost.category}
                                        onChange={e => setNewPost({ ...newPost, category: e.target.value })}
                                        required
                                    >
                                        <option value="event">Event</option>
                                        <option value="internship">Internship</option>
                                        <option value="placement">Placement</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Image (optional)</label>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="file-input file-input-bordered w-full"
                                        onChange={handleImageChange}
                                    />
                                    {imagePreview && (
                                        <img src={imagePreview} alt="Preview" className="mt-2 max-h-32 rounded-lg border" />
                                    )}
                                </div>
                                <div>
                                    <label className="block mb-1 font-medium">Link (optional)</label>
                                    <input
                                        type="url"
                                        placeholder="https://example.com"
                                        value={newPost.link}
                                        onChange={e => setNewPost({ ...newPost, link: e.target.value })}
                                        className="input input-bordered w-full"
                                    />
                                </div>
                                <div className="flex justify-between">
                                    <button type="submit" className="btn btn-primary">
                                        {editingPost ? "Update Post" : "Create Post"}
                                    </button>
                                    {editingPost && (
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setEditingPost(null);
                                                setNewPost({ title: "", content: "", category: "event", image: "", link: "" });
                                                setImagePreview("");
                                                setShowModal(false);
                                            }}
                                            className="btn btn-ghost"
                                        >
                                            Cancel Edit
                                        </button>
                                    )}
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Error Message */}
            {error && (
                <div className="alert alert-error mb-4">
                    <span>{error}</span>
                </div>
            )}

            {/* Posts List */}
            {loading ? (
                <div className="flex justify-center">
                    <span className="loading loading-spinner loading-lg"></span>
                </div>
            ) : (
                <div className="space-y-6">
                    {posts.map((post) => (
                        <div key={post._id} className="bg-white p-6 rounded-lg shadow-md relative">
                            <div className="flex justify-between items-start mb-4">
                                <div>
                                    <h3 className="text-xl font-semibold">{post.title}</h3>
                                    <p className="text-sm text-gray-500">
                                        Posted by {post.author.firstName} {post.author.lastName}
                                    </p>
                                </div>
                                {post.author._id === user._id && (
                                    <div className="relative" ref={menuRef}>
                                        <button
                                            className="btn btn-ghost btn-circle border border-indigo-500 bg-indigo-100 hover:bg-indigo-200"
                                            onClick={() => setMenuOpenId(menuOpenId === post._id ? null : post._id)}
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M6 12h.01M12 12h.01M18 12h.01" />
                                            </svg>
                                        </button>
                                        {menuOpenId === post._id && (
                                            <div className="absolute right-0 mt-2 w-28 bg-white border rounded shadow-lg z-10">
                                                <button
                                                    onClick={() => { setMenuOpenId(null); handleEdit(post); }}
                                                    className="block w-full text-left px-4 py-2 hover:bg-gray-100"
                                                >
                                                    Edit
                                                </button>
                                                <button
                                                    onClick={() => { setMenuOpenId(null); handleDelete(post._id); }}
                                                    className="block w-full text-left px-4 py-2 text-red-600 hover:bg-gray-100"
                                                >
                                                    Delete
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                            <p className="text-gray-700 whitespace-pre-wrap">{post.content}</p>
                            <div className="mt-4 text-sm text-gray-500">
                                {new Date(post.createdAt).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <div className="text-center text-gray-500 py-8">
                            No posts found in this category
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Community; 