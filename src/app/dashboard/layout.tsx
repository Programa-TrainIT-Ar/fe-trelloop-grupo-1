"use client";
import SideNav from "@/components/User/sidenav";
import SearchBar from "@/components/User/searchbar";
import React from "react";

interface DashboardLayoutProps {
  children: React.ReactNode;
  params: {
    boardId: string;
  };
}

export default function Layout({children, params}: DashboardLayoutProps) {
    return (
        <div className="flex h-screen flex-col md:flex-row md:overflow-hidden">
            <div className="w-full flex-none md:w-64">
                <SideNav />
            </div>
            <div className="bg-[#1A1A1A] flex-grow p-6 md:overflow-y-auto md:p-12">
                <SearchBar />
                {children}
            </div>
        </div>
    )
}