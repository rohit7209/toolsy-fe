import { Routes, Route, Navigate } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { JsonFormatter } from '../pages/JsonFormatter';
import { ComingSoon } from '../pages/ComingSoon';
import { NotFound } from '../pages/NotFound';
import { Toaster } from '../components/ui/sonner';

export default function App() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-black">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Navigate to="/json-formatter" replace />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/sql-formatter" element={<ComingSoon />} />
          <Route path="/time-converter" element={<ComingSoon />} />
          <Route path="/hash-generator" element={<ComingSoon />} />
          <Route path="/timestamp-converter" element={<ComingSoon />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      <Toaster theme="dark" />
    </div>
  );
}