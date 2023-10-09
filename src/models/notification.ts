import mongoose, {Document, Model} from 'mongoose';

const notificationSchema = new mongoose.Schema({
    userId:{
        type: mongoose.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    postId:{
        type: mongoose.Types.ObjectId,
        ref: 'Post',
    },
    type:{
        type: String,
        enum:['LIKE', 'COMMENT', 'NEW_POST'],
        required: true,
    },
    message:{
        type: String,
        required: true,
    },
    isRead:{
        type: Boolean,
        default: false,
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

export interface INotification extends Document{
    UserId: string;
    postId?: string;
    type: 'LIKE' | 'NEW_POST' | 'COMMENT';
    isRead: boolean;
    createdAt: Date;
}

const Notification: Model<INotification> = mongoose.model<INotification>('Notification', notificationSchema);

export default Notification

