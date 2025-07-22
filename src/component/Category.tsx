"use client";
import { useTranslations } from "next-intl";
import Image from "next/image";
import React, { useState, useEffect } from "react";
import { getAllPackages } from "@/lib/actions/packages";

interface Package {
  id: number;
  title: string;
  description: string;
  price: number;
  salePrice?: number | null;
  duration: string;
  startDate?: Date | null;
  endDate?: Date | null;
  byBus: boolean;
  byPlane: boolean;
  category: string;
  popular?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  gallery: Array<{
    id: number;
    url: string;
    packageId: number;
  }>;
  location?: {
    id: number;
    name: string;
    country: string;
    city: string;
  };
  dates?: Array<{
    id: number;
    startDate: Date;
    endDate: Date;
    maxPeople: number;
  }>;
}

import { Link } from "@/i18n/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";

const Category = () => {
  const t = useTranslations("category");

  const [nearestPackages, setNearestPackages] = useState<Package[]>([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const packagesResult = await getAllPackages();

        if (packagesResult.success && packagesResult.data) {
          // Filter upcoming packages by nearest location
          const nearest = filterUpcomingNearestPackages(packagesResult.data);
          setNearestPackages(nearest);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Helper function to get the earliest upcoming date for a package
  const getEarliestDate = (pkg: Package): Date | null => {
    const now = new Date();

    // Check specific dates first
    if (pkg.dates && pkg.dates.length > 0) {
      const futureDates = pkg.dates
        .map((date) => new Date(date.startDate))
        .filter((date) => date > now)
        .sort((a, b) => a.getTime() - b.getTime());

      return futureDates.length > 0 ? futureDates[0] : null;
    }

    // Check general start date
    if (pkg.startDate) {
      const startDate = new Date(pkg.startDate);
      return startDate > now ? startDate : null;
    }

    return null;
  };

  // Function to filter packages by dates and nearest location
  const filterUpcomingNearestPackages = (allPackages: Package[]): Package[] => {
    const now = new Date();

    // Filter packages with upcoming dates
    const upcomingPackages = allPackages.filter((pkg) => {
      // Check if package has specific dates
      if (pkg.dates && pkg.dates.length > 0) {
        // For packages with specific dates, check if any date is in the future
        return pkg.dates.some((date) => new Date(date.startDate) > now);
      }

      // For packages with general start/end dates
      if (pkg.startDate && pkg.endDate) {
        return new Date(pkg.startDate) > now;
      }

      // For packages without specific dates, include them (they might be ongoing)
      return true;
    });

    // Get unique countries and prioritize nearest ones
    const countries = [
      ...new Set(
        upcomingPackages.map((pkg) => pkg.location?.country).filter(Boolean)
      ),
    ];
    const priorityCountries = countries.slice(0, 3); // First 3 countries are considered nearest

    // Sort by nearest location first, then by earliest date
    const sortedPackages = upcomingPackages.sort((a, b) => {
      const aCountry = a.location?.country;
      const bCountry = b.location?.country;

      // First priority: nearest countries
      const aPriority = priorityCountries.includes(aCountry || "");
      const bPriority = priorityCountries.includes(bCountry || "");

      if (aPriority && !bPriority) return -1;
      if (!aPriority && bPriority) return 1;

      // Second priority: earliest upcoming date
      const aEarliestDate = getEarliestDate(a);
      const bEarliestDate = getEarliestDate(b);

      if (aEarliestDate && bEarliestDate) {
        return aEarliestDate.getTime() - bEarliestDate.getTime();
      }

      // If no dates, sort by creation date
      return (
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
      );
    });

    return sortedPackages.slice(0, 8); // Return top 8 upcoming nearest packages
  };

  return (
    <>
      <div className="container mx-auto ">
        <div className="max-w-7xl   mx-auto">
          {/* Upcoming Trips by Nearest Location Section */}
          {!loading && nearestPackages.length > 0 && (
            <div className="mt-20">
              <div className="mb-8 text-center">
                <h2 className="capitalize font-[Salsa,cursive] text-[30px] md:text-[40px] text-gray-900">
                  {t("upcomingTrips") || "Upcoming Trips"}
                </h2>
                <p className="text-lg font-[Quicksand,sans-serif] font-medium leading-snug mb-6">
                  {t("upcomingTripsSubtitle") ||
                    "Discover upcoming adventures near you, sorted by nearest location"}
                </p>
              </div>

              <Swiper
                slidesPerView={1}
                spaceBetween={16}
                pagination={{ clickable: true }}
                breakpoints={{
                  640: { slidesPerView: 1 },
                  768: { slidesPerView: 2 },
                  1024: { slidesPerView: 4 },
                }}
                modules={[Pagination]}
                className="nearest-packages-swiper"
              >
                {nearestPackages.map((package_, idx) => (
                  <SwiperSlide key={package_.id} className="h-full">
                    <div
                      className="h-full mb-20 rounded-lg shadow-lg overflow-hidden flex flex-col"
                      style={{
                        animationDelay: `${idx * 0.1}s`,
                        animationName: "fadeInUp",
                        animationDuration: "0.6s",
                        animationFillMode: "both",
                      }}
                    >
                      <div className="relative w-full h-[300px]">
                        {package_.gallery && package_.gallery.length > 0 ? (
                          <Image
                            src={package_.gallery[0].url}
                            alt={package_.title}
                            fill
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                            <span className="text-gray-400">No image</span>
                          </div>
                        )}
                        {package_.popular && (
                          <div className="absolute top-4 left-4 bg-red-500 text-white px-2 py-1 rounded text-sm font-medium">
                            Popular
                          </div>
                        )}
                      </div>

                      <div className="p-3 flex flex-col flex-1 font-[Quicksand,sans-serif]">
                        <div className="flex flex-col h-full">
                          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-3">
                            <h3 className="text-[18px] font-bold line-clamp-2 mb-5  text-gray-900 lg:mb-0 min-h-[40px]">
                              {package_.title}
                            </h3>
                          </div>

                          <p className="text-gray-600 text-[16px] mb-4 line-clamp-3 flex-grow">
                            {package_.description}
                          </p>

                          <div className="flex items-center text-[16px] text-gray-500 mb-4 gap-2">
                        <span className="text-xs bg-[[#EA8F03]] text-white px-2 py-1 rounded">
                        <Image
                                src="/icons/earth.png"
                                alt="Bus icon"
                                width={20}
                                height={20}
                                unoptimized
                              />        
                        </span>
                        <span className="mr-4">
                          {package_.location?.name || ""}
                        </span>
                      </div>

                          {/* Show upcoming date */}
                          {(() => {
                            const earliestDate = getEarliestDate(package_);
                            if (earliestDate) {
                              return (
                                <div className="flex items-center text-[16px] text-[#EA8F03] mb-4">
                                  <span>
                                    {earliestDate.toLocaleDateString("en-US", {
                                      month: "short",
                                      day: "numeric",
                                      year: "numeric",
                                    })}
                                  </span>
                                </div>
                              );
                            }
                            return null;
                          })()}
                         

                          <div className="flex justify-between gap-6">
                                                        <div className="flex items-center justify-around space-x-2">
                                                            <span className="text-[16px] text-gray-500">
                                                                {package_.byBus ? (
                                                                    <Image
                                                                        src="/icons/bus.png"
                                                                        alt="Bus icon"
                                                                        width={20}
                                                                        height={20}
                                                                        unoptimized
                                                                    />
                                                                ) : package_.byPlane ? (
                                                                    <Image
                                                                        src="/icons/plane.png"
                                                                        alt="Plane icon"
                                                                        width={20}
                                                                        height={20}
                                                                        unoptimized
                                                                    />
                                                                ) : (
                                                                    ""
                                                                )}
                                                            </span>
                                                        </div>
                                                        <Link
                                                            href={`/product/${package_.id}`}
                                                            className="text-[16px] font-bold text-end bg-[#51a9ff] cursor-pointer text-white py-2 px-4 rounded-lg transition-colors hover:bg-[#3a8ce6]"
                                                        >
                                                            {t("viewDetails")}
                                                        </Link>
                                                    </div>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default Category;
