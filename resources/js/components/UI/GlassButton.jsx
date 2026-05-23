import React from 'react';

const GlassButton = ({ children, variant = 'primary', className = '', ...props }) => {
    const variants = {
        primary: 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20',
        secondary: 'bg-slate-800 hover:bg-slate-700 text-slate-200 border border-white/5',
        ghost: 'bg-transparent hover:bg-white/5 text-slate-400 hover:text-slate-200',
        danger: 'bg-rose-600/10 hover:bg-rose-600 text-rose-500 hover:text-white border border-rose-500/20'
    };

    return (
        <button
            {...props}
            className={`
                px-6 py-2.5 rounded-xl font-semibold transition-all duration-200 
                active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none
                ${variants[variant]} ${className}
            `}
        >
            {children}
        </button>
    );
};

export default GlassButton;
