"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { 
  Search, BookOpen, Terminal, Code2, Layers, 
  Paintbrush, Database, Rocket, HelpCircle, 
  Hash, Box, FileText, Info, Plus, X, 
  CreditCard, ArrowRight, ArrowLeft, Shuffle, Sparkles, Loader2, Trash2,
  Sun, Moon
} from 'lucide-react';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL || "", process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "");

const baseCategories = [
  { id: "core-languages", title: "1. Core Languages", icon: <Code2 className="w-3.5 h-3.5" /> },
  { id: "styling", title: "2. Styling & Quality", icon: <Paintbrush className="w-3.5 h-3.5" /> },
  { id: "building-blocks", title: "3. Building Blocks", icon: <Layers className="w-3.5 h-3.5" /> },
  { id: "backend", title: "4. The Backend", icon: <Database className="w-3.5 h-3.5" /> },
  { id: "workspace", title: "5. The Workspace", icon: <Terminal className="w-3.5 h-3.5" /> },
  { id: "package-managers", title: "6. Package Managers", icon: <Box className="w-3.5 h-3.5" /> },
  { id: "version-control", title: "7. Version Control", icon: <BookOpen className="w-3.5 h-3.5" /> },
  { id: "launching", title: "8. Launching", icon: <Rocket className="w-3.5 h-3.5" /> },
  { id: "documentation", title: "9. Documentation", icon: <FileText className="w-3.5 h-3.5" /> },
  { id: "faqs", title: "10. FAQs", icon: <HelpCircle className="w-3.5 h-3.5" /> }
];

export default function App() {
  const [glossary, setGlossary] = useState(baseCategories.map(c => ({ ...c, terms: [] as any[] })));
  const [viewMode, setViewMode] = useState('dictionary'); 
  const [theme, setTheme] = useState('dark'); 
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("core-languages");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTerm, setNewTerm] = useState({ category: "core-languages", name: "", analogy: "", description: "" });

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

  const handleAIGenerate = async () => {
    if (!newTerm.name) return alert("Enter term first!");
    setIsGenerating(true);
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: newTerm.name, existingCategories: baseCategories.map(c => ({ id: c.id, title: c.title })) })
      });
      const data = await response.json();
      setNewTerm(prev => ({ ...prev, analogy: data.analogy || "", description: data.description || "", category: data.categoryId || prev.category }));
    } catch (e) { alert("Vault Sync failed."); } 
    finally { setIsGenerating(false); }
  };

  const filteredData = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return glossary.map(c => ({
      ...c, terms: c.terms.filter(t => t.name.toLowerCase().includes(query) || t.description.toLowerCase().includes(query))
    })).filter(c => c.terms.length > 0);
  }, [searchQuery, glossary]);

  const allTerms = useMemo(() => glossary.flatMap(c => c.terms.map(t => ({ ...t, catTitle: c.title }))), [glossary]);

  return (
    <div className="flex h-screen bg-background font-mono text-foreground overflow-hidden">
      
      {/* SIDEBAR */}
      <aside className="w-60 border-r border-border hidden lg:flex flex-col bg-card/10">
        <header className="p-10">
          <h1 className="text-2xl font-black italic tracking-tighter leading-none uppercase">unjargon.</h1>
          <p className="text-[8px] uppercase tracking-[0.4em] font-bold text-muted-foreground mt-3">Product Designer Edition</p>
        </header>
        <nav className="flex-1 overflow-y-auto px-6 space-y-1">
          {glossary.map(cat => (
            <button key={cat.id} onClick={() => { setViewMode('dictionary'); setActiveCategory(cat.id); document.getElementById(cat.id)?.scrollIntoView({ behavior: 'smooth' }); }} 
              className={`w-full text-left py-2 text-[10px] font-black uppercase tracking-tight transition-all ${activeCategory === cat.id && viewMode === 'dictionary' ? "text-primary translate-x-1" : "text-muted-foreground hover:text-foreground"}`}>
              {cat.title}
            </button>
          ))}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col min-w-0">
        {/* TOP BAR */}
        <header className="h-24 border-b border-border flex items-center justify-between px-10 bg-background z-40">
          <div className="flex gap-px bg-border p-px">
            <button onClick={() => { setViewMode('dictionary'); setIsFlipped(false); }} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'dictionary' ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}>Dictionary</button>
            <button onClick={() => { setViewMode('flashcards'); setIsFlipped(false); }} className={`px-6 py-2.5 text-[10px] font-black uppercase tracking-widest transition-all ${viewMode === 'flashcards' ? "bg-primary text-primary-foreground" : "bg-background text-muted-foreground hover:text-foreground"}`}>Flashcards</button>
          </div>

          <div className="flex flex-1 max-w-sm mx-10 items-center gap-6">
            <div className="relative flex-1 group">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground group-focus-within:text-primary transition-colors" />
               <input type="text" placeholder="SEARCH_VULT..." className="w-full bg-card border border-border pl-10 pr-4 py-3 text-[10px] font-bold tracking-widest uppercase focus:outline-none focus:border-primary/50" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} />
            </div>
            
            {/* MECHANICAL THEME TOGGLE */}
            <div 
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-20 h-10 bg-card border border-border relative cursor-pointer flex items-center shadow-inner group shrink-0"
            >
              <div className="absolute inset-0 flex justify-between items-center px-3 opacity-20 group-hover:opacity-40 transition-opacity">
                <Sun className="w-3.5 h-3.5" />
                <Moon className="w-3.5 h-3.5" />
              </div>
              <div className={`absolute top-0 h-full w-10 bg-primary transition-all duration-200 ease-in-out flex items-center justify-center z-10 ${theme === 'dark' ? 'translate-x-full border-l border-primary-foreground/20' : 'translate-x-0 border-r border-primary-foreground/20'}`}>
                 {theme === 'dark' ? <Moon className="w-4 h-4 text-primary-foreground" /> : <Sun className="w-4 h-4 text-primary-foreground" />}
              </div>
            </div>
          </div>

          {/* FIXED BUTTON: Swapped physical borders for solid shadow to fix padding/centering */}
          <button 
            onClick={() => setIsModalOpen(true)} 
            className="h-11 px-8 bg-foreground text-background text-[10px] font-black uppercase tracking-widest hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(255,77,0,0.2)] active:shadow-none active:translate-x-1 active:translate-y-1 shrink-0"
          >
            New Entry
          </button>
        </header>

        <div className="flex-1 overflow-y-auto p-10 lg:p-20 custom-scrollbar">
          {viewMode === 'dictionary' ? (
            <div className="max-w-4xl mx-auto space-y-32">
              {filteredData.map(cat => (
                <section key={cat.id} id={cat.id} className="scroll-mt-40">
                  <h2 className="text-[10px] font-black text-primary uppercase tracking-[0.6em] mb-12 flex items-center">
                    {cat.title} <span className="ml-4 h-[1px] bg-border flex-1"></span>
                  </h2>
                  <div className="space-y-16">
                    {cat.terms.map(term => (
                      <article key={term.id} className="relative pl-10 group">
                        <div className="absolute left-0 top-2 w-1 h-8 bg-primary/20 group-hover:bg-primary transition-all"></div>
                        <h3 className="text-2xl font-black mb-6 tracking-tighter uppercase">{term.name}</h3>
                        <div className="mb-6">
                           <p className="text-[10px] font-black text-primary uppercase tracking-widest mb-1 opacity-50">Analogy</p>
                           <p className="text-lg font-black text-foreground italic border-l-2 border-primary pl-4">“{term.analogy}”</p>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed font-sans max-w-2xl">{term.description}</p>
                      </article>
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ) : (
            /* FLASHCARDS */
            <div className="h-full flex flex-col items-center justify-center">
              {allTerms.length > 0 ? (
                <div className="w-full max-w-xl space-y-16 text-center">
                  <p className="text-[10px] font-black text-primary tracking-[0.6em] uppercase">ACCESSING_TERM_{currentCardIndex + 1}</p>
                  <div className="w-full aspect-video perspective-1000 cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
                    <div className={`relative w-full h-full transition-transform duration-700 preserve-3d ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}>
                      <div className="absolute inset-0 backface-hidden border border-border bg-card flex flex-col items-center justify-center p-16" style={{ transform: 'translateZ(1px)' }}>
                        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none">{allTerms[currentCardIndex].name}</h2>
                      </div>
                      <div className="absolute inset-0 backface-hidden border-2 border-primary bg-primary text-primary-foreground flex flex-col items-center justify-center p-16" style={{ transform: 'rotateY(180deg) translateZ(1px)' }}>
                        <p className="text-3xl font-black mb-8 italic tracking-tighter leading-tight">“{allTerms[currentCardIndex].analogy}”</p>
                        <p className="text-sm font-sans leading-relaxed max-w-xs opacity-90">{allTerms[currentCardIndex].description}</p>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 justify-center">
                    <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setCurrentCardIndex(p => (p - 1 + allTerms.length) % allTerms.length); }} className="px-8 py-4 border border-border hover:border-primary text-[10px] font-black uppercase transition-colors">Prev</button>
                    <button onClick={(e) => { e.stopPropagation(); setIsFlipped(false); setCurrentCardIndex(p => (p + 1) % allTerms.length); }} className="px-8 py-4 border border-border hover:border-primary text-[10px] font-black uppercase transition-colors">Next</button>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </main>

      {/* MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] bg-background/95 flex items-center justify-center p-6" onClick={() => setIsModalOpen(false)}>
          <div className="w-full max-w-md bg-background border border-primary p-10 space-y-8" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-black uppercase tracking-tighter italic">VULT_ENTRY</h2>
              <button onClick={() => setIsModalOpen(false)}><X className="w-5 h-5"/></button>
            </div>
            <form className="space-y-6" onSubmit={async e => {
              e.preventDefault();
              const { data } = await supabase.from('terms').insert([{ name: newTerm.name, analogy: newTerm.analogy, description: newTerm.description, category_id: newTerm.category }]).select();
              if (data) window.location.reload();
            }}>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Term Name</label>
                <div className="flex gap-2">
                  <input className="flex-1 bg-card border border-border p-4 text-[11px] font-black uppercase outline-none focus:border-primary" placeholder="E.G. DOCKER" value={newTerm.name} onChange={e => setNewTerm({...newTerm, name: e.target.value})} />
                  <button type="button" onClick={handleAIGenerate} disabled={isGenerating || !newTerm.name} className="px-4 bg-card border border-border hover:bg-primary hover:text-primary-foreground transition-all flex items-center justify-center">
                    {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  </button>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Designer Analogy</label>
                <input className="w-full bg-card border border-border p-4 text-[11px] font-black uppercase outline-none focus:border-primary" value={newTerm.analogy} onChange={e => setNewTerm({...newTerm, analogy: e.target.value})} />
              </div>
              <div className="space-y-2">
                <label className="text-[9px] font-black text-muted-foreground uppercase tracking-widest">Explanation</label>
                <textarea className="w-full bg-card border border-border p-4 text-sm font-sans h-32 outline-none focus:border-primary resize-none" value={newTerm.description} onChange={e => setNewTerm({...newTerm, description: e.target.value})} />
              </div>
              <button type="submit" disabled={isGenerating} className="w-full py-5 bg-primary text-primary-foreground text-xs font-black uppercase tracking-widest hover:opacity-90 transition-all active:scale-95 disabled:opacity-50">Upload to Vault</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}