import { useState, useEffect, FormEvent, ChangeEvent } from 'react';
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
  Pagination,
} from '@mui/material';
import './App.css';

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
  const [diarySearchTerm, setDiarySearchTerm] = useState('');
  const [diaryPage, setDiaryPage] = useState(1);
  const diaryItemsPerPage = 5;

  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');
  const [scheduleSearchTerm, setScheduleSearchTerm] = useState('');
  const [schedulePage, setSchedulePage] = useState(1);
  const scheduleItemsPerPage = 5;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [editingScheduleEntry, setEditingScheduleEntry] = useState<ScheduleEntry | null>(null);

  useEffect(() => {
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
      const response = await fetch(`${API_URL}/entries`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error('Failed to create entry');
      }

      const newEntry: DiaryEntry = await response.json();
      setEntries([...entries, newEntry]);
      setTitle('');
      setContent('');
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
          start_time: scheduleStartTime,
          end_time: scheduleEndTime,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to create schedule entry');
      }

      const newEntry: ScheduleEntry = await response.json();
      setScheduleEntries([...scheduleEntries, newEntry]);
      setScheduleTitle('');
      setScheduleDescription('');
      setScheduleStartTime('');
      setScheduleEndTime('');
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

        setEntries(entries.filter((entry) => entry.id !== id));
      } catch (error) {
        console.error(error);
      }
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

        setScheduleEntries(
          scheduleEntries.filter((entry) => entry.id !== id)
        );
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

  const handleUpdateEntry = async () => {
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

      const updatedEntry: DiaryEntry = await response.json();
      setEntries(
        entries.map((entry) =>
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
      handleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleScheduleEditClick = (entry: ScheduleEntry) => {
    setEditingScheduleEntry(entry);
    setIsScheduleModalOpen(true);
  };

  const handleScheduleModalClose = () => {
    setEditingScheduleEntry(null);
    setIsScheduleModalOpen(false);
  };

  const handleUpdateScheduleEntry = async () => {
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

      const updatedEntry: ScheduleEntry = await response.json();
      setScheduleEntries(
        scheduleEntries.map((entry) =>
          entry.id === updatedEntry.id ? updatedEntry : entry
        )
      );
      handleScheduleModalClose();
    } catch (error) {
      console.error(error);
    }
  };

  const handleDiaryPageChange = (event: ChangeEvent<unknown>, value: number) => {
    setDiaryPage(value);
  };

  const handleSchedulePageChange = (event: ChangeEvent<unknown>, value: number) => {
    setSchedulePage(value);
  };

  const filteredDiaryEntries = entries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(diarySearchTerm.toLowerCase()) ||
      entry.content.toLowerCase().includes(diarySearchTerm.toLowerCase())
  );

  const filteredScheduleEntries = scheduleEntries.filter(
    (entry) =>
      entry.title.toLowerCase().includes(scheduleSearchTerm.toLowerCase()) ||
      (entry.description &&
        entry.description.toLowerCase().includes(scheduleSearchTerm.toLowerCase()))
  );

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Diary & Schedule App</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              My Diary
            </Typography>
            <TextField
              label="Search Diary"
              fullWidth
              margin="normal"
              onChange={(e) => setDiarySearchTerm(e.target.value)}
            />
            <form onSubmit={handleDiarySubmit}>
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              <TextField
                label="What happened today?"
                fullWidth
                multiline
                rows={4}
                margin="normal"
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
              <Button type="submit" variant="contained" color="primary">
                Add Entry
              </Button>
            </form>
            <div style={{ marginTop: '2rem' }}>
              {filteredDiaryEntries
                .slice((diaryPage - 1) * diaryItemsPerPage, diaryPage * diaryItemsPerPage)
                .map((entry) => (
                  <Card key={entry.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h5">{entry.title}</Typography>
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(entry.created_at)}
                      </Typography>
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {entry.content}
                      </Typography>
                      <Button size="small" onClick={() => handleEditClick(entry)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleDiaryDelete(entry.id)}>Delete</Button>
                    </CardContent>
                  </Card>
                ))}
              <Pagination
                count={Math.ceil(filteredDiaryEntries.length / diaryItemsPerPage)}
                page={diaryPage}
                onChange={handleDiaryPageChange}
                sx={{ mt: 2 }}
              />
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              My Schedule
            </Typography>
            <TextField
              label="Search Schedule"
              fullWidth
              margin="normal"
              onChange={(e) => setScheduleSearchTerm(e.target.value)}
            />
            <form onSubmit={handleScheduleSubmit}>
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                value={scheduleTitle}
                onChange={(e) => setScheduleTitle(e.target.value)}
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                margin="normal"
                value={scheduleDescription}
                onChange={(e) => setScheduleDescription(e.target.value)}
              />
              <TextField
                type="datetime-local"
                label="Start Time"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                value={scheduleStartTime}
                onChange={(e) => setScheduleStartTime(e.target.value)}
              />
              <TextField
                type="datetime-local"
                label="End Time"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                value={scheduleEndTime}
                onChange={(e) => setScheduleEndTime(e.target.value)}
              />
              <Button type="submit" variant="contained" color="secondary">
                Add Schedule Entry
              </Button>
            </form>
            <div style={{ marginTop: '2rem' }}>
              {filteredScheduleEntries
                .slice((schedulePage - 1) * scheduleItemsPerPage, schedulePage * scheduleItemsPerPage)
                .map((entry) => (
                  <Card key={entry.id} sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="h5">{entry.title}</Typography>
                      {entry.description && (
                        <Typography variant="body1" sx={{ mt: 1 }}>
                          {entry.description}
                        </Typography>
                      )}
                      <Typography variant="body2" color="text.secondary">
                        {formatDateTime(entry.start_time)} - {formatDateTime(entry.end_time)}
                      </Typography>
                      <Button size="small" onClick={() => handleScheduleEditClick(entry)}>Edit</Button>
                      <Button size="small" color="error" onClick={() => handleScheduleDelete(entry.id)}>Delete</Button>
                    </CardContent>
                  </Card>
                ))}
              <Pagination
                count={Math.ceil(filteredScheduleEntries.length / scheduleItemsPerPage)}
                page={schedulePage}
                onChange={handleSchedulePageChange}
                sx={{ mt: 2 }}
              />
            </div>
          </Grid>
        </Grid>
      </Container>
      <Modal open={isModalOpen} onClose={handleModalClose}>
        <Box sx={{ ...style, width: 400 }}>
          <Typography variant="h6" id="modal-title">
            Edit Diary Entry
          </Typography>
          {editingEntry && (
            <form>
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
                label="Content"
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
                onClick={handleUpdateEntry}
              >
                Update
              </Button>
            </form>
          )}
        </Box>
      </Modal>
      <Modal open={isScheduleModalOpen} onClose={handleScheduleModalClose}>
        <Box sx={{ ...style, width: 400 }}>
          <Typography variant="h6" id="modal-title">
            Edit Schedule Entry
          </Typography>
          {editingScheduleEntry && (
            <form>
              <TextField
                label="Title"
                fullWidth
                margin="normal"
                value={editingScheduleEntry.title}
                onChange={(e) =>
                  setEditingScheduleEntry({ ...editingScheduleEntry, title: e.target.value })
                }
              />
              <TextField
                label="Description"
                fullWidth
                multiline
                rows={2}
                margin="normal"
                value={editingScheduleEntry.description || ''}
                onChange={(e) =>
                  setEditingScheduleEntry({ ...editingScheduleEntry, description: e.target.value })
                }
              />
              <TextField
                type="datetime-local"
                label="Start Time"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                value={editingScheduleEntry.start_time}
                onChange={(e) =>
                  setEditingScheduleEntry({ ...editingScheduleEntry, start_time: e.target.value })
                }
              />
              <TextField
                type="datetime-local"
                label="End Time"
                fullWidth
                margin="normal"
                InputLabelProps={{
                  shrink: true,
                }}
                value={editingScheduleEntry.end_time}
                onChange={(e) =>
                  setEditingScheduleEntry({ ...editingScheduleEntry, end_time: e.target.value })
                }
              />
              <Button
                variant="contained"
                color="secondary"
                onClick={handleUpdateScheduleEntry}
              >
                Update
              </Button>
            </form>
          )}
        </Box>
      </Modal>
    </>
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