export const setToken = (token: string) => {
    document.cookie = `token=${token}; path=/;`;
};

export const getToken = (): string | null => {
    const match = document.cookie.match(/(^|;)\s*token=([^;]+)/);
    return match ? match[2] : null;
};

export const removeToken = () => {
    document.cookie = `token=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/;`;
};

export const generateToken = (): string => {
    return Math.random().toString(36).substr(2); // Simple token generation
};