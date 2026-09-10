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
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: function() {
            return !this.firebaseUid;
        },
        minlength: 6,
    },
    firebaseUid: {
        type: String,
        unique: true,
        sparse: true,
        trim: true,
    },
    avatar: {
        type: String,
        default: '',
        trim: true,
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
    // Security fields
    bannedUntil: {
        type: Date,
    },
    loginAttempts: {
        type: Number,
        default: 0,
    },
    lockUntil: {
        type: Date,
    },
}, {
    timestamps: true,
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    if (!this.password) return false;
    return await bcrypt.compare(enteredPassword, this.password);
};

// Check if user is banned
userSchema.methods.isBanned = function () {
    return this.bannedUntil && this.bannedUntil > Date.now();
};

// Get ban status with details
userSchema.methods.getBanStatus = function () {
    if (!this.bannedUntil) return { banned: false };
    const remaining = this.bannedUntil - Date.now();
    if (remaining <= 0) {
        this.bannedUntil = undefined;
        this.save();
        return { banned: false };
    }
    return { banned: true, remainingMs: remaining, remainingMinutes: Math.ceil(remaining / 60000) };
};

// Prevent admin self-demotion
userSchema.methods.canDemoteSelf = function () {
    // Admins cannot demote themselves (set isAdmin to false)
    // This guard should be used in the controller
    return !this.isAdmin;
};

userSchema.methods.ban = function (durationMinutes = 60) {
    this.bannedUntil = Date.now() + durationMinutes * 60000;
    return this.save();
};

userSchema.methods.unban = function () {
    this.bannedUntil = undefined;
    return this.save();
};

userSchema.statics.isEmailBanned = async function (email) {
    const user = await this.findOne({ email });
    return user && user.isBanned();
};

const User = mongoose.model('User', userSchema);

export default User;