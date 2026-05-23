import React from 'react';

const InputField = ({ label, icon: Icon, ...props }) => {
    return (
        <div className="space-y-1.5">
            {label && (
                <label className="text-sm font-medium text-slate-400 ml-1">
                    {label}
                </label>
            )}
            <div className="relative group">
                {Icon && (
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors">
                        <Icon size={18} />
                    </div>
                )}
                <input
                    {...props}
                    className={`
                        w-full bg-slate-900/50 border border-white/5 rounded-xl py-2.5 
                        ${Icon ? 'pl-11' : 'px-4'} pr-4
                        text-slate-100 placeholder:text-slate-600
                        focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500/50
                        transition-all duration-200
                    `}
                />
            </div>
        </div>
    );
};

export default InputField;
