"use client";

import FooterSAU from "@/components/FooterSAU";
import Image from "next/image";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Swal from "sweetalert2";

export default function Page() {
  const router = useRouter();

  const [securecode, setSecurecode] = useState<string>("");

  const handleAsscessClick = () => {
    // ตรวจสอบรหัสที่ป้อนเข้ามา
    if (securecode.toLowerCase() !== "6519410040") {
      Swal.fire({
        icon: "error",
        title: "คำเตือน",
        text: "รหัสไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง",
      });
      return;
    }
    // ไปยังหน้าแสดงรายการงานทั้งหมด
    router.push("/showallkinkun");
  };

  return (
    <>
      <div className="w-3/5 mt-10 p-10 shadow-xl mx-auto border-gray-400 rounded-xl flex flex-col justify-center items-center">
        
        {/* แสดงชื่อ app */}
        <h1 className="mt-5 text-2xl font-bold text-blue-700">
          KinKun APP (Supabase)
        </h1>

        <h1 className=" text-lg font-bold text-blue-700">
          บันทึกการกิน
        </h1>

        {/* แสดงรูปจาก Internet */}
        <Image
          className="mt-5"
          src="https://cdn-icons-png.flaticon.com/128/9718/9718703.png"
          alt="Image"
          width={150}
          height={150}
        />

        {/* ป้อน Secure code สำหรับเข้าใช้งาน */}
        <input
          type="text"
          className="p-3 border border-gray-400 rounded mt-5 w-1/2"
          placeholder="Enter secure code"
          value={securecode}
          onChange={(e) => setSecurecode(e.target.value)}
        />

        {/* ปุ่มเข้าใช้งาน */}
        <button
          onClick={handleAsscessClick}
          className="mt-5 w-1/2 bg-blue-600 py-3 text-white rounded hover:bg-blue-700 cursor-pointer"
        >
          😋เข้าใช้งาน😋
        </button>
      </div>

      {/* แสดง footer */}
      <FooterSAU />
    </>
  );
}