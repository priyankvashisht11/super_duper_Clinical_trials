import React, { useState } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  Alert,
  Fade,
  LinearProgress,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Description as DocumentIcon,
  MoreVert as MoreIcon,
  Download as DownloadIcon,
  Share as ShareIcon,
  Delete as DeleteIcon,
  Edit as EditIcon,
  Visibility as ViewIcon,
  Add as AddIcon,
  FilterList as FilterIcon,
  CloudUpload as CloudIcon,
  FolderOpen as LocalIcon,
  ArrowDropDown as ArrowDownIcon,
} from '@mui/icons-material';
import { styled, alpha } from '@mui/material/styles';
import { colors } from '../../styles/theme';

const PageHeader = styled(Box)(() => ({
  background: `linear-gradient(135deg, ${alpha(colors.primary.light, 0.1)} 0%, ${alpha(colors.secondary.light, 0.05)} 100%)`,
  borderRadius: 16,
  padding: '32px',
  marginBottom: '24px',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
}));

const DocumentCard = styled(Card)(() => ({
  transition: 'all 0.3s ease',
  border: `1px solid ${alpha(colors.primary.main, 0.1)}`,
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: `0 8px 24px ${alpha(colors.primary.main, 0.15)}`,
    borderColor: colors.primary.main,
  },
}));

const StatsCard = styled(Card)(() => ({
  background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
  color: '#fff',
  border: 'none',
}));

interface Document {
  id: string;
  title: string;
  type: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'completed' | 'in-progress';
  trials: number;
  pages: number;
  size: string;
}

export const MyDocumentsPage: React.FC = () => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedDoc, setSelectedDoc] = useState<string | null>(null);
  const [filterType, setFilterType] = useState<string>('all');
  const [newDocMenuAnchor, setNewDocMenuAnchor] = useState<null | HTMLElement>(null);
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: '1',
      title: 'Diabetes Phase III Research Summary',
      type: 'Research Summary',
      createdAt: '2024-02-08',
      updatedAt: '2024-02-09',
      status: 'completed',
      trials: 15,
      pages: 24,
      size: '2.4 MB'
    },
    {
      id: '2',
      title: 'Cancer Immunotherapy Literature Review',
      type: 'Literature Review',
      createdAt: '2024-02-07',
      updatedAt: '2024-02-09',
      status: 'in-progress',
      trials: 8,
      pages: 18,
      size: '1.8 MB'
    },
    {
      id: '3',
      title: 'Cardiovascular Trials Comparison',
      type: 'Comparison Report',
      createdAt: '2024-02-06',
      updatedAt: '2024-02-08',
      status: 'completed',
      trials: 12,
      pages: 32,
      size: '3.1 MB'
    },
    {
      id: '4',
      title: 'Patient Matching Report - Hypertension',
      type: 'Patient Matching',
      createdAt: '2024-02-05',
      updatedAt: '2024-02-05',
      status: 'draft',
      trials: 5,
      pages: 8,
      size: '0.9 MB'
    },
  ]);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const stats = {
    total: documents.length,
    completed: documents.filter(d => d.status === 'completed').length,
    inProgress: documents.filter(d => d.status === 'in-progress').length,
    draft: documents.filter(d => d.status === 'draft').length,
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, docId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedDoc(docId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedDoc(null);
  };

  const handleAction = (action: string) => {
    if (action === 'delete' && selectedDoc) {
      handleDeleteDocument(selectedDoc);
    } else {
      console.log(`Action: ${action} on document: ${selectedDoc}`);
      handleMenuClose();
    }
  };

  const handleNewDocMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setNewDocMenuAnchor(event.currentTarget);
  };

  const handleNewDocMenuClose = () => {
    setNewDocMenuAnchor(null);
  };

  const handleAddFromCloud = () => {
    console.log('Add document from cloud');
    handleNewDocMenuClose();
    alert('Cloud storage integration coming soon! For now, please use "Add from Local" to upload files from your device.');
  };

  const handleAddFromLocal = () => {
    handleNewDocMenuClose();
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.pdf,.doc,.docx,.txt';
    input.multiple = true; // Allow multiple file selection
    input.onchange = async (e: any) => {
      const files = Array.from(e.target.files) as File[];
      if (files.length > 0) {
        setUploading(true);
        setUploadProgress(0);
        
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          
          // Simulate upload progress
          for (let progress = 0; progress <= 100; progress += 20) {
            setUploadProgress(progress);
            await new Promise(resolve => setTimeout(resolve, 100));
          }
          
          // Create new document entry
          const newDoc: Document = {
            id: `${Date.now()}-${i}`,
            title: file.name.replace(/\.[^/.]+$/, ''), // Remove file extension
            type: getFileType(file.name),
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0],
            status: 'draft',
            trials: 0,
            pages: Math.floor(Math.random() * 20) + 5, // Random page count
            size: formatFileSize(file.size)
          };
          
          // Add to documents list
          setDocuments(prev => [newDoc, ...prev]);
        }
        
        setUploading(false);
        setUploadProgress(0);
        alert(`Successfully uploaded ${files.length} document(s)!`);
      }
    };
    input.click();
  };

  const getFileType = (filename: string): string => {
    const ext = filename.split('.').pop()?.toLowerCase();
    switch (ext) {
      case 'pdf':
        return 'PDF Document';
      case 'doc':
      case 'docx':
        return 'Word Document';
      case 'txt':
        return 'Text Document';
      default:
        return 'Document';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const handleDeleteDocument = (docId: string) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      setDocuments(prev => prev.filter(doc => doc.id !== docId));
      handleMenuClose();
      alert('Document deleted successfully!');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'success';
      case 'in-progress':
        return 'warning';
      case 'draft':
        return 'default';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'draft':
        return 'Draft';
      default:
        return status;
    }
  };

  const filteredDocuments = filterType === 'all' 
    ? documents 
    : documents.filter(d => d.status === filterType);

  return (
    <Box sx={{ p: 4 }}>
      <Fade in timeout={600}>
        <PageHeader>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="h4" fontWeight={700} gutterBottom sx={{ color: colors.text.primary }}>
                <DocumentIcon sx={{ fontSize: 40, verticalAlign: 'middle', mr: 1, color: colors.primary.main }} />
                My Documents
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Manage your generated research summaries, reports, and patient matching documents
              </Typography>
            </Box>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              endIcon={<ArrowDownIcon />}
              onClick={handleNewDocMenuOpen}
              sx={{
                background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                color: '#fff',
                fontWeight: 600,
                '&:hover': {
                  background: `linear-gradient(135deg, ${colors.primary.dark} 0%, ${colors.secondary.dark} 100%)`,
                },
              }}
            >
              New Document
            </Button>
            <Menu
              anchorEl={newDocMenuAnchor}
              open={Boolean(newDocMenuAnchor)}
              onClose={handleNewDocMenuClose}
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'right',
              }}
              transformOrigin={{
                vertical: 'top',
                horizontal: 'right',
              }}
              slotProps={{
                paper: {
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: `0 4px 20px ${alpha(colors.primary.main, 0.15)}`,
                  },
                }
              }}
            >
              <MenuItem onClick={handleAddFromCloud}>
                <ListItemIcon>
                  <CloudIcon sx={{ color: colors.primary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Add from Cloud" 
                  secondary="Import from cloud storage"
                  slotProps={{
                    primary: { style: { fontWeight: 600 } }
                  }}
                />
              </MenuItem>
              <MenuItem onClick={handleAddFromLocal}>
                <ListItemIcon>
                  <LocalIcon sx={{ color: colors.secondary.main }} />
                </ListItemIcon>
                <ListItemText 
                  primary="Add from Local" 
                  secondary="Upload from your device"
                  slotProps={{
                    primary: { style: { fontWeight: 600 } }
                  }}
                />
              </MenuItem>
            </Menu>
          </Box>
        </PageHeader>
      </Fade>

      {/* Upload Progress */}
      {uploading && (
        <Fade in timeout={300}>
          <Card sx={{ mb: 3, border: `2px solid ${colors.primary.main}` }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <CloudIcon sx={{ color: colors.primary.main, mr: 1 }} />
                <Typography variant="body1" fontWeight={600}>
                  Uploading document...
                </Typography>
              </Box>
              <LinearProgress 
                variant="determinate" 
                value={uploadProgress} 
                sx={{ 
                  height: 8, 
                  borderRadius: 4,
                  backgroundColor: alpha(colors.primary.main, 0.1),
                  '& .MuiLinearProgress-bar': {
                    background: `linear-gradient(90deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`,
                  }
                }} 
              />
              <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                {uploadProgress}% complete
              </Typography>
            </CardContent>
          </Card>
        </Fade>
      )}

      {/* Stats Overview */}
      <Fade in timeout={800} style={{ transitionDelay: '200ms' }}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' }, gap: 2, mb: 3 }}>
          <StatsCard>
            <CardContent>
              <Typography variant="h3" fontWeight={700}>
                {stats.total}
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.9 }}>
                Total Documents
              </Typography>
            </CardContent>
          </StatsCard>
          <Card>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="success.main">
                {stats.completed}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Completed
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="warning.main">
                {stats.inProgress}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                In Progress
              </Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="h3" fontWeight={700} color="text.secondary">
                {stats.draft}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Drafts
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Fade>

      {/* Filter Chips */}
      <Fade in timeout={1000} style={{ transitionDelay: '400ms' }}>
        <Box sx={{ mb: 3, display: 'flex', gap: 1, alignItems: 'center' }}>
          <FilterIcon sx={{ color: colors.text.secondary }} />
          <Chip
            label="All"
            onClick={() => setFilterType('all')}
            color={filterType === 'all' ? 'primary' : 'default'}
            sx={{ fontWeight: filterType === 'all' ? 600 : 400 }}
          />
          <Chip
            label="Completed"
            onClick={() => setFilterType('completed')}
            color={filterType === 'completed' ? 'success' : 'default'}
            sx={{ fontWeight: filterType === 'completed' ? 600 : 400 }}
          />
          <Chip
            label="In Progress"
            onClick={() => setFilterType('in-progress')}
            color={filterType === 'in-progress' ? 'warning' : 'default'}
            sx={{ fontWeight: filterType === 'in-progress' ? 600 : 400 }}
          />
          <Chip
            label="Drafts"
            onClick={() => setFilterType('draft')}
            color={filterType === 'draft' ? 'default' : 'default'}
            sx={{ fontWeight: filterType === 'draft' ? 600 : 400 }}
          />
        </Box>
      </Fade>

      {/* Documents Grid */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(2, 1fr)' }, gap: 3 }}>
        {filteredDocuments.map((doc, index) => (
          <Fade in timeout={600} style={{ transitionDelay: `${index * 100}ms` }} key={doc.id}>
            <DocumentCard>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                  <Box sx={{ flex: 1 }}>
                    <Typography variant="h6" fontWeight={600} gutterBottom>
                      {doc.title}
                    </Typography>
                    <Chip
                      label={doc.type}
                      size="small"
                      sx={{ mr: 1, mb: 1 }}
                      color="primary"
                      variant="outlined"
                    />
                    <Chip
                      label={getStatusLabel(doc.status)}
                      size="small"
                      color={getStatusColor(doc.status) as any}
                    />
                  </Box>
                  <IconButton
                    size="small"
                    onClick={(e) => handleMenuOpen(e, doc.id)}
                  >
                    <MoreIcon />
                  </IconButton>
                </Box>

                {doc.status === 'in-progress' && (
                  <Box sx={{ mb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="caption" color="text.secondary">
                        Progress
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        65%
                      </Typography>
                    </Box>
                    <LinearProgress variant="determinate" value={65} />
                  </Box>
                )}

                <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 2, mb: 2 }}>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Trials
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {doc.trials}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Pages
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {doc.pages}
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="caption" color="text.secondary" display="block">
                      Size
                    </Typography>
                    <Typography variant="body2" fontWeight={600}>
                      {doc.size}
                    </Typography>
                  </Box>
                </Box>

                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1 }}>
                  Created: {new Date(doc.createdAt).toLocaleDateString()}
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block">
                  Updated: {new Date(doc.updatedAt).toLocaleDateString()}
                </Typography>

                <Box sx={{ display: 'flex', gap: 1, mt: 2 }}>
                  <Button
                    size="small"
                    variant="contained"
                    startIcon={<ViewIcon />}
                    sx={{ flex: 1 }}
                  >
                    View
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    startIcon={<DownloadIcon />}
                    sx={{ flex: 1 }}
                  >
                    Download
                  </Button>
                </Box>
              </CardContent>
            </DocumentCard>
          </Fade>
        ))}
      </Box>

      {filteredDocuments.length === 0 && (
        <Fade in timeout={600}>
          <Alert 
            severity="info"
            sx={{ 
              mt: 3,
              backgroundColor: '#e3f2fd',
              border: '2px solid #2196f3',
              '& .MuiAlert-icon': { color: '#1976d2' },
              '& .MuiAlert-message': { 
                color: '#0d47a1',
                fontWeight: 600,
              }
            }}
          >
            No documents found with the selected filter.
          </Alert>
        </Fade>
      )}

      {/* Context Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => handleAction('view')}>
          <ViewIcon sx={{ mr: 1, fontSize: 20 }} />
          View
        </MenuItem>
        <MenuItem onClick={() => handleAction('edit')}>
          <EditIcon sx={{ mr: 1, fontSize: 20 }} />
          Edit
        </MenuItem>
        <MenuItem onClick={() => handleAction('download')}>
          <DownloadIcon sx={{ mr: 1, fontSize: 20 }} />
          Download
        </MenuItem>
        <MenuItem onClick={() => handleAction('share')}>
          <ShareIcon sx={{ mr: 1, fontSize: 20 }} />
          Share
        </MenuItem>
        <MenuItem onClick={() => handleAction('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon sx={{ mr: 1, fontSize: 20 }} />
          Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};
