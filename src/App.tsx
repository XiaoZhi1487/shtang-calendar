import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Navbar } from './components/Layout/Navbar';
import { CalendarPage } from './pages/CalendarPage';
import { AccountBookPage } from './pages/AccountBookPage';
import { ProfitPage } from './pages/ProfitPage';
import { MyPage } from './pages/MyPage';
import { UpdateModal } from './components/UpdateModal';
import { useUserStore } from './store/userStore';

function App() {
  const { checkUpdate } = useUserStore();
  const [showUpdate, setShowUpdate] = useState(false);
  const [updateInfo, setUpdateInfo] = useState({ version: '', releaseNote: '', downloadUrl: '' });

  useEffect(() => {
    // App 启动时检查更新
    const checkAppUpdate = async () => {
      const result = await checkUpdate();
      if (result.hasUpdate) {
        setUpdateInfo(result);
        setShowUpdate(true);
      }
    };
    
    checkAppUpdate();
  }, [checkUpdate]);

  const handleUpdate = () => {
    window.open(updateInfo.downloadUrl, '_blank');
    setShowUpdate(false);
  };

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <UpdateModal 
          isOpen={showUpdate} 
          onClose={() => setShowUpdate(false)}
          onUpdate={handleUpdate}
          version={updateInfo.version}
          releaseNote={updateInfo.releaseNote}
          downloadUrl={updateInfo.downloadUrl}
        />
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
