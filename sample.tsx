// TypeScript Syntax Highlighting Demo
import React, { useState, useEffect, useCallback } from "react";
import type { FC, ReactNode } from "react";

// Type definitions
interface User {
    id: number;
    name: string;
    email?: string;
    isActive: boolean;
}

type Status = "pending" | "success" | "error";
type ApiResponse<T> = {
    data: T;
    status: Status;
    message?: string;
};

// Enum example
enum Color {
    RED = "#ff0000",
    GREEN = "#00ff00",
    BLUE = "#0000ff",
}

// Generic type with constraints
interface Repository<T extends { id: number }> {
    findById(id: number): Promise<T | null>;
    save(entity: T): Promise<T>;
    delete(id: number): Promise<boolean>;
}

// Class with decorators (conceptual)
class UserService implements Repository<User> {
    private readonly apiUrl = process.env.API_URL || "https://api.example.com";
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
                throw new Error(
                    `HTTP ${response.status}: ${response.statusText}`,
                );
            }

            const user: User = await response.json();
            this.cache.set(id, user);
            return user;
        } catch (error) {
            console.error("Failed to fetch user:", error);
            return null;
        }
    }

    async save(user: User): Promise<User> {
        const response = await fetch(`${this.apiUrl}/users`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(user),
        });
        return response.json();
    }

    async delete(id: number): Promise<boolean> {
        const response = await fetch(`${this.apiUrl}/users/${id}`, {
            method: "DELETE",
        });
        return response.ok;
    }
}
