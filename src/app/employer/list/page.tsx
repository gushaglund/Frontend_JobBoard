'use client'

import React, { useState, useEffect, useCallback } from "react";
import { Box, Container, Alert, Typography, useTheme, useMediaQuery } from "@mui/material";
import { CandidateList } from "@/components/recruiter/service/CandidateList";
import { useSearchParams } from "next/navigation";
import { CandidateProfile, getCandidatesByOrderId } from "@/utils/airtable";

export default function ATSPage() {
  const searchParams = useSearchParams();
  const orderId = searchParams?.get('orderId');
  const [allCandidates, setAllCandidates] = useState<CandidateProfile[]>([]);
  const [filteredCandidates, setFilteredCandidates] = useState<CandidateProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Function to fetch candidates
  const fetchCandidates = useCallback(async () => {
    if (!orderId) {
      setLoading(false);
      return;
    }

    try {
      console.log('Fetching candidates for orderId:', orderId);
      const candidates = await getCandidatesByOrderId(orderId);
      console.log('Fetched candidates:', candidates);
      setAllCandidates(candidates);
      setFilteredCandidates(candidates);
    } catch (error) {
      console.error('Error fetching candidates:', error);
    } finally {
      setLoading(false);
    }
  }, [orderId]);

  // Fetch candidates from Airtable when component mounts
  useEffect(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  // Callback to refresh candidates when actions are performed
  const handleCandidateUpdate = useCallback(() => {
    fetchCandidates();
  }, [fetchCandidates]);

  if (!orderId) {
    return (
      <Container 
        maxWidth="lg" 
        sx={{ 
          py: { xs: 4, sm: 6, md: 8 }, 
          px: { xs: 2, sm: 3, md: 4 },
          bgcolor: "#f5f7fa", 
          minHeight: "100vh" 
        }}
      >
        <Alert severity="error">
          No order ID provided. Please provide an order ID in the URL.
        </Alert>
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="lg" 
      sx={{ 
        py: { xs: 4, sm: 6, md: 8 }, 
        px: { xs: 2, sm: 3, md: 4 },
        bgcolor: "#f5f7fa", 
        minHeight: "100vh" 
      }}
    >
      <Box sx={{ 
        mb: { xs: 2, sm: 3 }, 
        mt: { xs: 1, sm: 2 },
        textAlign: { xs: 'center', sm: 'left' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: { xs: 'center', sm: 'flex-start' }
      }}>
        <Typography 
          variant={isMobile ? "h6" : "h5"} 
          fontWeight={600} 
          color="#1F2937" 
          gutterBottom
          sx={{
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '1.75rem' },
            lineHeight: { xs: 1.4, sm: 1.3 },
            mb: { xs: 1, sm: 1.5 },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          Recommended Candidates
        </Typography>
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            fontSize: { xs: '0.875rem', sm: '1rem' },
            lineHeight: { xs: 1.5, sm: 1.6 },
            px: { xs: 1, sm: 0 },
            maxWidth: { xs: '100%', sm: '80%', md: '70%' },
            textAlign: { xs: 'center', sm: 'left' }
          }}
        >
          View top candidates selected specifically for you — curated based on your needs, updated in real-time. {filteredCandidates.length} candidate{filteredCandidates.length !== 1 ? 's' : ''} available.
        </Typography>
      </Box>

      <CandidateList
        candidates={filteredCandidates}
        loading={loading}
        onCandidateUpdate={handleCandidateUpdate}
      />
    </Container>
  );
}
