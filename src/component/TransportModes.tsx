"use client";
import React from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function TransportModes() {
  const t = useTranslations("transportModes");

  return (
    <section className="py-16 ">
      <div className="container mx-auto">
        <div className="max-w-7xl mx-auto ">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              {t("title")}
            </h2>
            <p className="text-lg font-[Quicksand,sans-serif] font-medium leading-snug mb-6">
              {t("subtitle")}
            </p>
          </div>

          {/* Transport Modes Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Bus Transport */}
            <Link
              href="/travels?transport=bus"
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative h-80 md:h-96">
                <Image
                  src="/bus.webp"
                  alt="Bus Transportation"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute  inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute font-[Quicksand,sans-serif] bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{t("busTitle")}</h3>
                  <p className="text-gray-200 mb-4">{t("busDescription")}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="text-sm">{t("busFeature1")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                      <span className="text-sm">{t("busFeature2")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>

            {/* Plane Transport */}
            <Link
              href="/travels?transport=plane"
              className="group relative overflow-hidden rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2"
            >
              <div className="relative h-80 md:h-96">
                <Image
                  src="/plane.jpg"
                  alt="Plane Transportation"
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                <div className="absolute font-[Quicksand,sans-serif] bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-2xl font-bold mb-2">{t("planeTitle")}</h3>
                  <p className="text-gray-200 mb-4">{t("planeDescription")}</p>
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="text-sm">{t("planeFeature1")}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                      <span className="text-sm">{t("planeFeature2")}</span>
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
