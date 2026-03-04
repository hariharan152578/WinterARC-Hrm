// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { EventService, EventType } from "@/services/event.service";
// import { Plus, Clock, Paperclip, Calendar as CalendarIcon, Search, X } from "lucide-react";

// export default function EventsPage() {
//   const [events, setEvents] = useState<EventType[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     date: "",
//     startTime: "",
//     endTime: "",
//     color: "#fef3c7",
//   });

//   const [files, setFiles] = useState<File[]>([]);

//   // ✅ Fetch Events
//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const data = await EventService.getEvents();
//       setEvents(data);
//     } catch (err) {
//       console.error(err);
//     } finally {
//       setLoading(false);
//     }
//   };

//   useEffect(() => {
//     fetchEvents();
//   }, []);

//   // ✅ Search Logic: Filters events based on Title, Description, or Date
//   const filteredEvents = useMemo(() => {
//     return events.filter((event) => {
//       const searchStr = searchTerm.toLowerCase();
//       return (
//         event.title?.toLowerCase().includes(searchStr) ||
//         event.description?.toLowerCase().includes(searchStr) ||
//         event.date?.includes(searchTerm)
//       );
//     });
//   }, [events, searchTerm]);

//   // ✅ Search Suggestions (Top 5 matches)
//   const suggestions = useMemo(() => {
//     if (!searchTerm) return [];
//     return filteredEvents.slice(0, 5);
//   }, [filteredEvents, searchTerm]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     if (e.target.files) {
//       setFiles(Array.from(e.target.files));
//     }
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await EventService.createEvent({ ...form, files });
//       setForm({ title: "", description: "", date: "", startTime: "", endTime: "", color: "#fef3c7" });
//       setFiles([]);
//       fetchEvents();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   return (
//     <div className="min-h-screen bg-[#f8faf9] p-4 md:p-10 text-slate-800">
//       <div className="max-w-7xl mx-auto space-y-8">
        
//         {/* HEADER SECTION */}
//         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
//           <div>
//             <h1 className="text-3xl font-bold tracking-tight">Event Planner</h1>
//             <p className="text-slate-500">Manage your weekly schedule and team syncs</p>
//           </div>
//           <div className="flex items-center gap-3">
//             <div className="bg-white p-1 rounded-full shadow-sm flex border border-slate-100">
//               {['Daily', 'Weekly', 'Monthly'].map((view) => (
//                 <button 
//                   key={view} 
//                   className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'Weekly' ? 'bg-slate-100 shadow-inner text-slate-900' : 'text-slate-400'}`}
//                 >
//                   {view}
//                 </button>
//               ))}
//             </div>
//           </div>
//         </div>

//         <div className="grid grid-cols-12 gap-8">
          
//           {/* ================= LEFT COLUMN ================= */}
//           <div className="col-span-12 lg:col-span-4 space-y-6">
            
//             {/* SEARCH & SUGGESTIONS CARD */}
//             <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative">
//               <div className="flex items-center justify-between mb-4">
//                 <h3 className="font-bold flex items-center gap-2 text-slate-900">
//                   <Search size={18} className="text-teal-600" /> Quick Search
//                 </h3>
//               </div>
              
//               <div className="relative">
//                 <input
//                   type="text"
//                   placeholder="Search title, details, or date..."
//                   value={searchTerm}
//                   onChange={(e) => setSearchTerm(e.target.value)}
//                   className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all text-sm"
//                 />
//                 {searchTerm && (
//                   <button 
//                     onClick={() => setSearchTerm("")}
//                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
//                   >
//                     <X size={16} />
//                   </button>
//                 )}
//               </div>

//               {/* Suggestions Dropdown */}
//               {searchTerm && suggestions.length > 0 && (
//                 <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
//                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Suggestions</p>
//                   {suggestions.map((s) => (
//                     <div 
//                       key={s.id} 
//                       onClick={() => setSearchTerm(s.title)}
//                       className="p-3 bg-slate-50 rounded-xl hover:bg-teal-50 cursor-pointer transition-colors border border-transparent hover:border-teal-100"
//                     >
//                       <p className="text-sm font-bold text-slate-800 truncate">{s.title}</p>
//                       <p className="text-[10px] text-slate-500">{s.date} • {s.startTime}</p>
//                     </div>
//                   ))}
//                 </div>
//               )}
//             </section>

//             {/* CREATE FORM CARD */}
//             <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
//               <div className="flex items-center gap-2 mb-6 text-teal-600">
//                 <CalendarIcon size={20} />
//                 <h2 className="text-xl font-bold text-slate-900">New Event</h2>
//               </div>
              
//               <form onSubmit={handleSubmit} className="space-y-4">
//                 <input
//                   name="title"
//                   placeholder="Title"
//                   value={form.title}
//                   onChange={handleChange}
//                   className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-teal-500"
//                   required
//                 />
//                 <textarea
//                   name="description"
//                   placeholder="Description"
//                   value={form.description}
//                   onChange={handleChange}
//                   rows={2}
//                   className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-teal-500 resize-none"
//                 />
//                 <div className="grid grid-cols-2 gap-4">
//                   <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full bg-slate-50 border-none p-3.5 rounded-2xl text-xs" required />
//                   <input type="color" name="color" value={form.color} onChange={handleChange} className="w-full h-[48px] bg-slate-50 border-none p-1 rounded-2xl" />
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full bg-slate-50 border-none p-3.5 rounded-2xl text-xs" required />
//                   <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full bg-slate-50 border-none p-3.5 rounded-2xl text-xs" required />
//                 </div>
//                 <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-2xl shadow-md transition-all active:scale-95">
//                   <Plus size={20} className="inline mr-1" /> Create Event
//                 </button>
//               </form>
//             </section>
//           </div>

//           {/* ================= RIGHT COLUMN: EVENT LIST ================= */}
//           <div className="col-span-12 lg:col-span-8">
//             <div className="flex items-center justify-between mb-6">
//               <h2 className="text-xl font-bold">
//                 {searchTerm ? `Results for "${searchTerm}"` : "Upcoming Schedule"}
//               </h2>
//               <span className="text-sm font-medium text-slate-400 bg-white px-3 py-1 rounded-full border">
//                 {filteredEvents.length} Events
//               </span>
//             </div>

//             {loading ? (
//               <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
//             ) : (
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 {filteredEvents.map((event) => (
//                   <div
//                     key={event.id}
//                     className="group p-6 rounded-[2rem] shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
//                     style={{ 
//                       backgroundColor: event.color || "#e0f2fe",
//                       borderLeft: `10px solid rgba(0,0,0,0.05)` 
//                     }}
//                   >
//                     <div className="mb-4">
//                       <h3 className="font-bold text-lg text-slate-900 leading-tight">{event.title}</h3>
//                       <div className="flex items-center gap-1.5 mt-1 text-slate-600 font-medium text-xs">
//                         <Clock size={14} />
//                         <span>{event.startTime} - {event.endTime}</span>
//                         <span className="mx-1">•</span>
//                         <span>{event.date}</span>
//                       </div>
//                     </div>
//                     <p className="text-sm text-slate-600/80 line-clamp-2 mb-6">{event.description}</p>
//                     <div className="flex items-center justify-between pt-4 border-t border-black/5">
//                       <div className="flex -space-x-2">
//                         {[1, 2].map(i => <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-white shadow-sm" />)}
//                       </div>
//                       {event.files?.length > 0 && (
//                         <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase">
//                           <Paperclip size={12} /> {event.files.length} Files
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 ))}
//                 {filteredEvents.length === 0 && (
//                   <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400">
//                     No matches found for your search.
//                   </div>
//                 )}
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }

"use client";

import { useEffect, useState, useMemo } from "react";
import { EventService, EventType } from "@/services/event.service";
import { 
  Plus, Clock, Paperclip, Calendar as CalendarIcon, 
  Search, X, ChevronLeft, ChevronRight, 
  MoreVertical, CalendarDays, Info, AlignLeft
} from "lucide-react";

export default function EventsPage() {
  // --- BACKEND STATES ---
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  
  const [form, setForm] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "",
    endTime: "",
    color: "#6366f1",
  });

  // --- UI STATES ---
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

  // --- BACKEND LOGIC ---
  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await EventService.getEvents();
      setEvents(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await EventService.createEvent({ ...form, files });
      // Reset form including description
      setForm({ 
        title: "", 
        description: "", 
        date: new Date().toISOString().split('T')[0], 
        startTime: "", 
        endTime: "", 
        color: "#6366f1" 
      });
      setFiles([]);
      fetchEvents();
    } catch (err) {
      console.error(err);
    }
  };

  // --- FILTERING LOGIC ---
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const eventDateStr = event.date;
      const eventDate = new Date(event.date);
      const now = new Date();
      const todayStr = now.toISOString().split('T')[0];

      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = 
        event.title?.toLowerCase().includes(searchStr) || 
        event.description?.toLowerCase().includes(searchStr);
      
      if (!matchesSearch) return false;
      if (selectedDate && eventDateStr !== selectedDate) return false;

      if (timeFilter === "today") return eventDateStr === todayStr;
      if (timeFilter === "week") {
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
        return eventDate >= startOfWeek && eventDate <= endOfWeek;
      }
      if (timeFilter === "month") {
        return eventDate.getMonth() === new Date().getMonth() && 
               eventDate.getFullYear() === new Date().getFullYear();
      }

      return true;
    });
  }, [events, searchTerm, selectedDate, timeFilter]);

  // --- CALENDAR HELPERS ---
  const daysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const days = [];
    const totalDays = daysInMonth(year, month);
    const offset = firstDayOfMonth(year, month);
    for (let i = 0; i < offset; i++) days.push(null);
    for (let i = 1; i <= totalDays; i++) days.push(i);
    return days;
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-[#f3f4f6] text-slate-900 p-4 lg:p-8">
      
      {/* 1. EVENT DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="h-24 w-full" style={{ backgroundColor: selectedEvent.color || '#6366f1' }} />
            <div className="p-8 -mt-10 bg-white rounded-t-[2.5rem] relative">
              <button onClick={() => setSelectedEvent(null)} className="absolute -top-12 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><X size={20} /></button>
              
              <div className="mb-6">
                <h2 className="text-3xl font-black text-slate-900">{selectedEvent.title}</h2>
                <div className="flex items-center gap-2 mt-2 text-indigo-600 font-bold"><CalendarIcon size={16}/> {selectedEvent.date}</div>
              </div>

              <div className="space-y-6">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Description</label>
                  <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">{selectedEvent.description || "No description provided."}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</p>
                    <p className="text-sm font-bold">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
                  </div>
                  <div className="p-4 bg-slate-50 rounded-2xl">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Attachments</p>
                    <p className="text-sm font-bold">{selectedEvent.files?.length || 0} Files</p>
                  </div>
                </div>
              </div>
              <button onClick={() => setSelectedEvent(null)} className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all">Close Details</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto grid grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: CALENDAR & FORM --- */}
        <aside className="col-span-12 lg:col-span-4 space-y-8">
          <div className="flex items-center gap-3 px-2">
            <div className="bg-indigo-600 p-2.5 rounded-2xl shadow-lg shadow-indigo-200"><CalendarDays className="text-white" size={24} /></div>
            <h1 className="text-2xl font-black tracking-tight">Evently</h1>
          </div>

          {/* MINI CALENDAR */}
          <div className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200/60">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
              <div className="flex gap-1">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronLeft size={18}/></button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2 hover:bg-slate-100 rounded-xl"><ChevronRight size={18}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 text-center mb-2">
              {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] font-bold text-slate-300 uppercase">{d}</span>)}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {calendarDays.map((day, i) => {
                const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                const isSelected = selectedDate === dateStr;
                const hasEvent = day && events.some(e => e.date === dateStr);
                return (
                  <div key={i} onClick={() => day && setSelectedDate(isSelected ? null : dateStr)}
                    className={`h-10 flex items-center justify-center rounded-xl text-sm font-semibold transition-all relative cursor-pointer
                      ${day ? 'hover:bg-indigo-50' : 'opacity-0'}
                      ${isSelected ? 'bg-indigo-600 !text-white shadow-md' : 'text-slate-600'}`}>
                    {day}
                    {hasEvent && !isSelected && <span className="absolute bottom-1.5 w-1 h-1 bg-indigo-400 rounded-full" />}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ADD FORM (Description Included) */}
          <div className="bg-slate-900 p-8 rounded-[2.5rem] shadow-xl">
            <h3 className="text-white font-bold mb-6 flex items-center gap-2"><Plus size={18} className="text-indigo-400" /> New Event</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="title" placeholder="Event Title" value={form.title} onChange={handleChange} required className="w-full bg-slate-800 border-none p-4 rounded-2xl text-white text-sm" />
              
              <div className="relative">
                <AlignLeft className="absolute left-4 top-4 text-slate-500" size={16} />
                <textarea 
                  name="description" 
                  placeholder="Event Description..." 
                  value={form.description} 
                  onChange={handleChange} 
                  rows={3}
                  className="w-full bg-slate-800 border-none pl-12 pr-4 py-4 rounded-2xl text-white text-sm focus:ring-2 focus:ring-indigo-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <input type="date" name="date" value={form.date} onChange={handleChange} className="bg-slate-800 border-none p-4 rounded-2xl text-white text-xs" required />
                <input type="color" name="color" value={form.color} onChange={handleChange} className="w-full h-[52px] bg-slate-800 border-none p-1 rounded-2xl cursor-pointer" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="bg-slate-800 border-none p-4 rounded-2xl text-white text-xs" required />
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="bg-slate-800 border-none p-4 rounded-2xl text-white text-xs" required />
              </div>
              <button type="submit" className="w-full bg-indigo-500 text-white font-bold py-4 rounded-2xl hover:bg-indigo-600 transition-all">Add to Schedule</button>
            </form>
          </div>
        </aside>

        {/* --- RIGHT COLUMN --- */}
        <main className="col-span-12 lg:col-span-8 space-y-6">
          <div className="bg-white p-4 rounded-[2rem] shadow-sm border border-slate-200/60 flex flex-col md:flex-row items-center gap-4">
            <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-slate-50 border-none pl-12 pr-4 py-3.5 rounded-2xl text-sm" />
            </div>
            <div className="flex bg-slate-100 p-1 rounded-2xl shrink-0">
              {(['all', 'today', 'week', 'month'] as const).map((t) => (
                <button key={t} onClick={() => setTimeFilter(t)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold capitalize transition-all ${timeFilter === t ? 'bg-white shadow-sm text-indigo-600' : 'text-slate-500'}`}>
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center px-2">
               <h2 className="text-xl font-black">{selectedDate ? `Date: ${selectedDate}` : "Your Agenda"}</h2>
               {selectedDate && <button onClick={() => setSelectedDate(null)} className="text-xs font-bold text-indigo-600">Clear Date Filter</button>}
            </div>

            {loading ? (
              <div className="flex justify-center py-20 text-slate-400 animate-pulse">Syncing...</div>
            ) : (
              <div className="grid gap-4">
                {filteredEvents.map((event) => (
                  <div key={event.id} onClick={() => setSelectedEvent(event)}
                    className="group bg-white p-5 rounded-[2rem] border border-slate-100 hover:border-indigo-200 transition-all hover:shadow-xl cursor-pointer flex flex-col md:flex-row md:items-center gap-6">
                    <div className="flex md:flex-col items-center justify-center min-w-[100px] py-2 px-4 bg-slate-50 rounded-2xl group-hover:bg-indigo-50">
                      <span className="text-sm font-black text-slate-900">{event.startTime}</span>
                      <span className="text-[10px] font-bold text-slate-400 uppercase">{event.date}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: event.color }} />
                        <h3 className="font-bold text-lg text-slate-800">{event.title}</h3>
                      </div>
                      <p className="text-slate-500 text-sm line-clamp-1">{event.description}</p>
                    </div>
                    <div className="flex items-center gap-4 text-slate-300">
                      <Info size={18} />
                    </div>
                  </div>
                ))}
                {filteredEvents.length === 0 && <div className="py-20 text-center bg-white rounded-[2rem] border-2 border-dashed text-slate-400 font-bold">No events found.</div>}
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}