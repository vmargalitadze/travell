"use client";

import React, { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle, Calendar, Users, Package, Mail, Phone, CreditCard } from "lucide-react";
import Image from "next/image";

interface BookingData {
  id: number;
  packageId: number;
  name: string;
  email: string;
  phone?: string;
  idNumber: string;
  adults: number;
  date: string;
  startDate: string;
  endDate: string;
  totalPrice: number;
  createdAt: string;
  package: {
    id: number;
    title: string;
    description: string;
    price: number;
    salePrice?: number;
    duration: string;
    maxPeople: number;
    byBus: boolean;
    category: string;
    location: {
      id: number;
      name: string;
      country: string;
      city: string;
    };
    gallery: Array<{
      id: number;
      url: string;
    }>;
  };
}

export default function ConfirmationPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const t = useTranslations("confirmation");
  const [bookingData, setBookingData] = useState<BookingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
    console.log('ad');
    
  // Get locale from URL
  const locale = typeof window !== 'undefined' ? window.location.pathname.split('/')[1] : 'en';
  
  // Georgian month names
  const georgianMonths = {
    'Jan': 'იან',
    'Feb': 'თებ',
    'Mar': 'მარ',
    'Apr': 'აპრ',
    'May': 'მაი',
    'Jun': 'ივნ',
    'Jul': 'ივლ',
    'Aug': 'აგვ',
    'Sep': 'სექ',
    'Oct': 'ოქტ',
    'Nov': 'ნოე',
    'Dec': 'დეკ'
  };

  // Helper function to format dates
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    if (locale === 'ge') {
      const formatted = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      const parts = formatted.split(' ');
      const month = georgianMonths[parts[0] as keyof typeof georgianMonths] || parts[0];
      return `${month} ${parts[1]}, ${parts[2]}`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    }
  };

  useEffect(() => {
    const fetchBookingData = async () => {
      try {
        // Get booking ID from URL parameters
        const bookingId = searchParams.get('bookingId');
        
        if (!bookingId) {
          setError("No booking ID provided");
          setLoading(false);
          return;
        }

        // Fetch booking data from API
        const response = await fetch(`/api/bookings/${bookingId}`);
        const result = await response.json();

        if (result.success) {
          setBookingData(result.data);
        } else {
          setError(result.error || "Failed to fetch booking data");
        }
      } catch (error) {
        console.error("Error fetching booking data:", error);
        setError("An error occurred while fetching booking data");
      } finally {
        setLoading(false);
      }
    };

    fetchBookingData();
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">{t("loading")}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t("goHome")}
          </button>
        </div>
      </div>
    );
  }

  if (!bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">{t("noDataFound")}</p>
          <button
            onClick={() => router.push('/')}
            className="mt-4 bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
          >
            {t("goHome")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      <div className="container mx-auto">
      <div className="max-w-7xl font-[Quicksand,sans-serif] mx-auto px-4 py-8">
        {/* Success Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{t("bookingConfirmed")}</h1>
          <p className="text-gray-600">{t("successMessage")}</p>
          <p className="text-sm text-gray-500 mt-2">{t("bookingId", { id: bookingData.id })}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">

            {/* Call you soon message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-center font-semibold text-blue-700 text-lg">
              მალე დაგიკავშირდებით | We will call you soon
            </div>

            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Package className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-800">{t("packageDetails")}</h3>
              </div>
              
              <div className="flex items-start space-x-4">
                {bookingData.package.gallery && bookingData.package.gallery.length > 0 && (
                  <Image
                    src={bookingData.package.gallery[0].url}
                    alt={bookingData.package.title}
                    className="object-cover rounded-lg"
                    width={80}
                    height={80}
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-lg">{bookingData.package.title}</h4>
                  <p className="text-gray-600 mt-1">{bookingData.package.description}</p>
                  <div className="flex items-center space-x-4 mt-3 text-sm text-gray-500">
                    <span>📍 {bookingData.package.location.name}, {bookingData.package.location.city}, {bookingData.package.location.country}</span>
                    <span>⏱️ {bookingData.startDate && bookingData.endDate
                      ? `${formatDate(bookingData.startDate)} - ${formatDate(bookingData.endDate)}`
                      : bookingData.package.duration}
                    </span>
                    <span>👥 {bookingData.package.maxPeople} people</span>
                  </div>
                </div>
                                  <div className="text-right">
                    <div className="text-2xl font-bold text-blue-600">₾{bookingData.package.price}</div>
                    {bookingData.package.salePrice && (
                      <div className="text-sm text-green-600">Sale: ₾{bookingData.package.salePrice}</div>
                    )}
                  </div>
              </div>
            </div>

            {/* Customer Information */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Users className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-medium text-gray-800">{t("customerInformation")}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{t("fullName")}</label>
                  <p className="text-gray-900 font-medium">{bookingData.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t("email")}</label>
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-gray-400" />
                    <p className="text-gray-900">{bookingData.email}</p>
                  </div>
                </div>
                {bookingData.phone && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">{t("phone")}</label>
                    <div className="flex items-center gap-2">
                      <Phone className="w-4 h-4 text-gray-400" />
                      <p className="text-gray-900">{bookingData.phone}</p>
                    </div>
                  </div>
                )}
                <div>
                  <label className="text-sm font-medium text-gray-600">{t("personalIdNumber")}</label>
                  <p className="text-gray-900 font-mono">{bookingData.idNumber}</p>
                </div>
              </div>
            </div>

            {/* Travel Details */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-purple-600" />
                <h3 className="text-lg font-medium text-gray-800">{t("travelDetails")}</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-600">{t("travelDate")}</label>
                  <p className="text-gray-900">
                    {bookingData.startDate && bookingData.endDate
                      ? `${formatDate(bookingData.startDate)} - ${formatDate(bookingData.endDate)}`
                      : bookingData.date || bookingData.package.duration}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t("travelers")}</label>
                  <p className="text-gray-900">Adults: {bookingData.adults}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-600">{t("bookingDate")}</label>
                  <p className="text-gray-900">{formatDate(bookingData.createdAt)}</p>
                </div>
                {bookingData.package.byBus && (
                  <div>
                    <label className="text-sm font-medium text-gray-600">Tour Type</label>
                    <p className="text-gray-900">🚌 Bus Tour</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Price Summary */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
              <div className="flex items-center gap-2 mb-4">
                <CreditCard className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-medium text-gray-800">{t("priceSummary")}</h3>
              </div>
              
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">{t("adultsPrice", { count: bookingData.adults, price: bookingData.package.price })}</span>
                  <span>₾{(bookingData.package.price * bookingData.adults).toFixed(2)}</span>
                </div>
                {/* Assuming children price is not available in this interface */}
                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>{t("total")}</span>
                  <span>₾{bookingData.totalPrice.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">{t("whatsNext")}</h3>
              <div className="space-y-3 text-sm text-gray-700">
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>{t("emailConfirmation")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>{t("paymentArrangement")}</p>
                </div>
                <div className="flex items-start gap-2">
                  <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                  <p>{t("finalDetails")}</p>
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="text-lg font-medium text-gray-800 mb-3">{t("needHelp")}</h3>
              <div className="space-y-2 text-sm text-gray-600">
                <p>📧 info@nextkilla.com</p>
                <p>📞 +995 555 123 456</p>
                <p>📍 Tbilisi, Georgia</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-center mt-8 space-x-4">
          <button
            onClick={() => router.push('/')}
            className=" text-[18px] font-bold  bg-[#51a9ff] cursor-pointer text-white py-2 px-4 rounded-lg "
          >
            {t("backToHome")}
          </button>
          <button
            onClick={() => window.print()}
            className="bg-gray-600 text-[18px] font-bold  hover:bg-gray-700 text-white px-6 py-3 rounded-lg  transition-colors"
          >
            {t("printConfirmation")}
          </button>
        </div>
      </div>
        
      </div>
    </div>
  );
} 