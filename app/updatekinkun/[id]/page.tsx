"use client";

import FooterSAU from "@/components/FooterSAU";
import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { supabase } from "@/services/supabaseClient";
import Swal from "sweetalert2";

export default function Page() {
  const { id } = useParams();
  const router = useRouter();

  // State สำหรับข้อมูลการกิน
  const [foodName, setFoodName] = useState<string>("");
  const [foodWhere, setFoodWhere] = useState<string>("");
  const [foodPay, setFoodPay] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [oldImageUrl, setOldImageUrl] = useState<string | null>(null);

  // 1. ดึงข้อมูลเดิมมาแสดงใน Form
  useEffect(() => {
    const fetchTask = async () => {
      const { data, error } = await supabase
        .from("kinkun_tb")
        .select("*")
        .eq("id", id)
        .single();

      if (error) {
        Swal.fire("Error", "ไม่สามารถดึงข้อมูลได้", "error");
        return;
      }

      if (data) {
        setFoodName(data.food_name);
        setFoodWhere(data.food_where); // ใช้ก้ามปูเพราะชื่อคอลัมน์มีขีดกลาง
        setFoodPay(data.food_pay.toString());
        setImagePreview(data.food_img_url);
        setOldImageUrl(data.food_img_url);
      }
    };
    fetchTask();
  }, [id]);

  // ฟังก์ชันเลือกรูปภาพใหม่
  const handleSelectImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // ฟังก์ชันบันทึกการแก้ไข
  const handleUpdateClick = async () => {
    // Validation ตรวจสอบค่าว่าง
    if (!foodName.trim() || !foodWhere.trim() || !foodPay.trim()) {
      Swal.fire("คำเตือน", "กรุณากรอกข้อมูลให้ครบถ้วน", "warning");
      return;
    }

    let currentImageUrl = imagePreview;

    // แสดง Loading
    Swal.fire({
      title: "กำลังบันทึก...",
      allowOutsideClick: false,
      didOpen: () => {
        Swal.showLoading();
      },
    });

    // กรณีมีการเลือกรูปใหม่
    if (imageFile) {
      // 1. ลบรูปเก่าออกจาก Storage (ถ้ามี)
      if (oldImageUrl) {
        const oldFileName = oldImageUrl.split("/").pop()?.split("?")[0];
        if (oldFileName) {
          await supabase.storage.from("kinkun_bk").remove([oldFileName]);
        }
      }

      // 2. อัปโหลดรูปใหม่
      const newFileName = `${Date.now()}_${imageFile.name}`;
      const { error: uploadError } = await supabase.storage
        .from("kinkun_bk")
        .upload(newFileName, imageFile);

      if (uploadError) {
        Swal.fire("Error", "ไม่สามารถอัปโหลดรูปใหม่ได้", "error");
        return;
      }

      // 3. รับ URL รูปใหม่
      const { data: urlData } = supabase.storage
        .from("kinkun_bk")
        .getPublicUrl(newFileName);
      currentImageUrl = urlData.publicUrl;
    }

    // อัปเดตข้อมูลลง Database
    const { error: updateError } = await supabase
      .from("kinkun_tb")
      .update({
        food_name: foodName,
        food_where: foodWhere,
        food_pay: parseFloat(foodPay),
        food_img_url: currentImageUrl,
      })
      .eq("id", id);

    if (updateError) {
      Swal.fire("Error", "บันทึกข้อมูลไม่สำเร็จ", "error");
    } else {
      await Swal.fire({
        title: "สำเร็จ",
        text: "แก้ไขข้อมูลการกินเรียบร้อยแล้ว",
        icon: "success",
        confirmButtonText: "ตกลง",
      });
      router.push("/showallkinkun"); // กลับไปหน้าแสดงผลทั้งหมด
    }
  };

  return (
    <>
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white p-10 border border-gray-200 shadow-xl rounded-xl flex flex-col items-center">
          {/* แสดงชื่อ app */}
          <h1 className="mt-5 text-2xl font-bold text-blue-700">
            KinKun APP (Supabase)
          </h1>

          <h1 className=" text-lg font-bold text-blue-700">
            เพิ่มข้อมูลการกิน
          </h1>

          {/* แสดงรูปจาก Internet */}
          <Image
            className="mt-5"
            src="https://cdn-icons-png.flaticon.com/128/9718/9718703.png"
            alt="Image"
            width={150}
            height={150}
          />
          {/* ส่วนป้อนข้อมูล */}
          <div className="w-full flex flex-col mt-5">
            <h1 className="font-bold">กินอะไร</h1>
            <input
              value={foodName}
              onChange={(e) => setFoodName(e.target.value)}
              type="text"
              className="p-2 border border-gray-700 rounded mt-1 mb-3"
            />

            <h1 className="font-bold">กินที่ไหน</h1>
            <input
              value={foodWhere}
              onChange={(e) => setFoodWhere(e.target.value)}
              type="text"
              className="p-2 border border-gray-700 rounded mt-1 mb-3"
            />

            <h1 className="font-bold">กินไปเท่าไหร่ (บาท)</h1>
            <input
              value={foodPay}
              onChange={(e) => setFoodPay(e.target.value)}
              type="number"
              className="p-2 border border-gray-700 rounded mt-1 mb-3"
            />
          </div>

          {/* ส่วนรูปภาพ */}
          <div className="w-full flex flex-col mt-5">
            <h1 className="font-bold">รูปอาหาร</h1>
            <input
              id="selectImage"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleSelectImage}
            />
            <label
              htmlFor="selectImage"
              className="py-2 px-4 cursor-pointer bg-blue-600 hover:bg-blue-800 text-white rounded mt-1 mb-3 w-32 text-center"
            >
              เลือกรูปใหม่
            </label>
            {imagePreview && (
              <div className="mt-2">
                <Image
                  src={imagePreview}
                  alt="preview"
                  width={150}
                  height={150}
                  className="rounded shadow-md"
                />
              </div>
            )}
          </div>

          {/* ปุ่มบันทึก */}
          <button
            onClick={handleUpdateClick}
            className="w-full px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded mt-8 cursor-pointer font-bold"
          >
            บันทึกการกิน
          </button>

          <Link
            href="/showallkinkun"
            className="mt-4 text-blue-500 hover:text-blue-700 underline"
          >
            กลับไปหน้าแสดงรายการทั้งหมด
          </Link>
        </div>
      </div>

      <FooterSAU />
    </>
  );
}
