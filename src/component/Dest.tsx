"use client";
import { Link } from "@/i18n/navigation";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { getAllPackages } from "@/lib/actions/packages";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import { useTranslations } from "next-intl";
import "swiper/css";
import "swiper/css/pagination";

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



function Dest() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const t = useTranslations("newDest");

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const packagesResult = await getAllPackages();
        if (packagesResult.success) {
          setPackages(packagesResult.data || []);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  if (loading) {
    return (
      <div className="max-w-7xl pt-15 mx-auto">
        <div className="mb-7 text-center">
          <h3 className="capitalize font-[Salsa,cursive] text-[30px] md:text-[40px] md:text-6xl">
            {t("title")}
          </h3>
        </div>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto">
        <div className="max-w-7xl pt-15  mx-auto">
          <div className="mb-7 text-center">
            <h3 className="capitalize font-[Salsa,cursive] text-[30px] md:text-[40px] md:text-6xl">
              {t("title")}
            </h3>
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
            className="partner-swiper"
          >
            {packages.map((package_, idx) => (
              <SwiperSlide key={package_.id} className="h-full">
                <div
                  className="h-full mb-20 mt-10 rounded-lg shadow-lg overflow-hidden flex flex-col"
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
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <span className="text-gray-400">No image</span>
                      </div>
                    )}

                  </div>

                  <div className="p-6 flex flex-col flex-1  font-[Quicksand,sans-serif]">
                    <div className="h-[200px]">
                      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between mb-3">
                        <h3 className="text-[14px] font-bold line-clamp-2 mb-5 font-semibold text-gray-900 mb-2 lg:mb-0 min-h-[40px]">
                          {package_.title}
                        </h3>
                      </div>

                      <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                        {package_.description}
                      </p>

                      <div className="flex items-center text-sm text-gray-500 mb-4">
                        <span className="mr-4">
                          {package_.location?.name || ""}
                        </span>
                      </div>

                      <div className="flex items-center justify-between mt-auto">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-500">
                            {package_.byBus ? (
                              <Image
                                src="/icons/bus.png"
                                alt="Bus icon"
                                width={20}
                                height={20}
                              />
                            ) : package_.byPlane ? (
                              <Image
                                src="/icons/plane.png"
                                alt="Plane icon"
                                width={20}
                                height={20}
                              />
                            ) : (
                              ""
                            )}
                          </span>
                        </div>
                        <Link
                          href={`/product/${package_.id}`}
                          className="w-[50%] text-[18px] font-bold bg-[#51a9ff] cursor-pointer text-white py-2 px-4 rounded-lg transition-colors"
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
      </div>
    </>
  );
}

export default Dest;
