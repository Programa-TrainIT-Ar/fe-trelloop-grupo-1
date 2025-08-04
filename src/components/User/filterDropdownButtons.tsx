'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { IconType } from 'react-icons'; 


interface DropdownItem {
  id: string;
  label: string;  
  onClick?: () => void; 
}

interface FilterDropdownButtonProps {
  id: string; 
  label: string; 
  icon: IconType; 
  items: DropdownItem[]; 
  isOpen: boolean;  
  onToggle: (id: string) => void; 
  buttonTextColor?:string;
}

export default function FilterDropdownButton({
  id,
  label,
  icon: Icon, 
  items,
  isOpen,
  onToggle,
  buttonTextColor = 'text-white'
}: FilterDropdownButtonProps) {
  
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {      
      if (isOpen && dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onToggle(id); 
      }
    };

    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onToggle, id]); 

  return (
    <div className="relative" ref={dropdownRef}>
      
      <button
        type="button"
        onClick={() => onToggle(id)} 
        className={`${buttonTextColor} flex items-center hover:bg-[--global-color-neutral-600] rounded-xl py-2 px-4 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-[--global-color-neutral-800]`}
        aria-haspopup="true" 
        aria-expanded={isOpen ? "true" : "false"} 
      >
        <Icon className="me-2 size-8" /> 
        {label} 
      </button>

      
      {isOpen && (
        <div
          role="menu" 
          aria-orientation="vertical" 
          className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-[--global-color-neutral-700] shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none"
        >
          <div className="py-1">
            
            {items.map((item) => (
              <Link
                key={item.id} 
                href={item.href || '#'} 
                onClick={item.onClick || (() => onToggle(id))} 
                className="block px-4 py-2 text-sm text-white hover:bg-[--global-color-neutral-800]"
                role="menuitem" 
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}