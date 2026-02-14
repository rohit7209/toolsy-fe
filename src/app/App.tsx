import { Navigation } from '../components/Navigation';
import { JsonFormatter } from '../pages/JsonFormatter';
import { Toaster } from '../components/ui/sonner';

export default function App() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-black">
      <Navigation />
      <JsonFormatter />
      <Toaster theme="dark" />
    </div>
  );
}