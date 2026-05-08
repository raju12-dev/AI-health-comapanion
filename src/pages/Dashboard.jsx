import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Activity, 
  Heart, 
  Clock, 
  Calendar, 
  MessageSquare, 
  Bell, 
  User, 
  ChevronRight, 
  Plus,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');

  const healthMetrics = [
    { label: 'Heart Rate', value: '72', unit: 'bpm', icon: Heart, color: 'text-red-500', bg: 'bg-red-50' },
    { label: 'Blood Pressure', value: '120/80', unit: 'mmHg', icon: Activity, color: 'text-blue-500', bg: 'bg-blue-50' },
    { label: 'Sleep', value: '7.5', unit: 'hrs', icon: Clock, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  const medications = [
    { name: 'Lisinopril', dosage: '10mg', time: '08:00 AM', taken: true },
    { name: 'Metformin', dosage: '500mg', time: '12:30 PM', taken: false },
    { name: 'Atorvastatin', dosage: '20mg', time: '08:00 PM', taken: false },
  ];

  const upcomingAppointments = [
    { doctor: 'Dr. Sarah Smith', specialty: 'Cardiologist', date: 'May 12, 2026', time: '10:30 AM' },
  ];

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-12">
      {/* Top Navigation Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center">
              <div className="bg-blue-600 p-2 rounded-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <span className="ml-3 text-2xl font-bold text-slate-900">AI Health</span>
            </div>
            <div className="flex items-center space-x-4">
              <button className="p-2 text-slate-400 hover:text-blue-600 transition-colors relative">
                <Bell className="h-8 w-8" />
                <span className="absolute top-2 right-2 block h-3 w-3 rounded-full bg-red-500 ring-2 ring-white"></span>
              </button>
              <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center border-2 border-blue-200">
                <User className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">
        {/* Welcome Header */}
        <motion.div 
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-extrabold text-slate-900">Good Morning, John</h1>
          <p className="text-xl text-slate-600 mt-2">Here is your health summary for today.</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Metrics & Medications */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Health Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {healthMetrics.map((metric, index) => (
                <motion.div
                  key={metric.label}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow"
                >
                  <div className={`${metric.bg} ${metric.color} p-3 rounded-2xl w-fit mb-4`}>
                    <metric.icon className="h-8 w-8" />
                  </div>
                  <p className="text-lg font-medium text-slate-500">{metric.label}</p>
                  <div className="flex items-baseline mt-1">
                    <span className="text-4xl font-bold text-slate-900">{metric.value}</span>
                    <span className="ml-2 text-lg text-slate-500">{metric.unit}</span>
                  </div>
                </motion.div>
              ))}
            </div>

            {/* Medication Reminders */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden"
            >
              <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                <h2 className="text-2xl font-bold text-slate-900 flex items-center">
                  <Clock className="mr-3 h-7 w-7 text-blue-600" />
                  Medications
                </h2>
                <button className="text-blue-600 font-bold text-lg hover:underline flex items-center">
                  <Plus className="mr-1 h-5 w-5" /> Add New
                </button>
              </div>
              <div className="divide-y divide-slate-100">
                {medications.map((med) => (
                  <div key={med.name} className="p-6 flex items-center justify-between hover:bg-slate-50 transition-colors">
                    <div className="flex items-center">
                      <div className={`p-3 rounded-full ${med.taken ? 'bg-green-100 text-green-600' : 'bg-amber-100 text-amber-600'}`}>
                        {med.taken ? <CheckCircle2 className="h-7 w-7" /> : <AlertCircle className="h-7 w-7" />}
                      </div>
                      <div className="ml-4">
                        <p className="text-xl font-bold text-slate-900">{med.name}</p>
                        <p className="text-lg text-slate-500">{med.dosage} • {med.time}</p>
                      </div>
                    </div>
                    <button className={`px-6 py-2 rounded-xl font-bold text-lg transition-all ${
                      med.taken 
                      ? 'bg-slate-100 text-slate-400 cursor-default' 
                      : 'bg-blue-600 text-white hover:bg-blue-700 shadow-md active:scale-95'
                    }`}>
                      {med.taken ? 'Taken' : 'Mark as Taken'}
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>

          {/* Right Column: AI Assistant & Appointments */}
          <div className="space-y-8">
            
            {/* AI Assistant Quick Chat */}
            <motion.div 
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-blue-600 rounded-3xl shadow-xl p-6 text-white relative overflow-hidden"
            >
              <div className="relative z-10">
                <div className="bg-white/20 p-3 rounded-2xl w-fit mb-4">
                  <MessageSquare className="h-8 w-8 text-white" />
                </div>
                <h2 className="text-2xl font-bold mb-2">AI Health Assistant</h2>
                <p className="text-blue-100 text-lg mb-6">
                  "I noticed your heart rate was slightly higher this morning. Would you like to do a quick breathing exercise?"
                </p>
                <button className="w-full bg-white text-blue-600 py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-blue-50 transition-colors flex items-center justify-center">
                  Chat with Assistant
                  <ChevronRight className="ml-2 h-6 w-6" />
                </button>
              </div>
              {/* Decorative background circle */}
              <div className="absolute -bottom-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl"></div>
            </motion.div>

            {/* Upcoming Appointments */}
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-3xl shadow-sm border border-slate-100 p-6"
            >
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center">
                <Calendar className="mr-3 h-7 w-7 text-blue-600" />
                Appointments
              </h2>
              {upcomingAppointments.map((appt) => (
                <div key={appt.doctor} className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                  <p className="text-xl font-bold text-slate-900">{appt.doctor}</p>
                  <p className="text-lg text-blue-600 font-medium">{appt.specialty}</p>
                  <div className="mt-4 flex items-center text-slate-500 text-lg">
                    <Calendar className="h-5 w-5 mr-2" />
                    {appt.date}
                  </div>
                  <div className="mt-1 flex items-center text-slate-500 text-lg">
                    <Clock className="h-5 w-5 mr-2" />
                    {appt.time}
                  </div>
                  <button className="w-full mt-6 py-3 border-2 border-blue-600 text-blue-600 rounded-xl font-bold text-lg hover:bg-blue-50 transition-colors">
                    View Details
                  </button>
                </div>
              ))}
            </motion.div>

          </div>
        </div>
      </main>

      {/* Bottom Mobile Navigation (Optional but good for accessibility) */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-4 flex justify-between items-center z-20">
        <button className="flex flex-col items-center text-blue-600">
          <Activity className="h-7 w-7" />
          <span className="text-xs mt-1 font-bold">Home</span>
        </button>
        <button className="flex flex-col items-center text-slate-400">
          <MessageSquare className="h-7 w-7" />
          <span className="text-xs mt-1 font-bold">Chat</span>
        </button>
        <button className="flex flex-col items-center text-slate-400">
          <Calendar className="h-7 w-7" />
          <span className="text-xs mt-1 font-bold">Schedule</span>
        </button>
        <button className="flex flex-col items-center text-slate-400">
          <User className="h-7 w-7" />
          <span className="text-xs mt-1 font-bold">Profile</span>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
