// File: src/components/Payment/PaymentForm.tsx
import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { User, Course } from '../../types';
import { P24Service } from '../../services/payment/p24Service';

const PaymentSchema = Yup.object().shape({
    firstName: Yup.string().required('Wymagane'),
    lastName: Yup.string().required('Wymagane'),
    phone: Yup.string().required('Wymagane'),
    email: Yup.string().email('Nieprawidłowy email').required('Wymagane'),
    address: Yup.string().required('Wymagane'),
    postal: Yup.string().required('Wymagane'),
    city: Yup.string().required('Wymagane'),
    wantInvoice: Yup.boolean(),
    companyName: Yup.string().when('wantInvoice', {
      is: true,
      then: () => Yup.string().required('Wymagane dla faktury'),
      otherwise: () => Yup.string()
    }),
    nip: Yup.string().when('wantInvoice', {
      is: true,
      then: () => Yup.string().required('Wymagane dla faktury'),
      otherwise: () => Yup.string()
    }),
    companyAddress: Yup.string().when('wantInvoice', {
      is: true,
      then: () => Yup.string().required('Wymagane dla faktury'),
      otherwise: () => Yup.string()
    })
  });

interface PaymentFormProps {
  user: User;
  course: Course;
  onSuccess: () => void;
  onError: (error: string) => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({
  user,
  course,
  onSuccess,
  onError
}) => {
  const handleSubmit = async (values: any) => {
    try {
      const p24Service = new P24Service();
      
      const paymentData = {
        courseId: course.id,
        courseTitle: course.title,  // Add course title here
        userId: user.uid,           // Changed from user.id to user.uid to match User interface
        amount: course.price,
        email: values.email,
        customerData: {
          firstName: values.firstName,
          lastName: values.lastName,
          phone: values.phone,
          address: values.address,
          postal: values.postal,
          city: values.city
        },
        ...(values.wantInvoice && {
          invoiceData: {
            companyName: values.companyName,
            nip: values.nip,
            companyAddress: values.companyAddress
          }
        })
      };

      const order = await p24Service.createOrder(paymentData);
      
      // Przekieruj do bramki płatności
      window.location.href = order.payment_url;
    } catch (error) {
      console.error('Payment error:', error);
      onError('Wystąpił błąd podczas inicjowania płatności');
    }
  };

  return (
    <Formik
      initialValues={{
        firstName: user.displayName.split(' ')[0] || '',
        lastName: user.displayName.split(' ')[1] || '',
        phone: user.phoneNumber || '',
        email: user.email,
        address: user.address.street || '',
        postal: user.address.postalCode || '',
        city: user.address.city || '',
        wantInvoice: false,
        companyName: user.invoiceData?.companyName || '',
        nip: user.invoiceData?.nip || '',
        companyAddress: user.invoiceData?.companyAddress || ''
      }}
      validationSchema={PaymentSchema}
      onSubmit={handleSubmit}
    >
      {({ errors, touched, values }) => (
        <Form className="space-y-4 max-w-md mx-auto">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Imię</label>
              <Field
                name="firstName"
                className="w-full p-2 border rounded"
              />
              {errors.firstName && touched.firstName && (
                <div className="text-red-500">{errors.firstName}</div>
              )}
            </div>

            <div>
              <label className="block mb-1">Nazwisko</label>
              <Field
                name="lastName"
                className="w-full p-2 border rounded"
              />
              {errors.lastName && touched.lastName && (
                <div className="text-red-500">{errors.lastName}</div>
              )}
            </div>
          </div>

          <div>
            <label className="block mb-1">Telefon</label>
            <Field
              name="phone"
              className="w-full p-2 border rounded"
            />
            {errors.phone && touched.phone && (
              <div className="text-red-500">{errors.phone}</div>
            )}
          </div>

          <div>
            <label className="block mb-1">Email</label>
            <Field
              name="email"
              type="email"
              className="w-full p-2 border rounded"
            />
            {errors.email && touched.email && (
              <div className="text-red-500">{errors.email}</div>
            )}
          </div>

          <div>
            <label className="block mb-1">Adres</label>
            <Field
              name="address"
              className="w-full p-2 border rounded"
            />
            {errors.address && touched.address && (
              <div className="text-red-500">{errors.address}</div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block mb-1">Kod pocztowy</label>
              <Field
                name="postal"
                className="w-full p-2 border rounded"
              />
              {errors.postal && touched.postal && (
                <div className="text-red-500">{errors.postal}</div>
              )}
            </div>

            <div>
              <label className="block mb-1">Miasto</label>
              <Field
                name="city"
                className="w-full p-2 border rounded"
              />
              {errors.city && touched.city && (
                <div className="text-red-500">{errors.city}</div>
              )}
            </div>
          </div>

          <div>
            <label className="flex items-center space-x-2">
              <Field
                type="checkbox"
                name="wantInvoice"
                className="form-checkbox"
              />
              <span>Chcę otrzymać fakturę VAT</span>
            </label>
          </div>

          {values.wantInvoice && (
            <div className="space-y-4 border-t pt-4 mt-4">
              <div>
                <label className="block mb-1">Nazwa firmy</label>
                <Field
                  name="companyName"
                  className="w-full p-2 border rounded"
                />
                {errors.companyName && touched.companyName && (
                  <div className="text-red-500">{errors.companyName}</div>
                )}
              </div>

              <div>
                <label className="block mb-1">NIP</label>
                <Field
                  name="nip"
                  className="w-full p-2 border rounded"
                />
                {errors.nip && touched.nip && (
                  <div className="text-red-500">{errors.nip}</div>
                )}
              </div>

              <div>
                <label className="block mb-1">Adres firmy</label>
                <Field
                  name="companyAddress"
                  className="w-full p-2 border rounded"
                />
                {errors.companyAddress && touched.companyAddress && (
                  <div className="text-red-500">{errors.companyAddress}</div>
                )}
              </div>
            </div>
          )}

          <div className="border-t pt-4 mt-4">
            <h3 className="font-bold mb-2">Podsumowanie zamówienia</h3>
            <p>Kurs: {course.title}</p>
            <p className="font-bold">Cena: {course.price} PLN</p>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600"
          >
            Zapłać przez Przelewy24
          </button>
        </Form>
      )}
    </Formik>
  );
};