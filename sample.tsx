// TypeScript Syntax Highlighting Demo
import React, { useState, useEffect, useCallback } from 'react';
import type { FC, ReactNode } from 'react';

// Type definitions
interface User {
  id: number;
  name: string;
  email?: string;
  isActive: boolean;
}

type Status = 'pending' | 'success' | 'error';
type ApiResponse<T> = {
  data: T;
  status: Status;
  message?: string;
};

// Enum example
enum Color {
  RED = '#ff0000',
  GREEN = '#00ff00',
  BLUE = '#0000ff',
}

// Generic type with constraints
interface Repository<T extends { id: number }> {
  findById(id: number): Promise<T | null>;
  save(entity: T): Promise<T>;
  delete(id: number): Promise<boolean>;
}

// Class with decorators (conceptual)
class UserService implements Repository<User> {
  private readonly apiUrl = process.env.API_URL || 'https://api.example.com';
  private cache = new Map<number, User>();

  constructor(private readonly timeout: number = 5000) {}

  async findById(id: number): Promise<User | null> {
    const cached = this.cache.get(id);
    if (cached) return cached;

    try {
      const response = await fetch(`${this.apiUrl}/users/${id}`, {
        signal: AbortSignal.timeout(this.timeout),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const user: User = await response.json();
      this.cache.set(id, user);
      return user;
    } catch (error) {
      console.error('Failed to fetch user:', error);
      return null;
    }
  }

  async save(user: User): Promise<User> {
    const response = await fetch(`${this.apiUrl}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(user),
    });
    return response.json();
  }

  async delete(id: number): Promise<boolean> {
    const response = await fetch(`${this.apiUrl}/users/${id}`, {
      method: 'DELETE',
    });
    return response.ok;
  }
}

// Arrow functions with generics
const createApiClient = <T>(baseUrl: string) => ({
  get: async (path: string): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`);
    return response.json();
  },
  post: async (path: string, data: unknown): Promise<T> => {
    const response = await fetch(`${baseUrl}${path}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    return response.json();
  },
});

// React component with hooks
const UserProfile: FC<{ userId: number }> = ({ userId }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const userService = useCallback(() => new UserService(), []);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        const userData = await userService().findById(userId);
        setUser(userData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [userId, userService]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;
  if (!user) return <div>User not found</div>;

  return (
    <div className="user-profile">
      <h2>{user.name}</h2>
      <p>Email: {user.email ?? 'Not provided'}</p>
      <p>Status: {user.isActive ? 'Active' : 'Inactive'}</p>
    </div>
  );
};

// Advanced types
type EventHandler<T = Event> = (event: T) => void;
type Nullable<T> = T | null;
type KeysOfType<T, U> = {
  [K in keyof T]: T[K] extends U ? K : never;
}[keyof T];

// Utility functions with type guards
const isString = (value: unknown): value is string =>
  typeof value === 'string';

const isUser = (value: unknown): value is User =>
  typeof value === 'object' &&
  value !== null &&
  'id' in value &&
  'name' in value &&
  typeof (value as any).id === 'number' &&
  typeof (value as any).name === 'string';

// Template literals and computed properties
const buildUrl = (baseUrl: string, path: string, params?: Record<string, string>) => {
  const url = new URL(path, baseUrl);
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value);
    });
  }
  return url.toString();
};

// Async generator
async function* fetchUsers(userService: UserService, ids: number[]) {
  for (const id of ids) {
    const user = await userService.findById(id);
    if (user) yield user;
  }
}

// Namespace
namespace API {
  export interface Request {
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    url: string;
    headers?: Record<string, string>;
    body?: unknown;
  }

  export interface Response<T = unknown> {
    data: T;
    status: number;
    headers: Record<string, string>;
  }
}

// Module augmentation example
declare global {
  interface Window {
    API: typeof API;
  }
}

// Export everything
export default UserProfile;
export {
  UserService,
  createApiClient,
  buildUrl,
  fetchUsers,
  isString,
  isUser,
  Color,
};

export type {
  User,
  Status,
  ApiResponse,
  Repository,
  EventHandler,
  Nullable,
  KeysOfType,
};
