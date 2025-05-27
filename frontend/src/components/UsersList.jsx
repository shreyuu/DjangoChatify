import React from 'react';

const UsersList = ({ users }) => {
    return (
        <div className="bg-white rounded-lg shadow-sm p-4">
            <h3 className="text-lg font-semibold mb-3 text-gray-800">Active Users</h3>
            <div className="space-y-2">
                {users.map((user, index) => (
                    <div
                        key={index}
                        className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded-md"
                    >
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-700">{user}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default UsersList; 