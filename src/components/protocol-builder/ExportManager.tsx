import React, { useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions, Button,
  Box, Typography, Stepper, Step, StepLabel, LinearProgress,
  Alert, Chip, List, ListItem, ListItemIcon, ListItemText,
  Divider
} from '@mui/material';
import {
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  Description as DocIcon,
  Code as CodeIcon,
  Download as DownloadIcon
} from '@mui/icons-material';
import { colors } from '../../styles/theme';

interface ExportManagerProps {
  protocolId: string;
  protocolTitle: string;
  open: boolean;
  onClose: () => void;
}

export const ExportManager: React.FC<ExportManagerProps> = ({
  protocolId,
  protocolTitle,
  open,
  onClose
}) => {
  const [activeStep, setActiveStep] = useState(0);
  const [exporting, setExporting] = useState(false);
  const [exportResult, setExportResult] = useState<any>(null);
  const [selectedFormat, setSelectedFormat] = useState<'json' | 'pdf' | null>(null);

  const steps = ['Select Format', 'Validate', 'Export'];

  const handleExportJSON = async () => {
    setExporting(true);
    setActiveStep(1);

    try {
      // Step 1: Fetch protocol data
      const response = await fetch(`http://localhost:3001/api/protocols/${protocolId}`);
      if (!response.ok) throw new Error('Failed to fetch protocol');
      const data = await response.json();
      const protocol = data.data;

      setActiveStep(2);

      // Step 2: Transform to USDM format
      const usdmExport = {
        $schema: 'https://transcelerate.org/usdm/v3.0/protocol-schema.json',
        protocolVersion: '1.0.0-DRAFT',
        metadata: {
          title: protocol.fullTitle,
          identifier: protocol.sponsorProtocolIdentifier,
          version: protocol.protocolVersion,
          date: protocol.protocolDate,
          status: protocol.protocolStatus || 'draft',
          completeness: protocol.completenessPercentage,
          exportedAt: new Date().toISOString(),
          exportedBy: 'Protocol Builder v1.0'
        },
        studyIdentifiers: [{
          id: protocol.sponsorProtocolIdentifier,
          type: 'Sponsor Protocol Identifier',
          scopeLevel: 'Global'
        }],
        studyTitle: protocol.fullTitle,
        studyAcronym: protocol.shortTitle,
        studyPhase: {
          standardCode: protocol.trialPhase,
          standardCodeSystem: 'ICH',
          decode: protocol.trialPhase
        },
        studyType: protocol.studyType,
        therapeuticArea: protocol.indication,
        objectives: protocol.objectives?.map((obj: any, idx: number) => ({
          id: obj.id || `obj-${idx + 1}`,
          objectiveLevel: obj.objectiveType,
          description: obj.objectiveText,
          endpoints: obj.estimand ? [{
            description: obj.estimand.endpoint,
            purpose: obj.objectiveType,
            type: 'Efficacy'
          }] : []
        })),
        studyDesign: protocol.sections?.find((s: any) => s.sectionNumber === '4')?.content,
        studyPopulation: {
          description: protocol.indication,
          inclusionCriteria: protocol.eligibilityCriteria?.filter((c: any) => c.criterionType === 'inclusion').map((c: any) => ({
            id: c.id,
            category: 'Inclusion',
            description: c.criterionText,
            identifier: c.criterionNumber
          })),
          exclusionCriteria: protocol.eligibilityCriteria?.filter((c: any) => c.criterionType === 'exclusion').map((c: any) => ({
            id: c.id,
            category: 'Exclusion',
            description: c.criterionText,
            identifier: c.criterionNumber
          }))
        },
        studyInterventions: protocol.interventions?.map((int: any) => ({
          id: int.id,
          name: int.productName,
          description: int.description,
          type: int.interventionType,
          administrationDetails: {
            dose: int.dose ? `${int.dose} ${int.doseUnit}` : undefined,
            route: int.routeOfAdministration,
            frequency: int.frequency,
            duration: int.duration
          }
        })),
        studyAssessments: protocol.sections?.find((s: any) => s.sectionNumber === '8')?.content?.assessments,
        statisticalConsiderations: protocol.sections?.find((s: any) => s.sectionNumber === '10')?.content,
        studySections: protocol.sections?.map((sec: any) => ({
          sectionNumber: sec.sectionNumber,
          sectionTitle: sec.sectionTitle,
          sectionType: sec.sectionType,
          content: sec.content
        }))
      };

      // Step 3: Download file
      const blob = new Blob([JSON.stringify(usdmExport, null, 2)], {
        type: 'application/json'
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${protocol.sponsorProtocolIdentifier || 'protocol'}_USDM_v1.0.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      setExportResult({
        success: true,
        format: 'USDM JSON',
        filename: link.download,
        size: blob.size
      });
    } catch (error) {
      console.error('Export failed:', error);
      setExportResult({
        success: false,
        error: 'Export failed. Please try again.'
      });
    } finally {
      setExporting(false);
    }
  };

  const handleExportPDF = () => {
    setExportResult({
      success: false,
      error: 'PDF export requires backend implementation. Coming soon!'
    });
  };

  const handleFormatSelect = (format: 'json' | 'pdf') => {
    setSelectedFormat(format);
    setActiveStep(1);
    if (format === 'json') {
      handleExportJSON();
    } else {
      handleExportPDF();
    }
  };

  const handleClose = () => {
    setActiveStep(0);
    setSelectedFormat(null);
    setExportResult(null);
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={exporting ? undefined : handleClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box display="flex" alignItems="center" gap={2}>
          <DownloadIcon sx={{ color: colors.primary.main, fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight={700}>
              Export Protocol
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {protocolTitle}
            </Typography>
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Stepper */}
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {/* Step 0: Format Selection */}
        {activeStep === 0 && (
          <Box>
            <Typography variant="subtitle1" fontWeight={600} gutterBottom>
              Select Export Format:
            </Typography>
            <List>
              <ListItem
                component="div"
                onClick={() => handleFormatSelect('json')}
                sx={{
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: colors.primary.main,
                    backgroundColor: `${colors.primary.main}05`
                  }
                }}
              >
                <ListItemIcon>
                  <CodeIcon sx={{ fontSize: 40, color: colors.primary.main }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        USDM JSON
                      </Typography>
                      <Chip label="Recommended" size="small" color="primary" />
                    </Box>
                  }
                  secondary="TransCelerate USDM format - Machine-readable protocol data"
                />
              </ListItem>

              <ListItem
                component="div"
                onClick={() => handleFormatSelect('pdf')}
                sx={{
                  border: '2px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  cursor: 'pointer',
                  '&:hover': {
                    borderColor: colors.secondary.main,
                    backgroundColor: `${colors.secondary.main}05`
                  }
                }}
              >
                <ListItemIcon>
                  <DocIcon sx={{ fontSize: 40, color: colors.text.disabled }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Box display="flex" alignItems="center" gap={1}>
                      <Typography variant="subtitle1" fontWeight={700}>
                        PDF Document
                      </Typography>
                      <Chip label="Coming Soon" size="small" variant="outlined" />
                    </Box>
                  }
                  secondary="Formatted protocol document - Requires backend implementation"
                />
              </ListItem>
            </List>
          </Box>
        )}

        {/* Step 1-2: Exporting */}
        {exporting && (
          <Box textAlign="center" py={4}>
            <LinearProgress sx={{ mb: 3 }} />
            <Typography variant="h6" gutterBottom>
              {activeStep === 1 ? 'Validating Protocol...' : 'Generating Export...'}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Please wait while we prepare your export
            </Typography>
          </Box>
        )}

        {/* Step 3: Result */}
        {exportResult && (
          <Box>
            {exportResult.success ? (
              <>
                <Alert severity="success" icon={<CheckIcon />} sx={{ mb: 3 }}>
                  <Typography variant="subtitle2" fontWeight={700}>
                    Export Successful!
                  </Typography>
                  <Typography variant="body2">
                    Your protocol has been exported successfully.
                  </Typography>
                </Alert>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="Format"
                      secondary={exportResult.format}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="Filename"
                      secondary={exportResult.filename}
                    />
                  </ListItem>
                  <Divider />
                  <ListItem>
                    <ListItemText
                      primary="File Size"
                      secondary={`${(exportResult.size / 1024).toFixed(2)} KB`}
                    />
                  </ListItem>
                </List>
              </>
            ) : (
              <Alert severity="error" icon={<ErrorIcon />}>
                <Typography variant="subtitle2" fontWeight={700}>
                  Export Failed
                </Typography>
                <Typography variant="body2">
                  {exportResult.error}
                </Typography>
              </Alert>
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} disabled={exporting}>
          {exportResult ? 'Close' : 'Cancel'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};