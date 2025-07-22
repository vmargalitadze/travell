"use client";
import { useParams } from "next/navigation";

import Category from "@/component/Category";
import Company from "@/component/Company";
import CompanyFilter from "@/component/CompanyFilter";
import Dest from "@/component/Dest";

import Hero from "@/component/Hero";
import Top from "@/component/Top";
import TransportModes from "@/component/TransportModes";


export default function Home() {
  const params = useParams();
  const locale = params.locale as string;

 

  return (
    <>
      <Hero />
      <CompanyFilter />
   
      <TransportModes />
      {/* <Info /> */}

      <Category />
      <Top locale={locale} />
      <Dest  />
      <Company />
  
    </>
  );
}
