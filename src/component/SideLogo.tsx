import Link from "next/link";
import { FaWhatsapp } from "react-icons/fa";

export default function SideLogo() {
  const phoneNumber = "+995571191673";

  return (
    <div className="fixed bottom-[75px] right-[59px] z-50">
      <Link
        href={`https://wa.me/${phoneNumber}`}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Open WhatsApp"
        className="flex items-center justify-center w-16 h-16 rounded-full bg-[#25D366] shadow-lg hover:scale-105 transition-transform duration-200"
      >
        <FaWhatsapp className="text-white text-[45px]" />
      </Link>
    </div>
  );
}
