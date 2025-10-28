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

function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  const [scheduleEntries, setScheduleEntries] = useState<ScheduleEntry[]>([]);
  const [scheduleTitle, setScheduleTitle] = useState('');
  const [scheduleDescription, setScheduleDescription] = useState('');
  const [scheduleStartTime, setScheduleStartTime] = useState('');
  const [scheduleEndTime, setScheduleEndTime] = useState('');

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
              {entries.map((entry) => (
                <Card key={entry.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h5">{entry.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(entry.created_at).toLocaleString()}
                    </Typography>
                    <Typography variant="body1" sx={{ mt: 1 }}>
                      {entry.content}
                    </Typography>
                    <Button size="small" color="error" onClick={() => handleDiaryDelete(entry.id)}>Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Grid>

          <Grid item xs={12} md={6}>
            <Typography variant="h4" gutterBottom>
              My Schedule
            </Typography>
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
              {scheduleEntries.map((entry) => (
                <Card key={entry.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h5">{entry.title}</Typography>
                    {entry.description && (
                      <Typography variant="body1" sx={{ mt: 1 }}>
                        {entry.description}
                      </Typography>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {new Date(entry.start_time).toLocaleString()} - {new Date(entry.end_time).toLocaleString()}
                    </Typography>
                    <Button size="small" color="error" onClick={() => handleScheduleDelete(entry.id)}>Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Grid>
        </Grid>
      </Container>
    </>
  );
}

export default App;