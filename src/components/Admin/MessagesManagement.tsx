import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, orderBy, doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';

interface Message {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'read';
  createdAt: any;
  userId?: string;
}

export const MessagesManagement: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

  useEffect(() => {
    fetchMessages();
  }, []);

  const fetchMessages = async () => {
    try {
      const messagesRef = collection(db, 'contact_messages');
      const q = query(messagesRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const messagesData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Message[];

      setMessages(messagesData);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (messageId: string) => {
    try {
      const messageRef = doc(db, 'contact_messages', messageId);
      await updateDoc(messageRef, {
        status: 'read'
      });
      
      setMessages(prev => prev.map(msg => 
        msg.id === messageId ? { ...msg, status: 'read' } : msg
      ));
    } catch (error) {
      console.error('Error marking message as read:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Wiadomości</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Messages List */}
        <div className="bg-white rounded-lg shadow p-4">
          <h3 className="font-semibold mb-4">Lista wiadomości</h3>
          <div className="space-y-2">
            {messages.map(message => (
              <div
                key={message.id}
                onClick={() => setSelectedMessage(message)}
                className={`p-3 rounded cursor-pointer transition-colors ${
                  selectedMessage?.id === message.id 
                    ? 'bg-blue-50 border-2 border-blue-500'
                    : message.status === 'new'
                    ? 'bg-yellow-50 hover:bg-yellow-100'
                    : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium">{message.subject || 'Bez tematu'}</p>
                    <p className="text-sm text-gray-500">{message.name}</p>
                  </div>
                  {message.status === 'new' && (
                    <span className="bg-yellow-500 text-white text-xs px-2 py-1 rounded-full">
                      Nowa
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Message Details */}
        <div className="md:col-span-2">
          {selectedMessage ? (
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-xl font-semibold">{selectedMessage.subject || 'Bez tematu'}</h3>
                  <p className="text-gray-500">Od: {selectedMessage.name} ({selectedMessage.email})</p>
                  <p className="text-gray-500 text-sm">
                    Data: {selectedMessage.createdAt.toDate().toLocaleString()}
                  </p>
                </div>
                {selectedMessage.status === 'new' && (
                  <button
                    onClick={() => handleMarkAsRead(selectedMessage.id)}
                    className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                  >
                    Oznacz jako przeczytane
                  </button>
                )}
              </div>
              <div className="prose max-w-none">
                <p className="whitespace-pre-wrap">{selectedMessage.message}</p>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Wybierz wiadomość, aby zobaczyć szczegóły
            </div>
          )}
        </div>
      </div>
    </div>
  );
};