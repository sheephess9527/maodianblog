import React, { useState, useCallback } from 'react';
import { AppFeature } from './types';
import MeetingAssistant from './components/MeetingAssistant';
import ImageAnalyzer from './components/ImageAnalyzer';
import QuickChat from './components/QuickChat';
import { BrainCircuitIcon, MicIcon, ImageIcon, ZapIcon, GithubIcon } from './components/Icons';

const App: React.FC = () => {
  const [activeFeature, setActiveFeature] = useState<AppFeature>(AppFeature.MeetingAssistant);

  const renderFeature = useCallback(() => {
    switch (activeFeature) {
      case AppFeature.MeetingAssistant:
        return <MeetingAssistant />;
      case AppFeature.ImageAnalyzer:
        return <ImageAnalyzer />;
      case AppFeature.QuickChat:
        return <QuickChat />;
      default:
        return null;
    }
  }, [activeFeature]);

  const NavItem: React.FC<{
    feature: AppFeature;
    icon: React.ReactNode;
    label: string;
  }> = ({ feature, icon, label }) => (
    <button
      onClick={() => setActiveFeature(feature)}
      className={`flex items-center space-x-3 px-4 py-3 rounded-lg w-full text-left transition-colors duration-200 ${
        activeFeature === feature
          ? 'bg-blue-600 text-white shadow-lg'
          : 'hover:bg-gray-700 text-gray-300'
      }`}
    >
      {icon}
      <span className="font-medium">{label}</span>
    </button>
  );

  return (
    <div className="flex flex-col md:flex-row h-screen bg-gray-900 text-gray-100">
      <aside className="w-full md:w-64 bg-gray-800 p-4 border-b md:border-b-0 md:border-r border-gray-700 flex flex-col">
        <div className="flex items-center space-x-3 mb-8 px-2">
          <BrainCircuitIcon className="w-8 h-8 text-blue-400" />
          <h1 className="text-xl font-bold text-white">会议助手 Pro</h1>
        </div>
        <nav className="flex-grow space-y-2">
          <NavItem feature={AppFeature.MeetingAssistant} icon={<MicIcon className="w-5 h-5" />} label="会议助手" />
          <NavItem feature={AppFeature.ImageAnalyzer} icon={<ImageIcon className="w-5 h-5" />} label="图像分析" />
          <NavItem feature={AppFeature.QuickChat} icon={<ZapIcon className="w-5 h-5" />} label="快速问答" />
        </nav>
        <div className="mt-auto pt-4 border-t border-gray-700">
          <a
            href="https://github.com/google/generative-ai-docs/tree/main/site/en/gemini-api/docs/get-started/tutorial_audio"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center space-x-2 text-gray-400 hover:text-white transition-colors"
          >
            <GithubIcon className="w-5 h-5" />
            <span className="text-sm">在 GitHub 上查看</span>
          </a>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-4 md:p-8">
        {renderFeature()}
      </main>
    </div>
  );
};

export default App;