import { useState, useEffect, useRef } from 'react';
import { Menu, X, ChevronRight, Search, Github, ExternalLink, Layout, Info } from 'lucide-react';
import Markdown from 'react-markdown';
import { motion, AnimatePresence } from 'motion/react';
import { docs, DocSection } from './content';
import { cn } from './lib/utils';

export default function App() {
  const [activeSection, setActiveSection] = useState<string>(docs[0].id);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [openCategories, setOpenCategories] = useState<Record<string, boolean>>({});
  const mainContentRef = useRef<HTMLDivElement>(null);

  const toggleCategory = (cat: string) => {
    setOpenCategories(prev => ({ ...prev, [cat]: !prev[cat] }));
  };

  const filteredDocs = docs.filter(doc => 
    doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    doc.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Grouping
  const groupedDocs = filteredDocs.reduce((acc, doc) => {
    const cat = doc.category || "Miscellaneous";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(doc);
    return acc;
  }, {} as Record<string, DocSection[]>);

  // Auto-open categories on search
  useEffect(() => {
    if (searchQuery) {
      const newOpen: Record<string, boolean> = {};
      Object.keys(groupedDocs).forEach(cat => {
        newOpen[cat] = true;
      });
      setOpenCategories(newOpen);
    }
  }, [searchQuery]);

  const currentDoc = docs.find(doc => doc.id === activeSection) || docs[0];

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      if (hash && docs.some(doc => doc.id === hash)) {
        setActiveSection(hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange();

    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSectionClick = (id: string) => {
    setActiveSection(id);
    window.location.hash = id;
    setIsSidebarOpen(false);
    if (mainContentRef.current) {
      mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="h-screen bg-background text-foreground flex overflow-hidden">
      {/* Sidebar */}
      <aside 
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 bg-sidebar border-r border-border flex flex-col transition-transform duration-300 lg:relative lg:translate-x-0",
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        {/* Sidebar Header */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-3 font-display font-bold text-xl tracking-tight">
            <div className="w-9 h-9 rounded-xl flex items-center justify-center overflow-hidden border border-border">
              <img 
                src="https://cdn.discordapp.com/attachments/1372042524797042799/1449893730332180630/2f982280b0898f96c89dc8b970de5a01.png?ex=69cd9ec3&is=69cc4d43&hm=ffbe9634d455ac14afd4f7ccfc16713f5610f7c135afcda1fe337ae6f3f18296&" 
                alt="Opiumware Logo" 
                className="w-full h-full object-cover grayscale"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="text-white">Opiumware</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-2 text-muted-foreground hover:text-white">
            <X size={20} />
          </button>
        </div>

        {/* Search in Sidebar */}
        <div className="px-4 mb-6">
          <div className="relative group">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-accent transition-colors" size={15} />
            <input 
              type="text"
              placeholder="Search documentation..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-background/50 border border-border rounded-xl py-2.5 pl-10 pr-4 text-[13px] focus:outline-none focus:ring-2 focus:ring-accent/30 focus:border-accent/50 transition-all placeholder:text-muted-foreground/50"
            />
          </div>
        </div>

        {/* Sidebar Navigation - Scrollable */}
        <nav className="flex-1 overflow-y-auto px-4 pb-8 space-y-2 custom-scrollbar">
          {Object.keys(groupedDocs).length === 0 && searchQuery && (
            <div className="px-3 py-8 text-center">
              <p className="text-sm text-muted-foreground">No results found for "{searchQuery}"</p>
            </div>
          )}
          {Object.entries(groupedDocs).map(([category, items]) => (
            <div key={category} className="space-y-1">
              {category !== "General" ? (
                <>
                  <button 
                    onClick={() => toggleCategory(category)}
                    className={cn(
                      "w-full flex items-center justify-between px-3 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg transition-colors group",
                      openCategories[category] ? "text-white" : "text-muted-foreground hover:text-white hover:bg-white/5"
                    )}
                  >
                    <span>{category}</span>
                    <ChevronRight size={14} className={cn("transition-transform", openCategories[category] ? "rotate-90" : "group-hover:translate-x-0.5")} />
                  </button>
                  <AnimatePresence initial={false}>
                    {openCategories[category] && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-l border-border/50 ml-3.5 pl-3 space-y-0.5 mt-1"
                      >
                        {items.map(doc => (
                          <button
                            key={doc.id}
                            onClick={() => handleSectionClick(doc.id)}
                            className={cn(
                              "w-full text-left px-3 py-1.5 text-[13px] rounded-lg transition-all",
                              activeSection === doc.id 
                                ? "text-accent font-medium bg-accent/10" 
                                : "text-muted-foreground hover:text-white hover:bg-white/5"
                            )}
                          >
                            {doc.title}
                          </button>
                        ))}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </>
              ) : (
                items.map(doc => (
                  <button
                    key={doc.id}
                    onClick={() => handleSectionClick(doc.id)}
                    className={cn(
                      "w-full text-left px-3 py-2 text-[13px] font-medium rounded-lg transition-all",
                      activeSection === doc.id 
                        ? "bg-accent/10 text-accent border border-accent/20" 
                        : "text-muted-foreground hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {doc.title}
                  </button>
                ))
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 relative">
        {/* Mobile Header */}
        <header className="lg:hidden h-16 border-b border-border flex items-center px-4 bg-background/80 backdrop-blur-md z-40">
          <button onClick={() => setIsSidebarOpen(true)} className="p-2 -ml-2 text-muted-foreground">
            <Menu size={24} />
          </button>
          <span className="ml-4 font-display font-bold">Opiumware</span>
        </header>

        {/* Content Scroll Area */}
        <main 
          ref={mainContentRef}
          className="flex-1 overflow-y-auto custom-scrollbar relative"
        >
          <div className="max-w-6xl mx-auto px-6 lg:px-12 py-12 lg:py-20 flex gap-16">
            {/* Documentation Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  <div className="markdown-body">
                    <Markdown 
                      components={{
                        h2: ({ node, children, ...props }) => {
                          const id = String(children).toLowerCase().replace(/[^a-z0-9]/g, '-');
                          return <h2 id={id} {...props}>{children}</h2>;
                        },
                        h3: ({ node, children, ...props }) => {
                          const id = String(children).toLowerCase().replace(/[^a-z0-9]/g, '-');
                          return <h3 id={id} {...props}>{children}</h3>;
                        },
                        div: ({ node, className, children, ...props }) => {
                          if (className === 'callout') {
                            return (
                              <div className="callout" {...props}>
                                <div className="mt-0.5 text-accent shrink-0"><Info size={18} /></div>
                                <div>{children}</div>
                              </div>
                            );
                          }
                          if (className === 'card-grid') {
                            return (
                              <div className="card-grid" {...props}>
                                {children}
                              </div>
                            );
                          }
                          if (className === 'card') {
                            return (
                              <div className="card group" {...props}>
                                {children}
                              </div>
                            );
                          }
                          return <div className={className} {...props}>{children}</div>;
                        }
                      }}
                    >
                      {currentDoc.content}
                    </Markdown>
                  </div>

                  {/* Navigation Buttons */}
                  <div className="mt-24 pt-12 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-8">
                    <div className="flex flex-col gap-3">
                      <span className="text-[13px] text-muted-foreground font-medium">Last updated: March 2026</span>
                      <a 
                        href="https://discord.gg/opiumware" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-[13px] text-accent hover:text-accent/80 font-semibold transition-colors flex items-center gap-2"
                      >
                        <div className="w-6 h-6 rounded-md flex items-center justify-center border border-border overflow-hidden shrink-0">
                          <img 
                            src="https://cdn.discordapp.com/attachments/1372042524797042799/1449893730332180630/2f982280b0898f96c89dc8b970de5a01.png?ex=69cd9ec3&is=69cc4d43&hm=ffbe9634d455ac14afd4f7ccfc16713f5610f7c135afcda1fe337ae6f3f18296&" 
                            alt="Opiumware Icon" 
                            className="w-full h-full object-cover grayscale"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                        Join our Discord!
                      </a>
                    </div>

                    {docs.findIndex(doc => doc.id === activeSection) < docs.length - 1 && (
                      <button 
                        onClick={() => handleSectionClick(docs[docs.findIndex(doc => doc.id === activeSection) + 1].id)}
                        className="flex items-center gap-4 px-7 py-3.5 bg-accent text-background rounded-xl font-bold hover:bg-accent/90 transition-all group shadow-lg shadow-accent/20"
                      >
                        <div className="flex flex-col items-start">
                          <span className="text-[10px] uppercase tracking-widest opacity-70">Next Section</span>
                          <span className="text-[15px]">{docs[docs.findIndex(doc => doc.id === activeSection) + 1].title}</span>
                        </div>
                        <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                      </button>
                    )}
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Sidebar - On this page */}
            <aside className="hidden xl:block w-60 shrink-0">
              <div className="sticky top-0">
                <div className="flex items-center gap-2.5 text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground/60 mb-8">
                  <Layout size={14} />
                  On this page
                </div>
                <nav className="space-y-5 text-[13px]">
                  <button 
                    onClick={() => {
                      if (mainContentRef.current) {
                        mainContentRef.current.scrollTo({ top: 0, behavior: 'smooth' });
                      }
                    }}
                    className="flex items-center gap-3 text-accent font-semibold w-full text-left"
                  >
                    <div className="w-1 h-5 bg-accent rounded-full" />
                    {currentDoc.title}
                  </button>
                  {currentDoc.content.split('\n')
                    .filter(line => line.startsWith('## '))
                    .map(line => {
                      const title = line.replace('## ', '');
                      const id = title.toLowerCase().replace(/[^a-z0-9]/g, '-');
                      return (
                        <button 
                          key={title}
                          onClick={() => {
                            const element = document.getElementById(id);
                            if (element) {
                              element.scrollIntoView({ behavior: 'smooth' });
                            }
                          }}
                          className="block text-muted-foreground hover:text-white transition-colors pl-4 border-l border-border/50 w-full text-left"
                        >
                          {title}
                        </button>
                      );
                    })
                  }
                </nav>

                <div className="mt-16 p-6 rounded-2xl bg-sidebar/50 border border-border backdrop-blur-sm">
                  <div className="flex items-center gap-2.5 text-[12px] font-bold text-white mb-3">
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center border border-border">
                      <Info size={14} className="text-accent" />
                    </div>
                    Need help?
                  </div>
                  <p className="text-[12px] text-muted-foreground leading-relaxed">
                    Join our community on Discord for real-time support and updates.
                  </p>
                  <a 
                    href="https://discord.gg/opiumware"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 w-full py-2.5 bg-white/5 hover:bg-white/10 text-white text-[12px] font-bold rounded-xl border border-border transition-all flex items-center justify-center gap-2 overflow-hidden"
                  >
                    <div className="w-5 h-5 rounded-md overflow-hidden shrink-0">
                      <img 
                        src="https://cdn.discordapp.com/attachments/1372042524797042799/1449893730332180630/2f982280b0898f96c89dc8b970de5a01.png?ex=69cd9ec3&is=69cc4d43&hm=ffbe9634d455ac14afd4f7ccfc16713f5610f7c135afcda1fe337ae6f3f18296&" 
                        alt="Opiumware Icon" 
                        className="w-full h-full object-cover grayscale"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    Join Discord
                  </a>
                </div>
              </div>
            </aside>
          </div>
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {isSidebarOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 z-40 bg-black/80 backdrop-blur-sm lg:hidden"
          />
        )}
      </AnimatePresence>
    </div>
  );
}
