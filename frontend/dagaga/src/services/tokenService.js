// src/services/tokenService.js
// Token management service for JWT authentication

const TOKEN_KEYS = {
    ACCESS_TOKEN: 'accessToken',
    REFRESH_TOKEN: 'refreshToken',
};

export const tokenService = {
    // Access Token
    getAccessToken() {
        return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
    },

    setAccessToken(token) {
        localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, token);
    },

    // Refresh Token
    getRefreshToken() {
        return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
    },

    setRefreshToken(token) {
        localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, token);
    },

    // Clear all tokens
    clearTokens() {
        localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    },

    // Get Authorization header
    getAuthHeader() {
        const token = this.getAccessToken();
        return token ? `Bearer ${token}` : null;
    },

    // Check if user is authenticated
    isAuthenticated() {
        return !!this.getAccessToken();
    }
};
