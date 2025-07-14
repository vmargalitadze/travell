"use client";
import Image from 'next/image'
import { useTranslations } from "next-intl";
import React from 'react'

const Info = () => {
    const t = useTranslations("info");
    return (
        <>
            <div className="container pt-20  mx-auto">
                <div className="max-w-7xl mx-auto">
                    <div className="container">
                        <div className="flex flex-col lg:flex-row items-center justify-center gap-8 mt-10">
                            <div className="flex-shrink-0">
                                <Image src="/aboutimg1-b53ca5f6.png" alt="info" width={500} height={500} />
                            </div>
                            <div className="flex flex-col gap-8 max-w-[500px] w-full">
                                <div className="flex items-center gap-2">
                                    <i className="text-[18px] text-primary font-bold leading-5 ri-earth-line"></i>
                                    <h3 className="text-[18px] text-primary font-bold leading-5">
                                        {t("we_are")}
                                    </h3>
                                </div>
                                <div>
                                    <h1 className="text-center lg:text-left text-[30px] sm:text-[35px] md:text-[48px] xl:text-[56px] font-black leading-tight">
                                        {t("explore_title")}
                                    </h1>
                                    
                                </div>
                                
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

export default Info