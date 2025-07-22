"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Check, X, Shield } from "lucide-react";
import { useTranslations } from "next-intl";

import { useParams } from "next/navigation";
import { getPackageById } from "@/lib/actions/packages";
import { getIncludedItemsByPackage } from "@/lib/actions/includedItems";
import { getNotIncludedItemsByPackage } from "@/lib/actions/notIncludedItems";
import { getRulesByPackage } from "@/lib/actions/rules";
import TourPlanDisplay from "@/component/TourPlanDisplay";
import { useRouter } from "@/i18n/navigation";


interface PackageData {
  id: number;
  title: string;
  description: string;
  price: number;
  duration: string;
  startDate?: Date | null;
  endDate?: Date | null;
  byBus?: boolean;
  byPlane?: boolean;
  maxPeople: number;
  category: string;
  location?: { name: string; country: string; city: string };
  locationId: number;
  gallery?: Array<{ url: string }>;
  tourPlan?: Array<{ dayNumber: number; title: string; activities: string[] }>;
  dates?: Array<{ id: number; startDate: Date; endDate: Date; maxPeople: number }>;
  createdAt: Date;
  updatedAt: Date;
}

interface IncludedItemData {
  id: number;
  text: string;
}

interface NotIncludedItemData {
  id: number;
  text: string;
}

interface RuleData {
  id: number;
  text: string;
}

export default function PackageDetails() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslations("productDetails");
  const locale = params.locale as string;
  
  // Map app locale to date locale
  const dateLocale = locale === 'ge' ? 'ka-GE' : 'en-US';
  
  const [activeTab, setActiveTab] = useState("overview");
  const [adults, setAdults] = useState(1);
  const [packageData, setPackageData] = useState<PackageData | null>(null);
  const [includedItems, setIncludedItems] = useState<IncludedItemData[]>([]);
  const [notIncludedItems, setNotIncludedItems] = useState<NotIncludedItemData[]>([]);
  const [rules, setRules] = useState<RuleData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [bookingLoading, setBookingLoading] = useState(false);

  useEffect(() => {
    const loadPackage = async () => {
      if (!params.id) return;

      try {
        setLoading(true);
        const packageId = Number(params.id);

        const [packageResult, includedResult, notIncludedResult, rulesResult] = await Promise.all([
          getPackageById(packageId),
          getIncludedItemsByPackage(packageId),
          getNotIncludedItemsByPackage(packageId),
          getRulesByPackage(packageId)
        ]);

        if (packageResult.success && packageResult.data) {
          setPackageData(packageResult.data);
        } else {
          setError("Package not found");
        }

        if (includedResult.success && includedResult.data) {
          setIncludedItems(includedResult.data);
        }

        if (notIncludedResult.success && notIncludedResult.data) {
          setNotIncludedItems(notIncludedResult.data);
        }

        if (rulesResult.success && rulesResult.data) {
          setRules(rulesResult.data);
        }
      } catch {
        setError("Failed to load package");
      } finally {
        setLoading(false);
      }
    };

    loadPackage();
  }, [params.id]);

  if (loading) {
    return (
      <div className="w-full lg:py-36 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !packageData) {
    return (
      <div className="w-full lg:py-36 py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800 mb-4">{t("packageNotFound")}</h1>
            <p className="text-gray-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  const totalPrice = packageData.price * adults;

  const handleBooking = async () => {
    if (!packageData) return;
    
    setBookingLoading(true);
    try {
      // Build URL with booking parameters
      const params = new URLSearchParams({
        packageId: packageData.id.toString(),
        adults: adults.toString(),
        totalPrice: totalPrice.toString()
      });

      // Navigate to booking page with parameters
      router.push(`/booking?${params.toString()}`);
    } catch (error) {
      console.error('Booking error:', error);
    } finally {
      setBookingLoading(false);
    }
  };

  // Calculate maxPeople for display
  const displayMaxPeople = packageData.dates && packageData.dates.length > 0
    ? Math.max(...packageData.dates.map((d) => d.maxPeople || 0))
    : packageData.maxPeople;


  return (
    <>
      <div className="w-full lg:py-36 py-16 sm:py-20 relative overflow-hidden">
        <div className="jarallax absolute inset-0 z-minus" data-jarallax="">
          <div className="relative w-full min-h-[200px] h-[220px] sm:h-[300px] md:h-[400px] lg:h-[600px] xl:h-[700px] overflow-hidden">
            <div className="absolute w-full inset-0 -z-10">
              <div className="relative w-full min-h-[200px] h-[220px] sm:h-[300px] md:h-[400px] lg:h-[600px] xl:h-[700px]">
                <Image
                  src="/breadcrumb-bg.webp"
                  alt="placeholder"
                  fill
                  className="object-cover pointer-events-none"
                  
                  unoptimized
                />
                <div className="absolute inset-0 bg-black/30" />
              </div>
            </div>
          </div>
        </div>
        <Image
          src="/bird-illustration-w.png"
          alt="placeholder"
          width={100}
          height={100}
          className="absolute top-[5%] right-[8%] z-1 w-[16vw] max-w-[100px] min-w-[60px]"
          unoptimized
        />
      </div>

      <div className="pt-10 sm:pt-16 pb-10 sm:pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <div className="mb-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Main Content */}
              <div className="md:col-span-2 lg:col-span-2 order-1 lg:order-1">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                  <div className="relative h-56 sm:h-80 md:h-96">
                    <Image
                      src={packageData.gallery?.[0]?.url || "/category/photo-1532254497630-c74966e79621.jpg"}
                      alt={packageData.title}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  </div>
                  <div className="p-4 font-[Quicksand,sans-serif] sm:p-6">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-2">
                      <h1 className="text-2xl sm:text-3xl font-[Quicksand,sans-serif] font-bold text-gray-800">
                        {packageData.title}
                      </h1>
                    </div>

                    <div className="flex flex-wrap items-center gap-4 sm:gap-6 mb-6">
                      <div className="flex items-center gap-2">
                      <Image src="/icons/calendar.png" alt="Bus icon" width={20} height={20} />
                        <span className="text-gray-600">
                          {packageData.byBus && packageData.dates && packageData.dates.length > 0 ? (
                            `${packageData.dates.length} ${locale === 'ge' ? 'თარიღი' : 'dates'}`
                          ) : packageData.startDate && packageData.endDate ? (
                            `${packageData.startDate.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })} - ${packageData.endDate.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}`
                          ) : (
                            packageData.duration
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                      <Image src="/icons/users.png" alt="Bus icon" width={20} height={20} />
                        <span className="text-gray-600">
                          {t("maxPeople")}: {displayMaxPeople}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                      <Image src="/icons/map.png" alt="Bus icon" width={20} height={20} />
                        <span className="text-gray-600">
                          {packageData.location?.name} - {packageData.location?.city}, {packageData.location?.country}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-gray-600">
                          {packageData.category}
                        </span>
                      </div>
                    </div>

                    <p className="text-gray-700 mb-4 sm:mb-6">
                      {packageData.description}
                    </p>

                    {/* Available Dates for Bus Tours */}
                    {packageData.byBus && packageData.dates && packageData.dates.length > 0 && (
                      <div className="mb-4 sm:mb-6">
                        <h3 className="text-lg font-semibold text-gray-800 mb-3">
                          {locale === 'ge' ? 'ხელმისაწვდომი თარიღები' : 'Available Dates'}
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                          {packageData.dates.map((date) => (
                            <div key={date.id} className="bg-gray-50 rounded-lg p-3 border">
                              <div className="text-[16px] font-medium text-gray-900">
                                {date.startDate.toLocaleDateString(dateLocale, { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </div>
                              <div className="text-[14px] text-gray-500">
                                {date.endDate.toLocaleDateString(dateLocale, { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Tabs Section */}
                <div className="bg-white rounded-lg shadow-lg mt-6 sm:mt-8">
                  <div className="border-b font-[Quicksand,sans-serif] border-gray-200 overflow-x-auto">
                    <nav className="flex space-x-4 sm:space-x-8 px-4 sm:px-6">
                      {[
                        { id: "overview", label: t("overview") },
                        { id: "tour-plan", label: t("tourPlan") },
                        { id: "rules", label: "Rules" },
                        { id: "gallery", label: t("gallery") },
                      ].map((tab) => (
                        <button
                          key={tab.id}
                          onClick={() => setActiveTab(tab.id)}
                          className={`py-3 px-2 sm:py-4 sm:px-1 border-b-2 font-medium text-[16px] whitespace-nowrap ${activeTab === tab.id
                              ? "border-[#ea8f03] text-[#ea8f03]"
                              : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
                            }`}
                        >
                          {tab.label}
                        </button>
                      ))}
                    </nav>
                  </div>

                  <div className="p-4 sm:p-6">
                    {activeTab === "overview" && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 font-[Quicksand,sans-serif]">
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            {t("whatsIncluded")}
                          </h3>
                          {includedItems.length > 0 ? (
                            <ul className="space-y-2">
                              {includedItems.map((item) => (
                                <li key={item.id} className="flex items-center gap-2">
                                  <Check className="w-4 h-4 text-green-500 flex-shrink-0" />
                                  <span className="text-gray-700">{item.text}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500">{t("noIncludedItems")}</p>
                          )}
                        </div>
                        <div>
                          <h3 className="text-lg font-semibold mb-4">
                            {t("whatsNotIncluded")}
                          </h3>
                          {notIncludedItems.length > 0 ? (
                            <ul className="space-y-2">
                              {notIncludedItems.map((item) => (
                                <li key={item.id} className="flex items-center gap-2">
                                  <X className="w-4 h-4 text-bg-[#ea8f03] flex-shrink-0" />
                                  <span className="text-gray-700">{item.text}</span>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500">{t("noExcludedItems")}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {activeTab === "tour-plan" && (
                      <TourPlanDisplay packageId={packageData.id} />
                    )}

                    {activeTab === "rules" && (
                      <div>
                        <h3 className="text-lg font-semibold mb-4">
                          Package Rules
                        </h3>
                        {rules.length > 0 ? (
                          <ul className="space-y-3">
                            {rules.map((rule) => (
                              <li key={rule.id} className="flex font-[Quicksand,sans-serif] items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                                <Shield className="w-5 h-5 text-orange-500 flex-shrink-0 mt-0.5" />
                                <span className="text-gray-700">{rule.text}</span>
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <div className="text-center py-8">
                            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                            <p className="text-gray-500">No rules specified for this package</p>
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === "gallery" && (
                      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 sm:gap-4">
                        {packageData.gallery && packageData.gallery.length > 0 ? (
                          packageData.gallery.map((image, index) => (
                            <div key={index} className="relative aspect-square overflow-hidden rounded-lg">
                              <Image
                                src={image.url}
                                alt={`${packageData.title} - Gallery image ${index + 1}`}
                                fill
                                className="object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                                unoptimized
                              />
                            </div>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-8">
                            <p className="text-gray-500">{t("noGalleryImages")}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sidebar */}
              <div className="order-2 lg:order-2 mb-8 md:mb-0">
                <div className=" top-4 font-[Quicksand,sans-serif] space-y-6">
                  {/* Price Card */}
                  <div className="bg-white rounded-lg shadow-lg p-4 sm:p-6">
                    

                    <div className="space-y-3 sm:space-y-4 mb-4 sm:mb-6">
                    

                      <div>
                        <label className="block text-[16px] font-medium text-gray-700 mb-1 sm:mb-2">
                          {t("numberOfTravelers")}
                        </label>
                        <div className="text-[16px] text-gray-600 mb-1 sm:mb-2">
                          {adults} {t("adults")}
                        </div>
                        <div className="space-y-1 sm:space-y-2">
                          {/* Adults */}
                          <div className="flex items-center justify-between">
                            <span className="text-[16px]">{t("adult")}</span>
                            <div className="flex items-center gap-2">
                              <button
                                onClick={() => setAdults(Math.max(1, adults - 1))}
                                className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-center text-[14px] leading-tight"
                              >
                                −
                              </button>
                              <span className="w-8 text-center">{adults}</span>
                              <button
                                onClick={() => setAdults(adults + 1)}
                                className="w-6 h-6 bg-[#ea8f03] text-white rounded-full flex items-center justify-center text-[14px] leading-tight"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>

                    <div className="space-y-1 font-[Quicksand,sans-serif] sm:space-y-2 mb-4 sm:mb-6">
                      <div className="border-t pt-2 flex justify-between font-semibold text-[16px]">
                        <span>{t("total")}: </span>
                        <span>₾{totalPrice}</span>
                      </div>
                    </div>

                    <div className="space-y-2 sm:space-y-3">
                      <button 
                        onClick={handleBooking}
                        disabled={bookingLoading}
                      className="w-full text-[18px] font-bold  bg-[#51a9ff] cursor-pointer text-white py-2 px-4 rounded-lg "
                      >
                        <span>{bookingLoading ? t("processing") : t("bookNow")}</span>
                      </button>
                    </div>
                  </div>

                  {/* Package Info */}
                  <div className="bg-white font-[Quicksand,sans-serif] rounded-lg shadow-lg p-4 sm:p-6">
                    <h3 className="text-base sm:text-lg font-semibold mb-3 sm:mb-4">
                      {t("packageInformation")}
                    </h3>
                    <div className="space-y-3 sm:space-y-4">
                      <div className="flex justify-between">
                        <span className="text-[16px] text-gray-600">{t("category")}:</span>
                        <span className="text-[16px] font-medium">{packageData.category}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[16px] text-gray-600">{t("location")}:</span>
                        <span className="text-[16px] font-medium">{packageData.location?.name ? `${packageData.location.name}, ${packageData.location.city}` : ''}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-[16px] text-gray-600">{t("duration")}:</span>
                        <span className="text-[16px] font-medium">
                          {packageData.byBus && packageData.dates && packageData.dates.length > 0 ? (
                            `${packageData.dates.length} ${locale === 'ge' ? 'თარიღი' : 'dates'}`
                          ) : packageData.startDate && packageData.endDate ? (
                            `${packageData.startDate.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })} - ${packageData.endDate.toLocaleDateString(dateLocale, { month: 'short', day: 'numeric', year: 'numeric' })}`
                          ) : (
                            packageData.duration
                          )}
                        </span>
                      </div>
               
                      <div className="flex justify-between">
                        <span className="text-[16px] text-gray-600">{t("maxPeople")}:</span>
                        <span className="text-[16px] font-medium">{displayMaxPeople}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
