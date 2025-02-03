// src/components/User/UserAccount.tsx
import React, { useState } from 'react';
import * as Yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';
import { useAuth } from '../Auth/AuthProvider.tsx';
import { LoadingSpinner } from '../Loading/LoadingSpinner.tsx';
import { InvoiceRequest } from './InvoiceRequest.tsx';
import  UserInvoice  from './UserInvoice.tsx';

export const UserAccount: React.FC = () => {
  const { currentUser, refreshUserData } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Yup validation schema
  const UserDataSchema = Yup.object().shape({
    displayName: Yup.string()
      .required('Imię i nazwisko są wymagane')
      .min(3, 'Imię i nazwisko muszą mieć minimum 3 znaki'),
    phoneNumber: Yup.string()
      .required('Numer telefonu jest wymagany')
      .matches(/^[0-9]{9}$/, 'Numer telefonu musi składać się z 9 cyfr'),
    address: Yup.object().shape({
      street: Yup.string()
        .required('Ulica jest wymagana'),
      city: Yup.string()
        .required('Miasto jest wymagane'),
      postalCode: Yup.string()
        .required('Kod pocztowy jest wymagany')
        .matches(/^\d{2}-\d{3}$/, 'Kod pocztowy musi być w formacie XX-XXX'),
    }),
    invoiceData: Yup.object().shape({
      companyName: Yup.string().when('nip', {
        is: (val: string) => val && val.length > 0,
        then: () => Yup.string().required('Nazwa firmy jest wymagana'),
        otherwise: () => Yup.string()
      }),
      nip: Yup.string()
        .matches(/^\d{10}$/, 'NIP musi składać się z 10 cyfr')
        .nullable(),
      companyAddress: Yup.string().when('nip', {
        is: (val: string) => val && val.length > 0,
        then: () => Yup.string().required('Adres firmy jest wymagany'),
        otherwise: () => Yup.string()
      })
    })
  });

  if (!currentUser) return null;

  const handleSubmit = async (values: any, { setSubmitting }: any) => {
    setLoading(true);
    setError('');
    setSuccess('');
  
    try {
      // Add a type guard to ensure currentUser and uid exist
      if (!currentUser?.uid) {
        throw new Error('Użytkownik nie jest zalogowany');
      }
  
      const userRef = doc(db, 'users', currentUser.uid);
      const updateData = {
        displayName: values.displayName,
        phoneNumber: values.phoneNumber,
        address: values.address,
        invoiceData: values.invoiceData.nip ? values.invoiceData : null
      };
  
      await updateDoc(userRef, updateData);
      await refreshUserData();
      setSuccess('Dane zostały zaktualizowane');
    } catch (error) {
      console.error('Error updating user data:', error);
      setError(
        error instanceof Error 
          ? error.message 
          : 'Wystąpił błąd podczas aktualizacji danych'
      );
    } finally {
      setLoading(false);
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Moje konto</h1>

      <div className="bg-white shadow rounded-lg p-6">
        <Formik
          initialValues={{
            displayName: currentUser.displayName || '',
            phoneNumber: currentUser.phoneNumber || '',
            email: currentUser.email,
            address: {
              street: currentUser.address?.street || '',
              city: currentUser.address?.city || '',
              postalCode: currentUser.address?.postalCode || '',
            },
            invoiceData: {
              companyName: currentUser.invoiceData?.companyName || '',
              nip: currentUser.invoiceData?.nip || '',
              companyAddress: currentUser.invoiceData?.companyAddress || '',
            }
          }}
          validationSchema={UserDataSchema}
          onSubmit={handleSubmit}
        >
          {({ errors, touched, isSubmitting }) => (
            <Form className="space-y-6">
              {/* Personal Information Section */}
              <div>
                <h2 className="text-xl font-semibold mb-4">Dane osobowe</h2>
                
                {error && (
                  <div className="bg-red-50 text-red-700 p-4 rounded mb-4">
                    {error}
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 text-green-700 p-4 rounded mb-4">
                    {success}
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="displayName" className="block mb-2">Imię i nazwisko</label>
                    <Field 
                      name="displayName" 
                      className={`w-full p-2 border rounded ${
                        touched.displayName && errors.displayName ? 'border-red-500' : ''
                      }`} 
                    />
                    <ErrorMessage 
                      name="displayName" 
                      component="div" 
                      className="text-red-500 text-sm mt-1" 
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block mb-2">Email</label>
                    <Field 
                      name="email" 
                      type="email"
                      disabled 
                      className="w-full p-2 border rounded bg-gray-100 cursor-not-allowed" 
                    />
                  </div>

                  <div>
                    <label htmlFor="phoneNumber" className="block mb-2">Numer telefonu</label>
                    <Field 
                      name="phoneNumber" 
                      className={`w-full p-2 border rounded ${
                        touched.phoneNumber && errors.phoneNumber ? 'border-red-500' : ''
                      }`} 
                    />
                    <ErrorMessage 
                      name="phoneNumber" 
                      component="div" 
                      className="text-red-500 text-sm mt-1" 
                    />
                  </div>
                </div>
              </div>

              {/* Address Section */}
              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Adres</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="address.street" className="block mb-2">Ulica i numer</label>
                    <Field 
                      name="address.street" 
                      className={`w-full p-2 border rounded ${
                        touched.address?.street && errors.address?.street ? 'border-red-500' : ''
                      }`} 
                    />
                    <ErrorMessage 
                      name="address.street" 
                      component="div" 
                      className="text-red-500 text-sm mt-1" 
                    />
                  </div>

                  <div>
                    <label htmlFor="address.postalCode" className="block mb-2">Kod pocztowy</label>
                    <Field 
                      name="address.postalCode" 
                      placeholder="np. 00-000"
                      className={`w-full p-2 border rounded ${
                        touched.address?.postalCode && errors.address?.postalCode ? 'border-red-500' : ''
                      }`} 
                    />
                    <ErrorMessage 
                      name="address.postalCode" 
                      component="div" 
                      className="text-red-500 text-sm mt-1" 
                    />
                  </div>

                  <div>
                    <label htmlFor="address.city" className="block mb-2">Miasto</label>
                    <Field 
                      name="address.city" 
                      className={`w-full p-2 border rounded ${
                        touched.address?.city && errors.address?.city ? 'border-red-500' : ''
                      }`} 
                    />
                    <ErrorMessage 
                      name="address.city" 
                      component="div" 
                      className="text-red-500 text-sm mt-1" 
                    />
                  </div>
                </div>
              </div>

              {/* Invoice Data Section */}
              <div className="border-t pt-6 mt-6">
                <h2 className="text-xl font-semibold mb-4">Dane do faktury (opcjonalnie)</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="invoiceData.companyName" className="block mb-2">Nazwa firmy</label>
                    <Field 
                      name="invoiceData.companyName" 
                      className={`w-full p-2 border rounded ${
                        touched.invoiceData?.companyName && errors.invoiceData?.companyName ? 'border-red-500' : ''
                      }`} 
                    />
                    <ErrorMessage 
                      name="invoiceData.companyName" 
                      component="div" 
                      className="text-red-500 text-sm mt-1" 
                    />
                  </div>

                  <div>
                    <label htmlFor="invoiceData.nip" className="block mb-2">NIP</label>
                    <Field 
                      name="invoiceData.nip" 
                      className={`w-full p-2 border rounded ${
                        touched.invoiceData?.nip && errors.invoiceData?.nip ? 'border-red-500' : ''
                      }`} 
                    />
                    <ErrorMessage 
                      name="invoiceData.nip" 
                      component="div" 
                      className="text-red-500 text-sm mt-1" 
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label htmlFor="invoiceData.companyAddress" className="block mb-2">Adres firmy</label>
                    <Field 
                      name="invoiceData.companyAddress" 
                      className={`w-full p-2 border rounded ${
                        touched.invoiceData?.companyAddress && errors.invoiceData?.companyAddress ? 'border-red-500' : ''
                      }`} 
                    />
                    <ErrorMessage 
                      name="invoiceData.companyAddress" 
                      component="div" 
                      className="text-red-500 text-sm mt-1" 
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8">
                <InvoiceRequest />
                <UserInvoice />
              </div>

              <div className="pt-6">
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors duration-200 flex justify-center items-center"
                >
                  {isSubmitting ? <LoadingSpinner size="small" /> : 'Zapisz zmiany'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default UserAccount;