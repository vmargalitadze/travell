"use client";
import { useTranslations } from "next-intl";


import { Facebook,  Instagram, Linkedin, Mail, Phone, MapPin, } from "lucide-react";

const Footer = () => {
    const t = useTranslations("footer");

  

    return (
        <footer className="bg-black/80 backdrop-blur text-white">
            {/* Main Footer Content */}
            <div className="container font-[Quicksand,sans-serif] mx-auto px-4 py-16">
                <div className="flex justify-center items-center">

                    <div className="flex flex-wrap justify-center items-start gap-8 max-w-6xl">

                        {/* Company Info */}
                        <div className="w-full md:w-[30%] lg:w-1/3 space-y-6 flex flex-col h-full">
                            <div className="flex font-[Quicksand,sans-serif] text-[24px] items-center space-x-3">
                               Travel
                               
                            </div>
                            <p className="text-gray-300 font-[Quicksand,sans-serif] leading-relaxed">
                                {t("company_desc")}
                            </p>

                            {/* Social Media */}
                            <div className="flex space-x-4 mt-auto">
                                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-[#EA8F03] transition-colors duration-300">
                                    <Facebook className="w-5 h-5" />
                                </a>
                                
                                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-[#EA8F03] transition-colors duration-300">
                                    <Instagram className="w-5 h-5" />
                                </a>
                                <a href="#" className="p-2 bg-gray-800 rounded-full hover:bg-[#EA8F03] transition-colors duration-300">
                                    <Linkedin className="w-5 h-5" />
                                </a>
                            </div>
                        </div>

                     
                        {/* Contact Info */}
                        <div className="w-full font-[Quicksand,sans-serif] md:w-[30%] lg:w-1/3 space-y-6 flex flex-col h-full">
                            <h4 className="text-lg font-[Quicksand,sans-serif] font-semibold text-white border-b border-orange-500 pb-2">
                                {t("contact_info")}
                            </h4>
                            <ul className="space-y-3">
                                <li className="flex items-start space-x-3">
                                    <MapPin className="w-5 h-5 text-[#EA8F03] mt-1 flex-shrink-0" />
                                    <span className="text-gray-300 font-[Quicksand,sans-serif] text-sm leading-relaxed">
                                        georgia
                                    </span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <Phone className="w-5 h-5 text-[#EA8F03] flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">
                                      599123456
                                    </span>
                                </li>
                                <li className="flex items-center space-x-3">
                                    <Mail className="w-5 h-5 text-[#EA8F03] flex-shrink-0" />
                                    <span className="text-gray-300 text-sm">
                                    travel@gmail.com
                                    </span>
                                </li>
                            </ul>
                        </div>


                    </div>

                </div>
            </div>


        </footer>
    );
};

export default Footer;