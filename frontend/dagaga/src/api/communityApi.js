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
                    joinedChats: [
                        { id: 201, title: "서울 종로구 단체 채팅방", count: 12 },
                        { id: 202, title: "주말 등산 동호회", count: 8 },
                        { id: 203, title: "한국어 스터디", count: 5 }
                    ],
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
