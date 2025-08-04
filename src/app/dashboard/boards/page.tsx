"use client";
import React from "react";
import { BoardSettings } from "@/components/board/BoardSettings";

export default function CreateBoardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4 text-white">Crear nuevo tablero</h1>
      {/* Aquí puedes agregar más secciones si otros compañeros desarrollan más partes */}
      <BoardSettings />
    </div>
  );
}
