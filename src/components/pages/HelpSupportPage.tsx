import React from 'react';
import {
  Box,
  Container,
  Paper,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Button,
  Grid,
  Card,
  CardContent,
  Link,
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  Description as DocumentIcon,
  VideoLibrary as VideoIcon,
} from '@mui/icons-material';

const faqs = [
  {
    question: 'How do I create a new protocol?',
    answer:
      'Navigate to "My Protocols" from the profile menu, then click "Create New Protocol". Fill in the required information and save your protocol. You can edit it anytime.',
  },
  {
    question: 'How do I search for clinical trials?',
    answer:
      'Go to the Research Hub from the main navigation. Enter your search terms, apply filters like phase, status, and location, then click Search. You can view detailed information about each trial.',
  },
  {
    question: 'What are AI Insights?',
    answer:
      'AI Insights analyze clinical trial data to provide patterns, recommendations, and statistics. Click "Analyze with AI" in the Research Hub to generate insights from your search results.',
  },
  {
    question: 'How do I change my password?',
    answer:
      'Go to Settings from your profile menu, select the Security tab, and enter your current password along with your new password. Click "Change Password" to save.',
  },
  {
    question: 'How do I manage notifications?',
    answer:
      'Click the bell icon in the top navigation to view notifications. You can mark them as read, delete them, or mark all as read. To manage notification preferences, go to Settings > Notifications.',
  },
  {
    question: 'Can I export my protocols?',
    answer:
      'Yes! In the Protocol Builder, click the "Export" button to download your protocol in various formats including PDF, Word, and JSON.',
  },
  {
    question: 'How do I bookmark trials?',
    answer:
      'When viewing trial details in the Research Hub, click the bookmark icon to save it. Access your bookmarked trials from the Bookmarks page in the main navigation.',
  },
  {
    question: 'Is my data secure?',
    answer:
      'Yes! We use industry-standard encryption, secure authentication with JWT tokens, and follow best practices for data security. Your password is hashed using bcrypt, and all API communications are secured.',
  },
];

export function HelpSupportPage() {
  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box textAlign="center" mb={6}>
        <Typography variant="h3" fontWeight={600} mb={2}>
          Help & Support
        </Typography>
        <Typography variant="h6" color="text.secondary">
          Find answers to common questions or get in touch with our team
        </Typography>
      </Box>

      {/* Contact Cards */}
      <Grid container spacing={3} mb={6}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <EmailIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} mb={1}>
                Email Support
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Get help via email
              </Typography>
              <Link href="mailto:support@clinicaliq.com" underline="none">
                <Button variant="outlined">support@clinicaliq.com</Button>
              </Link>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <DocumentIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} mb={1}>
                Documentation
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Browse our guides
              </Typography>
              <Button variant="outlined">View Docs</Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <VideoIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} mb={1}>
                Video Tutorials
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={2}>
                Watch how-to videos
              </Typography>
              <Button variant="outlined">Watch Videos</Button>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* FAQs */}
      <Paper sx={{ p: 4 }}>
        <Typography variant="h4" fontWeight={600} mb={3}>
          Frequently Asked Questions
        </Typography>

        {faqs.map((faq, index) => (
          <Accordion key={index}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography fontWeight={600}>{faq.question}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Typography color="text.secondary">{faq.answer}</Typography>
            </AccordionDetails>
          </Accordion>
        ))}
      </Paper>

      {/* Additional Resources */}
      <Box mt={6} textAlign="center">
        <Typography variant="h5" fontWeight={600} mb={2}>
          Still need help?
        </Typography>
        <Typography variant="body1" color="text.secondary" mb={3}>
          Our support team is here to assist you
        </Typography>
        <Button variant="contained" size="large" href="mailto:support@clinicaliq.com">
          Contact Support
        </Button>
      </Box>
    </Container>
  );
}
