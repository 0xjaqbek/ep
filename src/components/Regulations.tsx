import React from 'react';

const Regulations = () => {
  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Regulamin</h1>
      
      <div className="prose lg:prose-lg">
        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">§1. Postanowienia ogólne</h2>
          <p>
            1.1. Niniejszy regulamin określa zasady korzystania z platformy edukacyjnej Progress999.
          </p>
          <p>
            1.2. Właścicielem platformy jest Progress999 Sp. z o.o. z siedzibą w Warszawie.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">§2. Definicje</h2>
          <p>
            2.1. Platforma - serwis internetowy dostępny pod adresem progress999.pl
          </p>
          <p>
            2.2. Użytkownik - osoba korzystająca z Platformy
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">§3. Zasady korzystania z platformy</h2>
          <p>
            3.1. Dostęp do kursów możliwy jest po utworzeniu konta i zalogowaniu się.
          </p>
          <p>
            3.2. Zakupione kursy dostępne są w panelu użytkownika.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">§4. Płatności i zwroty</h2>
          <p>
            4.1. Płatności za kursy realizowane są poprzez system Przelewy24.
          </p>
          <p>
            4.2. Zwrot możliwy jest w ciągu 14 dni od zakupu, jeśli kurs nie został rozpoczęty.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">§5. Certyfikaty</h2>
          <p>
            5.1. Certyfikaty wystawiane są po ukończeniu kursu i zdaniu testu.
          </p>
          <p>
            5.2. Certyfikaty dostępne są w formie elektronicznej do pobrania.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-bold mb-4">§6. Postanowienia końcowe</h2>
          <p>
            6.1. Regulamin obowiązuje od dnia 01.01.2024.
          </p>
          <p>
            6.2. Platforma zastrzega sobie prawo do zmiany regulaminu.
          </p>
        </section>
      </div>
    </div>
  );
};

export default Regulations;