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

export const fetchChatRooms = async () => {
    return new Promise((resolve) => {
        setTimeout(() => {
            resolve({
                data: {
                    regionalChat: {
                        id: 1,
                        title: "서울 종로구 단체 채팅방",
                        participantCount: 36,
                        image: "https://via.placeholder.com/600x300/F8B15E/FFFFFF?text=Group" // Placeholder or user provided example
                    },
                    userChats: [
                        {
                            id: 101,
                            title: "한국어 공부 같이해요",
                            creator: "배우는엄마",
                            avatar: "https://i.pravatar.cc/150?u=mom",
                            participantCount: 36,
                            image: "https://via.placeholder.com/150", // Placeholder
                            description: "한국어 공부 같이 하실 분 구해요"
                        },
                        {
                            id: 102,
                            title: "한국 음식 레시피",
                            creator: "한나",
                            avatar: "https://i.pravatar.cc/150?u=hanna",
                            participantCount: 28,
                            image: "https://via.placeholder.com/150",
                            description: "맛있는 한국 음식 레시피 공유해요"
                        },
                        {
                            id: 103,
                            title: "정보 공유방",
                            creator: "초보엄마",
                            avatar: "https://i.pravatar.cc/150?u=newmom",
                            participantCount: 14,
                            image: "https://via.placeholder.com/150",
                            description: "육아 정보 공유해요"
                        },
                        {
                            id: 104,
                            title: "한글 공부방",
                            creator: "버터",
                            avatar: "https://i.pravatar.cc/150?u=butter",
                            participantCount: 5,
                            image: "https://via.placeholder.com/150",
                            description: "한글 같이 배워요"
                        },
                        {
                            id: 105,
                            title: "한글 공부방",
                            creator: "버터",
                            avatar: "https://i.pravatar.cc/150?u=butter",
                            participantCount: 5,
                            image: "https://via.placeholder.com/150",
                            description: "한글 같이 배워요"
                        }
                    ]
                }
            });
        }, 500);
    });
};

/**
 * Fetch chat messages for a specific room.
 * @param {number} roomId - The chat room ID.
 * @param {number} userLocationId - The user's location ID (required).
 * @param {number|null} cursor - The message ID cursor for pagination (optional).
 * @param {number} size - Number of messages to fetch (default 30).
 * @returns {Promise<Array>} - List of chat messages.
 */
export const fetchChatMessages = async (roomId, userLocationId, cursor = null, size = 30) => {
    const params = {
        userLocationId,
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
 * @param {number} userId - The user's ID.
 * @param {string} title - The chat room title.
 * @returns {Promise<Object>} - Created chat room data.
 */
export const createChatRoom = async (userId, title) => {
    try {
        const response = await instance.post('/community/chats', {
            userId,
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
 * @param {number} userId - The user's ID.
 * @returns {Promise<Array>} - List of joined chat rooms.
 */
export const fetchJoinedChats = async (userId) => {
    try {
        const response = await instance.get('/community/chats/joined', {
            params: { userId }
        });
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to fetch joined chats:', error);
        throw error;
    }
};

/**
 * Send a chat message to a room.
 * @param {number} roomId - The chat room ID.
 * @param {number} userId - The sender's user ID.
 * @param {string} message - The message text.
 * @param {number} userLocationId - The user's location ID (optional).
 * @returns {Promise<Object>} - Sent message data.
 */
export const sendChatMessage = async (roomId, userId, message, userLocationId = null) => {
    try {
        const payload = {
            userId,
            message
        };
        
        // Add userLocationId if provided
        if (userLocationId) {
            payload.userLocationId = userLocationId;
        }
        
        console.log('Sending message:', { roomId, payload });
        
        const response = await instance.post(`/community/chats/${roomId}/messages`, payload);
        
        console.log('Message sent successfully:', response.data);
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to send message:', error);
        console.error('Error response:', error.response?.data);
        throw error;
    }
};

/**
 * Fetch chat rooms by user location.
 * @param {number} userLocationId - The user's location ID.
 * @param {string} sortBy - Sort order: 'popularity' or 'latest' (default: 'popularity').
 * @returns {Promise<Array>} - List of chat rooms in the user's location.
 */
export const fetchChatsByLocation = async (userLocationId, sortBy = 'popularity') => {
    try {
        const response = await instance.get('/community/chats/by-location', {
            params: {
                userLocationId,
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
 * @param {number} userId - The user's ID.
 * @param {number} userLocationId - The user's location ID.
 * @returns {Promise<Object>} - Join result.
 */
export const joinChatRoom = async (roomId, userId, userLocationId) => {
    try {
        const response = await instance.post(`/community/chats/${roomId}/join`, null, {
            params: {
                userId,
                userLocationId
            }
        });
        return response.data; // ApiResponse 형식: { success, message, data }
    } catch (error) {
        console.error('Failed to join chat room:', error);
        throw error;
    }
};





