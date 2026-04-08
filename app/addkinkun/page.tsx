"use client";

import FooterSAU from "@/components/FooterSAU";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Swal from "sweetalert2";
import { supabase } from "@/services/supabaseClient";
import { useRouter } from "next/navigation";

export default function Page() {
  const router = useRouter();

  const [foodName, setFoodName] = useState<string>("");
  const [foodWhere, setFoodWhere] = useState<string>("");
  const [foodPay, setFoodPay] = useState<string>(""); 
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSaveClick = async () => {
    if (foodName === "" || foodWhere === "" || foodPay === "" || imageFile === null) {
      Swal.fire({
        title: "คำเตือน",
        text: "กรุณากรอกข้อมูลให้ครบถ้วนและเลือกรูปภาพ",
        icon: "warning",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    const new_file_name = `${Date.now()}_${imageFile.name}`;

    Swal.fire({
      title: "กำลังบันทึก...",
      allowOutsideClick: false,
      didOpen: () => { Swal.showLoading(); },
    });

    const { error: uploadError } = await supabase.storage
      .from("kinkun_bk")
      .upload(new_file_name, imageFile);

    if (uploadError) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถอัปโหลดรูปภาพได้", "error");
      return;
    }

    const { data: publicUrlData } = await supabase.storage
      .from("kinkun_bk")
      .getPublicUrl(new_file_name);

    const food_img_url = publicUrlData.publicUrl;

    const { error: insertError } = await supabase.from("kinkun_tb").insert({
      food_name: foodName,
      food_where: foodWhere,
      food_pay: parseFloat(foodPay),
      food_img_url: food_img_url,
    });

    if (insertError) {
      Swal.fire("เกิดข้อผิดพลาด", "ไม่สามารถบันทึกข้อมูลได้", "error");
      return;
    }

    Swal.fire({
      title: "บันทึกสำเร็จ",
      text: "ข้อมูลการกินของคุณถูกบันทึกแล้ว",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });

    router.push("/showallkinkun");
  };

  return (
    <div className="min-h-screen bg-white py-12 px-4">
      <div className="max-w-4xl mx-auto bg-white p-10 border border-gray-200 shadow-xl rounded-xl flex flex-col items-center">
        
        {/* หัวข้อตามภาพ */}
        <h1 className="text-3xl font-bold text-blue-600">KinKun APP (Supabase)</h1>
        <h2 className="text-xl font-bold text-blue-600 mt-2 mb-4">เพิ่มข้อมูลการกิน</h2>
        
        {/* โลโก้แฮมเบอร์เกอร์ */}
        <Image
          src="https://cdn-icons-png.flaticon.com/128/9718/9718703.png"
          alt="App Logo"
          width={130}
          height={130}
          className="mb-8"
        />

        {/* ฟอร์มการกรอกข้อมูล */}
        <div className="w-full space-y-5 px-4">
          <div className="flex flex-col">
            <label className="font-bold text-gray-800 mb-1 text-left">กินอะไร</label>
            <input
              type="text"
              placeholder="เช่น Pizza, KFC, ..."
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              className="w-full p-2.5 border border-gray-400 rounded-md placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-gray-800 mb-1 text-left">กินที่ไหน</label>
            <input
              type="text"
              placeholder="เช่น KFC หนองแขม, Pizza หน้ามอเอเชีย, ..."
              value={foodWhere}
              onChange={(e) => setFoodWhere(e.target.value)}
              className="w-full p-2.5 border border-gray-400 rounded-md placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div className="flex flex-col">
            <label className="font-bold text-gray-800 mb-1 text-left">กินไปเท่าไหร่ (บาท)</label>
            <input
              type="number"
              placeholder="เช่น 100, 299.50, ..."
              value={foodPay}
              onChange={(e) => setFoodPay(e.target.value)}
              className="w-full p-2.5 border border-gray-400 rounded-md placeholder-gray-400 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* ส่วนอัปโหลดรูปภาพ */}
          <div className="flex flex-col items-start pt-2">
            <label className="font-bold text-gray-800 mb-2 text-left">รูปกิน</label>
            <input
              id="selectImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectImage}
            />
            <label
              htmlFor="selectImage"
              className="px-8 py-2.5 bg-blue-500 text-white rounded-md cursor-pointer hover:bg-blue-600 transition font-medium"
            >
              เลือกรูป
            </label>

            {imagePreview && (
              <div className="mt-4 p-1 border border-gray-200 inline-block bg-white shadow-sm">
                <Image
                  src={imagePreview}
                  alt="preview"
                  width={150}
                  height={150}
                  className="object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* ปุ่มบันทึกการกิน สีน้ำเงินยาวเต็ม */}
        <button
          onClick={handleSaveClick}
          className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded mt-8 cursor-pointer font-bold"
        >
          บันทึกการกิน
        </button>

        {/* กลับหน้าเดิม */}
        <Link
          href={"/showallkinkun"}
          className="mt-6 text-blue-500 hover:text-blue-700 font-medium underline"
        >
          กลับไปหน้าแสดงข้อมูลการกิน
        </Link>
      </div>

      {/* Footer */}
      <FooterSAU />
    </div>
  );
}