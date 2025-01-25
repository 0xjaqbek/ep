import React, { useState } from 'react';

const Contact = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Kontakt</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div>
          <h2 className="text-xl font-semibold mb-4">Dane kontaktowe</h2>
          <div className="space-y-2">
            <p><strong>Adres:</strong> ul. Przykładowa 1/2, 00-001 Warszawa</p>
            <p><strong>Email:</strong> kontakt@progress999.pl</p>
            <p><strong>Telefon:</strong> +48 000 000 000</p>
            <p><strong>Godziny pracy:</strong> Pon-Pt 9:00-17:00</p>
          </div>
        </div>

        <div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Imię i nazwisko</label>
              <input
                type="text"
                className="w-full p-2 border rounded"
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                required
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
              />
            </div>

            <button
              type="submit"
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              Wyślij wiadomość
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Contact;