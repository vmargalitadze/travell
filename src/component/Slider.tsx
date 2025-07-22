/* eslint-disable @next/next/no-img-element */
"use client";
import React, { useEffect, useRef, useState } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel, Pagination } from "swiper/modules";
import { gsap } from "gsap";
import "swiper/css";
import "swiper/css/pagination";
import "./slider.css"
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

import { getAllPackages } from "@/lib/actions/packages";
function Slider() {
    const swiperRef = useRef<HTMLElement | null>(null)
    const [packages, setPackages] = useState<Package[]>([]);
    const [loading, setLoading] = useState(true);
    function adjustMargin(){
        const screenWidth = window.innerWidth
        if(swiperRef.current){
           swiperRef.current.style.marginLeft = screenWidth <= 600 ? "-75px" : screenWidth <= 900 ? "-90px" : "-150px"
        }
    }

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
              wait
              </h3>
            </div>
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          </div>
        );
      }
  return (
    <div className="main">

    <div className="cont" >
      <Swiper
        modules={[Mousewheel, Pagination]}
        grabCursor={true}
        initialSlide={4}
        centeredSlides={true}
        className="swiperr"
        slidesPerView={4}
        slideActiveClass="auto"
        spaceBetween={10}
        speed={1000}
        slideToClickedSlide={true}
        pagination={{
          clickable: true,
        }}
        mousewheel={{thresholdDelta: 30}}
        onSwiper={(swiper) => {
            swiperRef.current = swiper.wrapperEl;
            swiper.on("resize", adjustMargin)
           
        }}
        onResize={adjustMargin}
        onSlideChange={(swiper) => {
          const activeSlide = swiper.slides[swiper.activeIndex]
          gsap.fromTo(activeSlide,
            {scale:0},
            {scale:1, duration:0.5, ease:"back.inOut"}
          )
        }}
      >
        {packages.map((pkg) => (
            <SwiperSlide className="swiper-slidde" key={pkg.id}>
                <img src={pkg.gallery[0].url} alt={pkg.title} />
                <div className="slide-overlay">
                    <p>{pkg.title}</p>
                    <div className="slide-meta">
                        {pkg.location?.name} &bull; ₾{pkg.salePrice ?? pkg.price}
                    </div>
                    <button className="slide-btn">View Details</button>
                </div>
            </SwiperSlide>
        ))}
       
      </Swiper>
    </div>
    </div>
  );
}

export default Slider;
