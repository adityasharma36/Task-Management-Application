import { useEffect, useState, type FormEvent } from 'react';
import { X } from 'lucide-react';
import type { Task, TaskStatus } from '../types';
import type { TaskInput } from '../api/tasks';

interface Props { task?: Task | null; onClose: () => void; onSave: (input: TaskInput) => Promise<void>; }

export default function TaskModal({ task, onClose, onSave }: Props) {
  const [title, setTitle] = useState(task?.title ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'PENDING');
  const [dueDate, setDueDate] = useState(task?.dueDate?.slice(0, 10) ?? '');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { const handleKey = (event: KeyboardEvent) => { if (event.key === 'Escape') onClose(); }; window.addEventListener('keydown', handleKey); return () => window.removeEventListener('keydown', handleKey); }, [onClose]);

  async function submit(event: FormEvent) {
    event.preventDefault(); setError('');
    if (!title.trim()) { setError('Please add a task title.'); return; }
    setSaving(true);
    try { await onSave({ title: title.trim(), description: description.trim() || undefined, status, dueDate: dueDate || null }); onClose(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Could not save task.'); }
    finally { setSaving(false); }
  }

  return <div className="modal-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="modal" role="dialog" aria-modal="true" aria-labelledby="task-modal-title">
      <div className="modal-heading"><div><span className="eyebrow">TASK DETAILS</span><h2 id="task-modal-title">{task ? 'Edit task' : 'Create a task'}</h2></div><button className="icon-button" onClick={onClose} aria-label="Close dialog"><X size={19} /></button></div>
      <form onSubmit={submit} className="form-stack">
        <label className="field"><span>Task name</span><input autoFocus maxLength={160} placeholder="e.g. Finish project proposal" value={title} onChange={(e) => setTitle(e.target.value)} required /></label>
        <label className="field"><span>Description <small>Optional</small></span><textarea rows={3} maxLength={2000} placeholder="Add a little context..." value={description} onChange={(e) => setDescription(e.target.value)} /></label>
        <div className="form-row"><label className="field"><span>Status</span><select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)}><option value="PENDING">To do</option><option value="IN_PROGRESS">In progress</option><option value="COMPLETED">Completed</option></select></label><label className="field"><span>Due date <small>Optional</small></span><input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} /></label></div>
        {error && <p className="form-error" role="alert">{error}</p>}
        <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary" disabled={saving}>{saving ? 'Saving…' : task ? 'Save changes' : 'Create task'}</button></div>
      </form>
    </section>
  </div>;
}
