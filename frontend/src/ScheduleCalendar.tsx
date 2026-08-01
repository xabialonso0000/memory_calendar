import { useEffect, useMemo, useState } from 'react';
import { Calendar, momentLocalizer, SlotInfo, View } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';

const API_URL = 'http://localhost:8000/api';
const localizer = momentLocalizer(moment);

interface ScheduleEntry {
  id: number;
  title: string;
  description?: string;
  start_time: string;
  end_time: string;
}

interface FormState {
  id?: number;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
}

const toInputDate = (date: Date) => {
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
};

const blankForm = (start = new Date(), end = new Date(start.getTime() + 60 * 60 * 1000)): FormState => ({
  title: '', description: '', start_time: toInputDate(start), end_time: toInputDate(end),
});

export default function ScheduleCalendar() {
  const [entries, setEntries] = useState<ScheduleEntry[]>([]);
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState('');
  const [view, setView] = useState<View>('month');
  const [date, setDate] = useState(new Date());

  const loadEntries = async () => {
    const response = await fetch(`${API_URL}/schedule`);
    if (!response.ok) throw new Error('スケジュールを取得できませんでした');
    setEntries(await response.json());
  };

  useEffect(() => { loadEntries().catch((e) => setError(e.message)); }, []);

  const events = useMemo(() => entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    start: new Date(entry.start_time),
    end: new Date(entry.end_time),
    resource: entry,
  })), [entries]);

  const openSlot = (slot: SlotInfo) => setForm(blankForm(slot.start, slot.end));
  const openEvent = (event: typeof events[number]) => setForm({
    id: event.resource.id,
    title: event.resource.title,
    description: event.resource.description || '',
    start_time: toInputDate(event.start),
    end_time: toInputDate(event.end),
  });

  const save = async () => {
    if (!form || !form.title.trim()) return setError('タイトルを入力してください');
    if (new Date(form.end_time) <= new Date(form.start_time)) return setError('終了日時は開始日時より後にしてください');
    const response = await fetch(`${API_URL}/schedule${form.id ? `/${form.id}` : ''}`, {
      method: form.id ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...form, start_time: new Date(form.start_time).toISOString(), end_time: new Date(form.end_time).toISOString() }),
    });
    if (!response.ok) return setError('スケジュールを保存できませんでした');
    setForm(null); setError(''); await loadEntries();
  };

  const remove = async () => {
    if (!form?.id || !window.confirm('このスケジュールを削除しますか？')) return;
    const response = await fetch(`${API_URL}/schedule/${form.id}`, { method: 'DELETE' });
    if (!response.ok) return setError('スケジュールを削除できませんでした');
    setForm(null); setError(''); await loadEntries();
  };

  return <Box sx={{ height: 620, mb: 4 }}>
    <Calendar
      localizer={localizer} events={events} selectable startAccessor="start" endAccessor="end"
      view={view} onView={setView} date={date} onNavigate={setDate}
      onSelectSlot={openSlot} onSelectEvent={openEvent}
      messages={{ next: '次へ', previous: '前へ', today: '今日', month: '月', week: '週', day: '日', agenda: '予定' }}
    />
    <Dialog open={Boolean(form)} onClose={() => setForm(null)} fullWidth maxWidth="sm">
      <DialogTitle>{form?.id ? 'スケジュールを編集' : 'スケジュールを登録'}</DialogTitle>
      <DialogContent>
        {error && <Box role="alert" sx={{ color: 'error.main', mb: 1 }}>{error}</Box>}
        <TextField autoFocus fullWidth margin="dense" label="タイトル" value={form?.title || ''} onChange={(e) => setForm((f) => f && ({ ...f, title: e.target.value }))} />
        <TextField fullWidth margin="dense" label="説明" multiline rows={3} value={form?.description || ''} onChange={(e) => setForm((f) => f && ({ ...f, description: e.target.value }))} />
        <TextField fullWidth margin="dense" label="開始日時" type="datetime-local" InputLabelProps={{ shrink: true }} value={form?.start_time || ''} onChange={(e) => setForm((f) => f && ({ ...f, start_time: e.target.value }))} />
        <TextField fullWidth margin="dense" label="終了日時" type="datetime-local" InputLabelProps={{ shrink: true }} value={form?.end_time || ''} onChange={(e) => setForm((f) => f && ({ ...f, end_time: e.target.value }))} />
      </DialogContent>
      <DialogActions>
        {form?.id && <Button color="error" onClick={remove}>削除</Button>}
        <Button onClick={() => setForm(null)}>キャンセル</Button>
        <Button variant="contained" onClick={save}>保存</Button>
      </DialogActions>
    </Dialog>
  </Box>;
}
