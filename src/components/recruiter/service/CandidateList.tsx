import React, { useState, useEffect } from "react";
import { CandidateCard } from "./CandidateCard";
import { Box, Container, CircularProgress, Typography } from "@mui/material";
import { CandidateProfile } from "../../../utils/airtable";
import { useSearchParams } from "next/navigation";

interface CandidateListProps {
  candidates: CandidateProfile[];
  loading?: boolean;
  onCandidateUpdate?: () => void;
}

export function CandidateList({ 
  candidates,
  loading = false,
  onCandidateUpdate
}: CandidateListProps) {
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');

  // Load expanded state from localStorage on mount
  useEffect(() => {
    const savedExpandedIdx = localStorage.getItem(`expandedIdx-${orderId}`);
    if (savedExpandedIdx !== null) {
      setExpandedIdx(parseInt(savedExpandedIdx, 10));
    }
  }, [orderId]);

  // Save expanded state to localStorage when it changes
  useEffect(() => {
    if (expandedIdx !== null) {
      localStorage.setItem(`expandedIdx-${orderId}`, expandedIdx.toString());
    } else {
      localStorage.removeItem(`expandedIdx-${orderId}`);
    }
  }, [expandedIdx, orderId]);

  if (loading) {
    return (
      <Box 
        display="flex" 
        justifyContent="center" 
        alignItems="center" 
        minHeight="200px"
        sx={{
          py: { xs: 4, sm: 6 }
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!candidates.length) {
    return (
      <Box 
        textAlign="center" 
        py={{ xs: 4, sm: 6 }}
        sx={{
          px: { xs: 2, sm: 0 }
        }}
      >
        <Typography 
          variant="h6" 
          color="text.secondary" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.1rem', sm: '1.25rem' },
            mb: { xs: 1, sm: 1.5 }
          }}
        >
          No candidates available
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            px: { xs: 1, sm: 0 },
            lineHeight: { xs: 1.5, sm: 1.6 }
          }}
        >
          Candidates will appear here once they are added to the system.
        </Typography>
      </Box>
    );
  }

  return (
    <Box 
      sx={{ 
        py: { xs: 2, sm: 3 },
        '& > *:not(:last-child)': {
          mb: { xs: 2, sm: 3 }
        }
      }}
    >
      {candidates.map((candidate, idx) => (
        <CandidateCard
          key={candidate.id}
          candidate={candidate}
          expanded={expandedIdx === idx}
          onExpand={() => setExpandedIdx(expandedIdx === idx ? null : idx)}
          onCandidateUpdate={onCandidateUpdate}
        />
      ))}
    </Box>
  );
} 