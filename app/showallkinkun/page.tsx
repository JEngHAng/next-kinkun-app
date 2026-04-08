"use client";

import Image from "next/image";
import Link from "next/link";
import FooterSAU from "@/components/FooterSAU";
import { useEffect, useState } from "react";
import { supabase } from "@/services/supabaseClient";
import Swal from "sweetalert2";

interface Task {
  id: string;
  created_at: string;
  food_name: string;
  food_where: string;
  food_pay: string;
  food_img_url: string;
}

export default function Page() {
  const [tasks, setTasks] = useState<Task[]>([]);

  const fetchTasks = async () => {
    const { data, error } = await supabase
      .from("kinkun_tb")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      Swal.fire({
        icon: "warning",
        title: "เกิดข้อผิดพลาด",
        text: "กรุณาลองใหม่อีกครั้ง",
      });
      return;
    }

    if (data) {
      setTasks(data as Task[]);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  // ฟังก์ชันลบข้อมูล (แก้ไขตำแหน่งปีกกาและ Logic)
  const handleDeleteClick = async (id: string, food_img_url: string) => {
    Swal.fire({
      title: "ยืนยันการลบ",
      text: "คุณต้องการลบข้อมูลการกินนี้หรือไม่?",
      icon: "question",
      confirmButtonText: "ใช่, ลบเลย",
      showCancelButton: true,
      cancelButtonText: "ไม่, ยกเลิก",
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
    }).then(async (result) => {
      if (result.isConfirmed) {
        // 1. ลบข้อมูลใน database
        const { error: error1 } = await supabase
          .from("kinkun_tb")
          .delete()
          .eq("id", id);

        if (error1) {
          Swal.fire({
            icon: "error",
            title: "เกิดข้อผิดพลาด",
            text: "ไม่สามารถลบข้อมูลจากฐานข้อมูลได้",
          });
          return; // หยุดการทำงานถ้าลบใน DB ไม่สำเร็จ
        }

        // 2. ลบรูปใน storage (ถ้ามี)
        if (food_img_url) {
          const fileName = food_img_url.substring(
            food_img_url.lastIndexOf("/") + 1,
          );
          await supabase.storage.from("kinkun_bk").remove([fileName]);
        }

        // 3. อัปเดต State และแจ้งเตือนสำเร็จ
        setTasks(tasks.filter((task) => task.id !== id));

        Swal.fire({
          icon: "success",
          title: "ลบสำเร็จ",
          text: "ลบข้อมูลเรียบร้อยแล้ว",
          timer: 1500,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <>
      <div className="min-h-screen bg-white py-12 px-4">
        <div className="max-w-4xl mx-auto bg-white p-10 border border-gray-200 shadow-xl rounded-xl flex flex-col items-center">
          <h1 className="mt-5 text-2xl font-bold text-blue-700">
            KinKun APP (Supabase)
          </h1>
          <h1 className="text-lg font-bold text-blue-700">บันทึกการกิน</h1>

          <Image
            className="mt-5"
            src="https://cdn-icons-png.flaticon.com/128/9718/9718703.png"
            alt="App Logo"
            width={100}
            height={100}
          />

          <div className="w-full mt-5 flex justify-end">
            <Link
              href="/addkinkun"
              className="bg-blue-600 py-2 px-5 rounded hover:bg-blue-800 text-white"
            >
              เพิ่มรายการกิน
            </Link>
          </div>

          <table className="w-full border border-gray-500 mt-5">
            <thead>
              <tr className="bg-gray-200">
                <th className="border border-gray-500 p-2">รูป</th>
                <th className="border border-gray-500 p-2">กินอะไร</th>
                <th className="border border-gray-500 p-2">กินที่ไหน</th>
                <th className="border border-gray-500 p-2">กินไปเท่าไหร่</th>
                <th className="border border-gray-500 p-2">วันไหน</th>
                <th className="border border-gray-500 p-2">ACTION</th>
              </tr>
            </thead>
            <tbody>
              {tasks.length > 0 ? (
                tasks.map((item) => (
                  <tr key={item.id} className="text-center">
                    <td className="border border-gray-500 p-2">
                      {item.food_img_url ? (
                        <Image
                          src={item.food_img_url}
                          alt={item.food_name}
                          width={60}
                          height={60}
                          className="mx-auto object-cover rounded"
                          unoptimized
                        />
                      ) : (
                        <span className="text-gray-400">ไม่มีรูป</span>
                      )}
                    </td>
                    <td className="border border-gray-500 p-2 font-medium">
                      {item.food_name}
                    </td>
                    <td className="border border-gray-500 p-2">
                      {item.food_where}
                    </td>
                    <td className="border border-gray-500 p-2 text-green-600 font-bold">
                      {Number(item.food_pay).toLocaleString()}
                    </td>
                    <td className="border border-gray-500 p-2 text-sm">
                      {new Date(item.created_at).toLocaleString("th-TH", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </td>
                    <td className="border border-gray-500 p-2">
                      <Link
                        href={`/updatekinkun/${item.id}`}
                        className="text-blue-500 hover:underline"
                      >
                        แก้ไข
                      </Link>
                      <span className="mx-2">|</span>
                      <button
                        className="text-red-500 hover:underline cursor-pointer"
                        onClick={() =>
                          handleDeleteClick(item.id, item.food_img_url)
                        }
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="text-center p-5 text-gray-500">
                    ยังไม่มีข้อมูลการกิน
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          <Link
            href="/"
            className="mt-4 text-blue-500 hover:text-blue-700 underline"
          >
            ออกจากการใช้งาน (Logout)
          </Link>
        </div>
      </div>

      <FooterSAU />
    </>
  );
}
