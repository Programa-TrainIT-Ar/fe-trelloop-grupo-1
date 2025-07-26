"use client";

import { useRouter } from "next/navigation";
import { FaPlus } from "react-icons/fa6";

export default function CreateBoardBar() {
  const router = useRouter();

  const handleClick = () => {
    router.push("/dashboard/boards");
  };

  return (
    <div className="flex justify-between mb-12">
      <span className="text-white text-3xl">Tablero</span>
      <button
        type="button"
        onClick={handleClick}
        className="px-10 text-white flex h-[48px] items-center justify-center rounded-lg bg-[--global-color-primary-500]"
      >
        <FaPlus className="size-6 me-3" />
        Crear tablero
      </button>
    </div>
  );
}
