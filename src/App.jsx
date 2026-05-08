import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HeartPulse, 
  Activity, 
  Camera, 
  FileText, 
  Send, 
  Mic, 
  Settings, 
  User, 
  Plus,
  Pill,
  Apple,
  Bot,
  Paperclip,
  X,
  Image as ImageIcon
} from 'lucide-react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';


const MOCK_LABS = [
  { name: 'HbA1c', value: '6.2%', status: 'warning' },
  { name: 'Blood Pressure', value: '118/76', status: 'normal' },
  { name: 'LDL Chol', value: '110 mg/dL', status: 'normal' }
];

export default function App() {
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "Hello! I'm your AI Health Companion. How are you feeling today? Remember it's time for your evening medication." }
  ]);
  const [input, setInput] = useState('');
  const [activeTab, setActiveTab] = useState('chat'); // chat, diet, med, reports
  const [attachment, setAttachment] = useState(null);
  const [attachmentPreview, setAttachmentPreview] = useState(null);
  const fileInputRef = useRef(null);
  const chatEndRef = useRef(null);

  // Diet Filter AI State
  const [dietAnalysisResult, setDietAnalysisResult] = useState(null);
  const [isDietLoading, setIsDietLoading] = useState(false);
  const dietFileInputRef = useRef(null);
  const [dietImagePreview, setDietImagePreview] = useState(null);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [isLoading, setIsLoading] = useState(false);

  const handleDietAnalyze = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setDietImagePreview(reader.result);
    reader.readAsDataURL(file);

    setIsDietLoading(true);
    setDietAnalysisResult(null);

    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) throw new Error("API Key is missing. Please add it to .env");

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      const imagePart = await fileToGenerativePart(file);

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          imagePart,
          { text: "You are Mr. Doctor, an expert and friendly AI physician. Analyze this meal. The patient has HbA1c 6.2% (warning) and LDL Chol 110 mg/dL. Tell them if it's safe to eat, provide a structured breakdown with short bullet points, and suggest a better alternative if needed. Use relevant emojis (🥗, ⚠️, etc) to make it attractive." }
        ]
      });

      setDietAnalysisResult(response.text);
    } catch (err) {
      console.error(err);
      setDietAnalysisResult("Error analyzing the meal. Please try again.");
    } finally {
      setIsDietLoading(false);
      if (dietFileInputRef.current) dietFileInputRef.current.value = '';
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAttachment(file);
      const reader = new FileReader();
      reader.onloadend = () => setAttachmentPreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const removeAttachment = () => {
    setAttachment(null);
    setAttachmentPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const fileToGenerativePart = async (file) => {
    const base64EncodedDataPromise = new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.readAsDataURL(file);
    });
    return {
      inlineData: { data: await base64EncodedDataPromise, mimeType: file.type },
    };
  };

  const handleSend = async () => {
    if (!input.trim() && !attachment) return;
    
    const userMsg = { role: 'user', content: input, image: attachmentPreview };
    setMessages(prev => [...prev, userMsg]);
    
    const currentInput = input;
    const currentAttachment = attachment;
    
    setInput('');
    removeAttachment();
    setIsLoading(true);
    
    try {
      const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key is missing. Please add it to your .env file.");
      }

      const { GoogleGenAI } = await import('@google/genai');
      const ai = new GoogleGenAI({ apiKey });
      
      const modelsToTry = ['gemini-2.0-flash', 'gemini-2.5-flash-lite', 'gemini-2.5-flash'];
      let aiText = "I'm sorry, I couldn't process that.";
      
      let contents = [];
      if (currentAttachment) {
        const imagePart = await fileToGenerativePart(currentAttachment);
        contents = [
          imagePart,
          { text: `You are Mr. Doctor, an expert AI physician. The patient says: "${currentInput}". Analyze any attached medical reports or images carefully. Provide a highly structured response using bullet points and relevant emojis. Keep it visually attractive.` }
        ];
      } else {
        contents = `You are Mr. Doctor, an expert, friendly AI physician. 
                   The patient asks: "${currentInput}". 
                   Provide a highly structured response using bullet points or short clear sections. 
                   ALWAYS use medical emojis (🩺, 💊, ⚕️, etc) to make it attractive. Do not use giant blocks of text.`;
      }

      for (const modelName of modelsToTry) {
        try {
          const response = await ai.models.generateContent({
            model: modelName,
            contents: contents
          });
          aiText = response.text;
          break; // Exit loop if successful
        } catch (modelError) {
          console.warn(`Model ${modelName} failed:`, modelError);
          // If it's the last model, we will throw to catch block below
          if (modelName === modelsToTry[modelsToTry.length - 1]) {
            throw modelError;
          }
        }
      }

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: aiText
      }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Error: ${err.message}` 
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar */}
      <motion.aside 
        initial={{ x: -250 }}
        animate={{ x: 0 }}
        className="w-64 bg-white border-r border-slate-200 flex flex-col justify-between hidden md:flex z-10 shadow-sm"
      >
        <div className="p-6">
          <div className="flex items-center gap-3 text-primary-600 mb-10">
            <div className="bg-primary-50 p-2 rounded-xl">
              <HeartPulse size={28} className="text-primary-600" />
            </div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-500">
              CareSync AI
            </h1>
          </div>
          
          <nav className="space-y-2">
            <SidebarItem icon={<Bot />} label="AI Companion" active={activeTab === 'chat'} onClick={() => setActiveTab('chat')} />
            <SidebarItem icon={<Pill />} label="Med-Explain" active={activeTab === 'med'} onClick={() => setActiveTab('med')} />
            <SidebarItem icon={<Apple />} label="Diet Filter" active={activeTab === 'diet'} onClick={() => setActiveTab('diet')} />
            <SidebarItem icon={<FileText />} label="MD Reports" active={activeTab === 'reports'} onClick={() => setActiveTab('reports')} />
          </nav>
        </div>

        <div className="p-6">
          <div className="bg-gradient-to-br from-primary-50 to-primary-100 p-4 rounded-2xl border border-primary-200 mb-4">
            <h4 className="text-sm font-semibold text-primary-900 mb-1">Weekly Goal</h4>
            <p className="text-xs text-primary-700">7/10 meds taken on time. Keep it up!</p>
            <div className="w-full bg-primary-200 rounded-full h-1.5 mt-2">
              <div className="bg-primary-600 h-1.5 rounded-full" style={{ width: '70%' }}></div>
            </div>
          </div>
          <button className="flex items-center gap-3 text-slate-500 hover:text-slate-800 transition-colors w-full px-4 py-2 rounded-xl hover:bg-slate-50">
            <Settings size={20} />
            <span className="font-medium">Settings</span>
          </button>
        </div>
      </motion.aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative overflow-hidden bg-slate-50/50">
        
        {/* Header */}
        <header className="h-20 glass flex items-center justify-between px-8 z-10 border-b border-slate-200/50 sticky top-0">
          <div>
            <h2 className="text-2xl font-bold text-slate-800">
              {activeTab === 'chat' && 'Dashboard & Chat'}
              {activeTab === 'med' && 'Med-Explain'}
              {activeTab === 'diet' && 'Diet Filter AI'}
              {activeTab === 'reports' && 'Monthly Insights'}
            </h2>
            <p className="text-sm text-slate-500">Bridging the gap between visits and 24/7 care.</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2.5 bg-white rounded-full shadow-sm hover:shadow-md transition-all border border-slate-100">
              <Activity size={20} className="text-slate-600" />
            </button>
            <div className="flex items-center gap-3 bg-white pl-2 pr-4 py-1.5 rounded-full shadow-sm border border-slate-100 cursor-pointer hover:shadow-md transition-all">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-secondary-400 to-primary-500 flex items-center justify-center text-white font-bold text-sm shadow-inner">
                JD
              </div>
              <span className="font-medium text-sm">John Doe</span>
            </div>
          </div>
        </header>

        {/* Dynamic View */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8">
          <AnimatePresence mode="wait">
            {activeTab === 'chat' && (
              <motion.div 
                key="chat"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="max-w-4xl mx-auto h-full flex flex-col gap-6"
              >
                {/* Chat Interface */}
                <div className="flex-1 glass rounded-3xl shadow-sm border border-slate-200/60 flex flex-col overflow-hidden">
                  <div className="flex-1 overflow-y-auto p-6 space-y-6">
                    {messages.map((msg, i) => (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={i} 
                        className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}
                      >
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-gradient-to-br from-primary-500 to-primary-600' : 'bg-white border border-slate-100'}`}>
                          {msg.role === 'user' ? <User size={20} className="text-white" /> : <HeartPulse size={24} className="text-secondary-500" />}
                        </div>
                        <div className={`max-w-[75%] p-4 rounded-2xl text-[15px] leading-relaxed shadow-sm flex flex-col gap-3 ${
                          msg.role === 'user' 
                            ? 'bg-primary-600 text-white rounded-tr-sm' 
                            : 'bg-white text-slate-700 border border-slate-100 rounded-tl-sm'
                        }`}>
                          {msg.image && (
                            <img src={msg.image} alt="User upload" className="rounded-xl max-w-full h-auto max-h-60 object-cover shadow-sm" />
                          )}
                          {msg.content && (
                            msg.role === 'user' ? (
                              <div className="whitespace-pre-wrap">{msg.content}</div>
                            ) : (
                              <div 
                                className="prose prose-sm prose-slate max-w-none marker:text-slate-400 prose-p:leading-relaxed prose-headings:font-bold prose-a:text-primary-600"
                                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(msg.content)) }}
                              />
                            )
                          )}
                        </div>
                      </motion.div>
                    ))}
                    {isLoading && (
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex gap-4"
                      >
                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-white border border-slate-100">
                          <HeartPulse size={24} className="text-secondary-500 animate-pulse" />
                        </div>
                        <div className="p-4 rounded-2xl text-[15px] bg-white text-slate-700 border border-slate-100 rounded-tl-sm shadow-sm flex items-center gap-2">
                          <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                      </motion.div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  
                  {/* Chat Input */}
                  <div className="p-4 bg-white border-t border-slate-100 flex flex-col gap-3">
                    <AnimatePresence>
                      {attachmentPreview && (
                        <motion.div 
                          initial={{ opacity: 0, y: 10, height: 0 }}
                          animate={{ opacity: 1, y: 0, height: 'auto' }}
                          exit={{ opacity: 0, y: 10, height: 0 }}
                          className="relative self-start"
                        >
                          <div className="relative inline-block border border-slate-200 p-1 rounded-xl bg-slate-50">
                            <img src={attachmentPreview} alt="Preview" className="h-20 w-auto rounded-lg object-cover shadow-sm" />
                            <button 
                              onClick={removeAttachment}
                              className="absolute -top-2 -right-2 bg-rose-500 text-white rounded-full p-1 shadow-md hover:bg-rose-600 transition-colors"
                            >
                              <X size={14} />
                            </button>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                    
                    <div className="relative flex items-center">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                      <button 
                        onClick={() => fileInputRef.current?.click()}
                        className="absolute left-4 text-slate-400 hover:text-primary-500 transition-colors"
                        title="Attach image"
                      >
                        <Paperclip size={22} />
                      </button>
                      <input 
                        type="text" 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && !isLoading && handleSend()}
                        placeholder="Ask about your meds, attach a scan, or what to eat..."
                        className="w-full bg-slate-50 border border-slate-200 rounded-full py-4 pl-12 pr-16 focus:outline-none focus:border-primary-400 focus:ring-2 focus:ring-primary-100 transition-all text-slate-700 disabled:opacity-50"
                        disabled={isLoading}
                      />
                      <button 
                        onClick={handleSend}
                        className="absolute right-2 p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-sm disabled:opacity-50 disabled:hover:bg-primary-600"
                        disabled={(!input.trim() && !attachment) || isLoading}
                      >
                        <Send size={18} className="ml-0.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'diet' && (
              <motion.div 
                key="diet"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="max-w-5xl mx-auto space-y-8"
              >
                <div className="glass p-8 rounded-3xl text-center space-y-4">
                  <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 overflow-hidden">
                    {dietImagePreview ? (
                      <img src={dietImagePreview} alt="Meal" className="w-full h-full object-cover" />
                    ) : (
                      <Camera size={32} className="text-secondary-600" />
                    )}
                  </div>
                  <h3 className="text-2xl font-bold">Diet Filter AI</h3>
                  <p className="text-slate-500 max-w-xl mx-auto">
                    Take a picture of your meal. Our AI vision model will analyze the ingredients and compare it against your real-time lab results to ensure it's safe for your current condition.
                  </p>
                  <input type="file" ref={dietFileInputRef} onChange={handleDietAnalyze} accept="image/*" className="hidden" />
                  <button 
                    onClick={() => dietFileInputRef.current?.click()}
                    disabled={isDietLoading}
                    className="mt-6 px-8 py-3 bg-gradient-to-r from-primary-600 to-secondary-500 text-white font-semibold rounded-full shadow-lg shadow-primary-500/30 hover:scale-105 transition-all flex items-center gap-2 mx-auto disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {isDietLoading ? <Activity className="animate-spin" size={20} /> : <Camera size={20} />}
                    {isDietLoading ? 'Analyzing...' : 'Analyze Meal'}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                    <h4 className="font-semibold text-lg mb-4 flex items-center gap-2"><Activity className="text-rose-500"/> Current Lab Context</h4>
                    <ul className="space-y-4">
                      {MOCK_LABS.map((lab, i) => (
                        <li key={i} className="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                          <span className="font-medium text-slate-700">{lab.name}</span>
                          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                            lab.status === 'warning' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                          }`}>
                            {lab.value}
                          </span>
                        </li>
                      ))}
                    </ul>
                    <p className="text-sm text-slate-500 mt-4 italic">
                      AI restricts high-glycemic foods due to elevated HbA1c.
                    </p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100">
                     <h4 className="font-semibold text-lg mb-4 flex items-center gap-2"><Apple className="text-emerald-500"/> Analysis Result</h4>
                     <div className="space-y-4">
                        {isDietLoading ? (
                           <div className="p-4 bg-slate-50 rounded-xl animate-pulse flex space-x-4">
                             <div className="rounded-full bg-slate-200 h-10 w-10"></div>
                             <div className="flex-1 space-y-2 py-1">
                               <div className="h-2 bg-slate-200 rounded"></div>
                               <div className="space-y-3">
                                 <div className="grid grid-cols-3 gap-4">
                                   <div className="h-2 bg-slate-200 rounded col-span-2"></div>
                                   <div className="h-2 bg-slate-200 rounded col-span-1"></div>
                                 </div>
                                 <div className="h-2 bg-slate-200 rounded"></div>
                               </div>
                             </div>
                           </div>
                        ) : dietAnalysisResult ? (
                          <div className="p-4 border border-emerald-100 bg-emerald-50 rounded-xl">
                            <div 
                              className="prose prose-sm prose-emerald max-w-none prose-p:leading-relaxed prose-headings:font-bold"
                              dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(marked.parse(dietAnalysisResult)) }}
                            />
                          </div>
                        ) : (
                          <div className="p-4 border border-emerald-100 bg-emerald-50 rounded-xl flex gap-4">
                            <div className="w-16 h-16 bg-white rounded-lg flex items-center justify-center text-2xl shadow-sm">🥗</div>
                            <div>
                              <h5 className="font-bold text-emerald-900">Waiting for Image</h5>
                              <p className="text-sm text-emerald-700">Upload a picture of your meal to get personalized recommendations.</p>
                            </div>
                          </div>
                        )}
                     </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'med' && (
              <motion.div key="med" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex items-start gap-6">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center shrink-0">
                    <Pill size={32} className="text-blue-500" />
                  </div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-slate-800">Metformin 500mg</h3>
                      <span className="px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">Active</span>
                    </div>
                    <p className="text-slate-600 mb-4">Take 1 tablet twice daily with meals.</p>
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                      <h4 className="text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                        <HeartPulse size={16} className="text-secondary-500" /> Why this matters (AI Explained)
                      </h4>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        Think of Metformin as a traffic cop for sugar in your blood. It helps your body use insulin better and tells your liver to stop making extra sugar. Taking it with meals prevents stomach upset and works exactly when sugar is entering your body.
                      </p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'reports' && (
              <motion.div key="reports" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-6">
                <div className="glass p-8 rounded-3xl text-center space-y-4">
                  <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <FileText size={32} className="text-indigo-600" />
                  </div>
                  <h3 className="text-2xl font-bold">MD Reports</h3>
                  <p className="text-slate-500 max-w-xl mx-auto">
                    Structured monthly insights for smarter clinical decisions. We analyze your chatbot interactions, diet logs, and adherence to create a comprehensive report for your doctor.
                  </p>
                  <button className="mt-6 px-8 py-3 bg-indigo-600 text-white font-semibold rounded-full shadow-lg shadow-indigo-500/30 hover:scale-105 transition-all flex items-center gap-2 mx-auto">
                    Generate May Report
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
        active 
          ? 'bg-primary-50 text-primary-700 font-semibold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700 font-medium'
      }`}
    >
      <div className={`${active ? 'text-primary-600' : 'text-slate-400'}`}>
        {icon}
      </div>
      {label}
    </button>
  );
}

function StatCard({ title, value, trend, color, icon }) {
  const colors = {
    emerald: 'bg-emerald-50 border-emerald-100 text-emerald-700',
    primary: 'bg-primary-50 border-primary-100 text-primary-700',
    secondary: 'bg-secondary-50 border-secondary-100 text-secondary-700',
  };
  
  return (
    <div className={`p-5 rounded-3xl border shadow-sm flex flex-col justify-between h-32 ${colors[color]}`}>
      <div className="flex items-center gap-2 opacity-80 mb-2">
        {icon}
        <span className="text-sm font-semibold">{title}</span>
      </div>
      <div>
        <h3 className="text-3xl font-bold mb-1">{value}</h3>
        <p className="text-xs font-medium opacity-80">{trend}</p>
      </div>
    </div>
  );
}
