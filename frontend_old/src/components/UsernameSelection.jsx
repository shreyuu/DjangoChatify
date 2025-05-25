import React, { useState } from 'react';

const UsernameSelection = ({ onUsernameSubmit }) => {
    const [username, setUsername] = useState('');
    const [error, setError] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (username.trim().length < 3) {
            setError('Username must be at least 3 characters long');
            return;
        }
        onUsernameSubmit(username.trim());
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
                <h2 className="text-2xl font-bold text-center mb-6 text-gray-800">
                    Choose Your Username
                </h2>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => {
                                setUsername(e.target.value);
                                setError('');
                            }}
                            placeholder="Enter your username"
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            minLength={3}
                            required
                        />
                        {error && (
                            <p className="text-red-500 text-sm mt-1">{error}</p>
                        )}
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-500 text-white py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors duration-200"
                    >
                        Join Chat
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UsernameSelection; 