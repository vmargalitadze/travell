"use client";
import React, { useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Pagination, EffectFade, Autoplay } from "swiper/modules";
import { useTranslations } from "next-intl";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/effect-fade";

export default function Hero() {
  const t = useTranslations("hero");
  const [activeIndex, setActiveIndex] = useState(0);

  const slides = [
    {
      title: t("hallstatt_title"),
      text: t("hallstatt_text"),
      bg: "https://upload.wikimedia.org/wikipedia/commons/b/b0/Hallstatt_-_Zentrum_.JPG",
      key: "one",
    },
    {
      title: t("paris_title"),
      text: t("paris_text"),
      bg: "https://avianet.ge/storage/app/media/cropped-images/PARIS-0-0-0-0-1624280981.jpeg",
      key: "two",
    },
    {
      title: t("amsterdam_title"),
      text: t("amsterdam_text"),
      bg: "https://www.holland.com/upload_mm/2/4/4/80160_fullimage_rondvaartboot%20vaart%20onder%20brug%20door%20met%20mooie%20wolkenlucht%20%C2%A9%20illusion-x%20via%20pixabay_1150x663_438x353.jpg",
      key: "three",
    },
    {
      title: t("kyoto_title"),
      text: t("kyoto_text"),
      bg: "https://images.unsplash.com/photo-1578469645742-46cae010e5d4?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
      key: "four",
    },
  ];

  return (
    <div className="relative h-screen bg-[#232328] font-[Quicksand,sans-serif]">
      <Swiper
        effect="fade"
        speed={1000}
        loop={true}
 
        autoplay={{ delay: 3000, disableOnInteraction: false }}
        modules={[Pagination, EffectFade, Autoplay]}
        className="w-full h-full swiper-container"
        onSlideChange={(swiper) => {
          setActiveIndex(swiper.realIndex);
        }}
      >
        {slides.map((slide, index) => (
          <SwiperSlide
            key={slide.key}
            className="relative w-full h-full swiper-slide"
          >
            <div
              className={`absolute bottom-12 mb-10 left-1/2 -translate-x-1/2 flex flex-col items-center w-[90%] max-w-2xl text-[#f2f2f2] text-center  z-20 transition-opacity duration-500 ease-in-out ${activeIndex === index
                ? "opacity-100 animate-fadeIn"
                : "opacity-0"
              }`}
            >
              <h1 className="font-[Salsa,cursive] text-[#EA8F03] text-4xl md:text-6xl mb-5">
                {slide.title}
              </h1>
              <p className="text-lg font-medium leading-snug mb-6">{slide.text}</p>
              
         
            </div>

            <div
              className={`background absolute inset-0 w-full h-full z-10 transition-all duration-[3000ms] ease-in-out ${activeIndex === index
                ? "clip-show opacity-100"
                : "clip-hide opacity-0"
              }`}
              style={{
                backgroundImage: `url(${slide.bg})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              {/* შავი overlay ფენა */}
              <div className="absolute inset-0 bg-black/40"></div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
}