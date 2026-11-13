import React, { useState } from 'react';
import destinationsData from '../data/destinations.json';
import festivalsData from '../data/festivals.json';
import rssData from '../data/rss.json';
import { TourismDestination, CulturalFestival, RSSItem } from '../types';
import { Compass, Sparkles, MapPin, Calendar, Rss, ArrowDown } from 'lucide-react';

export const ExplorePage: React.FC = () => {
  const [destinations] = useState<TourismDestination[]>(destinationsData as TourismDestination[]);
  const [festivals] = useState<CulturalFestival[]>(festivalsData as CulturalFestival[]);
  const [rssFeed] = useState<RSSItem[]>(rssData as RSSItem[]);

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="space-y-10">
      
      {/* Explore Hero Banner */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/10 p-8 md:p-12 bg-gradient-to-r from-slate-950 via-blue-950 to-slate-900 shadow-2xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
            <span>Discover North East India</span>
          </div>

          <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight leading-tight">
            Where mountains, cultures and communities meet.
          </h1>

          <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
            Explore the majestic biodiversity, ancient living traditions, sacred Himalayan peaks, and vibrant tribal festivals across all eight North Eastern states.
          </p>

          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => scrollToSection('destinations-section')}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold text-xs shadow-lg shadow-cyan-500/30 flex items-center space-x-2"
            >
              <span>Explore Destinations</span>
              <ArrowDown className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('festivals-section')}
              className="px-5 py-2.5 rounded-xl glass-panel-light hover:bg-white/10 text-slate-200 font-bold text-xs border border-white/20 flex items-center space-x-2"
            >
              <span>Discover Festivals</span>
              <Calendar className="w-4 h-4 text-cyan-400" />
            </button>
          </div>
        </div>

        {/* Subtle Cultural Pattern Accent */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 bg-[radial-gradient(#06b6d4_2px,transparent_2px)] [background-size:20px_20px] pointer-events-none"></div>
      </div>

      {/* Tourism Cards Section (8 States) */}
      <div id="destinations-section" className="space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <MapPin className="w-5 h-5 text-cyan-400" />
              <span>Regional Tourism & Natural Wonders</span>
            </h2>
            <p className="text-xs text-slate-400">Curated destinations across Meghalaya, Arunachal, Sikkim, Assam, Nagaland, Mizoram, Manipur, & Tripura.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {destinations.map(dest => (
            <div
              key={dest.id}
              className="glass-card rounded-2xl overflow-hidden border border-white/10 flex flex-col justify-between hover:border-cyan-400/50 transition-all group"
            >
              <div className="relative h-44 overflow-hidden">
                <img
                  src={dest.image}
                  alt={dest.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/30 to-transparent"></div>
                <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-md text-[10px] font-bold text-cyan-300 border border-cyan-500/30">
                  {dest.state}
                </span>
              </div>

              <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white group-hover:text-cyan-300 transition-colors">
                    {dest.name}
                  </h3>
                  <span className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                    {dest.category}
                  </span>
                  <p className="text-xs text-slate-300 mt-1 line-clamp-3 leading-relaxed">
                    {dest.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1">
                  {dest.highlights.map((h, i) => (
                    <span key={i} className="text-[9px] px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-white/5">
                      {h}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Festivals & Traditions Section */}
      <div id="festivals-section" className="space-y-4 pt-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div>
            <h2 className="text-xl font-extrabold text-white flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-amber-400" />
              <span>Cultural Festivals & Traditions</span>
            </h2>
            <p className="text-xs text-slate-400">Vibrant tribal heritage, spring dances, warrior chants, and sacred harvest ceremonies.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {festivals.map(fest => (
            <div
              key={fest.id}
              className="glass-card rounded-2xl p-5 border border-white/10 space-y-3 hover:border-amber-400/40 transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-amber-400">{fest.state}</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  {fest.month}
                </span>
              </div>

              <h3 className="text-lg font-extrabold text-white">{fest.name}</h3>

              <p className="text-xs text-slate-300 leading-relaxed">
                {fest.description}
              </p>

              <div className="pt-2 border-t border-white/10 flex flex-wrap gap-1">
                {fest.highlights.map((h, idx) => (
                  <span key={idx} className="text-[9px] px-2 py-0.5 rounded bg-slate-900 text-cyan-300 border border-cyan-500/20">
                    ★ {h}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Local Mocked RSS Feed Section */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 space-y-4">
        <div className="flex items-center justify-between border-b border-white/10 pb-3">
          <div className="flex items-center space-x-2">
            <Rss className="w-5 h-5 text-cyan-400" />
            <h3 className="text-sm font-extrabold text-white uppercase tracking-wider">
              Regional News & Emergency Bulletin Feed
            </h3>
          </div>
          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
            SIMULATED FEED
          </span>
        </div>

        <div className="space-y-3">
          {rssFeed.map(item => (
            <div key={item.id} className="glass-card p-4 rounded-xl border border-white/10 space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-cyan-300">{item.category}</span>
                <span className="text-slate-400 font-mono text-[10px]">{new Date(item.timestamp).toLocaleString()}</span>
              </div>
              <h4 className="text-sm font-bold text-white">{item.title}</h4>
              <p className="text-xs text-slate-300">{item.summary}</p>
              <p className="text-[10px] text-slate-400 text-right pt-1">Source: {item.source}</p>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
};
