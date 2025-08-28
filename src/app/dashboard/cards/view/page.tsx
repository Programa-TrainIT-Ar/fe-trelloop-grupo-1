'use client';

import { useSearchParams } from "next/navigation";  

export default function ViewCardPage() {
    const searchParams = useSearchParams();
    const cardId = searchParams.get("cardId");  
    const boardId = searchParams.get("boardId");
    
   return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold"></h1>

      <div className="grid grid-cols-[auto_1fr_1fr_1fr_1fr_1fr_1fr_auto] items-center gap-3 px-4 py-3 text-lg bg-[#313131B3] rounded-xl border-2 border-[#3C3C3CB2] backdrop-blur-[3.6px] text-white mb-6 text-center">
       
      </div>
    </div>
  );
}