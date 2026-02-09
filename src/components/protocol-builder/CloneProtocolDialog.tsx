import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  TextField, Box, Typography, Alert, LinearProgress, Stepper,
  Step, StepLabel, List, ListItem, ListItemIcon, ListItemText,
  Checkbox
} from '@mui/material';
import {
  ContentCopy as CloneIcon,
  CheckCircle as CheckIcon
} from '@mui/icons-material';
import { colors } from '../../styles/theme';

interface CloneProtocolDialogProps {
  protocolId: string;
  protocolTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess?: (newProtocolId: string) => void;
}

export const CloneProtocolDialog: React.FC<CloneProtocolDialogProps> = ({
  protocolId,
  protocolTitle,
  open,
  onClose,
  onSuccess
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [cloning, setCloning] = useState(false);
  const [newIdentifier, setNewIdentifier] = useState('');
  const [newTitle, setNewTitle] = useState(`${protocolTitle} (Copy)`);
  const [includeOptions, setIncludeOptions] = useState({
    objectives: true,
    eligibility: true,
    interventions: true,
    sections: true,
    assessments: true
  });

  const steps = ['Configure', 'Clone', 'Complete'];

  const handleClone = async () => {
    if (!newIdentifier) {
      alert('Please enter a protocol identifier');
      return;
    }

    setCloning(true);
    setActiveStep(1);

    try {
      // Step 1: Fetch original protocol
      const response = await fetch(`http://localhost:3001/api/protocols/${protocolId}`);
      if (!response.ok) throw new Error('Failed to fetch protocol');
      const data = await response.json();
      const protocol = data.data;

      // Step 2: Create new protocol
      const clonedData = {
        sponsorProtocolIdentifier: newIdentifier,
        fullTitle: newTitle,
        shortTitle: protocol.shortTitle,
        protocolVersion: '1.0',
        protocolDate: new Date().toISOString().split('T')[0],
        protocolStatus: 'draft',
        trialPhase: protocol.trialPhase,
        indication: protocol.indication,
        studyType: protocol.studyType
      };

      const createResponse = await fetch('http://localhost:3001/api/protocols', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(clonedData)
      });

      if (!createResponse.ok) throw new Error('Failed to create protocol');
      const newProtocol = await createResponse.json();
      const newProtocolId = newProtocol.data.id;

      // Step 3: Clone selected components
      if (includeOptions.objectives && protocol.objectives) {
        for (const obj of protocol.objectives) {
          await fetch('http://localhost:3001/api/protocols/objectives', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              protocolId: newProtocolId,
              objectiveType: obj.objectiveType,
              objectiveText: obj.objectiveText,
              estimand: obj.estimand
            })
          });
        }
      }

      if (includeOptions.eligibility && protocol.eligibilityCriteria) {
        for (const criterion of protocol.eligibilityCriteria) {
          await fetch('http://localhost:3001/api/protocols/criteria', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              protocolId: newProtocolId,
              criterionType: criterion.criterionType,
              criterionText: criterion.criterionText
            })
          });
        }
      }

      if (includeOptions.interventions && protocol.interventions) {
        for (const intervention of protocol.interventions) {
          await fetch('http://localhost:3001/api/protocols/interventions', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              protocolId: newProtocolId,
              interventionType: intervention.interventionType,
              productName: intervention.productName,
              dose: intervention.dose,
              doseUnit: intervention.doseUnit,
              routeOfAdministration: intervention.routeOfAdministration,
              frequency: intervention.frequency,
              duration: intervention.duration,
              description: intervention.description
            })
          });
        }
      }

      if (includeOptions.sections && protocol.sections) {
        for (const section of protocol.sections) {
          await fetch(`http://localhost:3001/api/protocols/sections/${section.sectionNumber}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ 
              protocolId: newProtocolId,
              content: section.content 
            })
          });
        }
      }

      setActiveStep(2);

      // Success - navigate to new protocol
      setTimeout(() => {
        if (onSuccess) {
          onSuccess(newProtocolId);
        } else {
          window.location.href = `/protocols/${newProtocolId}`;
        }
      }, 2000);

    } catch (error) {
      console.error('Clone failed:', error);
      alert('Protocol cloning failed. Please try again.');
      setCloning(false);
      setActiveStep(0);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={cloning ? undefined : onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <CloneIcon sx={{ color: colors.secondary.main, fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Clone Protocol
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Create a copy of: {protocolTitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: Configuration */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              New Protocol Details:
            </Typography>
            <TextField
              fullWidth
              label="Protocol Identifier *"
              value={newIdentifier}
              onChange={(e) => setNewIdentifier(e.target.value)}
              sx={{ mb: 2 }}
              placeholder="e.g., ABC-2024-002"
            />
            <TextField
              fullWidth
              label="Protocol Title *"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              sx={{ mb: 3 }}
              multiline
              rows={2}
            />

            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Include in Clone:
            </Typography>
            <List>
              {Object.entries({
                objectives: 'Objectives & Estimands',
                eligibility: 'Eligibility Criteria',
                interventions: 'Interventions',
                sections: 'All Section Content',
                assessments: 'Assessments & Schedule'
              }).map(([key, label]) => (
                <ListItem key={key} dense>
                  <ListItemIcon>
                    <Checkbox
                      checked={includeOptions[key as keyof typeof includeOptions]}
                      onChange={(e) => setIncludeOptions({
                        ...includeOptions,
                        [key]: e.target.checked
                      })}
                    />
                  </ListItemIcon>
                  <ListItemText primary={label} />
                </ListItem>
              ))}
            </List>
          </Box>
        )}

        {/* Step 1: Cloning */}
        {activeStep === 1 && (
          <Box textAlign="center" py={4}>
            <LinearProgress sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              Cloning Protocol...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Creating a complete copy of your protocol
            </Typography>
          </Box>
        )}

        {/* Step 2: Success */}
        {activeStep === 2 && (
          <Box textAlign="center" py={4}>
            <CheckIcon sx={{ fontSize: 64, color: colors.semantic.success, mb: 2 }} />
            <Typography variant="h6" gutterBottom>
              Clone Successful!
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Redirecting to new protocol...
            </Typography>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={cloning}>
          Cancel
        </Button>
        {activeStep === 0 && (
          <Button
            variant="contained"
            onClick={handleClone}
            disabled={!newIdentifier || !newTitle}
            sx={{
              background: `linear-gradient(135deg, ${colors.primary.main} 0%, ${colors.secondary.main} 100%)`
            }}
          >
            Clone Protocol
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};