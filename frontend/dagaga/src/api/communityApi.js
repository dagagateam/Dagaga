import instance from './axios';

export const fetchCommunityInfo = async (page = 0, size = 20) => {
    try {
        const response = await instance.get('/community/programs', {
            params: { page, size }
        });
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to fetch community info:', error);
        throw error;
    }
};

export const fetchCommunityInfoDetail = async (id) => {
    try {
        const response = await instance.get(`/community/programs/${id}`);
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to fetch community info detail:', error);
        throw error;
    }
};



/**
 * Fetch chat messages for a specific room.
 * @param {number} roomId - The chat room ID.
 * @param {number|null} cursor - The message ID cursor for pagination (optional).
 * @param {number} size - Number of messages to fetch (default 30).
 * @returns {Promise<Array>} - List of chat messages.
 */
export const fetchChatMessages = async (roomId, cursor = null, size = 30) => {
    const params = {
        size
    };
    if (cursor) {
        params.cursor = cursor;
    }

    const response = await instance.get(`/community/chats/${roomId}/messages`, { params });
    return response.data;
};

/**
 * Create a new chat room.
 * @param {string} title - The chat room title.
 * @returns {Promise<Object>} - Created chat room data.
 */
export const createChatRoom = async (title) => {
    try {
        const response = await instance.post('/community/chats', {
            title
        });
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to create chat room:', error);
        throw error;
    }
};

/**
 * Fetch joined chat rooms for a user.
 * @returns {Promise<Array>} - List of joined chat rooms.
 */
export const fetchJoinedChats = async () => {
    try {
        const response = await instance.get('/community/chats/joined');
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to fetch joined chats:', error);
        throw error;
    }
};

/**
 * Send a chat message to a room.
 * @param {number} roomId - The chat room ID.
 * @param {string} message - The message text.
 * @returns {Promise<Object>} - Sent message data.
 */
export const sendChatMessage = async (roomId, message) => {
    try {
        const payload = {
            message
        };

        // Add userLocationId if provided
        if (userLocationId) {
            payload.userLocationId = userLocationId;
        }

        // DEBUG: Sending message info
        // console.log('Sending message:', { roomId, payload });

        const response = await instance.post(`/community/chats/${roomId}/messages`, payload);

        // DEBUG: Message sent info
        // console.log('Message sent successfully:', response.data);
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to send message:', error);
        console.error('Error response:', error.response?.data);
        throw error;
    }
};

/**
 * Fetch chat rooms by user location.
 * @param {string} sortBy - Sort order: 'popularity' or 'latest' (default: 'popularity').
 * @returns {Promise<Array>} - List of chat rooms in the user's location.
 */
export const fetchChatsByLocation = async (sortBy = 'popularity') => {
    try {
        const response = await instance.get('/community/chats/by-location', {
            params: {
                sortBy
            }
        });
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to fetch chats by location:', error);
        throw error;
    }
};

/**
 * Join a chat room.
 * @param {number} roomId - The chat room ID.
 * @returns {Promise<Object>} - Join result.
 */
export const joinChatRoom = async (roomId) => {
    try {
        const response = await instance.post(`/community/chats/${roomId}/join`);
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to join chat room:', error);
        throw error;
    }
};

/**
 * Leave a chat room.
 * @param {number} roomId - The chat room ID.
 * @returns {Promise<Object>} - Leave result.
 */
export const leaveChatRoom = async (roomId) => {
    try {
        const response = await instance.post(`/community/chats/${roomId}/leave`);
        return response.data;
    } catch (error) {
        console.error('Failed to leave chat room:', error);
        throw error;
    }
};





/**
 * Create a new comment for a program.
 * @param {number} postId - The program post ID.
 * @param {string} content - The comment content.
 * @param {number} userId - The user's ID.
 * @param {number|null} parentCommentId - The parent comment ID (optional).
 * @returns {Promise<Object>} - Created comment data.
 */
export const createComment = async (postId, content, userId, parentCommentId = null) => {
    try {
        const response = await instance.post(`/community/programs/${postId}/comments`, {
            content,
            userId,
            parentCommentId
        });
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to create comment:', error);
        throw error;
    }
};

/**
 * Fetch comments for a specific program.
 * @param {number} postId - The program post ID.
 * @returns {Promise<Array>} - List of comments.
 */
export const fetchComments = async (postId) => {
    try {
        const response = await instance.get(`/community/programs/${postId}/comments`);
        return response.data; // ApiResponse 형식: { success, message, data: [...] }
    } catch (error) {
        console.error('Failed to fetch comments:', error);
        throw error;
    }
};
