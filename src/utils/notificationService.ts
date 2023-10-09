// utils/notificationHelper.ts
import Notification from "../models/notification"

export const createNotification = async (userId: string, postId: string, type: string, message: string) => {
    const notification = new Notification({ userId, postId, type, message });
    await notification.save();
}

