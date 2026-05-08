import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Clock, 
  Plus, 
  CheckCircle2, 
  AlertCircle, 
  ChevronRight, 
  Pill, 
  Calendar, 
  Trash2, 
  Edit2,
  X,
  Info
} from 'lucide-react';

const MedicationReminders = () => {
  const [showAddModal, setShowAddModal] = useState(false);
  const [medications, setMedications] = useState([
    { id: 1, name: 'Lisinopril', dosage: '10mg', frequency: 'Once daily', time: '08:00 AM', taken: true, instructions: 'Take with water before breakfast' },
    { id: 2, name: 'Metformin', dosage: '500mg', frequency: 'Twice daily', time: '12:30 PM', taken: false, instructions: 'Take with food' },
    { id: 3, name: 'Atorvastatin', dosage: '20mg', frequency: 'Once daily', time: '08:00 PM', taken: false, instructions: 'Take before bed' },
  ]);

  const toggleTaken = (id) => {
    setMedications(medications.map(med => 
      med.id === id ? { ...med, taken: !med.taken } : med
    ));
  };

  const deleteMedication = (id) => {
    setMedications(medications.filter(med => med.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-24">
      {/* Header Section */}
      <div className="bg-white border-b border-slate-200 pt-8 pb-6">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-extrabold text-slate-900">Medications</h1>
              <p className="text-xl text-slate-600 mt-2">Your daily schedule and reminders</p>
            </div>
            <button 
              onClick={() => setShowAddModal(true)}
              className="bg-blue-600 text-white p-4 rounded-2xl shadow-lg hover:bg-blue-700 transition-all transform active:scale-95 flex items-center"
            >
              <Plus className="h-8 w-8" />
              <span className="ml-2 text-xl font-bold hidden sm:inline">Add New</span>
            </button>
          </div>
        </div>
      </div>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 mt-8">
        {/* Today's Progress Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-blue-600 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden"
        >
          <div className="relative z-10">
            <h2 className="text-2xl font-bold mb-2">Today's Progress</h2>
            <div className="flex items-end space-x-4">
              <span className="text-6xl font-black">
                {medications.filter(m => m.taken).length}/{medications.length}
              </span>
              <span className="text-2xl font-medium mb-2 text-blue-100">doses taken</span>
            </div>
            <div className="mt-6 w-full bg-white/20 rounded-full h-4">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${(medications.filter(m => m.taken).length / medications.length) * 100}%` }}
                className="bg-white h-full rounded-full"
              />
            </div>
          </div>
          <Pill className="absolute -right-8 -bottom-8 h-48 w-48 text-white/10 rotate-12" />
        </motion.div>

        {/* Medication List */}
        <div className="space-y-6">
          <h3 className="text-2xl font-bold text-slate-800 flex items-center">
            <Clock className="mr-3 h-7 w-7 text-blue-600" />
            Daily Schedule
          </h3>
          
          <AnimatePresence>
            {medications.map((med, index) => (
              <motion.div
                key={med.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-3xl shadow-sm border-2 transition-all ${
                  med.taken ? 'border-green-100 bg-green-50/30' : 'border-slate-100'
                }`}
              >
                <div className="p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
                    <div className="flex items-start">
                      <div className={`p-4 rounded-2xl ${med.taken ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                        <Pill className="h-8 w-8" />
                      </div>
                      <div className="ml-5">
                        <div className="flex items-center">
                          <h4 className="text-2xl font-bold text-slate-900">{med.name}</h4>
                          {med.taken && (
                            <span className="ml-3 bg-green-100 text-green-700 text-sm font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                              Taken
                            </span>
                          )}
                        </div>
                        <p className="text-xl text-slate-600 font-medium mt-1">
                          {med.dosage} • {med.time}
                        </p>
                        <div className="flex items-center mt-3 text-slate-500 bg-slate-100 w-fit px-3 py-1 rounded-lg">
                          <Info className="h-5 w-5 mr-2" />
                          <span className="text-lg">{med.instructions}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <button 
                        onClick={() => toggleTaken(med.id)}
                        className={`flex-1 sm:flex-none px-8 py-4 rounded-2xl font-bold text-xl shadow-md transition-all active:scale-95 ${
                          med.taken 
                          ? 'bg-white text-green-600 border-2 border-green-200 hover:bg-green-50' 
                          : 'bg-blue-600 text-white hover:bg-blue-700'
                        }`}
                      >
                        {med.taken ? 'Undo' : 'Mark Taken'}
                      </button>
                      <button 
                        onClick={() => deleteMedication(med.id)}
                        className="p-4 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-colors"
                      >
                        <Trash2 className="h-7 w-7" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {/* Refill Reminders Section */}
        <div className="mt-12 bg-amber-50 border-2 border-amber-100 rounded-3xl p-8">
          <div className="flex items-center mb-4">
            <AlertCircle className="h-8 w-8 text-amber-600 mr-3" />
            <h3 className="text-2xl font-bold text-amber-900">Refill Reminders</h3>
          </div>
          <p className="text-xl text-amber-800 mb-6">
            You have 2 medications that will need a refill in the next 7 days.
          </p>
          <button className="bg-amber-600 text-white px-8 py-4 rounded-2xl font-bold text-xl shadow-lg hover:bg-amber-700 transition-all">
            Manage Refills
          </button>
        </div>
      </main>

      {/* Add Medication Modal (Simplified) */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAddModal(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden"
            >
              <div className="p-8">
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-3xl font-bold text-slate-900">Add Medication</h2>
                  <button onClick={() => setShowAddModal(false)} className="p-2 hover:bg-slate-100 rounded-full">
                    <X className="h-8 w-8 text-slate-400" />
                  </button>
                </div>
                
                <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
                  <div>
                    <label className="block text-xl font-bold text-slate-700 mb-2">Medication Name</label>
                    <input type="text" className="w-full p-4 border-2 border-slate-200 rounded-2xl text-xl focus:border-blue-500 outline-none" placeholder="e.g. Lisinopril" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xl font-bold text-slate-700 mb-2">Dosage</label>
                      <input type="text" className="w-full p-4 border-2 border-slate-200 rounded-2xl text-xl focus:border-blue-500 outline-none" placeholder="10mg" />
                    </div>
                    <div>
                      <label className="block text-xl font-bold text-slate-700 mb-2">Time</label>
                      <input type="time" className="w-full p-4 border-2 border-slate-200 rounded-2xl text-xl focus:border-blue-500 outline-none" />
                    </div>
                  </div>
                  <button className="w-full bg-blue-600 text-white py-5 rounded-2xl font-bold text-2xl shadow-xl hover:bg-blue-700 transition-all mt-4">
                    Save Medication
                  </button>
                </form>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MedicationReminders;
