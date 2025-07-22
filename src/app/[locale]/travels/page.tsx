"use client";
import React, { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllPackages } from "@/lib/actions/packages";
import { Link } from "@/i18n/navigation";
import Image from "next/image";
import { CATEGORIES } from "@/lib/Validation";
import { useTranslations } from "next-intl";

interface Package {
  id: number;
  title: string;
  description: string;
  price: number;
  salePrice?: number;
  duration: string;
  startDate?: Date | null;
  endDate?: Date | null;
  byBus: boolean;
  byPlane: boolean;
  category: string;
  popular: boolean;
  location: {
    id: number;
    name: string;
    country: string;
    city: string;
  };
  gallery: Array<{
    id: number;
    url: string;
    packageId: number;
  }>;
  dates?: Array<{
    id: number;
    startDate: Date;
    endDate: Date;
    maxPeople: number;
  }>;
}

export default function TravelsPage() {
  const [packages, setPackages] = useState<Package[]>([]);
  const [filteredPackages, setFilteredPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();
  const router = useRouter();
  const t = useTranslations();

  // Get URL parameters
  const country = searchParams.get("country");
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const date = searchParams.get("date");
  const transport = searchParams.get("transport");

  // Filter states
  const [selectedCategory, setSelectedCategory] = useState(category || "");
  const [selectedCountry, setSelectedCountry] = useState(country || "");
  const [selectedDestination, setSelectedDestination] = useState("");
  const [selectedDuration, setSelectedDuration] = useState("");
  const [selectedDate, setSelectedDate] = useState(date || "");
  const [selectedTransport, setSelectedTransport] = useState(transport || "");
  const [showPopularOnly, setShowPopularOnly] = useState(false);
  const [searchTerm, setSearchTerm] = useState(search || "");

  // Handle URL parameters on component mount
  useEffect(() => {
    if (country) {
      setSelectedCountry(country);
    }
    if (category) {
      setSelectedCategory(category);
    }
    if (search) {
      setSearchTerm(search);
    }
    if (date) {
      setSelectedDate(date);
    }
    if (transport) {
      setSelectedTransport(transport);
    }
  }, [country, category, search, date, transport]);

  useEffect(() => {
    const fetchPackages = async () => {
      try {
        const result = await getAllPackages();
        if (result.success) {
          setPackages((result.data as unknown as Package[]) || []);
        }
      } catch (error) {
        console.error("Error fetching packages:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPackages();
  }, []);

  useEffect(() => {
    let filtered = packages;

    // Filter by search term (package title and description)
    if (searchTerm) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pkg.location.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by transport type
    if (selectedTransport === "bus") {
      filtered = filtered.filter((pkg) => pkg.byBus === true);
    } else if (selectedTransport === "plane") {
      filtered = filtered.filter((pkg) => pkg.byPlane === true);
    }

    // Filter by country
    if (selectedCountry) {
      filtered = filtered.filter(
        (pkg) =>
          pkg.location.country.toLowerCase() === selectedCountry.toLowerCase()
      );
    }

    // Filter by category
    if (selectedCategory) {
      filtered = filtered.filter((pkg) => pkg.category === selectedCategory);
    }

    // Filter by destination
    if (selectedDestination) {
      filtered = filtered.filter((pkg) =>
        pkg.location.name
          .toLowerCase()
          .includes(selectedDestination.toLowerCase())
      );
    }

    // Filter by duration
    if (selectedDuration) {
      filtered = filtered.filter((pkg) => {
        if (pkg.byBus && pkg.dates && pkg.dates.length > 0) {
          // For bus packages, check if any date range matches the selected value
          return pkg.dates.some((date) => {
            const startStr = new Date(date.startDate)
              .toISOString()
              .split("T")[0];
            const endStr = new Date(date.endDate).toISOString().split("T")[0];
            return selectedDuration === `${startStr}_${endStr}`;
          });
        } else if (pkg.byPlane && pkg.startDate && pkg.endDate) {
          // For plane packages, check if the selected value matches the package's date range
          const startStr = new Date(pkg.startDate).toISOString().split("T")[0];
          const endStr = new Date(pkg.endDate).toISOString().split("T")[0];
          return selectedDuration === `${startStr}_${endStr}`;
        }
        return false;
      });
    }

    // Filter by popularity
    if (showPopularOnly) {
      filtered = filtered.filter((pkg) => pkg.popular === true);
    }

    // Filter by date (if date is selected, show packages that start on or after that date)
    if (selectedDate) {
      const selectedDateObj = new Date(selectedDate);
      filtered = filtered.filter((pkg) => {
        if (!pkg.startDate) return true; // Show packages without dates
        const packageStartDate = new Date(pkg.startDate);
        return packageStartDate >= selectedDateObj;
      });
    }

    setFilteredPackages(filtered);
  }, [
    packages,
    searchTerm,
    selectedCountry,
    selectedCategory,
    selectedDestination,
    selectedDuration,
    selectedTransport,
    showPopularOnly,
    selectedDate,
  ]);

  // Update transport filter and URL
  const handleTransportChange = (value: string) => {
    setSelectedTransport(value);
    // Build new query params
    const params = new URLSearchParams(window.location.search);
    if (value) {
      params.set("transport", value);
    } else {
      params.delete("transport");
    }
    router.replace(`?${params.toString()}`);
  };

  if (loading) {
    return (
      <>
        <div className="pt-20 pb-16">
          <div className="container mx-auto px-4">
            <div className="flex gap-8">
              {/* Sidebar skeleton */}
              <div className="w-80 hidden lg:block">
                <div className="bg-white rounded-lg shadow-lg p-6 space-y-6">
                  {[...Array(4)].map((_, i) => (
                    <div key={i}>
                      <div className="h-6 bg-gray-200 rounded animate-pulse mb-4"></div>
                      <div className="space-y-2">
                        {[...Array(3)].map((_, j) => (
                          <div
                            key={j}
                            className="h-4 bg-gray-200 rounded animate-pulse"
                          ></div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              {/* Content skeleton */}
              <div className="flex-1">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white mb-24 rounded-lg shadow-lg overflow-hidden flex flex-col"
                    >
                      <div className="relative w-full h-[300px]">
                        <div className="w-full h-full bg-gray-200 animate-pulse"></div>
                      </div>
                      <div className="p-6 flex rounded-lg flex-col flex-1">
                        <div className="flex flex-col lg:flex-row justify-between mb-3">
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-24"></div>
                          <div className="h-6 bg-gray-200 rounded animate-pulse w-16"></div>
                        </div>
                        <div className="flex gap-3 items-center mt-auto">
                          <div className="w-8 h-8 bg-gray-200 rounded-full animate-pulse"></div>
                          <div className="h-4 bg-gray-200 rounded animate-pulse w-20"></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }


  // Get page title based on filters
  const getPageTitle = () => {
    if (selectedTransport === "bus") {
      return "Bus Tours";
    } else if (selectedTransport === "plane") {
      return "Plane Tours";
    } else if (selectedCountry) {
      return `Travel to ${selectedCountry}`;
    } else {
      return "All Travel Destinations";
    }
  };

  return (
    <>
      <div className="w-full lg:py-36 py-16 sm:py-20 relative overflow-hidden">
        <div className="jarallax absolute inset-0 z-minus" data-jarallax="">
          <div className="relative w-full min-h-[300px] h-[350px] sm:h-[450px] md:h-[550px] lg:h-[750px] xl:h-[850px] overflow-hidden">
            <div className="absolute w-full inset-0 -z-10">
              <div className="relative w-full min-h-[300px] h-[350px] sm:h-[450px] md:h-[550px] lg:h-[750px] xl:h-[850px]">
                <Image
                  src="/breadcrumb-bg.webp"
                  alt="placeholder"
                  fill
                  className="object-cover pointer-events-none"
                  unoptimized
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/50 to-black/70" />
                <div className="absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/20" />
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

      <div className="pt-20 pb-16">
        <div className="container mx-auto px-4">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              {getPageTitle()}
            </h1>
          </div>

          <div className="flex font-[Quicksand,sans-serif] gap-8">
            {/* Sidebar */}
            <div className="w-80 hidden lg:block">
              <div className="bg-white rounded-lg shadow-lg p-6 sticky top-24">
                <h3 className="text-xl font-semibold text-gray-800 mb-6">
                  {t("travels.filterBy")}
                </h3>

                {/* Transport Type Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {t("travels.transportType")}
                  </h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="transport"
                        value=""
                        checked={selectedTransport === ""}
                        onChange={() => handleTransportChange("")}
                        className="text-red-400 focus:ring-red-400"
                      />
                      <span className="text-gray-600">{t("travels.all")}</span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="transport"
                        value="bus"
                        checked={selectedTransport === "bus"}
                        onChange={() => handleTransportChange("bus")}
                        className="text-red-400 focus:ring-red-400"
                      />
                      <Image src="/icons/bus.png" alt="Bus icon" width={20} height={20} />
                      <span className="text-gray-600">
                        {t("travels.busTours")}
                      </span>
                    </label>
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="radio"
                        name="transport"
                        value="plane"
                        checked={selectedTransport === "plane"}
                        onChange={() => handleTransportChange("plane")}
                        className="text-red-400 focus:ring-red-400"
                      />
                      <Image src="/icons/plane.png" alt="Plane icon" width={20} height={20} />
                      <span className="text-gray-600">
                        {t("travels.planeTours")}
                      </span>
                    </label>
                  </div>
                </div>

                {/* Search */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {t("travels.search")}
                  </h4>
                  <input
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Search packages..."
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                  />
                </div>

                {/* Date Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {t("travels.filterByDate")}
                  </h4>
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={selectedDate}
                      onChange={(e) => setSelectedDate(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-400 focus:border-transparent"
                      min={new Date().toISOString().split("T")[0]}
                    />
                  </div>
                </div>

                {/* Popularity Filter */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {t("travels.popularity")}
                  </h4>
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={showPopularOnly}
                      onChange={(e) => setShowPopularOnly(e.target.checked)}
                      className="text-red-400 focus:ring-red-400"
                    />
                    <span className="text-gray-600">
                      {t("travels.popularOnly")}
                    </span>
                  </label>
                </div>

                {/* Categories */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {t("travels.categories")}
                  </h4>
                  <div className="space-y-2">
                    {CATEGORIES.map((cat) => {
                      const packageCount = packages.filter(
                        (pkg) => pkg.category === cat
                      ).length;
                      return { category: cat, count: packageCount };
                    })
                      .filter((item) => item.count > 0)
                      .map(({ category, count }) => (
                        <label
                          key={category}
                          className="flex items-center justify-between cursor-pointer"
                        >
                          <div className="flex items-center space-x-2">
                            <input
                              type="radio"
                              name="category"
                              value={category}
                              checked={selectedCategory === category}
                              onChange={(e) =>
                                setSelectedCategory(e.target.value)
                              }
                              className="text-red-400 focus:ring-red-400"
                            />
                            <span className="text-gray-600">{category}</span>
                          </div>
                          <span className="text-xs text-gray-400">
                            ({count})
                          </span>
                        </label>
                      ))}
                  </div>
                </div>

                {/* Countries */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {t("travels.countries")}
                  </h4>
                  <div className="space-y-2">
                    {Array.from(
                      new Set(packages.map((pkg) => pkg.location.country))
                    ).map((country) => (
                      <label
                        key={country}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="country"
                          value={country}
                          checked={selectedCountry === country}
                          onChange={(e) => setSelectedCountry(e.target.value)}
                          className="text-red-400 focus:ring-red-400"
                        />
                        <span className="text-gray-600">{country}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Destinations */}
                <div className="mb-6">
                  <h4 className="font-semibold text-gray-700 mb-3">
                    {t("travels.destinations")}
                  </h4>
                  <div className="space-y-2">
                    {Array.from(
                      new Set(packages.map((pkg) => pkg.location.name))
                    ).map((dest) => (
                      <label
                        key={dest}
                        className="flex items-center space-x-2 cursor-pointer"
                      >
                        <input
                          type="radio"
                          name="destination"
                          value={dest}
                          checked={selectedDestination === dest}
                          onChange={(e) =>
                            setSelectedDestination(e.target.value)
                          }
                          className="text-red-400 focus:ring-red-400"
                        />
                        <span className="text-gray-600">{dest}</span>
                      </label>
                    ))}
                  </div>
                </div>

             

                <div className="mb-6">
                  <button
                    type="button"
                    className="w-full bg-[#51a9ff] text-[18px] font-bold  cursor-pointer text-white py-2 px-4 rounded-lg "
                    onClick={() => {
                      setSelectedCategory("");
                      setSelectedCountry("");
                      setSelectedDestination("");
                      setSelectedDuration("");
                      setSelectedDate("");
                      setSelectedTransport("");
                      setShowPopularOnly(false);
                      setSearchTerm("");
                      router.replace("/travels");
                    }}
                  >
                    {t("travels.clear")}
                  </button>
                </div>
              </div>
            </div>

            {/* Content */}
            <div className="flex-1">
              {filteredPackages.length === 0 ? (
                <div className="text-center py-12">
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">
                    {t("travels.noPackages")}
                  </h3>
                  <p className="text-gray-600">{t("travels.tryAdjusting")}</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPackages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white  rounded-lg shadow-lg overflow-hidden flex flex-col"
                    >
                      <div className="relative w-full h-[300px] group overflow-hidden">
                        {pkg.gallery?.[0]?.url ? (
                          <>
                            <Image
                              src={pkg.gallery[0].url}
                              alt={pkg.title}
                              fill
                              className="object-contain "
                            
                              priority={false}
                              loading="lazy"
                            />
                            {/* Popular badge */}
                            {pkg.popular && (
                              <div className="absolute top-4 left-4 bg-red-500 text-white px-3 py-1 rounded-full text-sm font-medium shadow-lg">
                                Popular
                              </div>
                            )}
                            {/* Transport type indicator */}
                           
                          
                          </>
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                            <div className="text-center">
                              <div className="w-16 h-16 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                              </div>
                              <span className="text-gray-500 text-sm">No image available</span>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="p-6 font-[Quicksand,sans-serif] flex flex-col flex-1">
                        <div className="flex flex-col lg:flex-row justify-between mb-3">
                          <h3 className="text-[16px] font-semibold text-gray-900 mb-2 lg:mb-0">
                            {pkg.title}
                          </h3>
                          <div className="text-right">
                            {pkg.salePrice ? (
                              <div>
                                <span className="text-lg font-bold text-red-600">
                                  ₾{pkg.salePrice}
                                </span>
                                <span className="text-sm text-gray-500 line-through ml-2">
                                  ₾{pkg.price}
                                </span>
                              </div>
                            ) : (
                              <span className="text-lg font-bold text-gray-900">
                                ₾{pkg.price}
                              </span>
                            )}
                          </div>
                        </div>

                        <p className="text-gray-600 text-[16px] mb-4 line-clamp-2">
                          {pkg.description}
                        </p>

                        <div className="flex  gap-6">
                        <Image
                                src="/icons/earth.png"
                                alt="Bus icon"
                                width={20}
                                height={20}
                                unoptimized
                              />   
                          <span>{pkg.location.country}</span>
                        </div>
                        <div className="flex justify-between gap-6">
                                                        <div className="flex items-center justify-around space-x-2">
                                                            <span className="text-[16px] text-gray-500">
                                                            {pkg.byBus ? <Image src="/icons/bus.png" alt="Bus icon" width={20} height={20} /> : pkg.byPlane ? <Image src="/icons/plane.png" alt="Bus icon" width={20} height={20} /> : ""}
                                                               
                                                            </span>
                                                        </div>
                                                        <Link
                                                           href={`/product/${pkg.id}`}
                                                            className="text-[16px] font-bold text-end bg-[#51a9ff] cursor-pointer text-white py-2 px-4 rounded-lg transition-colors hover:bg-[#3a8ce6]"
                                                        >
                                                             {t("travels.viewDetails")}
                                                        </Link>
                                                    </div>
                     
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
