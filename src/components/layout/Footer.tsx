import React from 'react';

export function Footer() {
  return (
    <footer className="border-t bg-background/95  supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-center">
        <div className="text-center text-sm text-muted-foreground">
          <p>EventPlanner - Soukromý plánovač událostí</p>
          <p className="mt-1">Vytvořeno s ❤️ pro vaše události</p>
        </div>
      </div>
    </footer>
  );
} 