"use client";

import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import Image from "next/image";

const partners = [
    { src: "/company/Wizz_Air-Logo.wine.png", alt: "Partner 1" },
    { src: "/company/Turkish_Airlines_logo.png", alt: "Partner 2" },
    { src: "/company/Pegasus_Airlines-Logo.wine.png", alt: "Partner 3" },
    { src: "/company/Lufthansa_Logo_2018.svg.png", alt: "Partner 4" },
    { src: "/company/EasyJet_logo.svg.png", alt: "Partner 5" },
];

export default function Company() {
    return (
        <div className="relative pt-20 lg:pt-8 pb-6 lg:pb-8">
            <div className="container mx-auto max-w-7xl">
                {/* Desktop Grid */}
                <div className="hidden lg:grid grid-cols-5 gap-6 justify-center items-center">
                    {partners.map((partner, idx) => (
                        <div key={idx} className="flex justify-center">
                            <div className="rounded-xl flex items-center justify-center p-6 w-full">
                                <Image
                                    width={100}
                                    height={100}
                                    src={partner.src}
                                    unoptimized 
                                    alt={partner.alt}
                                    className="h-16 w-auto mx-auto object-contain"
                                />
                            </div>
                        </div>
                    ))}
                </div>

                {/* Mobile Carousel */}
                <div className="lg:hidden pb-10">
                    <Swiper
                        slidesPerView={1}
                        spaceBetween={16}
                        pagination={{
                            el: ".custom-bullet",
                            clickable: true,
                            renderBullet: (index, className) =>
                                `<span class="${className} custom-bullet"></span>`,
                        }}
                        modules={[Pagination]}
                        className="partner-swiper"
                    >
                        {partners.map((partner, idx) => (
                            <SwiperSlide key={idx}>
                                <div className="flex justify-center">
                                    <div className="rounded-xl shadow-xl mb-10 flex items-center justify-center p-6  w-[100vw] h-[30vh]">
                                        <Image
                                            fill
                                            src={partner.src}
                                            alt={partner.alt}
                                            unoptimized
                                            className="h-full w-auto mb-10 object-contain shadow-lg"
                                        />
                                    </div>
                                </div>
                            </SwiperSlide>
                        ))}
                    </Swiper>
                    <div className="custom-bullet flex justify-center gap-2 mt-10 mb-10" />
                </div>
            </div>


        </div>
    );
}
