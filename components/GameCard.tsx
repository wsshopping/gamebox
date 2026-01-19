import React from 'react';
import { Game } from '../types';
import { useNavigate } from 'react-router-dom';

interface GameCardProps {
  game: Game;
  compact?: boolean;
}

const GameCard: React.FC<GameCardProps> = ({ game, compact = false }) => {
  const navigate = useNavigate();

  return (
    <div 
      onClick={() => navigate(`/game/${game.id}`)}
      // Premium: No border, high-end shadow, pure white bg, extra rounded corners
      className="relative bg-white rounded-[20px] p-4 flex items-center space-x-4 cursor-pointer group shadow-[0_4px_20px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.06)] hover:translate-y-[-2px] transition-all duration-500 ease-out"
    >
      <img 
        src={game.icon} 
        alt={game.title} 
        className={`${compact ? 'w-12 h-12' : 'w-18 h-18'} rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform duration-500`} 
      />
      
      <div className="flex-1 min-w-0">
        <h3 className="text-[17px] font-bold text-slate-900 truncate tracking-tight group-hover:text-indigo-600 transition-colors">{game.title}</h3>
        
        <div className="flex items-center space-x-2 mt-1.5">
          {/* Tag Design: Very subtle gray background */}
          <span className="bg-slate-50 text-slate-500 text-[10px] font-medium px-2 py-0.5 rounded-md tracking-wide uppercase border border-slate-100">
            {game.category}
          </span>
          <div className="flex items-center text-amber-500">
             <span className="text-xs">★</span>
             <span className="text-xs font-bold ml-0.5 text-slate-700">{game.rating}</span>
          </div>
        </div>
        
        {!compact && (
           <p className="text-xs text-slate-400 mt-2 truncate pr-2 font-light">{game.description}</p>
        )}
      </div>
      
      {/* Premium Button: Ghost style or soft gradient */}
      <button className="relative overflow-hidden group/btn">
        <div className="bg-slate-50 text-slate-900 text-xs font-bold px-5 py-2.5 rounded-full hover:bg-slate-900 hover:text-white transition-all duration-300 border border-slate-100 shadow-sm">
          <span className="relative z-10">开始</span>
        </div>
      </button>
    </div>
  );
};

export default GameCard;