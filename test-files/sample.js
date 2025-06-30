// Sample JavaScript file for testing the Chrome Extension
// This file demonstrates various JavaScript concepts that should be detected by the knowledge graph

class User {
    constructor(name, email) {
        this.name = name;
        this.email = email;
        this.createdAt = new Date();
    }

    getDisplayName() {
        return `${this.name} (${this.email})`;
    }

    updateEmail(newEmail) {
        this.email = newEmail;
        this.updatedAt = new Date();
    }
}

class UserManager {
    constructor() {
        this.users = new Map();
    }

    addUser(user) {
        if (user instanceof User) {
            this.users.set(user.email, user);
            return true;
        }
        return false;
    }

    getUser(email) {
        return this.users.get(email);
    }

    removeUser(email) {
        return this.users.delete(email);
    }

    getAllUsers() {
        return Array.from(this.users.values());
    }
}

// Utility functions
function validateEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function formatDate(date) {
    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// API service
class ApiService {
    constructor(baseUrl) {
        this.baseUrl = baseUrl;
    }

    async get(endpoint) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`);
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }

    async post(endpoint, data) {
        try {
            const response = await fetch(`${this.baseUrl}${endpoint}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
}

// Event handling
class EventEmitter {
    constructor() {
        this.events = {};
    }

    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }

    emit(event, data) {
        if (this.events[event]) {
            this.events[event].forEach(callback => callback(data));
        }
    }

    off(event, callback) {
        if (this.events[event]) {
            this.events[event] = this.events[event].filter(cb => cb !== callback);
        }
    }
}

// Configuration
const CONFIG = {
    apiUrl: 'https://api.example.com',
    maxUsers: 1000,
    timeout: 5000,
    retries: 3
};

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        User,
        UserManager,
        ApiService,
        EventEmitter,
        validateEmail,
        formatDate,
        CONFIG
    };
} 