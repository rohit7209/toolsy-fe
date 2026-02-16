import { Routes, Route } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Landing } from '../pages/Landing';
import { JsonFormatter } from '../pages/JsonFormatter';
import { ComingSoon } from '../pages/ComingSoon';
import { Toaster } from '../components/ui/sonner';

export default function App() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-black">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/sql-formatter" element={<ComingSoon />} />
          <Route path="/time-converter" element={<ComingSoon />} />
          <Route path="/hash-generator" element={<ComingSoon />} />
          <Route path="/timestamp-converter" element={<ComingSoon />} />
        </Routes>
      </main>
      <Toaster theme="dark" />
    </div>
  );
}