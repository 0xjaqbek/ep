// src/components/Admin/CertificateManagement.tsx
import React, { useState, useEffect } from 'react';
import { collection, query, getDocs, doc, updateDoc, deleteDoc, addDoc, getDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.ts';

interface Certificate {
  id: string;
  userId: string;
  courseId: string;
  completionDate: Date;
  score: number;
  pdfUrl: string;
  status: 'active' | 'revoked' | 'replaced';
  revokedAt?: Date;
  replacedAt?: Date;
}

interface ExtendedCertificate extends Certificate {
  userName: string;
  courseName: string;
}

export const CertificateManagement: React.FC = () => {
  const [certificates, setCertificates] = useState<ExtendedCertificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCertificates();
  }, []);

  const fetchCertificates = async () => {
    try {
      const certificatesRef = collection(db, 'certificates');
      const querySnapshot = await getDocs(certificatesRef);
      
      const certificatesPromises = querySnapshot.docs.map(async (docSnapshot) => {
        const certData = { id: docSnapshot.id, ...docSnapshot.data() } as Certificate;
        
        // Fetch user and course details
        const userDocRef = doc(db, 'users', certData.userId);
        const courseDocRef = doc(db, 'courses', certData.courseId);
        
        const [userDoc, courseDoc] = await Promise.all([
          getDoc(userDocRef),
          getDoc(courseDocRef)
        ]);

        return {
          ...certData,
          userName: userDoc.exists() ? userDoc.data()?.displayName : 'Unknown User',
          courseName: courseDoc.exists() ? courseDoc.data()?.title : 'Unknown Course'
        } as ExtendedCertificate;
      });

      const certificatesData = await Promise.all(certificatesPromises);
      setCertificates(certificatesData);
    } catch (error) {
      console.error('Error fetching certificates:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (certificateId: string) => {
    if (window.confirm('Czy na pewno chcesz unieważnić ten certyfikat?')) {
      try {
        const certRef = doc(db, 'certificates', certificateId);
        await updateDoc(certRef, {
          status: 'revoked',
          revokedAt: new Date()
        });
        fetchCertificates(); // Refresh the list
      } catch (error) {
        console.error('Error revoking certificate:', error);
      }
    }
  };

  const handleReissue = async (certificate: ExtendedCertificate) => {
    try {
      // Create new certificate
      const newCertData: Omit<Certificate, 'id'> = {
        userId: certificate.userId,
        courseId: certificate.courseId,
        completionDate: new Date(),
        score: certificate.score,
        status: 'active',
        pdfUrl: certificate.pdfUrl // You might want to generate a new PDF here
      };

      await addDoc(collection(db, 'certificates'), newCertData);
      
      // Mark old certificate as replaced
      const oldCertRef = doc(db, 'certificates', certificate.id);
      await updateDoc(oldCertRef, {
        status: 'replaced',
        replacedAt: new Date()
      });

      fetchCertificates(); // Refresh the list
    } catch (error) {
      console.error('Error reissuing certificate:', error);
    }
  };

  const getStatusBadgeClasses = (status: Certificate['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'revoked':
        return 'bg-red-100 text-red-800';
      case 'replaced':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const filteredCertificates = certificates.filter(cert => 
    cert.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    cert.courseName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Zarządzanie Certyfikatami</h2>

      <div className="mb-6">
        <input
          type="text"
          placeholder="Szukaj po nazwie użytkownika lub kursu..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full p-2 border rounded"
        />
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full bg-white border rounded-lg">
          <thead>
            <tr className="bg-gray-50">
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Data wydania
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Użytkownik
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Kurs
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Wynik
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Akcje
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {filteredCertificates.map((cert) => (
              <tr key={cert.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cert.completionDate instanceof Date 
                    ? cert.completionDate.toLocaleDateString()
                    : new Date(cert.completionDate).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cert.userName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cert.courseName}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {cert.score}%
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClasses(cert.status)}`}>
                    {cert.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {cert.status === 'active' && (
                    <button
                      onClick={() => handleRevoke(cert.id)}
                      className="text-red-600 hover:text-red-900 mr-4"
                    >
                      Unieważnij
                    </button>
                  )}
                  {cert.status === 'revoked' && (
                    <button
                      onClick={() => handleReissue(cert)}
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Wystaw ponownie
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};