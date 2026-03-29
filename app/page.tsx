"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, BookOpen, Terminal, Code2, Layers, 
  Paintbrush, Database, Rocket, HelpCircle, 
  Hash, Box, FileText, Info, Plus, X, 
  Check, Sparkles, Loader2, Sun, Moon, Menu, AlertTriangle
} from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

const baseCategories = [
  { id: "core-languages", title: "1. Core Languages" },
  { id: "styling", title: "2. Styling & Quality" },
  { id: "building-blocks", title: "3. Building Blocks" },
  { id: "backend", title: "4. The Backend" },
  { id: "workspace", title: "5. The Workspace" },
  { id: "package-managers", title: "6. Package Managers" },
  { id: "version-control", title: "7. Version Control" },
  { id: "launching", title: "8. Launching" },
  { id: "documentation", title: "9. Documentation" },
  { id: "faqs", title: "10. FAQs" }
];

export default function App() {
  const [glossary, setGlossary] = useState(baseCategories.map(c => ({ ...c, terms: [] as any[] })));
  const [viewMode, setViewMode] = useState('dictionary'); 
  const [theme, setTheme] = useState('dark'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("core-languages");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  // MODAL STATE MANAGEMENT
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'input' | 'generated' | 'success'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTerm, setNewTerm] = useState({ category: "core-languages", name: "", analogy: "", description: "" });

  const openModal = () => {
    setNewTerm({ category: "core-languages", name: "", analogy: "", description: "" });
    setModalStep('input');
    setIsModalOpen(true);
  };

  // MOUSE HEAD TRACKER
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    const handleTouch = (e: TouchEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.touches[0].clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.touches[0].clientY}px`);
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('touchmove', handleTouch);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('touchmove', handleTouch);
    };
  }, []);

  // SCROLL SYNC
  useEffect(() => {
    if (viewMode !== 'dictionary') return;
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => {
        if (entry.isIntersecting) setActiveCategory(entry.target.id);
      }),
      { threshold: 0, rootMargin: "-20% 0px -75% 0px" }
    );
    baseCategories.forEach((cat) => {
      const el = document.getElementById(cat.id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [viewMode, glossary]);

  useEffect(() => {
    const root = window.document.documentElement;
    theme === 'light' ? root.classList.add('light') : root.classList.remove('light');
  }, [theme]);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('terms').select('*');
      if (data) setGlossary(baseCategories.map(cat => ({ ...cat, terms: data.filter(t => t.category_id === cat.id) })));
    }
    load();
  }, []);

  // AI GENERATION
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.name) return alert("Identify the term first!");
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: newTerm.name, existingCategories: baseCategories.map(c => ({ id: c.id, title: c.title })) })
      });
      const data = await response.json();
      setNewTerm(prev => ({ 
        ...prev, 
        analogy: data.analogy || "", 
        description: data.description || "", 
        category: data.categoryId || prev.category 
      }));
      setModalStep('generated'); 
    } catch (e) { 
      alert("Vault Sync failed."); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  // DATABASE UPLOAD
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    const { data } = await supabase.from('terms').insert([{ 
      name: newTerm.name, analogy: newTerm.analogy, description: newTerm.description, category_id: newTerm.category 
    }]).select();
    
    if (data) {
      setModalStep('success'); 
      setTimeout(() => {
        setIsModalOpen(false);
        window.location.reload();
      }, 1500); 
    }
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return glossary.map(c => ({
      ...c, terms: c.terms.filter(t => t.name.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query)))
    })).filter(c => c.terms.length > 0);
  }, [searchQuery, glossary]);

  const allTerms = useMemo(() => glossary.flatMap(c => c.terms.map(t => ({ ...t, catTitle: c.title }))), [glossary]);

  return (
    <div className="flex flex-col h-screen bg-background font-mono text-foreground overflow-hidden relative selection:bg-primary/30">
      
      <div className="interactive-grid" />

      {/* 1. SYMMETRIC TOP BAR */}
      <header className="h-20 lg:h-24 w-full border-b border-border flex items-center bg-background z-50 shadow-sm shrink-0">
        
        {/* LOGO CONTAINER */}
        <div className="w-auto lg:w-64 h-full flex items-center px-4 lg:px-6 lg:border-r border-border shrink-0">
           <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/5 mr-2 -ml-2"><Menu className="w-5 h-5"/></button>
           <div className="flex flex-col justify-center">
             <h1 className="text-xl lg:text-2xl font-black italic tracking-tighter leading-none uppercase">unjargon.</h1>
             <p className="text-[6px] lg:text-[7px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1.5 leading-tight hidden sm:block">
               Demystifying tech terminology for designers.
             </p>
           </div>
        </div>

        {/* MAIN HEADER CONTAINER */}
        <div className="flex-1 flex h-full items-center px-4 lg:px-10 gap-4">
          <div className="flex-1 flex justify-start shrink-0">
             <div className="hidden sm:flex gap-px bg-border p-px shrink-0">
                <button onClick={() => setViewMode('dictionary')} className={`px-4 lg:px-6 py-2.5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'dictionary' ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}>Dictionary</button>
                <button onClick={() => setViewMode('flashcards')} className={`px-4 lg:px-6 py-2.5 text-[9px] lg:text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'flashcards' ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}>Flashcards</button>
             </div>
          </div>
          
          <div className="w-full max-w-4xl relative group hidden md:block h-10 lg:h-11 shrink">
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <input 
               type="text" 
               placeholder="SEARCH THE VAULT..." 
               className="w-full h-full bg-card border border-border pl-12 pr-4 text-[10px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all shadow-inner" 
               value={searchQuery} 
               onChange={e => setSearchQuery(e.target.value)} 
             />
          </div>
          
          <div className="flex-1 flex items-center justify-end gap-4 shrink-0 h-10 lg:h-11">
            <div onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="w-16 lg:w-20 h-full bg-card border border-border relative cursor-pointer flex items-center group shrink-0">
              <div className="absolute inset-0 flex justify-between items-center px-2.5 opacity-20"><Sun className="w-3 h-3" /><Moon className="w-3 h-3" /></div>
              <div className={`absolute top-0 h-full w-1/2 bg-primary transition-all duration-200 flex items-center justify-center ${theme === 'dark' ? 'translate-x-full border-l border-white/10' : 'translate-x-0 border-r border-white/10'}`}>
                 {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary-foreground" /> : <Sun className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>
            </div>
            <button onClick={openModal} className="hidden lg:flex h-full px-6 lg:px-8 bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,77,0,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1 shrink-0">
              New Entry
            </button>
          </div>
        </div>
      </header>

      {/* MOBILE FAB */}
      <button onClick={openModal} className="lg:hidden fixed bottom-8 right-6 w-14 h-14 bg-primary text-primary-foreground rounded-none z-[60] flex items-center justify-center shadow-[6px_6px_0px_0px_rgba(0,0,0,0.3)] active:translate-x-1 active:translate-y-1 transition-all border border-white/10">
        <Plus className="w-6 h-6" />
      </button>

      {/* 2. MAIN BODY (Sidebar + Content) */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        
        {/* MOBILE DRAWER */}
        {isSidebarOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] lg:hidden" onClick={() => setIsSidebarOpen(false)}>
            <aside className="w-72 h-full bg-background border-r border-border p-8 space-y-6 flex flex-col" onClick={e => e.stopPropagation()}>
              <div className="flex justify-between items-center border-b border-border pb-6">
                 <h1 className="text-xl font-black italic tracking-tighter uppercase">Menu</h1>
                 <button onClick={() => setIsSidebarOpen(false)}><X className="w-6 h-6"/></button>
              </div>
              {viewMode === 'dictionary' && (
                <nav className="space-y-4 flex-1 overflow-y-auto pb-28">
                  {glossary.map(cat => (
                    <button key={cat.id} onClick={() => { setViewMode('dictionary'); setActiveCategory(cat.id); setIsSidebarOpen(false); document.getElementById(cat.id)?.scrollIntoView(); }} 
                      className={`w-full text-left py-2 text-[10px] font-black uppercase tracking-tight transition-all ${activeCategory === cat.id ? "text-primary translate-x-1" : "text-muted-foreground"}`}>
                      {cat.title}
                    </button>
                  ))}
                </nav>
              )}
            </aside>
          </div>
        )}

        {/* DESKTOP SIDEBAR */}
        {viewMode === 'dictionary' && (
          <aside className="w-64 border-r border-border hidden lg:flex flex-col bg-background shrink-0 z-40 relative">
            <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-1 custom-scrollbar pb-28">
              {glossary.map(cat => (
                <button key={cat.id} onClick={() => { setViewMode('dictionary'); setActiveCategory(cat.id); document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' }); }} 
                  className={`w-full text-left py-2.5 px-4 text-[10px] font-black uppercase tracking-tight transition-all bg-transparent border-none ${activeCategory === cat.id && viewMode === 'dictionary' ? "text-primary translate-x-1" : "text-muted-foreground hover:text-foreground"}`}>
                  {cat.title}
                </button>
              ))}
            </nav>
          </aside>
        )}

        {/* SCROLLABLE CONTENT AREA */}
        <main className="flex-1 overflow-y-auto relative scroll-smooth custom-scrollbar">
          {viewMode === 'dictionary' ? (
            <div className="max-w-4xl mx-auto px-4 lg:px-10 space-y-20 lg:space-y-32 relative z-10 pb-40">
              {filteredData.map(cat => (
                <section key={cat.id} id={cat.id} className="scroll-mt-0">
                  <div className="sticky top-0 z-30 bg-background pt-8 pb-6 border-b border-white/5">
                    <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.6em] flex items-center gap-4">
                      {cat.title} <span className="h-px bg-primary/20 flex-1"></span>
                    </h2>
                  </div>

                  <div className="border border-border bg-background shadow-2xl relative z-10">
                    {cat.terms.map((term, idx) => (
                      <article key={term.id} className={`relative p-8 lg:p-10 group transition-all duration-300 hover:bg-primary/[0.02] bg-background ${idx !== cat.terms.length -1 ? 'border-b border-border' : ''}`}>
                        <div className="absolute left-0 top-0 w-1.5 h-0 bg-primary group-hover:h-full transition-all duration-500"></div>
                        <h3 className="text-2xl font-black mb-6 tracking-tighter uppercase leading-none">{term.name}</h3>
                        <div className="mb-6">
                           <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-3 opacity-50">Analogy</p>
                           <p className="text-xl font-black text-foreground italic border-l-4 border-primary pl-6 leading-tight">“{term.analogy}”</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-sans max-w-2xl">{term.description}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
             <div className="h-full flex flex-col items-center justify-center relative z-10 p-4">
              {allTerms.length > 0 ? (
                <div className="w-full max-w-xl space-y-16 text-center">
                  <div className="w-full aspect-video perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                      <div className="absolute inset-0 backface-hidden border border-border bg-background flex flex-col items-center justify-center p-16 shadow-2xl">
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-none text-center px-4">{allTerms[currentCardIndex].name}</h2>
                        <p className="mt-8 text-[8px] font-black text-primary/40 uppercase tracking-widest animate-pulse text-center">Tap to reveal</p>
                      </div>
                      <div className="absolute inset-0 backface-hidden border-2 border-primary bg-primary text-primary-foreground flex flex-col items-center justify-center p-8 lg:p-16" style={{ transform: 'rotateY(180deg) translateZ(1px)' }}>
                        <p className="text-xl lg:text-2xl font-black italic tracking-tighter mb-8 leading-tight text-center">“{allTerms[currentCardIndex].analogy}”</p>
                        <p className="text-xs lg:text-sm font-sans leading-relaxed max-w-xs opacity-90 text-center">{allTerms[currentCardIndex].description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-px bg-border max-w-xs mx-auto p-px shadow-xl">
                    <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setCurrentCardIndex(p => (p - 1 + allTerms.length) % allTerms.length); }} className="flex-1 py-4 bg-background hover:bg-muted text-[10px] font-black uppercase transition-all">Prev</button>
                    <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setCurrentCardIndex(p => (p + 1) % allTerms.length); }} className="flex-1 py-4 bg-background hover:bg-muted text-[10px] font-black uppercase transition-all">Next</button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </main>
      </div>

      {/* 3. THE "WARNING LABEL" WATERMARK (Bottom Right, Desktop Only) */}
      <div className="hidden sm:flex fixed bottom-6 right-6 lg:right-10 z-[60] group flex-col items-end drop-shadow-2xl">
        <div className="relative bg-card border border-border p-3.5 transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)] overflow-hidden w-auto max-w-[220px] group-hover:max-w-sm cursor-default hover:border-primary/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:shadow-[0_0_20px_rgba(255,77,0,0.15)] group-hover:-translate-y-1">
          
          {/* Pinging Notification Dot */}
          <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5 group-hover:hidden">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary"></span>
          </span>

          <div className="flex items-center gap-3 whitespace-nowrap">
            <AlertTriangle className="w-4 h-4 text-primary shrink-0 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-widest text-primary">CAUTION: Designer coding</span>
          </div>
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500 ease-[cubic-bezier(0.23,1,0.32,1)]">
            <div className="overflow-hidden">
              <p className="mt-4 text-[11px] text-muted-foreground leading-relaxed font-sans whitespace-normal">
              I built this to finally understand the devs. 👾 Raised my first PR, learned a ton, and only cried twice. 😭 If you're also on the designer-to-code journey, let's connect! 🤝
              </p>
              <a 
                href="https://www.linkedin.com/in/jainulabudeen" 
                target="_blank" 
                rel="noreferrer" 
                className="mt-4 inline-flex items-center gap-1.5 text-[10px] font-black text-primary hover:text-foreground transition-colors uppercase tracking-widest border-b border-primary/30 pb-0.5"
              >
                LinkedIn↗
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-STEP MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4 lg:p-6" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-md bg-background border border-primary p-8 lg:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            
            {modalStep === 'success' ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-6 animate-in fade-in zoom-in-95 duration-300">
                <div className="w-20 h-20 rounded-full border-2 border-primary bg-primary/10 flex items-center justify-center text-primary shadow-[0_0_30px_rgba(255,77,0,0.2)]">
                  <Check className="w-10 h-10" />
                </div>
                <div className="text-center space-y-2">
                  <h2 className="text-2xl font-black uppercase tracking-widest text-primary">Entry Secured</h2>
                  <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Vault Updated Successfully</p>
                </div>
              </div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4 duration-300">
                <div className="flex justify-between items-center pb-6 border-b border-primary/10 mb-8">
                  <h2 className="text-xl font-black uppercase tracking-tighter italic">VAULT_ENTRY</h2>
                  <button onClick={() => setIsModalOpen(false)} className="hover:rotate-90 transition-transform text-muted-foreground hover:text-primary"><X className="w-5 h-5"/></button>
                </div>

                {modalStep === 'input' && (
                  <form className="space-y-8" onSubmit={handleAIGenerate}>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Identify Target Term</label>
                      <input autoFocus className="w-full bg-card border border-border p-5 text-sm font-black uppercase outline-none focus:border-primary transition-colors placeholder:text-muted-foreground/30 shadow-inner" placeholder="E.G. WEBHOOK" value={newTerm.name} onChange={e => setNewTerm({...newTerm, name: e.target.value})} />
                    </div>
                    <button type="submit" disabled={isGenerating || !newTerm.name} className="w-full py-5 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] flex items-center justify-center gap-3 disabled:opacity-50">
                      {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                      {isGenerating ? 'Decrypting Vault...' : 'Generate Definition'}
                    </button>
                  </form>
                )}

                {modalStep === 'generated' && (
                  <form className="space-y-6" onSubmit={handleUpload}>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Category Alignment</label>
                      <select className="w-full bg-card border border-border p-3.5 text-[11px] font-bold uppercase outline-none focus:border-primary appearance-none cursor-pointer shadow-inner" value={newTerm.category} onChange={e => setNewTerm({...newTerm, category: e.target.value})}>
                        {baseCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.title}</option>))}
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Term Name</label>
                      <input className="w-full bg-card border border-border p-3.5 text-[11px] font-black uppercase outline-none focus:border-primary transition-colors shadow-inner" value={newTerm.name} onChange={e => setNewTerm({...newTerm, name: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Designer Analogy</label>
                      <input className="w-full bg-card border border-border p-3.5 text-[11px] font-black outline-none focus:border-primary transition-colors shadow-inner" value={newTerm.analogy} onChange={e => setNewTerm({...newTerm, analogy: e.target.value})} />
                    </div>
                    <div className="space-y-2">
                      <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Explanation</label>
                      <textarea className="w-full bg-card border border-border p-3.5 text-[11px] font-sans h-24 outline-none focus:border-primary resize-none transition-colors shadow-inner leading-relaxed" value={newTerm.description} onChange={e => setNewTerm({...newTerm, description: e.target.value})} />
                    </div>
                    <button type="submit" className="w-full py-5 mt-2 bg-primary text-primary-foreground text-[11px] font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-[0.98] shadow-[4px_4px_0px_rgba(255,77,0,0.2)] active:shadow-none active:translate-y-1 active:translate-x-1">
                      Authorize Upload
                    </button>
                  </form>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}