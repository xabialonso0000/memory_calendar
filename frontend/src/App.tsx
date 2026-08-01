import { useState, useEffect, FormEvent, useRef } from 'react';
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
} from '@mui/material';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import './App.css';

const API_URL = 'http://localhost:8000/api';

interface DiaryEntry {
  id: number;
  title: string;
  content: string;
  created_at: string;
}

function App() {
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<DiaryEntry | null>(null);

  const quillRef = useRef<ReactQuill>(null);

  const imageHandler = () => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', 'image/*');
    input.click();

    input.onchange = async () => {
      if (input.files) {
        const file = input.files[0];
        const formData = new FormData();
        formData.append('file', file);

        try {
          const uploadResponse = await fetch(`${API_URL}/upload`, {
            method: 'POST',
            body: formData,
          });

          if (!uploadResponse.ok) {
            throw new Error('Failed to upload image');
          }

          const uploadResult = await uploadResponse.json();
          const imageUrl = `${API_URL.replace('/api', '')}${uploadResult.file_path}`;
          
          const editor = quillRef.current?.getEditor();
          if (editor) {
            const range = editor.getSelection();
            if (range) {
              editor.insertEmbed(range.index, 'image', imageUrl);
            }
          }
        } catch (error) {
          console.error(error);
          alert('Failed to upload image');
        }
      }
    };
  };

  const modules = {
    toolbar: {
      container: [
        [{ 'header': [1, 2, false] }],
        ['bold', 'italic', 'underline','strike', 'blockquote'],
        [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
        ['link', 'image'],
        ['clean']
      ],
      handlers: {
        image: imageHandler,
      },
    },
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

  useEffect(() => {
    fetchEntries();
  }, []);

  const handleDiarySubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!title || !content) {
      alert('Title and content are required');
      return;
    }

    try {
      const currentDate = new Date();
      const year = currentDate.getFullYear();
      const month = (currentDate.getMonth() + 1).toString().padStart(2, '0');
      const day = currentDate.getDate().toString().padStart(2, '0');
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

  return (
    <>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6">Diary App</Typography>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4 }}>
        <Grid container spacing={4}>
          <Grid item xs={12} md={7}>
            {/* Calendar was here */}
            <Typography variant="h5" gutterBottom>Diary Entries</Typography>
            <div style={{ marginTop: '2rem' }}>
              {entries.map((entry) => (
                <Card key={entry.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h5">{entry.title}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {new Date(entry.created_at).toLocaleDateString()}
                    </Typography>
                    <Box sx={{ mt: 1, p: 2, border: '1px solid #ddd', borderRadius: '4px', '& h1, & h2, & h3': { mt: 2, mb: 1 } }}
                         dangerouslySetInnerHTML={{ __html: entry.content }}
                    />
                    <Button size="small" onClick={() => handleEditClick(entry)}>Edit</Button>
                    <Button size="small" color="error" onClick={() => handleDiaryDelete(entry.id)}>Delete</Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </Grid>
          <Grid item xs={12} md={5}>
            <div>
              <Typography variant="h5" gutterBottom sx={{ mt: 2 }}>
                New Diary Entry
              </Typography>
              <form onSubmit={handleDiarySubmit}>
                <TextField
                  label="Title"
                  fullWidth
                  margin="normal"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={content}
                  onChange={setContent}
                  modules={modules}
                  style={{ height: '200px', marginBottom: '50px' }}
                />
                <Button type="submit" variant="contained" color="primary">
                  Add Diary Entry
                </Button>
              </form>
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
                <ReactQuill
                  ref={quillRef}
                  theme="snow"
                  value={editingEntry.content}
                  modules={modules}
                  onChange={(value) =>
                    setEditingEntry({ ...editingEntry, content: value })
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
