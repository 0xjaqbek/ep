import React, { useState } from 'react';
import { doc, addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase/config.ts';
import { useAuth } from './Auth/AuthProvider.tsx';
import SEO from './SEO.tsx';

const Contact = () => {
  const { currentUser } = useAuth();
  const [formData, setFormData] = useState({
    name: currentUser?.displayName || '',
    email: currentUser?.email || '',
    subject: '',
    message: ''
  });
  const [status, setStatus] = useState<{type: 'success' | 'error' | null, message: string}>({
    type: null,
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setStatus({ type: null, message: '' });

    try {
      const contactData = {
        name: formData.name,
        email: formData.email,
        subject: formData.subject,
        message: formData.message,
        userId: currentUser?.uid || null,
        createdAt: serverTimestamp(),
        status: 'new'
      };

      await addDoc(collection(db, 'contact_messages'), contactData);

      setStatus({
        type: 'success',
        message: 'Wiadomość została wysłana. Odpowiemy najszybciej jak to możliwe.'
      });

      // Reset form
      setFormData(prev => ({
        ...prev,
        subject: '',
        message: ''
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      setStatus({
        type: 'error',
        message: 'Wystąpił błąd podczas wysyłania wiadomości. Spróbuj ponownie później.'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <SEO 
        title="Kontakt | Progres999"
        description="Skontaktuj się z nami. Jesteśmy tu, aby pomóc w Twoim rozwoju zawodowym. Masz pytania? Napisz do nas!"
        keywords="kontakt, ratownictwo medyczne, pomoc, wsparcie, formularz kontaktowy"
        ogType="website"
        ogImage="/logo.png"
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Kontakt</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          <div>
            <h2 className="text-xl font-semibold mb-4">Dane kontaktowe</h2>
            <div className="space-y-2">
              <p><strong>Adres:</strong> ul. Przykładowa 1/2, 00-001 Warszawa</p>
              <p><strong>Email:</strong> jaqbek.eth@gmail.com</p>
              <p><strong>Telefon:</strong> +48 000 000 000</p>
              <p><strong>Godziny pracy:</strong> Pon-Pt 9:00-17:00</p>
            </div>
          </div>

          <div>
            <form onSubmit={handleSubmit} className="space-y-4">
              {status.type && (
                <div className={`p-4 rounded ${
                  status.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
                }`}>
                  {status.message}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium mb-1">Imię i nazwisko</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Email</label>
                <input
                  type="email"
                  className="w-full p-2 border rounded"
                  value={formData.email}
                  onChange={e => setFormData({...formData, email: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Temat</label>
                <input
                  type="text"
                  className="w-full p-2 border rounded"
                  value={formData.subject}
                  onChange={e => setFormData({...formData, subject: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Wiadomość</label>
                <textarea
                  className="w-full p-2 border rounded"
                  rows={4}
                  value={formData.message}
                  onChange={e => setFormData({...formData, message: e.target.value})}
                  required
                  disabled={isSubmitting}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed"
              >
                {isSubmitting ? 'Wysyłanie...' : 'Wyślij wiadomość'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default Contact;