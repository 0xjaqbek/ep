// src/services/payment/p24Service.ts
import axios from 'axios';

const WOOCOMMERCE_API_URL = process.env.REACT_APP_WOOCOMMERCE_API_URL;
const WC_CONSUMER_KEY = process.env.REACT_APP_WC_CONSUMER_KEY;
const WC_CONSUMER_SECRET = process.env.REACT_APP_WC_CONSUMER_SECRET;

export interface P24PaymentData {
  courseId: string;
  courseTitle: string;  // Added this field
  userId: string;
  amount: number;
  email: string;
  customerData: {
    firstName: string;
    lastName: string;
    phone: string;
    address: string;
    postal: string;
    city: string;
  };
  invoiceData?: {
    companyName: string;
    nip: string;
    companyAddress: string;
  };
}

export class P24Service {
  private getAuthHeaders() {
    return {
      Authorization: `Basic ${btoa(`${WC_CONSUMER_KEY}:${WC_CONSUMER_SECRET}`)}`,
      'Content-Type': 'application/json',
    };
  }

  async createOrder(paymentData: P24PaymentData) {
    try {
      const orderData = {
        payment_method: 'przelewy24',
        payment_method_title: 'Przelewy24',
        set_paid: false,
        billing: {
          first_name: paymentData.customerData.firstName,
          last_name: paymentData.customerData.lastName,
          address_1: paymentData.customerData.address,
          city: paymentData.customerData.city,
          postcode: paymentData.customerData.postal,
          email: paymentData.email,
          phone: paymentData.customerData.phone,
        },
        line_items: [
          {
            name: `Kurs: ${paymentData.courseTitle}`,
            price: paymentData.amount,
            quantity: 1
          }
        ],
        meta_data: [
          {
            key: 'courseId',
            value: paymentData.courseId
          },
          {
            key: 'courseTitle',
            value: paymentData.courseTitle
          },
          {
            key: 'userId',
            value: paymentData.userId
          }
        ]
      };

      if (paymentData.invoiceData) {
        orderData.meta_data.push(
          {
            key: 'invoice_company',
            value: paymentData.invoiceData.companyName
          },
          {
            key: 'invoice_nip',
            value: paymentData.invoiceData.nip
          },
          {
            key: 'invoice_address',
            value: paymentData.invoiceData.companyAddress
          }
        );
      }

      const response = await axios.post(
        `${WOOCOMMERCE_API_URL}/orders`,
        orderData,
        { headers: this.getAuthHeaders() }
      );

      return response.data;
    } catch (error) {
      console.error('Error creating WooCommerce order:', error);
      throw new Error('Failed to create order');
    }
  }

  async verifyPayment(orderId: string) {
    try {
      const response = await axios.get(
        `${WOOCOMMERCE_API_URL}/orders/${orderId}`,
        { headers: this.getAuthHeaders() }
      );
      return response.data.status === 'completed';
    } catch (error) {
      console.error('Error verifying payment:', error);
      return false;
    }
  }
}