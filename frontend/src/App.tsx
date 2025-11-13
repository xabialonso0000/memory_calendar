import { useState, useEffect, FormEvent } from 'react';
import {
  Container,
  Typography,
  TextField,
  Button,
  Grid,
  Card,
  CardContent,
  AppBar,
  Toolbar,
  Modal,
  Box,
  Tabs,
  Tab,
} from '@mui/material';
import { LocalizationProvider, DateTimePicker } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import ScheduleCalendar from './ScheduleCalendar';
import ReactMarkdown from 'react-markdown';
import './App.css';
import { SlotInfo } from 'react-big-calendar';

const API_URL = 'http://localhost:8000/api';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

interface ScheduleEntry {
  id: number;
  title: string;
  description: string | null;
  start_time: string;
  end_time: string;
}

const formatDateTime = (dateTimeString: string) => {
  const date = new Date(dateTimeString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  const hours = date.getHours().toString().padStart(2, '0');
  const minutes = date.getMinutes().toString().padStart(2, '0');
  return `${year}/${month}/${day} ${hours}:${minutes}`;
};

function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState<Date | null>(null);
  const [scheduleEndTime, setScheduleEndTime] = useState<Date | null>(null);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleEntry, setEditingScheduleEntry] = useState<ScheduleEntry | null>(null);
  
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [rightTab, setRightTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setRightTab(newValue);
  };

  const fetchEntries = async () => {
    try {
      const response = await fetch(`${API_URL}/entries`);
      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }
      const data: DiaryEntry[] = await response.json();
      setEntries(data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchScheduleEntries = async () => {
    try {
      const response = await fetch(`${API_URL}/schedule`);
      if (!response.ok) {
        throw new Error('Failed to fetch schedule entries');
      }
      const data: ScheduleEntry[] = await response.json();
      setScheduleEntries(data);
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    fetchEntries();
    fetchScheduleEntries();
  }, []);

  const handleDiarySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Title and content are required');
      return;
    }

    try {
      const year = selectedDate.getFullYear();
      const month = (selectedDate.getMonth() + 1).toString().padStart(2, '0');
      const day = selectedDate.getDate().toString().padStart(2, '0');
      const dateString = `${year}-${month}-${day}T12:00:00.000Z`; // Noon UTC

      const response = await fetch(`${API_URL}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content, created_at: dateString }),
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      fetchEntries();
      setTitle('');
      setContent('');
    } catch (error) {
      console.error(error);
    }
  };

  const handleDiaryDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this diary entry?')) {
      try {
        const response = await fetch(`${API_URL}/entries/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete entry');
        }

        fetchEntries();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleEditClick = (entry: DiaryEntry) => {
    setEditingEntry(entry);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setEditingEntry(null);
    setIsModalOpen(false);
  };

  const handleUpdateEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingEntry) return;

    try {
      const response = await fetch(`${API_URL}/entries/${editingEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingEntry.title,
          content: editingEntry.content,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update entry');
      }

      fetchEntries();
      handleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleScheduleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!scheduleTitle || !scheduleStartTime || !scheduleEndTime) {
      alert('Title, start time and end time are required');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: scheduleTitle,
          description: scheduleDescription,
          start_time: scheduleStartTime.toISOString(),
          end_time: scheduleEndTime.toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule entry');
      }

      fetchScheduleEntries();
      handleScheduleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleScheduleModalClose = () => {
    setEditingScheduleEntry(null);
    setIsScheduleModalOpen(false);
    setScheduleTitle('');
    setScheduleDescription('');
    setScheduleStartTime(null);
    setScheduleEndTime(null);
  };

  const handleUpdateScheduleEntry = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingScheduleEntry) return;

    try {
      const response = await fetch(`${API_URL}/schedule/${editingScheduleEntry.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: editingScheduleEntry.title,
          description: editingScheduleEntry.description,
          start_time: editingScheduleEntry.start_time,
          end_time: editingScheduleEntry.end_time,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update schedule entry');
      }

      fetchScheduleEntries();
      handleScheduleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleScheduleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this schedule entry?')) {
      try {
        const response = await fetch(`${API_URL}/schedule/${id}`, {
          method: 'DELETE',
        });

        if (!response.ok) {
          throw new Error('Failed to delete schedule entry');
        }

        fetchScheduleEntries();
        handleScheduleModalClose();
      } catch (error) {
        console.error(error);
      }
    }
  };

  const handleSelectEvent = (event: any) => {
    setSelectedDate(new Date(event.start));
    if (event.resource.type === 'diary') {
      handleEditClick(event.resource);
    } else {
      setEditingScheduleEntry(event.resource);
      setIsScheduleModalOpen(true);
    }
  };

  const handleSelectSlot = (slotInfo: SlotInfo) => {
    setSelectedDate(slotInfo.start);
    if (rightTab === 0) { // Schedule tab
      setIsScheduleModalOpen(true);
      setEditingScheduleEntry(null);
      setScheduleTitle('');
      setScheduleDescription('');
      setScheduleStartTime(slotInfo.start);
      setScheduleEndTime(slotInfo.end);
    }
  };

  const scheduleEvents = scheduleEntries.map(entry => {
    const startTime = entry.start_time.endsWith('Z') ? entry.start_time : entry.start_time + 'Z';
    const endTime = entry.end_time.endsWith('Z') ? entry.end_time : entry.end_time + 'Z';
    return {
      title: entry.title,
      start: new Date(startTime),
      end: new Date(endTime),
      allDay: false,
      resource: { ...entry, type: 'schedule' },
    };
  });

  const diaryEvents = entries.map(entry => {
    const eventTime = entry.created_at.endsWith('Z') ? entry.created_at : entry.created_at + 'Z';
    return {
      title: entry.title,
      start: new Date(eventTime),
      end: new Date(eventTime),
      allDay: true,
      resource: { ...entry, type: 'diary' },
    };
  });

  const calendarEvents = [...scheduleEvents, ...diaryEvents];

  const eventPropGetter = (event: any) => {
    const style = {
      backgroundColor: event.resource.type === 'diary' ? '#28a745' : '#3174ad',
      borderRadius: '5px',
      opacity: 0.8,
      color: 'white',
      border: '0px',
      display: 'block'
    };
    return {
      style: style
    };
  };

  const year = selectedDate.getFullYear();
  const month = selectedDate.getMonth();
  const day = selectedDate.getDate();
  const startOfDayUTC = new Date(Date.UTC(year, month, day, 0, 0, 0));
  const endOfDayUTC = new Date(Date.UTC(year, month, day, 23, 59, 59));

  const dayDiaryEntries = entries.filter(entry => {
    const entryDate = new Date(entry.created_at);
    return entryDate >= startOfDayUTC && entryDate <= endOfDayUTC;
  });

  const dayScheduleEntries = scheduleEntries.filter(entry => {
    const entryDate = new Date(entry.start_time);
    return entryDate >= startOfDayUTC && entryDate <= endOfDayUTC;
  });

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Diary & Schedule App</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            <ScheduleCalendar events={calendarEvents} onSelectSlot={handleSelectSlot} onSelectEvent={handleSelectEvent} eventPropGetter={eventPropGetter} />
          </Grid>
          <Grid item xs={12} md={5}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
              <Tabs value={rightTab} onChange={handleTabChange} aria-label="schedule and diary tabs">
                <Tab label="Schedule" />
                <Tab label="Diary" />
              </Tabs>
            </Box>
            {rightTab === 0 && (
              <div>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  Schedule for {selectedDate.toLocaleDateString()}
                </Typography>
                {dayScheduleEntries.map(entry => (
                  <Card key={entry.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h5">{entry.title}</Typography>
                      {entry.description && <Typography variant="body1">{entry.description}</Typography>}
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(entry.start_time)} - {formatDateTime(entry.end_time)}
                      </Typography>
                      <Button size="small" onClick={() => handleSelectEvent({ resource: { ...entry, type: 'schedule' } })}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleScheduleDelete(entry.id)}>Delete</Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {rightTab === 1 && (
              <div>
                <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                  Diary for {selectedDate.toLocaleDateString()}
                </Typography>
                <form onSubmit={handleDiarySubmit}>
                  <TextField
                    label="Title"
                    fullWidth
                    margin="normal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <TextField
                    label="What happened today? (Markdown supported)"
                    fullWidth
                    multiline
                    rows={4}
                    margin="normal"
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                  />
                  <Button type="submit" variant="contained" color="primary">
                    Add Diary Entry for {selectedDate.toLocaleDateString()}
                  </Button>
                </form>
                <div style={{ marginTop: '2rem' }}>
                  {dayDiaryEntries.map((entry) => (
                    <Card key={entry.id} sx={{ mb: 2 }}>
                      <CardContent>
                        <Typography variant="h5">{entry.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          {new Date(entry.created_at).toLocaleDateString()}
                        </Typography>
                        <Box sx={{ mt: 1, p: 2, border: '1px solid #ddd', borderRadius: '4px', '& h1, & h2, & h3': { mt: 2, mb: 1 } }}>
                          <ReactMarkdown>{entry.content}</ReactMarkdown>
                        </Box>
                        <Button size="small" onClick={() => handleEditClick(entry)}>Edit</Button>
                        <Button size="small" color="error" onClick={() => handleDiaryDelete(entry.id)}>Delete</Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </Grid>
        </Grid>
      </Container>
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <Box sx={{ ...style, width: 400 }}>
          <Typography variant="h6" id="modal-title">
            Edit Diary Entry
          </Typography>
          {editingEntry && (
            <div>
              <Typography variant="subtitle1" color="text.secondary" gutterBottom>
                {new Date(editingEntry.created_at).toLocaleDateString()}
              </Typography>
              <form onSubmit={handleUpdateEntry}>
                <TextField
                  label="Title"
                  fullWidth
                  margin="normal"
                  value={editingEntry.title}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, title: e.target.value })
                  }
                />
                <TextField
                  label="Content (Markdown supported)"
                  fullWidth
                  multiline
                  rows={4}
                  margin="normal"
                  value={editingEntry.content}
                  onChange={(e) =>
                    setEditingEntry({ ...editingEntry, content: e.target.value })
                  }
                />
                <Button
                  variant="contained"
                  color="primary"
                  type="submit"
                >
                  Update
                </Button>
              </form>
            </div>
          )}
        </Box>
      </Modal>
      <Modal open={isScheduleModalOpen} onClose={handleScheduleModalClose}>
        <Box sx={{ ...style, width: 400 }}>
          <Typography variant="h6" id="modal-title">
            {editingScheduleEntry ? 'Edit Schedule Entry' : 'Add Schedule Entry'}
          </Typography>
          <form onSubmit={editingScheduleEntry ? handleUpdateScheduleEntry : handleScheduleSubmit}>
            <TextField
              label="Title"
              fullWidth
              margin="normal"
              value={editingScheduleEntry ? editingScheduleEntry.title : scheduleTitle}
              onChange={(e) => {
                if (editingScheduleEntry) {
                  setEditingScheduleEntry({ ...editingScheduleEntry, title: e.target.value });
                }
                else {
                  setScheduleTitle(e.target.value);
                }
              }}
            />
            <TextField
              label="Description"
              fullWidth
              multiline
              rows={2}
              margin="normal"
              value={editingScheduleEntry ? editingScheduleEntry.description : scheduleDescription}
              onChange={(e) => {
                if (editingScheduleEntry) {
                  setEditingScheduleEntry({ ...editingScheduleEntry, description: e.target.value });
                }
                else {
                  setScheduleDescription(e.target.value);
                }
              }}
            />
            <DateTimePicker
              label="Start Time"
              value={editingScheduleEntry ? new Date(editingScheduleEntry.start_time) : scheduleStartTime}
              onChange={(newValue) => {
                if (editingScheduleEntry) {
                  setEditingScheduleEntry({ ...editingScheduleEntry, start_time: newValue ? newValue.toISOString() : new Date().toISOString() });
                }
                else {
                  setScheduleStartTime(newValue);
                }
              }}
              slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
            />
            <DateTimePicker
              label="End Time"
              value={editingScheduleEntry ? new Date(editingScheduleEntry.end_time) : scheduleEndTime}
              onChange={(newValue) => {
                if (editingScheduleEntry) {
                  setEditingScheduleEntry({ ...editingScheduleEntry, end_time: newValue ? newValue.toISOString() : new Date().toISOString() });
                }
                else {
                  setScheduleEndTime(newValue);
                }
              }}
              slotProps={{ textField: { fullWidth: true, margin: "normal" } }}
            />
            <Button
              variant="contained"
              color="secondary"
              type="submit"
            >
              {editingScheduleEntry ? 'Update' : 'Add'}
            </Button>
            {editingScheduleEntry && (
              <Button
                variant="contained"
                color="error"
                onClick={() => handleScheduleDelete(editingScheduleEntry.id)}
                sx={{ ml: 2 }}
              >
                Delete
              </Button>
            )}
          </form>
        </Box>
      </Modal>
    </LocalizationProvider>
  );
}

const style = {
  position: 'absolute' as 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

export default App;
