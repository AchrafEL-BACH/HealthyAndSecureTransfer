import axios from 'axios';

const API_URL = 'http://exemple.com/api'; // Remplacez par l'URL de votre API

interface User {
  id: number;
  username: string;
  password: string;
  email: string;
}

export const UserService = {
  getUsers: async (): Promise<User[]> => {
    const response = await axios.get<User[]>(`${API_URL}/users`);
    return response.data;
  },

  getUserByUsername: async (username: string): Promise<User | undefined> => {
    const users = await UserService.getUsers();
    return users.find(user => user.username === username);
  },

  getUserById: async (userId: number): Promise<User> => {
    const response = await axios.get<User>(`${API_URL}/users/${userId}`);
    return response.data;
  },

  createUser: async (userData: Partial<User>): Promise<User> => {
    const response = await axios.post<User>(`${API_URL}/users`, userData);
    return response.data;
  },

  updateUser: async (userId: number, userData: Partial<User>): Promise<User> => {
    const response = await axios.put<User>(`${API_URL}/users/${userId}`, userData);
    return response.data;
  },

  deleteUser: async (userId: number): Promise<void> => {
    await axios.delete(`${API_URL}/users/${userId}`);
  }
};
