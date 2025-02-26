// src/components/FAQ.tsx
import React, { useState } from 'react';
import SEO from './SEO.tsx';

interface FAQItem {
  question: string;
  answer: string;
  category: 'Kursy' | 'Płatności' | 'Certyfikaty' | 'Konto';
}

const faqData: FAQItem[] = [
  // Kursy Category
  {
    category: 'Kursy',
    question: 'Jakie kursy oferuje Progres999?',
    answer: 'Oferujemy profesjonalne kursy z zakresu ratownictwa medycznego i pierwszej pomocy. Nasze kursy są przeznaczone dla ratowników medycznych, studentów medycyny oraz wszystkich zainteresowanych zdobyciem wiedzy z zakresu ratownictwa.'
  },
  {
    category: 'Kursy',
    question: 'Jak długo trwają kursy?',
    answer: 'Czas trwania kursów jest różny i uzależniony od ich szczegółowej tematyki. Większość naszych kursów trwa od 60 do 180 minut. Dokładny czas trwania każdego kursu jest podany przy jego opisie.'
  },
  {
    category: 'Kursy',
    question: 'Czy kursy są akredytowane?',
    answer: 'Tak, nasze kursy są przygotowane przez profesjonalistów z branży ratownictwa medycznego i zapewniają punkty edukacyjne. Po ukończeniu kursu otrzymujesz certyfikat potwierdzający zdobyte umiejętności.'
  },
  
  // Płatności Category
  {
    category: 'Płatności',
    question: 'Jakie metody płatności są dostępne?',
    answer: 'Akceptujemy płatności online za pośrednictwem systemu Przelewy24. Możesz zapłacić kartą kredytową, przelewem bankowym lub wybierając inną dostępną metodę płatności elektronicznej.'
  },
  {
    category: 'Płatności',
    question: 'Czy mogę dostać fakturę za zakup kursu?',
    answer: 'Tak, każdy zakup kursu może być udokumentowany fakturą VAT. Możesz wygenerować fakturę w sekcji "Moje konto" po zalogowaniu się na platformie.'
  },
  {
    category: 'Płatności',
    question: 'Czy są dostępne zniżki?',
    answer: 'Oferujemy program poleceń, w którym możesz zdobyć punkty za polecenie platformy znajomym. Dodatkowo, okresowo pojawiają się specjalne promocje i kody rabatowe.'
  },
  
  // Certyfikaty Category
  {
    category: 'Certyfikaty',
    question: 'Jak zdobyć certyfikat?',
    answer: 'Aby zdobyć certyfikat, musisz ukończyć kurs z wynikiem minimum 70% w teście końcowym. Certyfikat jest generowany automatycznie i dostępny do pobrania w Twoim koncie.'
  },
  {
    category: 'Certyfikaty',
    question: 'Ile punktów edukacyjnych można zdobyć?',
    answer: 'Liczba punktów edukacyjnych zależy od konkretnego kursu. Większość naszych kursów zapewnia od 2 do 5 punktów edukacyjnych, które są istotne w procesie doskonalenia zawodowego ratowników medycznych.'
  },
  {
    category: 'Certyfikaty',
    question: 'Czy certyfikaty są honorowane?',
    answer: 'Nasze certyfikaty są wydawane przez profesjonalną platformę edukacyjną i są uznawane w środowisku medycznym. Zawierają one unikalny numer identyfikacyjny i szczegółowe informacje o ukończonym kursie.'
  },
  
  // Konto Category
  {
    category: 'Konto',
    question: 'Jak założyć konto?',
    answer: 'Możesz założyć konto, klikając przycisk "Zarejestruj się" w prawym górnym rogu strony. Możesz się zarejestrować przy pomocy adresu email lub konta Google.'
  },
  {
    category: 'Konto',
    question: 'Czy mogę zmienić dane mojego konta?',
    answer: 'Tak, w każdej chwili możesz zaktualizować swoje dane osobowe, adresowe oraz dane do faktury w sekcji "Moje konto" po zalogowaniu się na platformie.'
  },
  {
    category: 'Konto',
    question: 'Co zrobić, jeśli zapomniałem hasła?',
    answer: 'Na stronie logowania znajdziesz link "Zapomniałeś hasła?". Po kliknięciu w niego i podaniu adresu email otrzymasz instrukcje resetowania hasła.'
  }
];

const FAQ: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<FAQItem['category'] | null>('Kursy');
  const [activeQuestion, setActiveQuestion] = useState<string | null>(null);

  const categories: FAQItem['category'][] = ['Kursy', 'Płatności', 'Certyfikaty', 'Konto'];

  const filteredFAQs = activeCategory 
    ? faqData.filter(faq => faq.category === activeCategory)
    : faqData;

  const toggleQuestion = (question: string) => {
    setActiveQuestion(activeQuestion === question ? null : question);
  };

  return (
    <>
      <SEO 
        title="Często Zadawane Pytania (FAQ) | Progres999"
        description="Kompleksowe odpowiedzi na najczęściej zadawane pytania dotyczące kursów ratownictwa medycznego, płatności, certyfikatów i konta użytkownika. Dowiedz się wszystkiego o naszej platformie edukacyjnej."
        keywords="FAQ, ratownictwo medyczne, kursy online, płatności, certyfikaty, konto użytkownika"
        ogType="website"
        ogImage="/logo.png"
      />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Często Zadawane Pytania</h1>

        {/* Category Tabs */}
        <div className="flex justify-center mb-8 space-x-4">
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={`px-4 py-2 rounded-lg transition-colors ${
                activeCategory === category 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {filteredFAQs.map((faq, index) => (
            <div 
              key={index} 
              className="border rounded-lg overflow-hidden"
            >
              <button
                onClick={() => toggleQuestion(faq.question)}
                className="w-full text-left p-4 bg-gray-50 hover:bg-gray-100 flex justify-between items-center"
              >
                <span className="font-medium">{faq.question}</span>
                <span className="text-xl">
                  {activeQuestion === faq.question ? '−' : '+'}
                </span>
              </button>
              {activeQuestion === faq.question && (
                <div className="p-4 bg-white">
                  <p>{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default FAQ;