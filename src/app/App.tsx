import { Routes, Route } from 'react-router-dom';
import { Navigation } from '../components/Navigation';
import { Landing } from '../pages/Landing';
import { JsonFormatter } from '../pages/JsonFormatter';
import { SqlFormatter } from '../pages/SqlFormatter';
import { TimeConverter } from '../pages/TimeConverter';
import { HashGenerator } from '../pages/HashGenerator';
import { TimestampConverter } from '../pages/TimestampConverter';
import { Toaster } from '../components/ui/sonner';

export default function App() {
  return (
    <div className="min-h-screen w-full flex flex-col bg-black">
      <Navigation />
      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/json-formatter" element={<JsonFormatter />} />
          <Route path="/sql-formatter" element={<SqlFormatter />} />
          <Route path="/time-converter" element={<TimeConverter />} />
          <Route path="/hash-generator" element={<HashGenerator />} />
          <Route path="/timestamp-converter" element={<TimestampConverter />} />
        </Routes>
      </main>
      <Toaster theme="dark" />
    </div>
  );
}