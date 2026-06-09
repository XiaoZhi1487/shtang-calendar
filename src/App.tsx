import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { CalendarPage } from './pages/CalendarPage';
import { AccountBookPage } from './pages/AccountBookPage';
import { ProfitPage } from './pages/ProfitPage';
import { MyPage } from './pages/MyPage';

function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/account" element={<AccountBookPage />} />
          <Route path="/profit" element={<ProfitPage />} />
          <Route path="/my" element={<MyPage />} />
        </Routes>
        <Navbar />
      </div>
    </BrowserRouter>
  );
}

export default App;
