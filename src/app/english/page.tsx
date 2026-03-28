"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const STORAGE_KEY = "dailyseed-selected-day";

export default function EnglishIndex() {
  const router = useRouter();
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const dayNumber = saved ? parseInt(saved, 10) + 1 : 1;
    router.replace(`/english/${dayNumber}`);
  }, [router]);
  return null;
}
