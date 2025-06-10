// /components/Header.tsx
'use client';

import { Button } from '@/components/ui/button';

type Page = 'stats' | 'students' | 'scan';

interface HeaderProps {
  activePage: Page;
  onPageChange: (page: Page) => void;
}

const retroStyle = "border-2 border-black shadow-[4px_4px_0px_#2A2A2A] transition-all hover:shadow-[2px_2px_0px_#2A2A2A]";

export default function Header({ activePage, onPageChange }: HeaderProps) {
  return (
    <header className="flex flex-col sm:flex-row justify-between items-center mb-8 pb-4 border-b-4 border-black">
      <h1 className="text-4xl md:text-5xl mb-4 sm:mb-0">SEMICOLON '25</h1>
      <nav className="flex space-x-2">
        <Button 
          variant={activePage === 'stats' ? 'default' : 'outline'} 
          className={`${retroStyle} uppercase`} 
          onClick={() => onPageChange('stats')}
        >
          Stats
        </Button>
        <Button 
          variant={activePage === 'students' ? 'default' : 'outline'} 
          className={`${retroStyle} uppercase`} 
          onClick={() => onPageChange('students')}
        >
          Students
        </Button>
        <Button 
          variant={activePage === 'scan' ? 'default' : 'outline'} 
          className={`${retroStyle} uppercase`} 
          onClick={() => onPageChange('scan')}
        >
          Scan QR
        </Button>
      </nav>
    </header>
  );
}