import React from 'react';
import { Link } from 'react-router-dom';
import SEO from './SEO.tsx';

const Regulations: React.FC = () => {
  return (
    <>
      <SEO 
        title="Regulamin"
        description="Regulamin serwisu Progres999 - platformy edukacyjnej dla ratowników medycznych."
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">Regulamin serwisu Progres999</h1>
        <div className="text-sm text-gray-500 mb-8">
          Ostatnia aktualizacja: 02.02.2024
        </div>
        
        {/* Spis treści */}
        <nav className="mb-8 p-4 bg-gray-50 rounded-lg">
          <h2 className="text-lg font-semibold mb-4">Spis treści:</h2>
          <ul className="space-y-2">
            <li><a href="#general" className="text-blue-600 hover:underline">§1. Postanowienia ogólne</a></li>
            <li><a href="#registration" className="text-blue-600 hover:underline">§2. Rejestracja i konto użytkownika</a></li>
            <li><a href="#courses" className="text-blue-600 hover:underline">§3. Kursy i certyfikaty</a></li>
            <li><a href="#payments" className="text-blue-600 hover:underline">§4. Płatności i zwroty</a></li>
            <li><a href="#rights" className="text-blue-600 hover:underline">§5. Prawa i obowiązki</a></li>
            <li><a href="#liability" className="text-blue-600 hover:underline">§6. Odpowiedzialność</a></li>
            <li><a href="#intellectual" className="text-blue-600 hover:underline">§7. Własność intelektualna</a></li>
            <li><a href="#tests" className="text-blue-600 hover:underline">§8. Zasady zaliczania testów</a></li>
            <li><a href="#complaints" className="text-blue-600 hover:underline">§9. Reklamacje</a></li>
            <li><a href="#referral" className="text-blue-600 hover:underline">§10. Program poleceń</a></li>
            <li><a href="#technical" className="text-blue-600 hover:underline">§11. Wymagania techniczne</a></li>
            <li><a href="#disputes" className="text-blue-600 hover:underline">§12. Rozwiązywanie sporów</a></li>
            <li><a href="#final" className="text-blue-600 hover:underline">§13. Postanowienia końcowe</a></li>
          </ul>
        </nav>

        <div className="prose max-w-none">
          <section id="general" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§1. Postanowienia ogólne</h2>
            <p>1.1. Niniejszy regulamin określa zasady korzystania z platformy edukacyjnej Progres999, dostępnej pod adresem progres999.pl</p>
            <p>1.2. Właścicielem platformy jest Progres999 Sp. z o.o. z siedzibą w Warszawie.</p>
            <p>1.3. Definicje:</p>
            <ul>
              <li>Platforma - serwis internetowy dostępny pod adresem progres999.pl</li>
              <li>Użytkownik - osoba fizyczna lub prawna korzystająca z Platformy</li>
              <li>Kurs - materiał edukacyjny dostępny na Platformie</li>
              <li>Certyfikat - dokument potwierdzający ukończenie kursu</li>
            </ul>
          </section>

          <section id="registration" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§2. Rejestracja i konto użytkownika</h2>
            <p>2.1. Korzystanie z pełnej funkcjonalności Platformy wymaga założenia konta.</p>
            <p>2.2. Podczas rejestracji Użytkownik zobowiązany jest do:</p>
            <ul>
              <li>Podania prawdziwych danych osobowych</li>
              <li>Utworzenia bezpiecznego hasła</li>
              <li>Zapoznania się z Regulaminem i Polityką Prywatności</li>
            </ul>
            <p>2.3. Użytkownik zobowiązuje się do:</p>
            <ul>
              <li>Nieudostępniania danych logowania osobom trzecim</li>
              <li>Aktualizacji danych w przypadku ich zmiany</li>
              <li>Korzystania z konta zgodnie z prawem i dobrymi obyczajami</li>
            </ul>
          </section>

          <section id="courses" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§3. Kursy i certyfikaty</h2>
            <p>3.1. Platforma oferuje kursy z zakresu ratownictwa medycznego i pierwszej pomocy.</p>
            <p>3.2. Zakup kursu:</p>
            <ul>
              <li>Wymaga posiadania konta na Platformie</li>
              <li>Jest realizowany poprzez system płatności elektronicznych</li>
              <li>Jest potwierdzany fakturą VAT (na życzenie)</li>
            </ul>
            <p>3.3. Certyfikaty:</p>
            <ul>
              <li>Są wystawiane po pozytywnym ukończeniu kursu</li>
              <li>Zawierają unikalny numer identyfikacyjny</li>
              <li>Są dostępne w formie elektronicznej do pobrania</li>
              <li>Potwierdzają zdobycie określonej liczby punktów edukacyjnych</li>
            </ul>
          </section>

          <section id="payments" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§4. Płatności i zwroty</h2>
            <p>4.1. Płatności:</p>
            <ul>
              <li>Są realizowane poprzez system Przelewy24</li>
              <li>Ceny kursów są podane w złotych polskich (PLN)</li>
              <li>Zawierają podatek VAT</li>
            </ul>
            <p>4.2. Zwroty:</p>
            <ul>
              <li>Przysługują w ciągu 14 dni od zakupu</li>
              <li>Dotyczą tylko nierozpoczętych kursów</li>
              <li>Są realizowane w formie przelewu na konto</li>
            </ul>
          </section>

          <section id="rights" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§5. Prawa i obowiązki</h2>
            <p>5.1. Prawa Użytkownika:</p>
            <ul>
              <li>Dostęp do zakupionych kursów</li>
              <li>Możliwość uzyskania certyfikatu</li>
              <li>Wsparcie techniczne</li>
              <li>Ochrona danych osobowych</li>
            </ul>
            <p>5.2. Obowiązki Użytkownika:</p>
            <ul>
              <li>Przestrzeganie regulaminu</li>
              <li>Podawanie prawdziwych danych</li>
              <li>Samodzielne rozwiązywanie testów</li>
              <li>Nieudostępnianie materiałów osobom trzecim</li>
            </ul>
          </section>

          <section id="liability" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§6. Odpowiedzialność</h2>
            <p>6.1. Platforma odpowiada za:</p>
            <ul>
              <li>Dostępność zakupionych kursów</li>
              <li>Poprawność wystawianych certyfikatów</li>
              <li>Bezpieczeństwo danych użytkowników</li>
            </ul>
            <p>6.2. Platforma nie odpowiada za:</p>
            <ul>
              <li>Przerwy techniczne wynikające z konserwacji</li>
              <li>Problemy wynikające z działania dostawców internetu</li>
              <li>Szkody powstałe w wyniku nieprawidłowego korzystania z Platformy</li>
            </ul>
          </section>

          <section id="intellectual" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§7. Własność intelektualna</h2>
            <p>7.1. Wszelkie materiały dostępne na Platformie są chronione prawem autorskim.</p>
            <p>7.2. Użytkownik nie ma prawa kopiować, rozpowszechniać, sprzedawać lub w inny sposób wykorzystywać materiałów bez zgody.</p>
            <p>7.3. Użytkownik może korzystać z materiałów wyłącznie na własny użytek.</p>
          </section>

          <section id="tests" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§8. Zasady zaliczania testów</h2>
            <p>8.1. Do uzyskania certyfikatu wymagane jest zaliczenie testu z wynikiem minimum 70%.</p>
            <p>8.2. Test można powtarzać bez ograniczeń.</p>
            <p>8.3. Pytania w teście są losowane z bazy pytań.</p>
            <p>8.4. Test należy rozwiązać samodzielnie.</p>
          </section>

          <section id="complaints" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§9. Reklamacje</h2>
            <p>9.1. Zgłaszanie reklamacji:</p>
            <ul>
              <li>Poprzez formularz kontaktowy</li>
              <li>Mailowo na adres: kontakt@progres999.pl</li>
              <li>W formie pisemnej na adres siedziby</li>
            </ul>
            <p>9.2. Reklamacja powinna zawierać:</p>
            <ul>
              <li>Dane użytkownika</li>
              <li>Opis problemu</li>
              <li>Oczekiwany sposób rozwiązania</li>
            </ul>
            <p>9.3. Reklamacje rozpatrywane są w ciągu 14 dni roboczych.</p>
          </section>

          <section id="referral" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§10. Program poleceń</h2>
            <p>10.1. Za polecenie nowego użytkownika przyznawany jest 1 punkt.</p>
            <p>10.2. Za każde 10 punktów przysługuje darmowy kurs.</p>
            <p>10.3. Punkty są przyznawane po dokonaniu zakupu przez poleconego użytkownika.</p>
            <p>10.4. Platforma zastrzega sobie prawo do zmiany zasad programu poleceń.</p>
          </section>

          <section id="technical" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§11. Wymagania techniczne</h2>
            <p>11.1. Dostęp do platformy wymaga:</p>
            <ul>
              <li>Aktualnej przeglądarki internetowej</li>
              <li>Stabilnego połączenia z internetem</li>
              <li>Włączonej obsługi JavaScript</li>
              <li>Minimalnej rozdzielczości ekranu 1024x768</li>
            </ul>
          </section>

          <section id="disputes" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§12. Rozwiązywanie sporów</h2>
            <p>12.1. Spory będą rozwiązywane polubownie.</p>
            <p>12.2. W przypadku braku porozumienia, spory rozstrzyga sąd właściwy dla siedziby Platformy.</p>
            <p>12.3. W sprawach nieuregulowanych niniejszym regulaminem zastosowanie mają przepisy prawa polskiego.</p>
          </section>

          <section id="final" className="mb-8">
            <h2 className="text-2xl font-bold mb-4">§13. Postanowienia końcowe</h2>
            <p>13.1. Regulamin obowiązuje od dnia 02.02.2024.</p>
            <p>13.2. Platforma zastrzega sobie prawo do:</p>
            <ul>
              <li>Zmiany regulaminu</li>
              <li>Zmiany oferty kursów</li>
              <li>Zmiany cen kursów</li>
            </ul>
            <p>13.3. O wszelkich zmianach użytkownicy będą informowani z wyprzedzeniem.</p>
            <p>13.4. Użytkownik ma prawo do wypowiedzenia umowy w przypadku braku akceptacji zmian w regulaminie.</p>
          </section>
        </div>

        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            W przypadku pytań dotyczących regulaminu prosimy o kontakt: {' '}
            <Link to="/contact" className="text-blue-600 hover:underline">
              Formularz kontaktowy
            </Link>
          </p>
        </div>
      </div>
    </>
  );
};

export default Regulations;