import React from "react";
import { Card, CardContent, Avatar, Typography, Box, Chip } from "@mui/material";
import { styled } from "@mui/material/styles";

const StyledCard = styled(Card)(({ theme }) => ({
  marginBottom: theme.spacing(2),
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  border: '1px solid rgba(255, 255, 255, 0.2)',
  background: 'linear-gradient(135deg, #ffffff 0%, #f8fafc 100%)',
  transition: 'all 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 12px 40px rgba(0, 0, 0, 0.12)',
  },
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 56,
  height: 56,
  marginRight: theme.spacing(2.5),
  border: '3px solid #3B82F6',
  boxShadow: '0 4px 12px rgba(59, 130, 246, 0.3)',
}));

const StatusChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(59, 130, 246, 0.1)',
  color: '#3B82F6',
  fontWeight: 600,
  fontSize: '0.75rem',
  height: 24,
  '& .MuiChip-label': {
    padding: '0 8px',
  },
}));

export function MessageCard({ adminMessage }: { adminMessage: string | undefined }) {
  return (
    <StyledCard>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
          <StyledAvatar
            src="/recruiter.jpg"
            alt="Recruiter"
          />
          <Box sx={{ flex: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography 
                variant="h6" 
                fontWeight="700"
                sx={{ 
                  color: '#1e293b',
                  mr: 1.5
                }}
              >
                Gus
              </Typography>
              <StatusChip label="Online" size="small" />
            </Box>
            
            <Typography 
              variant="subtitle1" 
              sx={{ 
                color: '#3B82F6', 
                fontWeight: '600',
                mb: 1.5,
                fontSize: '0.95rem'
              }}
            >
              Deal Team Jobs
            </Typography>
            
            <Typography 
              variant="h5" 
              fontWeight="700" 
              sx={{ 
                mt: 2, 
                mb: 1.5,
                color: '#1e293b',
                background: 'linear-gradient(135deg, #1e293b 0%, #3B82F6 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              Today's Update
            </Typography>
            
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#64748b',
                lineHeight: 1.6,
                fontSize: '0.95rem',
                backgroundColor: 'rgba(248, 250, 252, 0.8)',
                padding: 2,
                borderRadius: 2,
                border: '1px solid rgba(226, 232, 240, 0.8)',
              }}
            >
              {adminMessage || 'There are no updates for this job posting.'}
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
              <Box sx={{ display: 'flex', gap: 0.5 }}>
                <Box sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: '#10b981' }} />
                <Typography variant="caption" sx={{ color: '#10b981', fontSize: '0.75rem' }}>
                  Active
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </StyledCard>
  );
} 