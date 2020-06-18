import { admin } from "../imports";

export class Database {
    static firestore = admin.firestore();
    static meetingsCollection = Database.firestore.collection('meetings');

    static async createMeeting(meetingInfo: any) {
        try {
            const ref = await Database.meetingsCollection.add(meetingInfo);
            return ref.id;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    static async retrieveMeetingByRoomName(roomName: any): Promise<any> {
        try {
            const snap = await Database.meetingsCollection.where('roomName', '==', roomName).get();
            if (snap.empty) return null;
            const d = { ...snap.docs[0].data(), id: snap.docs[0].id };
            return d;
        } catch (error) {
            console.error(error);
            return null;
        }
    }
}