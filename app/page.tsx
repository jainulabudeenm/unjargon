"use client";

import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, BookOpen, Terminal, Code2, Layers, 
  Paintbrush, Database, Rocket, HelpCircle, 
  Hash, Box, FileText, Info, Plus, X, 
  CreditCard, ArrowRight, ArrowLeft, Shuffle, Sparkles, Loader2
} from 'lucide-react';

const initialGlossaryData = [
  {
    id: "core-languages",
    title: "1. The Core Languages",
    subtitle: "(The Anatomy)",
    icon: <Code2 className="w-5 h-5" />,
    description: "The basic DNA of the web. Every site you design is eventually translated into these three things.",
    terms: [
      { name: "HTML (HyperText Markup Language)", analogy: "The Wireframe.", description: "Defines the raw structure. It tells the browser 'this is a button' or 'this is a heading,' but has no opinion on what they look like." },
      { name: "CSS (Cascading Style Sheets)", analogy: "Visual Design & Auto-Layout.", description: "Applies the branding. This is where hex codes, typography, padding, and layout rules (like Flexbox or Grid) live." },
      { name: "JavaScript (JS)", analogy: "The Interactive Logic.", description: "The engine that makes things 'do' something. If a user clicks a button and a modal pops up, JavaScript is doing the work." }
    ]
  },
  {
    id: "workspace",
    title: "2. The Workspace",
    subtitle: "(The Tools)",
    icon: <Terminal className="w-5 h-5" />,
    description: "The software environments where developers spend their day writing and managing code.",
    terms: [
      { name: "IDE (Integrated Development Environment)", analogy: "The Developer's Figma.", description: "The primary app for writing code (like VS Code or Cursor). It's an advanced text editor with features like auto-complete and error checking." },
      { name: "CLI (Command Line Interface)", analogy: "The Quick Command Palette (Cmd + /).", description: "The Terminal app. Instead of clicking buttons, developers type text commands to tell the computer what to do instantly." },
      { name: "Homebrew", analogy: "The App Store for the Terminal.", description: "A tool used to install software (like Node.js or Figma) via a single text command instead of downloading setup files manually." }
    ]
  },
  {
    id: "version-control",
    title: "3. Version Control",
    subtitle: "(Saving & Sharing)",
    icon: <BookOpen className="w-5 h-5" />,
    description: "How teams save their progress and collaborate without overwriting each other's work.",
    terms: [
      { name: "Git", analogy: "Version History on steroids.", description: "A tracking system that takes snapshots of code. If a new feature breaks the app, developers can instantly rewind to a working snapshot." },
      { name: "GitHub", analogy: "The Cloud Workspace.", description: "A website where Git snapshots are uploaded to be backed up and shared with a team, similar to a shared Figma project." }
    ]
  },
  {
    id: "building-blocks",
    title: "4. Building Blocks",
    subtitle: "& Architecture",
    icon: <Layers className="w-5 h-5" />,
    description: "The structural foundations and blueprints used to build modern web applications.",
    terms: [
      { name: "Node.js", analogy: "The Engine.", description: "Software that allows JavaScript to run outside of a browser, turning your computer into a machine capable of running full apps." },
      { name: "Framework", analogy: "The Structural Blueprint.", description: "A pre-written foundation for an app (like Next.js) so developers don't have to build basic mechanics like page navigation from scratch." },
      { name: "Next.js", analogy: "The Industry-Standard Blueprint.", description: "Currently the most popular framework for building fast, modern web apps. It's the 'pro' version of building with React." },
      { name: "App Router", analogy: "The Navigation Logic.", description: "The system inside Next.js that manages how pages connect. It handles moving the user from '/home' to '/settings' smoothly." }
    ]
  },
  {
    id: "package-managers",
    title: "5. Package Managers",
    subtitle: "(The Plugin Libraries)",
    icon: <Box className="w-5 h-5" />,
    description: "Tools used to download pre-written code 'packages'—essentially UI kits or plugins for code.",
    terms: [
      { name: "npm (Node Package Manager)", analogy: "The Default Figma Community.", description: "The standard marketplace where developers download code pieces (like a calendar picker) to add to their project." },
      { name: "yarn / pnpm / bun", analogy: "Alternative Plugin Managers.", description: "Different 'brands' of managers. Yarn is a faster alternative; pnpm saves hard drive space by sharing files; Bun is the new, blazing-fast 'super-app' version." }
    ]
  },
  {
    id: "styling",
    title: "6. Styling & Quality",
    subtitle: "(Control)",
    icon: <Paintbrush className="w-5 h-5" />,
    description: "Tools for enforcing design systems, tokens, and code cleanliness.",
    terms: [
      { name: "TailwindCSS", analogy: "Design Tokens applied via code.", description: "A framework that lets developers use shorthand tokens (like 'rounded-lg') directly in their layout code instead of writing separate CSS files." },
      { name: "TypeScript", analogy: "Strict Component Properties.", description: "An add-on to JavaScript that enforces rules (data types). It ensures a 'Price' field only accepts numbers, not text, preventing crashes." },
      { name: "ESLint", analogy: "An automated Design Linter.", description: "A tool that scans code for inconsistencies, forcing the whole team to follow the same spacing and style rules." }
    ]
  },
  {
    id: "backend",
    title: "7. The Backend",
    subtitle: "& Connections",
    icon: <Database className="w-5 h-5" />,
    description: "Where the 'brains' of the app live: databases, logins, and external connections.",
    terms: [
      { name: "Database", analogy: "The Filing Cabinet.", description: "A secure system (like a complex Airtable) that stores user profiles, posts, and settings permanently." },
      { name: "Auth Provider", analogy: "The Bouncer.", description: "A service (like 'Sign in with Google') that handles secure logins and user verification." },
      { name: "Supabase", analogy: "An All-in-One Backend.", description: "A platform that gives developers a Database and Auth in one place, allowing them to skip weeks of backend setup." },
      { name: "API", analogy: "The Waiter at a restaurant.", description: "The messenger that takes a request from your app, gets data from another app (like Google Maps), and brings it back to you." },
      { name: "REST API", analogy: "The standardized Restaurant Menu.", description: "A universally agreed-upon style for APIs. It uses standard actions like GET (read) or POST (save) so communication is predictable." },
      { name: "MCP (Model Context Protocol)", analogy: "A Universal Translator for AI.", description: "A new standard bridge that lets AI models safely read your files or data without needing custom code for every single app." }
    ]
  },
  {
    id: "launching",
    title: "8. Launching",
    subtitle: "& Graphics",
    icon: <Rocket className="w-5 h-5" />,
    description: "Getting the app onto the internet and rendering high-end visuals.",
    terms: [
      { name: "Localhost", analogy: "Figma 'Present' Mode.", description: "A private server running only on your laptop. It's a testing ground that no one else on the internet can see." },
      { name: "Deployment", analogy: "Clicking 'Publish'.", description: "The process of moving the code from your private laptop (localhost) to a public server so real users can visit the URL." },
      { name: "Host (e.g., Vercel)", analogy: "The 24/7 Exhibition Hall.", description: "The company that provides the servers to keep your app live and accessible on the internet around the clock." },
      { name: "Docker", analogy: "The Shipping Container.", description: "Packages code with all its settings so it works perfectly on any computer, preventing 'it works on my machine' bugs." }
    ]
  },
  {
    id: "documentation",
    title: "9. Documentation",
    subtitle: "(The Handoff)",
    icon: <FileText className="w-5 h-5" />,
    description: "The written instructions and standards for a project.",
    terms: [
      { name: ".md (Markdown)", analogy: "Keyboard-only formatting.", description: "A simple way to write rich text (bold, titles, lists) using symbols instead of buttons. It's the standard for dev notes." },
      { name: "README.md", analogy: "The 'Start Here' Cover Page.", description: "The absolute front door of a code project. It explains what the app is, how to install it, and how to use it." }
    ]
  },
  {
    id: "faqs",
    title: "10. FAQs",
    subtitle: "The Big Mix-ups",
    icon: <HelpCircle className="w-5 h-5" />,
    description: "Clarifying the most common points of confusion.",
    terms: [
      { name: "Framework vs. npm", analogy: "The Blueprint vs. The Furniture.", description: "You build the house using a Framework (Next.js). You furnish it with pre-built pieces from npm (Package Manager)." },
      { name: "Node.js vs. Next.js", analogy: "The Electricity vs. The Appliance.", description: "Node.js is the underlying electricity. Next.js is the smart home system plugged into it." },
      { name: "App Router vs. API", analogy: "Internal Navigation vs. External Waiter.", description: "The App Router connects your own pages. An API connects your app to other companies' data." }
    ]
  }
];

export default function App() {
  const [glossary, setGlossary] = useState(initialGlossaryData);
  const [viewMode, setViewMode] = useState('dictionary'); 
  
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("core-languages");
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [flashcardCategory, setFlashcardCategory] = useState('all');
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [newTerm, setNewTerm] = useState({
    category: "backend",
    name: "",
    analogy: "",
    description: ""
  });

  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return glossary;
    const query = searchQuery.toLowerCase();
    return glossary.map(category => {
      const filteredTerms = category.terms.filter(term => 
        term.name.toLowerCase().includes(query) || 
        term.analogy.toLowerCase().includes(query) ||
        term.description.toLowerCase().includes(query)
      );
      return { ...category, terms: filteredTerms };
    }).filter(category => category.terms.length > 0);
  }, [searchQuery, glossary]);

  const flashcards = useMemo(() => {
    const cards: { name: string; analogy: string; description: string; categoryTitle: string }[] = [];
    glossary.forEach(cat => {
      if (flashcardCategory === 'all' || flashcardCategory === cat.id) {
        cat.terms.forEach(term => cards.push({ ...term, categoryTitle: cat.title }));
      }
    });
    return cards;
  }, [glossary, flashcardCategory]);

  const scrollToCategory = (id: string) => {
    if (viewMode !== 'dictionary') setViewMode('dictionary');
    setActiveCategory(id);
    setTimeout(() => {
      const element = document.getElementById(id);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }, 100);
    if (searchQuery) setSearchQuery("");
  };

  const handleAddTerm = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!newTerm.name || !newTerm.analogy || !newTerm.description) return;
    const updatedGlossary = glossary.map(cat => {
      if (cat.id === newTerm.category) {
        return {
          ...cat,
          terms: [...cat.terms, { name: newTerm.name, analogy: newTerm.analogy, description: newTerm.description }]
        };
      }
      return cat;
    });
    setGlossary(updatedGlossary);
    setIsModalOpen(false);
    setNewTerm({ category: "backend", name: "", analogy: "", description: "" });
  };

  const handleAIGenerate = async () => {
    if (!newTerm.name) {
      alert("Please type a term name first! (e.g., 'Webhooks')");
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ term: newTerm.name }),
      });

      if (!response.ok) throw new Error("Failed to fetch from AI API");
      
      const data = await response.json();
      
      setNewTerm(prev => ({
        ...prev,
        analogy: data.analogy || "Could not generate analogy.",
        description: data.description || "Could not generate description."
      }));
    } catch (error) {
      console.error(error);
      alert("Oops! The AI connection failed. Make sure your GEMINI API key is in your .env.local file!");
    } finally {
      setIsGenerating(false);
    }
  };

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentCardIndex((prev) => (prev + 1) % flashcards.length), 150);
  };

  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentCardIndex((prev) => (prev - 1 + flashcards.length) % flashcards.length), 150);
  };

  const shuffleCards = () => {
    setIsFlipped(false);
    setTimeout(() => setCurrentCardIndex(Math.floor(Math.random() * flashcards.length)), 150);
  };

  useEffect(() => {
    setCurrentCardIndex(0);
    setIsFlipped(false);
  }, [flashcardCategory]);

  return (
    <div className="flex h-screen bg-neutral-50 font-sans text-neutral-900 overflow-hidden">
      
      <aside className="w-72 bg-white border-r border-neutral-200 flex-shrink-0 flex flex-col hidden lg:flex z-20">
        <div className="p-6 border-b border-neutral-200">
          <div className="flex items-center gap-2 mb-1">
            <BookOpen className="w-6 h-6 text-indigo-600" />
            <h1 className="text-lg font-bold">Tech Glossary</h1>
          </div>
          <p className="text-[10px] text-neutral-500 font-bold uppercase tracking-widest">Product Designer Edition</p>
        </div>
        
        <div className="p-4 flex-1 overflow-y-auto">
          <div className="mb-4 pb-4 border-b border-neutral-100">
            <button
              onClick={() => setViewMode('dictionary')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 mb-2 transition-all ${
                viewMode === 'dictionary' ? "bg-indigo-50 text-indigo-700 font-bold" : "text-neutral-600 hover:bg-neutral-100 font-medium"
              }`}
            >
              <BookOpen className="w-5 h-5" /> Dictionary View
            </button>
            <button
              onClick={() => setViewMode('flashcards')}
              className={`w-full text-left px-3 py-2.5 rounded-xl flex items-center gap-3 transition-all ${
                viewMode === 'flashcards' ? "bg-indigo-50 text-indigo-700 font-bold" : "text-neutral-600 hover:bg-neutral-100 font-medium"
              }`}
            >
              <CreditCard className="w-5 h-5" /> Flashcards Mode
            </button>
          </div>

          <p className="px-3 text-xs font-bold text-neutral-400 uppercase tracking-wider mb-2">Categories</p>
          {glossary.map((cat) => (
            <button
              key={cat.id}
              onClick={() => scrollToCategory(cat.id)}
              className={`w-full text-left px-3 py-2 rounded-lg flex items-center gap-3 mb-1 transition-all ${
                activeCategory === cat.id && viewMode === 'dictionary' ? "bg-indigo-50/50 text-indigo-700" : "text-neutral-500 hover:bg-neutral-100"
              }`}
            >
              <span className={activeCategory === cat.id && viewMode === 'dictionary' ? "text-indigo-600" : "text-neutral-400"}>{cat.icon}</span>
              <span className="text-sm">{cat.title}</span>
            </button>
          ))}
        </div>
        
        <div className="p-4 border-t border-neutral-200 bg-white">
          <button onClick={() => setIsModalOpen(true)} className="w-full flex items-center justify-center gap-2 py-3 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 shadow-md transition-all">
            <Plus className="w-4 h-4" /> Add New Term
          </button>
        </div>
      </aside>

      <main className="flex-1 flex flex-col overflow-hidden relative">
        <header className="bg-white/80 backdrop-blur-md border-b border-neutral-200 p-4 sticky top-0 z-10 flex flex-col gap-3">
          <div className="flex lg:hidden bg-neutral-100 p-1 rounded-xl">
            <button 
              onClick={() => setViewMode('dictionary')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'dictionary' ? 'bg-white shadow-sm text-indigo-600' : 'text-neutral-500'}`}
            >
              Dictionary
            </button>
            <button 
              onClick={() => setViewMode('flashcards')}
              className={`flex-1 py-2 text-sm font-bold rounded-lg transition-all ${viewMode === 'flashcards' ? 'bg-white shadow-sm text-indigo-600' : 'text-neutral-500'}`}
            >
              Flashcards
            </button>
          </div>

          <div className="max-w-3xl mx-auto w-full relative flex gap-3">
            {viewMode === 'dictionary' ? (
              <div className="relative flex-1">
                <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-neutral-400" />
                <input
                  type="text"
                  placeholder="Search jargon..."
                  className="w-full bg-neutral-100 border-none rounded-xl pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            ) : (
              <div className="flex-1">
                <select 
                  className="w-full bg-neutral-100 border-none rounded-xl px-4 py-2.5 font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none text-neutral-700"
                  value={flashcardCategory}
                  onChange={(e) => setFlashcardCategory(e.target.value)}
                >
                  <option value="all">Study All Categories</option>
                  {glossary.map(cat => <option key={cat.id} value={cat.id}>{cat.title}</option>)}
                </select>
              </div>
            )}
            <button onClick={() => setIsModalOpen(true)} className="lg:hidden px-4 bg-indigo-600 text-white rounded-xl flex items-center justify-center">
              <Plus className="w-5 h-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto scroll-smooth">
          {viewMode === 'dictionary' && (
             <div className="p-6 lg:p-10 max-w-3xl mx-auto space-y-12 pb-32">
                {filteredData.length === 0 ? (
                  <div className="text-center py-20 bg-white border-2 border-dashed border-neutral-200 rounded-3xl">
                    <Info className="w-10 h-10 text-neutral-300 mx-auto mb-3" />
                    <h3 className="text-lg font-medium text-neutral-900">No matching terms</h3>
                    <p className="text-neutral-500 mt-1">Try a different search query.</p>
                  </div>
                ) : (
                  filteredData.map((category) => (
                    <section key={category.id} id={category.id} className="scroll-mt-28">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg">{category.icon}</div>
                        <h2 className="text-xl font-bold">{category.title}</h2>
                      </div>
                      <div className="space-y-4 lg:ml-11">
                        {category.terms.map((term, i) => (
                          <div key={i} className="bg-white border border-neutral-200 rounded-2xl p-5 shadow-sm hover:border-indigo-200 transition-all">
                            <h3 className="font-bold mb-2 flex items-center gap-2"><Hash className="w-3 h-3 text-indigo-300"/>{term.name}</h3>
                            <div className="mb-3"><span className="text-[11px] font-bold bg-indigo-50 text-indigo-700 px-2 py-1 rounded-md tracking-wide">Think of it like: {term.analogy}</span></div>
                            <p className="text-sm text-neutral-600 leading-relaxed">{term.description}</p>
                          </div>
                        ))}
                      </div>
                    </section>
                  ))
                )}
             </div>
          )}

          {viewMode === 'flashcards' && (
             <div className="h-full flex flex-col items-center justify-center p-6 lg:p-10 pb-32">
                 {flashcards.length === 0 ? (
                   <div className="text-center"><p className="text-neutral-500 font-medium">Switch to Dictionary view to add terms.</p></div>
                 ) : (
                   <div className="w-full max-w-md flex flex-col items-center gap-8">
                     <div className="text-sm font-bold text-neutral-400 tracking-widest uppercase">
                       Card {currentCardIndex + 1} of {flashcards.length}
                     </div>

                     <div 
                       className="w-full aspect-[4/3] perspective-1000 cursor-pointer"
                       onClick={() => setIsFlipped(!isFlipped)}
                     >
                       <div 
                         className={`relative w-full h-full transition-all duration-500 preserve-3d shadow-xl rounded-3xl ${isFlipped ? '[transform:rotateY(180deg)]' : ''}`}
                         style={{ transformStyle: 'preserve-3d' }}
                       >
                         <div className="absolute inset-0 backface-hidden bg-white border border-neutral-200 rounded-3xl p-8 flex flex-col items-center justify-center text-center gap-4" style={{ backfaceVisibility: 'hidden' }}>
                           <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{flashcards[currentCardIndex].categoryTitle}</div>
                           <h2 className="text-3xl font-bold text-neutral-900">{flashcards[currentCardIndex].name}</h2>
                           <p className="text-sm text-neutral-400 mt-4 absolute bottom-6">Tap to flip</p>
                         </div>

                         <div className="absolute inset-0 backface-hidden bg-indigo-600 text-white rounded-3xl p-8 flex flex-col items-center justify-center text-center" style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}>
                           <div className="bg-indigo-500/50 px-3 py-1.5 rounded-lg mb-6 inline-block">
                             <p className="text-sm font-bold tracking-wide text-indigo-50 uppercase mb-1">Think of it like:</p>
                             <p className="text-lg font-bold">{flashcards[currentCardIndex].analogy}</p>
                           </div>
                           <p className="text-base leading-relaxed text-indigo-50">{flashcards[currentCardIndex].description}</p>
                         </div>
                       </div>
                     </div>

                     <div className="flex items-center gap-4 w-full">
                       <button onClick={prevCard} className="flex-1 py-4 bg-white border border-neutral-200 rounded-2xl flex justify-center hover:bg-neutral-50 active:scale-95 transition-all shadow-sm text-neutral-600">
                         <ArrowLeft className="w-5 h-5" />
                       </button>
                       <button onClick={shuffleCards} className="p-4 bg-white border border-neutral-200 rounded-2xl flex justify-center hover:bg-neutral-50 active:scale-95 transition-all shadow-sm text-neutral-400 hover:text-indigo-600">
                         <Shuffle className="w-5 h-5" />
                       </button>
                       <button onClick={nextCard} className="flex-1 py-4 bg-white border border-neutral-200 rounded-2xl flex justify-center hover:bg-neutral-50 active:scale-95 transition-all shadow-sm text-neutral-600">
                         <ArrowRight className="w-5 h-5" />
                       </button>
                     </div>
                   </div>
                 )}
             </div>
          )}
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-neutral-900/60 backdrop-blur-sm" onClick={() => setIsModalOpen(false)}>
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-neutral-100 flex justify-between items-center bg-indigo-50/50">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h2 className="text-lg font-bold text-indigo-950">AI Term Generator</h2>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-2 hover:bg-neutral-200 rounded-full transition-colors"><X className="w-5 h-5 text-neutral-500"/></button>
            </div>

            <form onSubmit={handleAddTerm} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block">1. What do you want to learn?</label>
                <div className="flex gap-2">
                  <input 
                    className="flex-1 bg-white border border-neutral-300 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
                    placeholder="e.g. Serverless" 
                    value={newTerm.name} 
                    onChange={e => setNewTerm({...newTerm, name: e.target.value})} 
                  />
                  <button 
                    type="button"
                    onClick={handleAIGenerate}
                    disabled={isGenerating}
                    className="px-4 bg-indigo-100 text-indigo-700 font-bold rounded-xl hover:bg-indigo-200 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    {isGenerating ? <Loader2 className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                    Auto-Fill
                  </button>
                </div>
              </div>

              <div className={`transition-all duration-500 ${isGenerating ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block mt-4">2. The Analogy</label>
                <input 
                  className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
                  placeholder="Think of it like..." 
                  value={newTerm.analogy} 
                  onChange={e => setNewTerm({...newTerm, analogy: e.target.value})} 
                />
                
                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block mt-4">3. The Explanation</label>
                <textarea 
                  className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20 h-24 resize-none" 
                  placeholder="Explain it simply..." 
                  value={newTerm.description} 
                  onChange={e => setNewTerm({...newTerm, description: e.target.value})} 
                />

                <label className="text-xs font-bold text-neutral-500 uppercase tracking-wider mb-1 block mt-4">4. Category</label>
                <select 
                  className="w-full bg-neutral-50 border border-neutral-200 p-3 rounded-xl outline-none focus:ring-2 focus:ring-indigo-500/20" 
                  value={newTerm.category} 
                  onChange={e => setNewTerm({...newTerm, category: e.target.value})}
                >
                  {glossary.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>

              <button 
                type="submit"
                disabled={isGenerating || !newTerm.name || !newTerm.analogy}
                className="w-full mt-6 py-3.5 bg-indigo-950 text-white rounded-xl font-bold hover:bg-indigo-900 transition-colors disabled:opacity-50"
              >
                Save to Dictionary
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}