import React from "react";
import { Stepper, Step, StepLabel, Box, Chip } from "@mui/material";
import { CandidateProfile } from "../../../utils/airtable";

const steps = ["Shortlist", "First Round Interview", "Final Interview", "Offer"];

interface ATSTrackerProps {
  currentStep: number;
  onStepClick?: (stepIndex: number) => void;
  candidates?: CandidateProfile[];
  key?: string | number;
}

export function ATSTracker({ currentStep, onStepClick, candidates = [] }: ATSTrackerProps) {
  // Map step indices to status stages
  const stepToStatusMap = ['shortlist', 'firstRound', 'finalInterview', 'offer'];
  
  // Calculate candidate counts for each step
  const getStepCount = (stepIndex: number) => {
    if (stepIndex === 0) {
      // Shortlist includes candidates without status
      return candidates.filter(candidate => !candidate.status).length;
    }
    
    const status = stepToStatusMap[stepIndex];
    return candidates.filter(candidate => candidate.status?.stage === status).length;
  };

  return (
    <Box sx={{ width: "100%", mb: 4 }}>
      <Stepper activeStep={currentStep} alternativeLabel>
        {steps.map((label, index) => (
          <Step key={label}>
            <StepLabel
              onClick={() => onStepClick?.(index)}
              sx={{
                cursor: onStepClick ? 'pointer' : 'default',
                '& .MuiStepIcon-root.Mui-active': { color: '#3B82F6' },
                '& .MuiStepIcon-root.Mui-completed': { color: '#3B82F6' },
                '&:hover': onStepClick ? {
                  opacity: 0.8,
                  transform: 'scale(1.05)',
                  transition: 'all 0.2s ease'
                } : {},
                position: 'relative',
                transition: 'all 0.3s ease',
                '& .MuiStepLabel-label': {
                  transition: 'all 0.3s ease',
                  fontWeight: index === currentStep ? 600 : 400,
                  color: index === currentStep ? '#1F2937' : '#6B7280'
                }
              }}
            >
              <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                <span>{label}</span>
                <Chip
                  size="small"
                  sx={{
                    mt: 1,
                    backgroundColor: index === currentStep ? '#3B82F6' : '#E5E7EB',
                    color: index === currentStep ? 'white' : '#6B7280',
                    fontSize: '0.75rem',
                    height: '20px',
                    minWidth: '24px',
                    fontWeight: 600,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'scale(1.1)',
                      transition: 'all 0.2s ease'
                    }
                  }}
                />
              </Box>
            </StepLabel>
          </Step>
        ))}
      </Stepper>
    </Box>
  );
} 