import { NavLink, Outlet } from 'react-router-dom';
const links = [['/', 'Dashboard'], ['/guests', 'Guests'], ['/budget', 'Budget'], ['/tasks', 'Tasks'], ['/settings', 'Wedding settings']];
export function AppShell() { return <div className="min-h-screen md:flex"><aside className="bg-rose-950 p-5 text-white md:w-60"><h1 className="mb-8 text-xl font-bold">Wedding Planner</h1><nav className="flex gap-2 overflow-auto md:flex-col">{links.map(([to, label]) => <NavLink key={to} to={to} className="rounded px-3 py-2 hover:bg-rose-900">{label}</NavLink>)}</nav></aside><main className="mx-auto w-full max-w-6xl p-6"><Outlet /></main></div>; }

