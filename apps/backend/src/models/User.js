import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: function() {
            return !this.firebaseUid;
        },
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
    },
    avatar: {
        type: String,
        default: '',
    },
    authProvider: {
        type: String,
        enum: ['local', 'google'],
        default: 'local',
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    isAdmin: {
        type: Boolean,
        default: false,
    },
    // Role-based access (isAdmin kept for backwards compat with frontend + JWTs).
    // New code should prefer `role`; `isAdmin === true` implies admin privileges.
    role: {
        type: String,
        enum: ['customer', 'manager', 'admin'],
        default: 'customer',
    },
    // Banned users are blocked at auth middleware (protect.js). Admins can never be banned.
    isBanned: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};



const User = mongoose.model('User', userSchema);

export default User;