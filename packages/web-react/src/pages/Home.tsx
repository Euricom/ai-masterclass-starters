import { useState } from 'react';
import { Button } from '@/components/ui/button';

export function Home() {
  const [crash, setCrash] = useState(false);

  if (crash) {
    throw new Error('Test error from Home page');
  }

  return (
    <main>
      <h1 className="text-5xl font-bold tracking-tight">Welcome</h1>
      <p className="mt-6 text-xl text-gray-500">A simple React app.</p>
      <Button variant="destructive" className="mt-6" onClick={() => setCrash(true)}>
        Trigger error
      </Button>
    </main>
  );
}
