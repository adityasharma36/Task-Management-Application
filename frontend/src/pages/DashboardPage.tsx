import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowDownWideNarrow, ArrowUpRight, CalendarDays, Check, CheckCircle2, Circle, Clock3, ListFilter, Plus, Search, Sparkles, Target, Trash2, X } from 'lucide-react';
import { tasksApi, type TaskInput } from '../api/tasks';
import type { Task, TaskStatus } from '../types';
import { getErrorMessage } from '../utils/errors';
import Spinner from '../components/Spinner';
import TaskModal from '../components/TaskModal';

const statusLabel: Record<TaskStatus, string> = { PENDING: 'To do', IN_PROGRESS: 'In progress', COMPLETED: 'Completed' };
const statusClass: Record<TaskStatus, string> = { PENDING: 'status-todo', IN_PROGRESS: 'status-progress', COMPLETED: 'status-complete' };

type Filter = 'ALL' | TaskStatus;

function dueLabel(date?: string | null) {
  if (!date) return 'No due date';
  const due = new Date(`${date.slice(0, 10)}T00:00:00`);
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today); tomorrow.setDate(today.getDate() + 1);
  if (due.getTime() === today.getTime()) return 'Due today';
  if (due.getTime() === tomorrow.getTime()) return 'Due tomorrow';
  return due.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export default function DashboardPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState('');
  const [notice, setNotice] = useState('');
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<Filter>('ALL');
  const [sortDue, setSortDue] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);

  const loadTasks = useCallback(async () => {
    setLoading(true); setPageError('');
    try { setTasks(await tasksApi.list()); }
    catch (error) { setPageError(getErrorMessage(error)); }
    finally { setLoading(false); }
  }, []);
  useEffect(() => { void loadTasks(); }, [loadTasks]);

  const stats = useMemo(() => ({ total: tasks.length, active: tasks.filter((task) => task.status !== 'COMPLETED').length, progress: tasks.filter((task) => task.status === 'IN_PROGRESS').length, completed: tasks.filter((task) => task.status === 'COMPLETED').length }), [tasks]);
  const visibleTasks = useMemo(() => tasks.filter((task) => (filter === 'ALL' || task.status === filter) && `${task.title} ${task.description ?? ''}`.toLowerCase().includes(query.toLowerCase().trim())).sort((a, b) => sortDue ? (a.dueDate ?? '9999').localeCompare(b.dueDate ?? '9999') : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()), [tasks, filter, query, sortDue]);

  function openCreate() { setEditing(null); setModalOpen(true); }
  function openEdit(task: Task) { setEditing(task); setModalOpen(true); }
  async function saveTask(input: TaskInput) {
    if (editing) {
      const updated = await tasksApi.update(editing.id, input);
      setTasks((old) => old.map((task) => task.id === editing.id ? { ...task, ...updated, ...input } : task));
      setNotice('Task updated successfully.');
    } else {
      const created = await tasksApi.create(input);
      setTasks((old) => [created, ...old]);
      setNotice('Your new task is ready.');
    }
    window.setTimeout(() => setNotice(''), 3000);
  }
  async function toggleComplete(task: Task) {
    const status: TaskStatus = task.status === 'COMPLETED' ? 'PENDING' : 'COMPLETED';
    try {
      const updated = await tasksApi.update(task.id, { status });
      setTasks((old) => old.map((item) => item.id === task.id ? { ...item, ...updated, status } : item));
      setNotice(status === 'COMPLETED' ? 'Nice work — task completed!' : 'Task moved back to to do.');
      window.setTimeout(() => setNotice(''), 3000);
    } catch (error) { setPageError(getErrorMessage(error)); }
  }
  async function deleteTask(task: Task) {
    if (!window.confirm(`Delete “${task.title}”? This cannot be undone.`)) return;
    try { await tasksApi.remove(task.id); setTasks((old) => old.filter((item) => item.id !== task.id)); setNotice('Task deleted.'); window.setTimeout(() => setNotice(''), 3000); }
    catch (error) { setPageError(getErrorMessage(error)); }
  }

  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' });
  return <div className="dashboard-page">
    <header className="topbar"><div className="breadcrumb">Workspace <span>/</span> <strong>Overview</strong></div><div className="topbar-right"><div className="today-chip"><CalendarDays size={15} /> {today}</div></div></header>
    <div className="page-content"><section className="welcome-row"><div><div className="eyebrow"><Sparkles size={14} /> YOUR PERSONAL WORKSPACE</div><h1>Make today <span>count.</span></h1><p>A little progress each day adds up to big results.</p></div><button className="button button-primary create-top" onClick={openCreate}><Plus size={18} /> New task</button></section>
      {pageError && <div className="alert-error" role="alert"><span>{pageError}</span><button onClick={() => setPageError('')} aria-label="Dismiss error"><X size={17} /></button></div>}
      {notice && <div className="toast-message" role="status"><CheckCircle2 size={17} />{notice}<button onClick={() => setNotice('')} aria-label="Dismiss notification"><X size={15} /></button></div>}
      <section className="stats-grid" aria-label="Task summary"><article className="stat-card stat-total"><div className="stat-top"><span>Total tasks</span><div className="stat-icon"><Target size={18} /></div></div><div className="stat-value">{loading ? '—' : stats.total}</div><div className="stat-caption">Everything on your plate</div><div className="stat-line"><span style={{ width: '100%' }} /></div></article><article className="stat-card"><div className="stat-top"><span>To do</span><div className="stat-icon stat-icon-blue"><Circle size={18} /></div></div><div className="stat-value">{loading ? '—' : tasks.filter((task) => task.status === 'PENDING').length}</div><div className="stat-caption">Ready when you are</div><div className="stat-line line-blue"><span style={{ width: `${stats.total ? tasks.filter((task) => task.status === 'PENDING').length / stats.total * 100 : 0}%` }} /></div></article><article className="stat-card"><div className="stat-top"><span>In progress</span><div className="stat-icon stat-icon-orange"><Clock3 size={18} /></div></div><div className="stat-value">{loading ? '—' : stats.progress}</div><div className="stat-caption">Keep the momentum</div><div className="stat-line line-orange"><span style={{ width: `${stats.total ? stats.progress / stats.total * 100 : 0}%` }} /></div></article><article className="stat-card"><div className="stat-top"><span>Completed</span><div className="stat-icon stat-icon-green"><CheckCircle2 size={18} /></div></div><div className="stat-value">{loading ? '—' : stats.completed}</div><div className="stat-caption">Look how far you've come</div><div className="stat-line line-green"><span style={{ width: `${stats.total ? stats.completed / stats.total * 100 : 0}%` }} /></div></article></section>
      <section className="tasks-section"><div className="section-heading"><div><div className="eyebrow">STAY ON TRACK</div><h2>Your tasks <span className="count-pill">{stats.active} active</span></h2></div><button className="button button-secondary button-small" onClick={openCreate}><Plus size={16} /> Add task</button></div>
        <div className="task-toolbar"><div className="filter-tabs" role="tablist" aria-label="Filter tasks">{([{ key: 'ALL', label: 'All tasks' }, { key: 'PENDING', label: 'To do' }, { key: 'IN_PROGRESS', label: 'In progress' }, { key: 'COMPLETED', label: 'Completed' }] as {key: Filter; label: string}[]).map((item) => <button key={item.key} role="tab" aria-selected={filter === item.key} className={filter === item.key ? 'filter-tab selected' : 'filter-tab'} onClick={() => setFilter(item.key)}>{item.label}{item.key === 'ALL' && <span>{stats.total}</span>}</button>)}</div><div className="task-controls"><label className="search-field"><Search size={16} /><input placeholder="Search tasks..." value={query} onChange={(e) => setQuery(e.target.value)} aria-label="Search tasks" />{query && <button onClick={() => setQuery('')} aria-label="Clear search"><X size={14} /></button>}</label><button className={`icon-button control-button ${sortDue ? 'control-active' : ''}`} onClick={() => setSortDue(!sortDue)} title="Toggle due-date sorting" aria-label="Toggle due-date sorting"><ArrowDownWideNarrow size={17} /></button></div></div>
        {loading ? <div className="loading-state"><Spinner label="Loading tasks" /><span>Getting your tasks ready…</span></div> : visibleTasks.length === 0 ? <div className="empty-state"><div className="empty-icon"><ListFilter size={24} /></div><h3>{query || filter !== 'ALL' ? 'No tasks match this view' : 'A fresh start'}</h3><p>{query || filter !== 'ALL' ? 'Try changing your search or choosing another filter.' : 'Add your first task and turn your plans into progress.'}</p>{!query && filter === 'ALL' && <button className="button button-primary" onClick={openCreate}><Plus size={17} /> Create your first task</button>}{(query || filter !== 'ALL') && <button className="button button-secondary" onClick={() => { setQuery(''); setFilter('ALL'); }}>Clear filters</button>}</div> : <div className="task-list">{visibleTasks.map((task) => <article className={`task-row ${task.status === 'COMPLETED' ? 'task-row-completed' : ''}`} key={task.id}><button className={`task-check ${task.status === 'COMPLETED' ? 'checked' : ''}`} onClick={() => void toggleComplete(task)} aria-label={task.status === 'COMPLETED' ? 'Mark as not completed' : 'Mark as completed'}>{task.status === 'COMPLETED' && <Check size={15} />}</button><button className="task-main" onClick={() => openEdit(task)}><strong>{task.title}</strong><span>{task.description || 'No description added'} </span></button><div className={`status-badge ${statusClass[task.status]}`}><span />{statusLabel[task.status]}</div><div className={`task-due ${task.dueDate && new Date(`${task.dueDate.slice(0,10)}T23:59:59`) < new Date() && task.status !== 'COMPLETED' ? 'due-overdue' : ''}`}><CalendarDays size={14} />{dueLabel(task.dueDate)}</div><div className="task-actions"><button className="icon-button" onClick={() => openEdit(task)} aria-label={`Edit ${task.title}`} title="Edit task"><ArrowUpRight size={17} /></button><button className="icon-button delete-action" onClick={() => void deleteTask(task)} aria-label={`Delete ${task.title}`} title="Delete task"><Trash2 size={16} /></button></div></article>)}</div>}
        {!loading && visibleTasks.length > 0 && <div className="task-list-footer"><span>Showing <strong>{visibleTasks.length}</strong> of <strong>{tasks.length}</strong> tasks</span><span><CheckCircle2 size={14} /> Keep going, you're doing great</span></div>}
      </section><footer className="page-footer"><span>Made for focused work.</span><span>Small steps. Meaningful progress.</span></footer></div>
    {modalOpen && <TaskModal task={editing} onClose={() => { setModalOpen(false); setEditing(null); }} onSave={saveTask} />}
  </div>;
}
