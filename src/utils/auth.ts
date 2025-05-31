// filepath: my-login-app/my-login-app/src/utils/auth.ts

export const validateCredentials = (username: string, password: string): boolean => {
    return username === 'Admin' && password === '123456';
};

export const login = (username: string): void => {
    localStorage.setItem('username', username);
};

export const logout = (): void => {
    localStorage.removeItem('username');
};