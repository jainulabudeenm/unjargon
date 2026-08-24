"use client";

import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, Menu, Plus, X, Check, Sparkles, Loader2, Sun, Moon, AlertTriangle, Trash2 
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
  // 1. REFS
  const searchRef = useRef<HTMLInputElement>(null);
  const mainRef = useRef<HTMLDivElement>(null); // 🎯 CRITICAL: Watches the scroll container

  // 2. STATE
  const [glossary, setGlossary] = useState(baseCategories.map(c => ({ ...c, terms: [] as any[] })));
  const [viewMode, setViewMode] = useState('dictionary'); 
  const [theme, setTheme] = useState('dark'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("core-languages");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [adminKey, setAdminKey] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalStep, setModalStep] = useState<'input' | 'generated' | 'success'>('input');
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTerm, setNewTerm] = useState({ category: "core-languages", name: "", analogy: "", description: "" });

  // 3. DERIVED DATA
  const allTerms = useMemo(() => glossary.flatMap(c => c.terms.map(t => ({ ...t, catTitle: c.title }))), [glossary]);
  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return glossary.map(c => ({
      ...c, terms: c.terms.filter(t => t.name.toLowerCase().includes(query) || (t.description && t.description.toLowerCase().includes(query)))
    })).filter(c => c.terms.length > 0);
  }, [searchQuery, glossary]);

  // 4. HANDLERS
  const toggleTheme = useCallback(() => setTheme(prev => prev === 'dark' ? 'light' : 'dark'), []);
  const openModal = useCallback(() => {
    if (!isAdmin) return;
    setNewTerm({ category: "core-languages", name: "", analogy: "", description: "" });
    setModalStep('input');
    setIsModalOpen(true);
  }, [isAdmin]);

  const handleModeChange = useCallback((mode: string) => {
    if (mode === viewMode) return;
    setIsTransitioning(true);
    setTimeout(() => { setViewMode(mode); setIsTransitioning(false); }, 250);
  }, [viewMode]);

  // 5. EFFECTS

  // A. 🎯 SIDEBAR SCROLL SYNC (Fixed Intersection Logic)
  useEffect(() => {
    const container = mainRef.current;
    if (viewMode !== 'dictionary' || !container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // We find the first entry that enters our top "Active Zone"
        const visibleEntry = entries.find(entry => entry.isIntersecting);
        if (visibleEntry) {
          setActiveCategory(visibleEntry.target.id);
        }
      },
      { 
        root: container,
        threshold: 0,
        rootMargin: "-15% 0px -80% 0px" // Only watches a small slice near the top
      }
    );

    const sections = container.querySelectorAll('section[id]');
    sections.forEach((section) => observer.observe(section));

    return () => observer.disconnect();
  }, [viewMode, filteredData]);

  // B. Shortcuts & Mouse Track
  useEffect(() => {
    const handleMove = (e: MouseEvent) => {
      document.documentElement.style.setProperty('--mouse-x', `${e.clientX}px`);
      document.documentElement.style.setProperty('--mouse-y', `${e.clientY}px`);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'a') {
        e.preventDefault();
        const pass = window.prompt("ENTER ARCHITECT KEY:");
        // Cosmetic unlock only. Nothing is verified here and the key is not in
        // the bundle: every write is authorised server side against ADMIN_KEY,
        // so revealing this modal grants nothing on its own.
        if (pass) { setAdminKey(pass); setIsAdmin(true); }
        return;
      }
      if (e.key === 'Escape' && isModalOpen) { setIsModalOpen(false); return; }
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      
      if (viewMode === 'dictionary' && (((e.metaKey || e.ctrlKey) && e.key === 'k') || e.key === '/')) {
        e.preventDefault();
        searchRef.current?.focus();
      }
      if (e.key === 't') toggleTheme();
      if (e.key === 'd' || e.key === '1') handleModeChange('dictionary');
      if (e.key === 'f' || e.key === '2') handleModeChange('flashcards');
      if (isAdmin && e.key === 'n') { e.preventDefault(); openModal(); }

      if (viewMode === 'flashcards' && allTerms.length > 0) {
        if (e.key === 'ArrowRight' || e.key === 'l') { setIsFlipped(false); setCurrentCardIndex(p => (p + 1) % allTerms.length); }
        if (e.key === 'ArrowLeft' || e.key === 'h') { setIsFlipped(false); setCurrentCardIndex(p => (p - 1 + allTerms.length) % allTerms.length); }
        if (e.key === ' ' || e.key === 'Enter') { e.preventDefault(); setIsFlipped(prev => !prev); }
      }
    };
    window.addEventListener('mousemove', handleMove);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('mousemove', handleMove);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [viewMode, allTerms, isAdmin, isModalOpen, toggleTheme, handleModeChange, openModal]);

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

  // 6. DB HANDLERS
  const handleAIGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTerm.name || !isAdmin) return;
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey ?? '' },
        body: JSON.stringify({ term: newTerm.name, existingCategories: baseCategories.map(c => ({ id: c.id, title: c.title })) })
      });
      // Check the status before reading fields. Without this a failed call
      // lands as blank inputs on step 2, which looks like the model returned
      // nothing rather than like an error.
      if (!response.ok) {
        alert(response.status === 401
          ? "Key rejected."
          : "Generation failed. The AI API key is probably invalid or out of quota.");
        return;
      }
      const data = await response.json();
      setNewTerm(prev => ({ ...prev, analogy: data.analogy || "", description: data.description || "", category: data.categoryId || prev.category }));
      setModalStep('generated'); 
    } catch (err) { alert("Sync failed."); } finally { setIsGenerating(false); }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    // Goes through /api/terms rather than the browser's anon client, so the
    // terms table can refuse anon writes at the RLS layer.
    const response = await fetch('/api/terms', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-admin-key': adminKey ?? '' },
      body: JSON.stringify({
        name: newTerm.name, analogy: newTerm.analogy,
        description: newTerm.description, category_id: newTerm.category
      })
    });
    if (!response.ok) {
      alert(response.status === 401 ? "Key rejected." : "Upload failed.");
      return;
    }
    setModalStep('success');
    setTimeout(() => { setIsModalOpen(false); window.location.reload(); }, 1500);
  };

  // Deleting is two clicks rather than a window.confirm: a native dialog blocks
  // the page, and an inline confirm keeps the term you are about to remove visible.
  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      const response = await fetch(`/api/terms?id=${encodeURIComponent(id)}`, {
        method: 'DELETE',
        headers: { 'x-admin-key': adminKey ?? '' }
      });
      if (!response.ok) {
        alert(response.status === 401 ? "Key rejected." : "Delete failed.");
        return;
      }
      setGlossary(prev => prev.map(c => ({ ...c, terms: c.terms.filter((t: any) => t.id !== id) })));
      setPendingDelete(null);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background font-mono text-foreground overflow-hidden relative selection:bg-primary/30">
      <div className="interactive-grid pointer-events-none z-0" />

      {/* HEADER: Added overflow-visible for tooltips */}
      <header className="h-20 lg:h-24 w-full border-b border-border flex items-center bg-background z-50 shadow-sm shrink-0 overflow-visible">
        <div className="w-auto lg:w-64 h-full flex items-center px-4 lg:px-6 lg:border-r border-border shrink-0">
           <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 hover:bg-white/5 mr-2 -ml-2"><Menu className="w-5 h-5"/></button>
           <div className="flex flex-col justify-center">
             <h1 className="text-xl lg:text-2xl font-black italic tracking-tighter leading-none uppercase">unjargon.</h1>
             <p className="text-[10px] uppercase tracking-[0.2em] font-bold text-muted-foreground mt-1.5 leading-tight hidden sm:block">Demystifying tech for designers.</p>
           </div>
        </div>

        <div className="flex-1 flex h-full items-center px-4 lg:px-10 gap-4 overflow-visible">
          <div className="flex-1 flex justify-start shrink-0 overflow-visible">
             {/* MODE TOGGLE */}
             <div className="hidden sm:flex relative bg-border p-px shrink-0 overflow-visible">
                <div className={`absolute top-px bottom-px bg-primary transition-all duration-300 ease-out z-0 pointer-events-none ${viewMode === 'dictionary' ? 'left-px w-[140px]' : 'left-[141px] w-[140px]'}`} />
                
                <button onClick={() => handleModeChange('dictionary')} className="group relative z-10 w-[140px] py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors duration-300">
                  <span className={viewMode === 'dictionary' ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}>Dictionary</span>
                  <kbd className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center px-2 py-1 rounded border border-border bg-card text-[10px] opacity-0 group-hover:opacity-100 transition-all text-foreground shadow-xl pointer-events-none z-[100]">D</kbd>
                </button>
                
                <button onClick={() => handleModeChange('flashcards')} className="group relative z-10 w-[140px] py-2.5 text-[11px] font-black uppercase tracking-widest transition-colors duration-300">
                  <span className={viewMode === 'flashcards' ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground"}>Flashcards</span>
                  <kbd className="absolute -bottom-10 left-1/2 -translate-x-1/2 flex items-center justify-center px-2 py-1 rounded border border-border bg-card text-[10px] opacity-0 group-hover:opacity-100 transition-all text-foreground shadow-xl pointer-events-none z-[100]">F</kbd>
                </button>
             </div>
          </div>
          
          <div className={`w-full max-w-4xl relative group hidden md:block h-10 lg:h-11 shrink transition-all duration-500 ease-in-out ${viewMode === 'dictionary' ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-10 scale-95 pointer-events-none'}`}>
             <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
             <input ref={searchRef} type="text" placeholder="SEARCH THE VAULT..." className="w-full h-full bg-card border border-border pl-12 pr-16 text-[11px] font-bold uppercase tracking-widest focus:outline-none focus:border-primary/50 transition-all shadow-inner" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
             <div className="absolute right-4 top-1/2 -translate-y-1/2 flex gap-1 pointer-events-none">
                <kbd className="px-2 py-1 rounded border border-border bg-background text-[10px] text-muted-foreground shadow-sm font-bold">⌘</kbd>
                <kbd className="px-2 py-1 rounded border border-border bg-background text-[10px] text-muted-foreground shadow-sm font-bold">K</kbd>
             </div>
          </div>
          
          <div className="flex-1 flex items-center justify-end gap-6 shrink-0 h-10 lg:h-11 overflow-visible">
            <div onClick={toggleTheme} className="w-16 lg:w-20 h-full bg-card border border-border relative cursor-pointer flex items-center group shrink-0">
              <div className="absolute inset-0 flex justify-between items-center px-2.5 opacity-20"><Sun className="w-3 h-3" /><Moon className="w-3 h-3" /></div>
              <div className={`absolute top-0 h-full w-1/2 bg-primary transition-all duration-200 flex items-center justify-center ${theme === 'dark' ? 'translate-x-full border-l border-white/10' : 'translate-x-0 border-r border-white/10'}`}>
                 {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-primary-foreground" /> : <Sun className="w-3.5 h-3.5 text-primary-foreground" />}
              </div>
              <kbd className="absolute -bottom-10 left-1/2 -translate-x-1/2 items-center justify-center px-2 py-1 rounded border border-border bg-card text-[10px] opacity-0 group-hover:opacity-100 transition-all text-foreground shadow-xl pointer-events-none z-[100]">T</kbd>
            </div>
            {isAdmin && (
              <button onClick={openModal} className="hidden lg:flex h-full px-8 bg-foreground text-background text-[11px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all items-center justify-center relative group">
                New Entry <kbd className="absolute -bottom-10 right-0 items-center justify-center px-2 py-1 rounded border border-border bg-card text-[10px] opacity-0 group-hover:opacity-100 transition-all text-foreground shadow-xl pointer-events-none z-[100]">N</kbd>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* MAIN BODY */}
      <div className="flex flex-1 overflow-hidden relative z-10">
        {viewMode === 'dictionary' && (
          <aside className="w-64 border-r border-border hidden lg:flex flex-col bg-background shrink-0 z-40 relative">
            <nav className="flex-1 overflow-y-auto px-6 py-8 space-y-1 custom-scrollbar pb-28">
              {glossary.map(cat => (
                <button key={cat.id} onClick={() => { document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' }); setActiveCategory(cat.id); }} 
                  className={`w-full text-left py-3 px-4 text-[11px] font-black uppercase tracking-tight transition-all bg-transparent border-none ${activeCategory === cat.id ? "text-primary translate-x-1" : "text-muted-foreground hover:text-foreground"}`}>
                  {cat.title}
                </button>
              ))}
            </nav>
          </aside>
        )}

        <main ref={mainRef} className={`flex-1 overflow-y-auto relative scroll-smooth custom-scrollbar transition-all duration-300 ease-out z-10 ${isTransitioning ? 'opacity-0 translate-y-4 scale-[0.98]' : 'opacity-100 translate-y-0 scale-100'}`}>
          {viewMode === 'dictionary' ? (
            <div className="max-w-4xl mx-auto px-4 lg:px-10 space-y-20 lg:space-y-32 relative z-10 pb-40 pt-10">
              {filteredData.map(cat => (
                <section key={cat.id} id={cat.id} className="scroll-mt-0">
                  <div className="sticky top-0 z-30 bg-background pt-8 pb-6 border-b border-white/5">
                    <h2 className="text-xs font-black text-primary uppercase tracking-[0.5em] flex items-center gap-4">{cat.title} <span className="h-px bg-primary/20 flex-1"></span></h2>
                  </div>
                  <div className="border border-border bg-background shadow-2xl mt-8">
                    {cat.terms.map((term, idx) => (
                      <article key={term.id} className={`relative p-8 lg:p-10 group transition-all hover:bg-primary/[0.02] bg-background ${idx !== cat.terms.length -1 ? 'border-b border-border' : ''}`}>
                        <div className="absolute left-0 top-0 w-1.5 h-0 bg-primary group-hover:h-full transition-all duration-500"></div>
                        {isAdmin && (
                          <div className="absolute top-6 right-6 flex items-center gap-2 z-10">
                            {pendingDelete === term.id ? (
                              <>
                                <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground hidden sm:inline">Delete?</span>
                                <button onClick={() => handleDelete(term.id)} disabled={deletingId === term.id}
                                  className="px-3 py-1.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest disabled:opacity-50">
                                  {deletingId === term.id ? 'Deleting' : 'Confirm'}
                                </button>
                                <button onClick={() => setPendingDelete(null)}
                                  className="px-3 py-1.5 border border-border text-[10px] font-black uppercase tracking-widest text-muted-foreground hover:text-foreground">
                                  Cancel
                                </button>
                              </>
                            ) : (
                              <button onClick={() => setPendingDelete(term.id)} aria-label={`Delete ${term.name}`}
                                className="p-2 text-muted-foreground hover:text-primary opacity-60 hover:opacity-100 transition-opacity">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        )}
                        <h3 className="text-2xl font-black mb-6 tracking-tighter uppercase leading-none pr-28">{term.name}</h3>
                        <div className="mb-6">
                           <p className="text-[11px] font-black text-primary uppercase tracking-widest mb-3 opacity-60">Analogy</p>
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
             <div className="h-full flex flex-col items-center justify-center p-4">
                <div className="w-full max-w-xl space-y-16 text-center">
                  <div className="w-full aspect-video perspective-1000 cursor-pointer group" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                      <div className="absolute inset-0 backface-hidden border border-border bg-background flex flex-col items-center justify-center p-16 shadow-2xl">
                        <h2 className="text-3xl lg:text-5xl font-black tracking-tighter uppercase leading-none">{allTerms[currentCardIndex]?.name}</h2>
                        <p className="mt-8 text-xs font-black text-primary/60 uppercase tracking-widest animate-pulse">Tap or <kbd className="mx-1 px-2 py-1 rounded border border-primary/30 bg-primary/10 text-[10px]">Space</kbd> to reveal</p>
                      </div>
                      <div className="absolute inset-0 backface-hidden border-2 border-primary bg-primary text-primary-foreground flex flex-col items-center justify-center p-8 lg:p-16" style={{ transform: 'rotateY(180deg) translateZ(1px)' }}>
                        <p className="text-xl lg:text-2xl font-black italic tracking-tighter mb-8 leading-tight">“{allTerms[currentCardIndex]?.analogy}”</p>
                        <p className="text-sm opacity-90">{allTerms[currentCardIndex]?.description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-px bg-border max-w-xs mx-auto p-px shadow-xl">
                    <button onClick={() => { setIsFlipped(false); setCurrentCardIndex(p => (p - 1 + allTerms.length) % allTerms.length); }} className="flex-1 py-4 bg-background hover:bg-muted text-[11px] font-black uppercase flex items-center justify-center gap-4">Prev</button>
                    <button onClick={() => { setIsFlipped(false); setCurrentCardIndex(p => (p + 1) % allTerms.length); }} className="flex-1 py-4 bg-background hover:bg-muted text-[11px] font-black uppercase flex items-center justify-center gap-4">Next</button>
                  </div>
                </div>
            </div>
          )}
        </main>
      </div>

      {/* WATERMARK */}
      <div className="hidden sm:flex fixed bottom-6 right-6 lg:right-10 z-[60] group flex-col items-end drop-shadow-2xl">
        <div className="relative bg-card border border-border p-4 transition-all duration-500 w-auto max-w-[240px] group-hover:max-w-sm hover:border-primary/50 shadow-[0_0_15px_rgba(0,0,0,0.5)] group-hover:-translate-y-1 overflow-hidden">
          <span className="absolute -top-1 -right-1 flex h-3 w-3 group-hover:hidden"><span className="animate-ping absolute h-full w-full rounded-full bg-primary opacity-75"></span><span className="relative h-3 w-3 rounded-full bg-primary"></span></span>
          <div className="flex items-center gap-3 whitespace-nowrap"><AlertTriangle className="w-5 h-5 text-primary animate-pulse" /><span className="text-[11px] font-black uppercase tracking-widest text-primary">CAUTION: Designer coding</span></div>
          <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-all duration-500">
            <div className="overflow-hidden"><p className="mt-4 text-[11px] text-muted-foreground leading-relaxed font-sans">I built this to finally understand the devs. 👾 Raised my first PR, learned a ton, and only cried twice. 😭 Let's connect! 🤝</p>
            <a href="https://www.linkedin.com/in/jainulabudeen" target="_blank" rel="noreferrer" className="mt-4 inline-flex items-center gap-1.5 text-[11px] font-black text-primary hover:text-foreground border-b border-primary/30 pb-0.5">LinkedIn↗</a></div>
          </div>
        </div>
      </div>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-background/95 backdrop-blur-md flex items-center justify-center p-4" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-md bg-background border border-primary p-8 lg:p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center pb-6 border-b border-primary/10 mb-8">
               <h2 className="text-xl font-black italic flex items-center gap-3">VAULT_ENTRY <span className="text-[10px] bg-primary/10 text-primary px-2 py-1 rounded border border-primary/20">STEP {modalStep === 'input' ? '1' : '2'}/2</span></h2>
               <button onClick={() => setIsModalOpen(false)} className="group flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors"><span className="text-[10px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100">ESC TO EXIT</span><X className="w-6 h-6 transition-transform group-hover:rotate-90"/></button>
            </div>
            {modalStep === 'success' ? (
              <div className="flex flex-col items-center py-12 space-y-6"><Check className="w-14 h-14 text-primary animate-bounce" /><h2 className="text-2xl font-black uppercase text-primary tracking-widest">Entry Secured</h2></div>
            ) : (
              <div className="animate-in fade-in slide-in-from-bottom-4">
                {modalStep === 'input' && (
                  <form id="modal-form" className="space-y-8" onSubmit={handleAIGenerate}>
                    <div className="space-y-3"><label className="text-xs font-black text-muted-foreground uppercase tracking-widest flex justify-between">Identify Target Term <span className="opacity-40">Required</span></label>
                    <input autoFocus className="w-full bg-card border border-border p-5 text-sm font-black uppercase outline-none focus:border-primary shadow-inner" placeholder="E.G. WEBHOOK" value={newTerm.name} onChange={e => setNewTerm({...newTerm, name: e.target.value})} /></div>
                    <button type="submit" disabled={isGenerating || !newTerm.name} className="w-full py-5 px-8 bg-primary text-primary-foreground text-[11px] font-black uppercase hover:opacity-90 transition-all flex items-center justify-between disabled:opacity-50 group">
                      <div className="flex items-center gap-3">{isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />} {isGenerating ? 'Decrypting...' : 'Generate Definition'}</div>
                      <div className="hidden sm:flex gap-1.5 ml-auto opacity-90 group-hover:opacity-100 transition-opacity"><kbd className="px-2 py-1 border border-white/40 rounded bg-white/20 text-[10px] font-bold shadow-sm">⌘</kbd><kbd className="px-2 py-1 border border-white/40 rounded bg-white/20 text-[10px] font-bold shadow-sm">↵</kbd></div>
                    </button>
                  </form>
                )}
                {modalStep === 'generated' && (
                  <form id="modal-form" className="space-y-6" onSubmit={handleUpload}>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2"><label className="text-xs font-black text-muted-foreground uppercase">Alignment</label><select className="w-full bg-card border border-border p-3.5 text-[11px] font-bold uppercase outline-none focus:border-primary appearance-none cursor-pointer" value={newTerm.category} onChange={e => setNewTerm({...newTerm, category: e.target.value})}>{baseCategories.map(cat => (<option key={cat.id} value={cat.id}>{cat.title}</option>))}</select></div>
                      <div className="space-y-2"><label className="text-xs font-black text-muted-foreground uppercase">Term</label><input className="w-full bg-card border border-border p-3.5 text-[11px] font-black uppercase outline-none focus:border-primary" value={newTerm.name} onChange={e => setNewTerm({...newTerm, name: e.target.value})} /></div>
                    </div>
                    <div className="space-y-2"><label className="text-xs font-black text-muted-foreground uppercase">Designer Analogy</label><input className="w-full bg-card border border-border p-3.5 text-[11px] font-black outline-none focus:border-primary" value={newTerm.analogy} onChange={e => setNewTerm({...newTerm, analogy: e.target.value})} /></div>
                    <div className="space-y-2"><label className="text-xs font-black text-muted-foreground uppercase">Explanation</label><textarea className="w-full bg-card border border-border p-3.5 text-[11px] font-sans h-24 outline-none focus:border-primary resize-none" value={newTerm.description} onChange={e => setNewTerm({...newTerm, description: e.target.value})} /></div>
                    <button type="submit" className="w-full py-5 px-8 mt-2 bg-primary text-primary-foreground text-[11px] font-black uppercase hover:opacity-90 transition-all shadow-[4px_4px_0px_rgba(255,77,0,0.2)] active:translate-y-1 flex items-center justify-between group">
                      <div className="flex items-center gap-3"><Check className="w-5 h-5" /> Authorize Upload</div>
                      <div className="hidden sm:flex gap-1.5 ml-auto opacity-90 group-hover:opacity-100 transition-opacity"><kbd className="px-2 py-1 border border-white/40 rounded bg-white/20 text-[10px] font-bold shadow-sm">⌘</kbd><kbd className="px-2 py-1 border border-white/40 rounded bg-white/20 text-[10px] font-bold shadow-sm">↵</kbd></div>
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