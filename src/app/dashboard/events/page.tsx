// // "use client";

// // import { useEffect, useState, useMemo } from "react";
// // import { EventService, EventType } from "@/services/event.service";
// // import { Plus, Clock, Paperclip, Calendar as CalendarIcon, Search, X } from "lucide-react";

// // export default function EventsPage() {
// //   const [events, setEvents] = useState<EventType[]>([]);
// //   const [loading, setLoading] = useState(false);
// //   const [searchTerm, setSearchTerm] = useState("");

// //   const [form, setForm] = useState({
// //     title: "",
// //     description: "",
// //     date: "",
// //     startTime: "",
// //     endTime: "",
// //     color: "#fef3c7",
// //   });

// //   const [files, setFiles] = useState<File[]>([]);

// //   // ✅ Fetch Events
// //   const fetchEvents = async () => {
// //     try {
// //       setLoading(true);
// //       const data = await EventService.getEvents();
// //       setEvents(data);
// //     } catch (err) {
// //       console.error(err);
// //     } finally {
// //       setLoading(false);
// //     }
// //   };

// //   useEffect(() => {
// //     fetchEvents();
// //   }, []);

// //   // ✅ Search Logic: Filters events based on Title, Description, or Date
// //   const filteredEvents = useMemo(() => {
// //     return events.filter((event) => {
// //       const searchStr = searchTerm.toLowerCase();
// //       return (
// //         event.title?.toLowerCase().includes(searchStr) ||
// //         event.description?.toLowerCase().includes(searchStr) ||
// //         event.date?.includes(searchTerm)
// //       );
// //     });
// //   }, [events, searchTerm]);

// //   // ✅ Search Suggestions (Top 5 matches)
// //   const suggestions = useMemo(() => {
// //     if (!searchTerm) return [];
// //     return filteredEvents.slice(0, 5);
// //   }, [filteredEvents, searchTerm]);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
// //     setForm({ ...form, [e.target.name]: e.target.value });
// //   };

// //   const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     if (e.target.files) {
// //       setFiles(Array.from(e.target.files));
// //     }
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     try {
// //       await EventService.createEvent({ ...form, files });
// //       setForm({ title: "", description: "", date: "", startTime: "", endTime: "", color: "#fef3c7" });
// //       setFiles([]);
// //       fetchEvents();
// //     } catch (err) {
// //       console.error(err);
// //     }
// //   };

// //   return (
// //     <div className="min-h-screen bg-[#f8faf9] p-4 md:p-10 text-slate-800">
// //       <div className="max-w-7xl mx-auto space-y-8">

// //         {/* HEADER SECTION */}
// //         <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
// //           <div>
// //             <h1 className="text-3xl font-bold tracking-tight">Event Planner</h1>
// //             <p className="text-slate-500">Manage your weekly schedule and team syncs</p>
// //           </div>
// //           <div className="flex items-center gap-3">
// //             <div className="bg-white p-1 rounded-full shadow-sm flex border border-slate-100">
// //               {['Daily', 'Weekly', 'Monthly'].map((view) => (
// //                 <button 
// //                   key={view} 
// //                   className={`px-5 py-1.5 rounded-full text-sm font-medium transition-all ${view === 'Weekly' ? 'bg-slate-100 shadow-inner text-slate-900' : 'text-slate-400'}`}
// //                 >
// //                   {view}
// //                 </button>
// //               ))}
// //             </div>
// //           </div>
// //         </div>

// //         <div className="grid grid-cols-12 gap-8">

// //           {/* ================= LEFT COLUMN ================= */}
// //           <div className="col-span-12 lg:col-span-4 space-y-6">

// //             {/* SEARCH & SUGGESTIONS CARD */}
// //             <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-100 relative">
// //               <div className="flex items-center justify-between mb-4">
// //                 <h3 className="font-bold flex items-center gap-2 text-slate-900">
// //                   <Search size={18} className="text-teal-600" /> Quick Search
// //                 </h3>
// //               </div>

// //               <div className="relative">
// //                 <input
// //                   type="text"
// //                   placeholder="Search title, details, or date..."
// //                   value={searchTerm}
// //                   onChange={(e) => setSearchTerm(e.target.value)}
// //                   className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-teal-500 transition-all text-sm"
// //                 />
// //                 {searchTerm && (
// //                   <button 
// //                     onClick={() => setSearchTerm("")}
// //                     className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
// //                   >
// //                     <X size={16} />
// //                   </button>
// //                 )}
// //               </div>

// //               {/* Suggestions Dropdown */}
// //               {searchTerm && suggestions.length > 0 && (
// //                 <div className="mt-4 space-y-2 animate-in fade-in slide-in-from-top-2">
// //                   <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Suggestions</p>
// //                   {suggestions.map((s) => (
// //                     <div 
// //                       key={s.id} 
// //                       onClick={() => setSearchTerm(s.title)}
// //                       className="p-3 bg-slate-50 rounded-xl hover:bg-teal-50 cursor-pointer transition-colors border border-transparent hover:border-teal-100"
// //                     >
// //                       <p className="text-sm font-bold text-slate-800 truncate">{s.title}</p>
// //                       <p className="text-[10px] text-slate-500">{s.date} • {s.startTime}</p>
// //                     </div>
// //                   ))}
// //                 </div>
// //               )}
// //             </section>

// //             {/* CREATE FORM CARD */}
// //             <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-slate-100">
// //               <div className="flex items-center gap-2 mb-6 text-teal-600">
// //                 <CalendarIcon size={20} />
// //                 <h2 className="text-xl font-bold text-slate-900">New Event</h2>
// //               </div>

// //               <form onSubmit={handleSubmit} className="space-y-4">
// //                 <input
// //                   name="title"
// //                   placeholder="Title"
// //                   value={form.title}
// //                   onChange={handleChange}
// //                   className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-teal-500"
// //                   required
// //                 />
// //                 <textarea
// //                   name="description"
// //                   placeholder="Description"
// //                   value={form.description}
// //                   onChange={handleChange}
// //                   rows={2}
// //                   className="w-full bg-slate-50 border-none p-3.5 rounded-2xl focus:ring-2 focus:ring-teal-500 resize-none"
// //                 />
// //                 <div className="grid grid-cols-2 gap-4">
// //                   <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full bg-slate-50 border-none p-3.5 rounded-2xl text-xs" required />
// //                   <input type="color" name="color" value={form.color} onChange={handleChange} className="w-full h-[48px] bg-slate-50 border-none p-1 rounded-2xl" />
// //                 </div>
// //                 <div className="grid grid-cols-2 gap-4">
// //                   <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full bg-slate-50 border-none p-3.5 rounded-2xl text-xs" required />
// //                   <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full bg-slate-50 border-none p-3.5 rounded-2xl text-xs" required />
// //                 </div>
// //                 <button type="submit" className="w-full bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-bold py-4 rounded-2xl shadow-md transition-all active:scale-95">
// //                   <Plus size={20} className="inline mr-1" /> Create Event
// //                 </button>
// //               </form>
// //             </section>
// //           </div>

// //           {/* ================= RIGHT COLUMN: EVENT LIST ================= */}
// //           <div className="col-span-12 lg:col-span-8">
// //             <div className="flex items-center justify-between mb-6">
// //               <h2 className="text-xl font-bold">
// //                 {searchTerm ? `Results for "${searchTerm}"` : "Upcoming Schedule"}
// //               </h2>
// //               <span className="text-sm font-medium text-slate-400 bg-white px-3 py-1 rounded-full border">
// //                 {filteredEvents.length} Events
// //               </span>
// //             </div>

// //             {loading ? (
// //               <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div></div>
// //             ) : (
// //               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
// //                 {filteredEvents.map((event) => (
// //                   <div
// //                     key={event.id}
// //                     className="group p-6 rounded-[2rem] shadow-sm transition-all hover:shadow-md hover:-translate-y-1"
// //                     style={{ 
// //                       backgroundColor: event.color || "#e0f2fe",
// //                       borderLeft: `10px solid rgba(0,0,0,0.05)` 
// //                     }}
// //                   >
// //                     <div className="mb-4">
// //                       <h3 className="font-bold text-lg text-slate-900 leading-tight">{event.title}</h3>
// //                       <div className="flex items-center gap-1.5 mt-1 text-slate-600 font-medium text-xs">
// //                         <Clock size={14} />
// //                         <span>{event.startTime} - {event.endTime}</span>
// //                         <span className="mx-1">•</span>
// //                         <span>{event.date}</span>
// //                       </div>
// //                     </div>
// //                     <p className="text-sm text-slate-600/80 line-clamp-2 mb-6">{event.description}</p>
// //                     <div className="flex items-center justify-between pt-4 border-t border-black/5">
// //                       <div className="flex -space-x-2">
// //                         {[1, 2].map(i => <div key={i} className="w-7 h-7 rounded-full bg-white border-2 border-white shadow-sm" />)}
// //                       </div>
// //                       {event.files?.length > 0 && (
// //                         <div className="flex items-center gap-1 text-slate-500 text-[10px] font-bold uppercase">
// //                           <Paperclip size={12} /> {event.files.length} Files
// //                         </div>
// //                       )}
// //                     </div>
// //                   </div>
// //                 ))}
// //                 {filteredEvents.length === 0 && (
// //                   <div className="col-span-full py-20 text-center bg-white rounded-[2rem] border-2 border-dashed border-slate-100 text-slate-400">
// //                     No matches found for your search.
// //                   </div>
// //                 )}
// //               </div>
// //             )}
// //           </div>
// //         </div>
// //       </div>
// //     </div>
// //   );
// // }

// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { EventService, EventType } from "@/services/event.service";
// import {
//   Plus, Clock, Paperclip, Calendar as CalendarIcon,
//   Search, X, ChevronLeft, ChevronRight,
//   MoreVertical, CalendarDays, Info, AlignLeft
// } from "lucide-react";

// export default function EventsPage() {
//   // --- BACKEND STATES ---
//   const [events, setEvents] = useState<EventType[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [files, setFiles] = useState<File[]>([]);

//   const [form, setForm] = useState({
//     title: "",
//     description: "",
//     date: new Date().toISOString().split('T')[0],
//     startTime: "",
//     endTime: "",
//     color: "#6366f1",
//   });

//   // --- UI STATES ---
//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [selectedDate, setSelectedDate] = useState<string | null>(null);
//   const [timeFilter, setTimeFilter] = useState<"all" | "today" | "week" | "month">("all");
//   const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);

//   // --- NEW UI STATES FOR POPUP ---
//   const [showAddPopup, setShowAddPopup] = useState(false);
//   const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

//   // --- BACKEND LOGIC ---
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

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await EventService.createEvent({ ...form, files });
//       // Reset form including description
//       setForm({
//         title: "",
//         description: "",
//         date: new Date().toISOString().split('T')[0],
//         startTime: "",
//         endTime: "",
//         color: "#6366f1"
//       });
//       setFiles([]);
//       fetchEvents();
//     } catch (err) {
//       console.error(err);
//     }
//   };

//   // --- FILTERING LOGIC ---
//   const filteredEvents = useMemo(() => {
//     return events.filter((event) => {
//       const eventDateStr = event.date;
//       const eventDate = new Date(event.date);
//       const now = new Date();
//       const todayStr = now.toISOString().split('T')[0];

//       const searchStr = searchTerm.toLowerCase();
//       const matchesSearch =
//         event.title?.toLowerCase().includes(searchStr) ||
//         event.description?.toLowerCase().includes(searchStr);

//       if (!matchesSearch) return false;
//       if (selectedDate && eventDateStr !== selectedDate) return false;

//       if (timeFilter === "today") return eventDateStr === todayStr;
//       if (timeFilter === "week") {
//         const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
//         const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
//         return eventDate >= startOfWeek && eventDate <= endOfWeek;
//       }
//       if (timeFilter === "month") {
//         return eventDate.getMonth() === new Date().getMonth() &&
//           eventDate.getFullYear() === new Date().getFullYear();
//       }

//       return true;
//     });
//   }, [events, searchTerm, selectedDate, timeFilter]);

//   // --- TASK COMPLETION LOGIC ---
//   const toggleTaskStatus = async (eventId: string | number) => {
//     setEvents(prev => prev.map(event =>
//       event.id === eventId ? { ...event, completed: !event.completed } : event
//     ));
//   };

//   // --- EVENT STATUS LOGIC ---
//   const getEventStatus = (event: EventType) => {
//     const now = new Date();
//     const eventDate = new Date(event.date);

//     const [startHour, startMinute] = event.startTime.split(":").map(Number);
//     const [endHour, endMinute] = event.endTime.split(":").map(Number);

//     const start = new Date(eventDate);
//     start.setHours(startHour, startMinute);

//     const end = new Date(eventDate);
//     end.setHours(endHour, endMinute);

//     if (now < start) return "Upcoming";
//     if (now >= start && now <= end) return "Ongoing";
//     return "Completed";
//   };

//   const calendarDays = useMemo(() => {
//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
//     const firstDayOfMonth = new Date(year, month, 1).getDay();
//     const daysInMonth = new Date(year, month + 1, 0).getDate();

//     const days = [];
//     for (let i = 0; i < firstDayOfMonth; i++) {
//       days.push(null);
//     }
//     for (let i = 1; i <= daysInMonth; i++) {
//       days.push(i);
//     }
//     return days;
//   }, [currentMonth]);

//   return (
//     <div className="min-h-screen  text-slate-900 font-sans antialiased">

//       {/* 1. EVENT DETAIL MODAL */}
//       {selectedEvent && (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm transition-all">
//           <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
//             <div className="h-24 w-full" style={{ backgroundColor: selectedEvent.color || '#6366f1' }} />
//             <div className="p-8 -mt-10 bg-white rounded-t-[2.5rem] relative">
//               <button onClick={() => setSelectedEvent(null)} className="absolute -top-12 right-6 p-2 bg-white/20 hover:bg-white/40 rounded-full text-white"><X size={20} /></button>

//               <div className="mb-6">
//                 <h2 className="text-3xl font-black text-slate-900">{selectedEvent.title}</h2>
//                 <div className="flex items-center gap-2 mt-2 text-indigo-600 font-bold"><CalendarIcon size={16} /> {selectedEvent.date}</div>
//               </div>

//               <div className="space-y-6">
//                 <div>
//                   <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block mb-2">Description</label>
//                   <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl">{selectedEvent.description || "No description provided."}</p>
//                 </div>
//                 <div className="grid grid-cols-2 gap-4">
//                   <div className="p-4 bg-slate-50 rounded-2xl">
//                     <p className="text-[10px] font-bold text-slate-400 uppercase">Time Slot</p>
//                     <p className="text-sm font-bold">{selectedEvent.startTime} - {selectedEvent.endTime}</p>
//                   </div>
//                   <div className="p-4 bg-slate-50 rounded-2xl">
//                     <p className="text-[10px] font-bold text-slate-400 uppercase">Attachments</p>
//                     <p className="text-sm font-bold">{selectedEvent.files?.length || 0} Files</p>
//                   </div>
//                 </div>
//               </div>
//               <button onClick={() => setSelectedEvent(null)} className="w-full mt-8 bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all">Close Details</button>
//             </div>
//           </div>
//         </div>
//       )}

//       {/* 2. MAIN APP CONTAINER (The "Floating" Card) */}
//       <div className="max-w-[1440px] mx-auto bg-white/60 backdrop-blur-xl rounded-[3rem] shadow-2xl shadow-indigo-100/50 border border-white/40 overflow-hidden grid grid-cols-12">

//         {/* --- LEFT SIDEBAR: CALENDAR & FORM --- */}
//         <aside className="col-span-12 lg:col-span-4 p-10 space-y-10 border-r border-slate-100">
//           <div className="flex items-center gap-4">
//             <div className="bg-slate-900 p-3 rounded-2xl shadow-lg shadow-slate-200">
//               <CalendarDays className="text-white" size={26} />
//             </div>
//             <h1 className="text-2xl font-black tracking-tighter text-slate-900">Evently</h1>
//           </div>

//           {/* REFINED MINI CALENDAR */}
//           <div className="space-y-6">
//             <div className="flex items-center justify-between">
//               <h2 className="font-extrabold text-slate-800 tracking-tight text-lg">{currentMonth.toLocaleString('default', { month: 'long', year: 'numeric' })}</h2>
//               <div className="flex gap-2">
//                 <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() - 1)))} className="p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"><ChevronLeft size={16} /></button>
//                 <button onClick={() => setCurrentMonth(new Date(currentMonth.setMonth(currentMonth.getMonth() + 1)))} className="p-2.5 hover:bg-slate-50 border border-slate-100 rounded-xl transition-all"><ChevronRight size={16} /></button>
//               </div>
//             </div>

//             <div className="grid grid-cols-7 text-center mb-4">
//               {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => <span key={d} className="text-[10px] font-black text-slate-300 uppercase">{d}</span>)}
//             </div>

//             <div className="grid grid-cols-7 gap-1.5">
//               {calendarDays.map((day, i) => {
//                 const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
//                 const isSelected = selectedDate === dateStr;
//                 const hasEvent = day && events.some(e => e.date === dateStr);
//                 return (
//                   <div key={i} onClick={() => day && setSelectedDate(isSelected ? null : dateStr)}
//                     className={`h-10 flex items-center justify-center rounded-xl text-xs font-bold transition-all relative cursor-pointer
//                     ${day ? 'hover:bg-slate-100' : 'opacity-0'}
//                     ${isSelected ? 'bg-slate-900 !text-white shadow-xl scale-110' : 'text-slate-500'}`}>
//                     {day}
//                     {hasEvent && !isSelected && <span className="absolute bottom-1.5 w-1 h-1 bg-indigo-500 rounded-full" />}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>

//           {/* 3. Dark Form (Matching your dark form requirement) */}
//           <div className="bg-white p-10 rounded-[2.5rem] shadow-xl shadow-form-background/10">
//             <h3 className="text-black font-black mb-8 flex items-center gap-2"><Plus size={18} className="text-indigo-400" /> New Event</h3>
//             <form onSubmit={handleSubmit} className="space-y-5">
//               {/* Cleaner, focused dark inputs */}
//               <input name="title" placeholder="Event Title (E.g. Design Sync)" value={form.title} onChange={handleChange} required
//                 className="w-full bg-black/5 border border-black/10 p-4.5 rounded-2xl text-black/80 text-xs focus:ring-2 focus:ring-indigo-500 transition-all placeholder:text-slate-600" />

//               <textarea name="description" placeholder="Description or notes..." value={form.description} onChange={handleChange} rows={3}
//                 className="w-full bg-black/5 border border-black/10 p-4.5 rounded-2xl text-black/80 text-xs focus:ring-2 focus:ring-indigo-500 resize-none transition-all placeholder:text-slate-600" />

//               <div className="grid grid-cols-2 gap-3.5">
//                 <input type="date" name="date" value={form.date} onChange={handleChange} className="w-full bg-black/5 border border-black/10 p-4.5 rounded-2xl text-black/80 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" required />
//                 <div className="flex items-center bg-black/5 rounded-2xl p-2 border border-black/10">
//                   <input type="color" name="color" value={form.color} onChange={handleChange} className="w-full h-9 bg-transparent border-none cursor-pointer" />
//                 </div>
//               </div>

//               <div className="grid grid-cols-2 gap-3.5">
//                 <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="w-full bg-black/5 border border-black/10 p-4.5 rounded-2xl text-black/80 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" required />
//                 <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="w-full bg-black/5 border border-black/10 p-4.5 rounded-2xl text-black/80 text-xs focus:ring-2 focus:ring-indigo-500 outline-none" required />
//               </div>

//               <button type="submit" className="w-full mt-3 bg-indigo-600 text-white font-black py-4.5 rounded-2xl hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100/10">
//                 Add to Schedule
//               </button>
//             </form>
//           </div>
//         </aside>

//         {/* --- RIGHT COLUMN: SEARCH & ACTIVITY --- */}
//         {/* --- RIGHT COLUMN: FULL CALENDAR GRID --- */}
//         <main className="col-span-12 lg:col-span-8 space-y-6 lg:p-12">
//           {/* Header Section */}
//           <div className="flex items-center justify-between px-4">
//             <h2 className="text-3xl font-black text-slate-900 tracking-tight">Calendar</h2>
//             <div className="flex bg-white/50 backdrop-blur-md p-1.5 rounded-2xl border border-white/40 shadow-sm">
//               {(['Week', 'Month'] as const).map((view) => (
//                 <button key={view} className={`px-6 py-2 rounded-xl text-xs font-bold transition-all ${view === 'Month' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-500'}`}>
//                   {view}
//                 </button>
//               ))}
//             </div>
//           </div>

//           {/* REFINED SEARCH */}
//           <div className="bg-white p-3.5 rounded-full shadow-sm border border-slate-100 flex items-center">
//             <div className="relative flex-1 w-full">
//               <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
//               <input type="text" placeholder="Search events..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
//                 className="w-full bg-transparent border-none pl-14 pr-4 py-3 text-sm focus:ring-0 placeholder:text-slate-400" />
//             </div>
//           </div>

//           {/* FULL GRID CONTAINER */}
//           <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-indigo-100/50 border border-slate-100 overflow-hidden">
//             {/* Day Labels */}
//             <div className="grid grid-cols-7 border-b border-slate-100 bg-slate-50/50">
//               {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => (
//                 <div key={day} className="py-4 text-center text-[10px] font-black uppercase tracking-widest text-slate-400 border-r border-slate-100 last:border-r-0">
//                   {day}
//                 </div>
//               ))}
//             </div>

//             {/* The Actual Grid */}
//             <div className="grid grid-cols-7 grid-rows-5">
//               {calendarDays.map((day, index) => {
//                 const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
//                 const dayEvents = filteredEvents.filter(e => e.date === dateStr);
//                 const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth();
//                 const isActive = selectedDate === dateStr;

//                 return (
//                   <div key={index}
//                     onClick={(e) => {
//                       if (day) {
//                         setSelectedDate(dateStr);
//                         // Capture click position for the popup
//                         setPopupPos({ x: e.clientX + 10, y: e.clientY + 10 });
//                         setShowAddPopup(true);
//                       }
//                     }}
//                     className={`min-h-[160px] p-4 border-r border-b border-slate-50 transition-all cursor-pointer relative group
//                     ${!day ? 'bg-slate-100/20' : 'hover:bg-white/80'} 
//                     ${isActive ? 'z-30 shadow-inner' : 'z-0'}
//                     ${index % 7 === 6 ? 'border-r-0' : ''}`}
//                   >
//                     {/* Day Number */}
//                     <span className={`text-sm font-black ${isToday ? 'text-indigo-600' : 'text-slate-400'} mb-2 block`}>
//                       {day}
//                     </span>

//                     {/* Event List inside Cell */}
//                     <div className="mt-3 space-y-2">
//                       {dayEvents.map((event) => (
//                         <div
//                           key={event.id}
//                           onClick={(e) => {
//                             e.stopPropagation(); // Prevents opening the "Add Task" popup
//                             toggleTaskStatus(event.id);
//                           }}
//                           className={`group/task flex items-center gap-2 p-2 rounded-xl text-[9px] font-bold transition-all border-l-4 shadow-sm
//                             ${event.completed ? 'opacity-50 grayscale' : 'hover:scale-105'}`}
//                           style={{
//                             backgroundColor: event.completed ? '#f1f5f9' : `${event.color}15`,
//                             color: event.completed ? '#94a3b8' : event.color,
//                             borderLeftColor: event.completed ? '#cbd5e1' : event.color
//                           }}
//                         >
//                           {/* Status Icon */}
//                           <div className={`w-3 h-3 rounded-full border flex items-center justify-center transition-colors
//                             ${event.completed ? 'bg-green-500 border-green-500' : 'border-current'}`}>
//                             {event.completed && <div className="w-1 h-1 bg-white rounded-full" />}
//                           </div>

//                           <span className={`truncate ${event.completed ? 'line-through' : ''}`}>
//                             {event.title}
//                           </span>
//                         </div>
//                       ))}
//                     </div>

//                     {/* DYNAMIC ACTIVE OVERLAY */}
//                     {isActive && day && (
//                       <div className="absolute inset-2 bg-gradient-to-br from-indigo-600 to-purple-700 rounded-3xl shadow-xl z-20 p-5 text-white animate-in zoom-in-95 duration-200">
//                         <div className="flex justify-between items-start mb-3">
//                           <span className="text-sm font-black bg-white/20 px-2 py-1 rounded-lg">{day}</span>
//                         </div>

//                         <div className="space-y-3 max-h-[80px] overflow-y-auto custom-scrollbar">
//                           {dayEvents.length > 0 ? (
//                             dayEvents.map(e => (
//                               <div key={e.id} className="flex items-center gap-2">
//                                 <div className={`w-2 h-2 rounded-full ${e.completed ? 'bg-green-400' : 'bg-white/40'}`} />
//                                 <p className={`text-[10px] font-bold truncate ${e.completed ? 'opacity-50 line-through' : ''}`}>
//                                   {e.title}
//                                 </p>
//                               </div>
//                             ))
//                           ) : (
//                             <p className="text-[10px] italic opacity-60">No tasks scheduled</p>
//                           )}
//                         </div>

//                         <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between border-t border-white/10 pt-3">
//                           <p className="text-[9px] font-black uppercase tracking-tighter">Status: {dayEvents.every(e => e.completed) && dayEvents.length > 0 ? 'Clear' : 'Pending'}</p>
//                           <div className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/40 transition-colors">
//                             <Plus size={12} />
//                           </div>
//                         </div>
//                       </div>
//                     )}
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* --- FLOATING "ADD TASK" POPUP (From Screenshot) --- */}
//       {showAddPopup && (
//         <div
//           className="fixed z-50 w-72 bg-white rounded-3xl shadow-2xl border border-slate-100 p-6 animate-in fade-in zoom-in-95 duration-200"
//           style={{ top: popupPos.y, left: popupPos.x }}
//         >
//           <div className="flex justify-between items-center mb-4">
//             <span className="bg-slate-100 text-slate-500 text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest flex items-center gap-1">
//               <Plus size={10} /> Category
//             </span>
//             <span className="text-[10px] font-bold text-slate-300">{new Date().toLocaleDateString()}</span>
//           </div>

//           <div className="space-y-4">
//             <div className="flex items-center gap-3">
//               <div className="w-5 h-5 rounded-full border-2 border-slate-200" /> {/* Checkbox circle */}
//               <input
//                 autoFocus
//                 placeholder="Title of the task"
//                 className="text-sm font-black text-slate-800 placeholder:text-slate-300 border-none p-0 focus:ring-0 w-full"
//               />
//             </div>
//             <textarea
//               placeholder="Description..."
//               className="text-xs text-slate-400 placeholder:text-slate-200 border-none p-0 focus:ring-0 w-full resize-none"
//               rows={2}
//             />
//           </div>

//           <div className="flex justify-end mt-6">
//             <button
//               onClick={() => setShowAddPopup(false)}
//               className="bg-indigo-600 text-white px-5 py-2 rounded-xl text-[10px] font-black shadow-lg shadow-indigo-200 hover:bg-indigo-700 transition-all"
//             >
//               Add task
//             </button>
//           </div>

//           {/* Click outside to close handle */}
//           <button
//             onClick={() => setShowAddPopup(false)}
//             className="absolute -top-2 -right-2 bg-white shadow-md rounded-full p-1 text-slate-300 hover:text-slate-600"
//           >
//             <X size={12} />
//           </button>
//         </div>
//       )}
//     </div>
//   );
// }




// "use client";

// import { useEffect, useState, useMemo } from "react";
// import { EventService, EventType } from "@/services/event.service";
// import {
//   Plus, Calendar as CalendarIcon, Search, X, ChevronLeft, ChevronRight,
//   CalendarDays, Clock, AlignLeft
// } from "lucide-react";

// export default function EventsPage() {
//   const [events, setEvents] = useState<EventType[]>([]);
//   const [loading, setLoading] = useState(false);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [view, setView] = useState<"month" | "week">("month");
//   const [files, setFiles] = useState<File[]>([]);
//   const [form, setForm] = useState({
//     title: "", description: "",
//     date: new Date().toISOString().split('T')[0],
//     startTime: "", endTime: "", color: "#6366f1",
//   });

//   const [currentMonth, setCurrentMonth] = useState(new Date());
//   const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
//   const [showAddPopup, setShowAddPopup] = useState(false);
//   const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

//   const fetchEvents = async () => {
//     try {
//       setLoading(true);
//       const data = await EventService.getEvents();
//       setEvents(data);
//     } catch (err) { console.error(err); } finally { setLoading(false); }
//   };

//   useEffect(() => { fetchEvents(); }, []);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     setForm({ ...form, [e.target.name]: e.target.value });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     try {
//       await EventService.createEvent({ ...form, files });
//       setForm({
//         title: "", description: "",
//         date: new Date().toISOString().split('T')[0],
//         startTime: "", endTime: "", color: "#6366f1"
//       });
//       setShowAddPopup(false);
//       fetchEvents();
//     } catch (err) { console.error(err); }
//   };

//   const handleDayClick = (e: React.MouseEvent, dateStr: string) => {
//     setForm({ ...form, date: dateStr });
//     const x = e.clientX > window.innerWidth - 300 ? e.clientX - 260 : e.clientX;
//     const y = e.clientY > window.innerHeight - 400 ? e.clientY - 350 : e.clientY;
//     setPopupPos({ x, y });
//     setShowAddPopup(true);
//   };

//   // Function to jump to today
//   const handleGoToToday = () => {
//     setCurrentMonth(new Date());
//   };

//   const filteredEvents = useMemo(() => {
//     return events.filter((event) => {
//       const searchStr = searchTerm.toLowerCase();
//       const matchesSearch = event.title?.toLowerCase().includes(searchStr) || 
//                             event.description?.toLowerCase().includes(searchStr);
      
//       if (view === "week") {
//         const eventDate = new Date(event.date);
//         const today = new Date();
//         const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
//         const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
//         return matchesSearch && eventDate >= firstDayOfWeek && eventDate <= lastDayOfWeek;
//       }
      
//       return matchesSearch;
//     });
//   }, [events, searchTerm, view]);

//   const calendarDays = useMemo(() => {
//     const year = currentMonth.getFullYear();
//     const month = currentMonth.getMonth();
//     const firstDay = new Date(year, month, 1).getDay();
//     const totalDays = new Date(year, month + 1, 0).getDate();
//     return [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
//   }, [currentMonth]);

//   return (
//     <div className="min-h-screen bg-[#F4F7FE] p-2 lg:p-4 text-slate-900 font-sans antialiased">
      
//       {/* 1. DETAIL MODAL */}
//       {selectedEvent && (
//         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
//           <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
//             <div className="h-16" style={{ backgroundColor: selectedEvent.color || '#6366f1' }} />
//             <div className="p-6 -mt-6 bg-white rounded-t-3xl relative">
//               <button onClick={() => setSelectedEvent(null)} className="absolute -top-10 right-2 p-2 text-white"><X size={20} /></button>
//               <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
//               <p className="text-xs text-indigo-600 font-semibold mb-4">{selectedEvent.date} | {selectedEvent.startTime}</p>
//               <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedEvent.description || "No description."}</p>
//               <button onClick={() => setSelectedEvent(null)} className="w-full mt-6 bg-slate-900 text-white text-sm font-bold py-3 rounded-xl">Close</button>
//             </div>
//           </div>
//         </div>
//       )}

//       <div className="max-w-[1600px] mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden grid grid-cols-12 h-[calc(100vh-2rem)]">
        
//         {/* --- LEFT SIDEBAR --- */}
//         <aside className="col-span-12 lg:col-span-3 p-5 flex flex-col gap-6 border-r border-slate-100 bg-white overflow-y-auto">
//           <div className="flex items-center gap-3">
//             <div className="bg-slate-900 p-2 rounded-xl"><CalendarDays className="text-white" size={20} /></div>
//             <h1 className="text-xl font-black tracking-tight">Evently</h1>
//           </div>

//           {/* MINI CALENDAR */}
//           <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
//             <div className="flex items-center justify-between mb-4">
//               <h2 className="font-bold text-sm">{currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</h2>
//               <div className="flex gap-1">
//                 <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-white rounded-md border border-slate-200"><ChevronLeft size={14}/></button>
//                 <button onClick={handleGoToToday} className="text-[9px] font-bold px-2 hover:bg-white rounded-md border border-slate-200 uppercase">Today</button>
//                 <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-white rounded-md border border-slate-200"><ChevronRight size={14}/></button>
//               </div>
//             </div>
//             <div className="grid grid-cols-7 gap-1 text-center">
//               {['S','M','T','W','T','F','S'].map(d => <span key={d} className="text-[10px] font-bold text-slate-400">{d}</span>)}
//               {calendarDays.map((day, i) => (
//                 <div key={i} className={`text-[10px] h-7 flex items-center justify-center rounded-lg ${day ? 'hover:bg-indigo-50 cursor-pointer font-bold' : 'opacity-0'}`}>
//                   {day}
//                 </div>
//               ))}
//             </div>
//           </div>

//           <div className="flex-1">
//             <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Add</h3>
//             <form onSubmit={handleSubmit} className="space-y-3">
//               <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
//               <textarea name="description" placeholder="Notes" value={form.description} onChange={handleChange} rows={2} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none resize-none" />
//               <div className="grid grid-cols-2 gap-2">
//                 <input type="date" name="date" value={form.date} onChange={handleChange} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px]" />
//                 <input type="color" name="color" value={form.color} onChange={handleChange} className="w-full h-8 bg-transparent cursor-pointer" />
//               </div>
//               <div className="grid grid-cols-2 gap-2">
//                 <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px]" />
//                 <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px]" />
//               </div>
//               <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-indigo-700 transition-all shadow-md">Add Event</button>
//             </form>
//           </div>
//         </aside>

//         {/* --- MAIN AREA --- */}
//         <main className="col-span-12 lg:col-span-9 bg-slate-50/30 flex flex-col relative">
//           <header className="p-5 flex items-center justify-between bg-white border-b border-slate-100">
//             <div className="flex items-center gap-4">
//               <h2 className="text-2xl font-black text-slate-900">{currentMonth.toLocaleString('default', { month: 'long' })}</h2>
//               <button onClick={handleGoToToday} className="px-3 py-1 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Today</button>
//             </div>
            
//             <div className="flex items-center gap-4">
//               <div className="relative">
//                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
//                 <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs w-64 focus:ring-1 focus:ring-indigo-500 outline-none" />
//               </div>
//               {/* <div className="flex bg-slate-100 p-1 rounded-xl">
//                 <button 
//                   onClick={() => setView("month")}
//                   className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${view === 'month' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
//                   Month
//                 </button>
//                 <button 
//                   onClick={() => setView("week")}
//                   className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${view === 'week' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
//                   Week
//                 </button>
//               </div> */}
//             </div>
//           </header>

//           <div className="flex-1 overflow-y-auto">
//             <div className="grid grid-cols-7 bg-white">
//               {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
//                 <div key={day} className="py-2 text-center text-[9px] font-black uppercase text-slate-400 border-r border-b border-slate-100 last:border-r-0">
//                   {day}
//                 </div>
//               ))}
//               {calendarDays.map((day, index) => {
//                 const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
//                 const dayEvents = filteredEvents.filter(e => e.date === dateStr);
//                 const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

//                 return (
//                   <div key={index} 
//                     onClick={(e) => day && handleDayClick(e, dateStr!)}
//                     className={`min-h-[110px] p-2 border-r border-b border-slate-100 transition-all cursor-pointer group hover:bg-indigo-50/30
//                     ${!day ? 'bg-slate-50/50' : ''} ${index % 7 === 6 ? 'border-r-0' : ''}`}>
                    
//                     <span className={`text-xs font-bold ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-md' : 'text-slate-400'}`}>
//                       {day}
//                     </span>

//                     <div className="mt-2 space-y-1">
//                       {dayEvents.slice(0, 3).map((event) => (
//                         <div key={event.id} onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
//                           className="px-2 py-1 rounded-md text-[9px] font-bold truncate border-l-2 shadow-sm"
//                           style={{ backgroundColor: `${event.color}15`, color: event.color, borderLeftColor: event.color }}>
//                           {event.title}
//                         </div>
//                       ))}
//                       {dayEvents.length > 3 && <p className="text-[8px] font-bold text-slate-400 pl-1">+{dayEvents.length - 3} more</p>}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         </main>
//       </div>

//       {/* --- QUICK ADD POPUP --- */}
//       {showAddPopup && (
//         <>
//           <div className="fixed inset-0 z-40" onClick={() => setShowAddPopup(false)} />
//           <div className="fixed z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 animate-in fade-in zoom-in-95"
//             style={{ top: popupPos.y, left: popupPos.x }}>
            
//             <div className="flex justify-between items-center mb-4">
//               <div className="flex items-center gap-2">
//                 <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
//                 <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">New Event Task</span>
//               </div>
//               <button onClick={() => setShowAddPopup(false)} className="hover:bg-slate-100 p-1 rounded-md transition-colors">
//                 <X size={14} className="text-slate-400" />
//               </button>
//             </div>

//             <form onSubmit={handleSubmit} className="space-y-3">
//               <input autoFocus name="title" placeholder="What's happening?" value={form.title} onChange={handleChange} required className="text-sm font-bold w-full border-none p-0 focus:ring-0 placeholder:text-slate-300" />
//               <div className="space-y-2 pt-2 border-t border-slate-50">
//                 <div className="flex items-center gap-2 text-slate-400">
//                   <AlignLeft size={14} />
//                   <textarea name="description" placeholder="Add description..." value={form.description} onChange={handleChange} rows={2} className="text-[11px] w-full border-none p-0 focus:ring-0 resize-none bg-transparent" />
//                 </div>
//                 <div className="flex items-center gap-2 text-slate-400">
//                   <Clock size={14} />
//                   <div className="flex items-center gap-1">
//                     <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="text-[10px] border-none p-0 focus:ring-0 bg-transparent font-medium" />
//                     <span className="text-[10px]">-</span>
//                     <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="text-[10px] border-none p-0 focus:ring-0 bg-transparent font-medium" />
//                   </div>
//                 </div>
//                 <div className="flex items-center justify-between pt-2">
//                   <div className="flex items-center gap-2">
//                     <input type="color" name="color" value={form.color} onChange={handleChange} className="w-5 h-5 rounded-full border-none cursor-pointer bg-transparent overflow-hidden" />
//                     <span className="text-[10px] text-slate-400 font-medium">Label Color</span>
//                   </div>
//                   <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{form.date}</span>
//                 </div>
//               </div>
//               <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-[11px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-2">
//                 Create Event
//               </button>
//             </form>
//           </div>
//         </>
//       )}
//     </div>
//   );
// }



"use client";

import { useEffect, useState, useMemo } from "react";
import { EventService, EventType } from "@/services/event.service";
import {
  Plus, Calendar as CalendarIcon, Search, X, ChevronLeft, ChevronRight,
  CalendarDays, Clock, AlignLeft
} from "lucide-react";

export default function EventsPage() {
  const [events, setEvents] = useState<EventType[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [view, setView] = useState<"month" | "week">("month");
  const [files, setFiles] = useState<File[]>([]);
  const [form, setForm] = useState({
    title: "", description: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "", endTime: "", color: "#6366f1",
  });

  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<EventType | null>(null);
  const [showAddPopup, setShowAddPopup] = useState(false);
  const [popupPos, setPopupPos] = useState({ x: 0, y: 0 });

  const fetchEvents = async () => {
    try {
      setLoading(true);
      const data = await EventService.getEvents();
      setEvents(data);
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };

  useEffect(() => { fetchEvents(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await EventService.createEvent({ ...form, files });
      setForm({
        title: "", description: "",
        date: new Date().toISOString().split('T')[0],
        startTime: "", endTime: "", color: "#6366f1"
      });
      setShowAddPopup(false);
      fetchEvents();
    } catch (err) { console.error(err); }
  };

  const handleDayClick = (e: React.MouseEvent, dateStr: string) => {
    setForm({ ...form, date: dateStr });
    const x = e.clientX > window.innerWidth - 300 ? e.clientX - 260 : e.clientX;
    const y = e.clientY > window.innerHeight - 400 ? e.clientY - 350 : e.clientY;
    setPopupPos({ x, y });
    setShowAddPopup(true);
  };

  const handleGoToToday = () => {
    setCurrentMonth(new Date());
  };

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const searchStr = searchTerm.toLowerCase();
      const matchesSearch = event.title?.toLowerCase().includes(searchStr) || 
                            event.description?.toLowerCase().includes(searchStr);
      
      if (view === "week") {
        const eventDate = new Date(event.date);
        const today = new Date();
        const firstDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay()));
        const lastDayOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 6));
        return matchesSearch && eventDate >= firstDayOfWeek && eventDate <= lastDayOfWeek;
      }
      
      return matchesSearch;
    });
  }, [events, searchTerm, view]);

  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const totalDays = new Date(year, month + 1, 0).getDate();
    return [...Array(firstDay).fill(null), ...Array.from({ length: totalDays }, (_, i) => i + 1)];
  }, [currentMonth]);

  return (
    <div className="min-h-screen bg-[#F4F7FE] p-2 text-slate-900 font-sans antialiased">
      
      {/* 1. DETAIL MODAL */}
      {selectedEvent && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95">
            <div className="h-16" style={{ backgroundColor: selectedEvent.color || '#6366f1' }} />
            <div className="p-6 -mt-6 bg-white rounded-t-3xl relative">
              <button onClick={() => setSelectedEvent(null)} className="absolute -top-10 right-2 p-2 text-white"><X size={20} /></button>
              <h2 className="text-xl font-bold">{selectedEvent.title}</h2>
              <p className="text-xs text-indigo-600 font-semibold mb-4">{selectedEvent.date} | {selectedEvent.startTime}</p>
              <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-xl border border-slate-100">{selectedEvent.description || "No description."}</p>
              <button onClick={() => setSelectedEvent(null)} className="w-full mt-6 bg-slate-900 text-white text-sm font-bold py-3 rounded-xl">Close</button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-[1600px] mx-auto bg-white rounded-[2rem] shadow-xl border border-slate-200 overflow-hidden grid grid-cols-12 h-[calc(100vh-2rem)]">
        
        {/* --- LEFT SIDEBAR --- */}
        <aside className="col-span-12 lg:col-span-3 p-5 flex flex-col gap-6 border-r border-slate-100 bg-white overflow-y-auto">
          <div className="flex items-center gap-3">
            <div className="bg-slate-900 p-2 rounded-xl"><CalendarDays className="text-white" size={20} /></div>
            <h1 className="text-xl font-black tracking-tight">Evently</h1>
          </div>

          {/* MINI CALENDAR - FIXED KEYS HERE */}
          <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-sm">{currentMonth.toLocaleString('default', { month: 'short', year: 'numeric' })}</h2>
              <div className="flex gap-1">
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))} className="p-1 hover:bg-white rounded-md border border-slate-200"><ChevronLeft size={14}/></button>
                <button onClick={handleGoToToday} className="text-[9px] font-bold px-2 hover:bg-white rounded-md border border-slate-200 uppercase">Today</button>
                <button onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))} className="p-1 hover:bg-white rounded-md border border-slate-200"><ChevronRight size={14}/></button>
              </div>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
              {/* FIXED: Added index to key to prevent duplicate S and T key errors */}
              {['S','M','T','W','T','F','S'].map((d, idx) => (
                <span key={`${d}-${idx}`} className="text-[10px] font-bold text-slate-400">{d}</span>
              ))}
              {calendarDays.map((day, i) => (
                <div key={i} className={`text-[10px] h-7 flex items-center justify-center rounded-lg ${day ? 'hover:bg-indigo-50 cursor-pointer font-bold' : 'opacity-0'}`}>
                  {day}
                </div>
              ))}
            </div>
          </div>

          <div className="flex-1">
            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Quick Add</h3>
            <form onSubmit={handleSubmit} className="space-y-3">
              <input name="title" placeholder="Title" value={form.title} onChange={handleChange} required className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none focus:ring-1 focus:ring-indigo-500" />
              <textarea name="description" placeholder="Notes" value={form.description} onChange={handleChange} rows={2} className="w-full bg-slate-50 border border-slate-200 p-3 rounded-xl text-xs outline-none resize-none" />
              <div className="grid grid-cols-2 gap-2">
                <input type="date" name="date" value={form.date} onChange={handleChange} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px]" />
                <input type="color" name="color" value={form.color} onChange={handleChange} className="w-full h-8 bg-transparent cursor-pointer" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px]" />
                <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="bg-slate-50 border border-slate-200 p-2 rounded-xl text-[10px]" />
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white font-bold py-3 rounded-xl text-xs hover:bg-indigo-700 transition-all shadow-md">Add Event</button>
            </form>
          </div>
        </aside>

        {/* --- MAIN AREA --- */}
        <main className="col-span-12 lg:col-span-9 bg-slate-50/30 flex flex-col relative">
          <header className="p-5 flex items-center justify-between bg-white border-b border-slate-100">
            <div className="flex items-center gap-4">
              <h2 className="text-2xl font-black text-slate-900">{currentMonth.toLocaleString('default', { month: 'long' })}</h2>
              <button onClick={handleGoToToday} className="px-3 py-1 text-xs font-bold border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors">Today</button>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="bg-slate-50 border border-slate-200 pl-9 pr-4 py-2 rounded-xl text-xs w-64 focus:ring-1 focus:ring-indigo-500 outline-none" />
              </div>
              {/* <div className="flex bg-slate-100 p-1 rounded-xl">
                <button 
                  onClick={() => setView("month")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${view === 'month' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                  Month
                </button>
                <button 
                  onClick={() => setView("week")}
                  className={`px-4 py-1.5 rounded-lg text-[10px] font-bold transition-all ${view === 'week' ? 'bg-white shadow-sm text-slate-900' : 'text-slate-500'}`}>
                  Week
                </button>
              </div> */}
            </div>
          </header>

          <div className="flex-1 overflow-y-auto">
            <div className="grid grid-cols-7 bg-white">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="py-2 text-center text-[9px] font-black uppercase text-slate-400 border-r border-b border-slate-100 last:border-r-0">
                  {day}
                </div>
              ))}
              {calendarDays.map((day, index) => {
                const dateStr = day ? `${currentMonth.getFullYear()}-${String(currentMonth.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}` : null;
                const dayEvents = filteredEvents.filter(e => e.date === dateStr);
                const isToday = day === new Date().getDate() && currentMonth.getMonth() === new Date().getMonth() && currentMonth.getFullYear() === new Date().getFullYear();

                return (
                  <div key={index} 
                    onClick={(e) => day && handleDayClick(e, dateStr!)}
                    className={`min-h-[110px] p-2 border-r border-b border-slate-100 transition-all cursor-pointer group hover:bg-indigo-50/30
                    ${!day ? 'bg-slate-50/50' : ''} ${index % 7 === 6 ? 'border-r-0' : ''}`}>
                    
                    <span className={`text-xs font-bold ${isToday ? 'bg-indigo-600 text-white w-6 h-6 flex items-center justify-center rounded-lg shadow-md' : 'text-slate-400'}`}>
                      {day}
                    </span>

                    <div className="mt-2 space-y-1">
                      {dayEvents.slice(0, 3).map((event) => (
                        <div key={event.id} onClick={(e) => { e.stopPropagation(); setSelectedEvent(event); }}
                          className="px-2 py-1 rounded-md text-[9px] font-bold truncate border-l-2 shadow-sm"
                          style={{ backgroundColor: `${event.color}15`, color: event.color, borderLeftColor: event.color }}>
                          {event.title}
                        </div>
                      ))}
                      {dayEvents.length > 3 && <p className="text-[8px] font-bold text-slate-400 pl-1">+{dayEvents.length - 3} more</p>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </main>
      </div>

      {/* --- QUICK ADD POPUP --- */}
      {showAddPopup && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setShowAddPopup(false)} />
          <div className="fixed z-50 w-72 bg-white rounded-2xl shadow-2xl border border-slate-100 p-5 animate-in fade-in zoom-in-95"
            style={{ top: popupPos.y, left: popupPos.x }}>
            
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-indigo-600 animate-pulse" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-tighter">New Event Task</span>
              </div>
              <button onClick={() => setShowAddPopup(false)} className="hover:bg-slate-100 p-1 rounded-md transition-colors">
                <X size={14} className="text-slate-400" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <input autoFocus name="title" placeholder="What's happening?" value={form.title} onChange={handleChange} required className="text-sm font-bold w-full border-none p-0 focus:ring-0 placeholder:text-slate-300" />
              <div className="space-y-2 pt-2 border-t border-slate-50">
                <div className="flex items-center gap-2 text-slate-400">
                  <AlignLeft size={14} />
                  <textarea name="description" placeholder="Add description..." value={form.description} onChange={handleChange} rows={2} className="text-[11px] w-full border-none p-0 focus:ring-0 resize-none bg-transparent" />
                </div>
                <div className="flex items-center gap-2 text-slate-400">
                  <Clock size={14} />
                  <div className="flex items-center gap-1">
                    <input type="time" name="startTime" value={form.startTime} onChange={handleChange} className="text-[10px] border-none p-0 focus:ring-0 bg-transparent font-medium" />
                    <span className="text-[10px]">-</span>
                    <input type="time" name="endTime" value={form.endTime} onChange={handleChange} className="text-[10px] border-none p-0 focus:ring-0 bg-transparent font-medium" />
                  </div>
                </div>
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center gap-2">
                    <input type="color" name="color" value={form.color} onChange={handleChange} className="w-5 h-5 rounded-full border-none cursor-pointer bg-transparent overflow-hidden" />
                    <span className="text-[10px] text-slate-400 font-medium">Label Color</span>
                  </div>
                  <span className="text-[9px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{form.date}</span>
                </div>
              </div>
              <button type="submit" className="w-full bg-indigo-600 text-white py-2.5 rounded-xl text-[11px] font-black hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-100 mt-2">
                Create Event
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}