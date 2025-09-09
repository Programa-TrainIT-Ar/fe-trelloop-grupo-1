import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
  params: {
    boardId: string;
  };
}

export default function BoardsLayout({ children, params }: LayoutProps) {
  return (
    <div>      
      {children}
    </div>
  );
}