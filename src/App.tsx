import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Navbar } from './components/Layout/Navbar';
import { CalendarPage } from './pages/CalendarPage';
import { AccountBookPage } from './pages/AccountBookPage';
import { ProfitPage } from './pages/ProfitPage';
import { MyPage } from './pages/MyPage';
import { ErrorBoundary } from './components/ErrorBoundary';
import { ToastProvider } from './components/Toast';

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <BrowserRouter>
          <div className="min-h-screen">
            <Routes>
              <Route path="/" element={<CalendarPage />} />
              <Route path="/account" element={<AccountBookPage />} />
              <Route path="/profit" element={<ProfitPage />} />
              <Route path="/my" element={<MyPage />} />
            </Routes>
            <Navbar />
          </div>
        </BrowserRouter>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;