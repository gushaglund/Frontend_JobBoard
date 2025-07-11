'use client';

import React, { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import Modal from '@mui/material/Modal';
import Typography from '@mui/material/Typography';
import Stack from '@mui/material/Stack';
import { config } from '@/config';
import { useSearchParams } from 'next/navigation';

// Airtable setup
import Airtable from 'airtable';
import Avatar from '@mui/material/Avatar';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import Divider from '@mui/material/Divider';
import { FaUser, FaArrowRight, FaExclamationTriangle } from 'react-icons/fa';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import { toast } from '@/components/core/toaster';

const base = new Airtable({ apiKey: process.env.NEXT_PUBLIC_AIRTABLE_API_KEY }).base(
  process.env.NEXT_PUBLIC_AIRTABLE_BASE_ID || ''
);

// Minimal applicant type
interface Applicant {
  id: string;
  name: string;
  email: string;
  submissionDate: string;
  university?: string;
  currentGrade?: string;
  status: 'Applied' | 'Interviewed' | 'Denied';
  calendlyLink?: string;
  [key: string]: any;
}

export default function ApplicationListPage() {
  const searchParams = useSearchParams();
  const jobPostingId = searchParams.get('id');
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [page, setPage] = useState(1);
  const applicantsPerPage = 5;
  const [activeStep, setActiveStep] = useState<'Applied' | 'Interviewed'>('Applied');
  // Remove: const [modalStatus, setModalStatus] = useState<string | null>(null);
  const [confirmDenyOpen, setConfirmDenyOpen] = useState(false);
  const [pendingDenyApplicant, setPendingDenyApplicant] = useState<Applicant | null>(null);
  const [interviewModalOpen, setInterviewModalOpen] = useState(false);
  const [pendingInterviewApplicant, setPendingInterviewApplicant] = useState<Applicant | null>(null);
  const [calendlyLink, setCalendlyLink] = useState('');
  const [calendlyError, setCalendlyError] = useState('');

  // Fetch applicants from Airtable
  useEffect(() => {
    async function fetchApplicants() {
      setLoading(true);
      const records: Applicant[] = [];
      await base('Applications')
        .select({})
        .eachPage((recordsPage, fetchNextPage) => {
          recordsPage.forEach((rec) => {
            const applicantJobPostingId = rec.get('Job Posting Id');
            if (jobPostingId && applicantJobPostingId === jobPostingId) {
              records.push({
                id: rec.id,
                name: rec.get('Name') as string,
                email: rec.get('Email') as string,
                submissionDate: rec.get('Created_At') as string,
                university: rec.get('University') as string,
                currentGrade: rec.get('Current Grade') as string,
                status: (rec.get('Status') as any) || 'Applied',
                calendlyLink: rec.get('Calendly Link') as string | undefined,
                ...rec.fields,
              });
            }
          });
          fetchNextPage();
        });
      setApplicants(records);
      setLoading(false);
    }
    if (jobPostingId) {
      fetchApplicants();
    } else {
      setApplicants([]);
      setLoading(false);
    }
  }, [jobPostingId]);

  // Filter applicants by active step
  const appliedCount = applicants.filter((a) => a.status === 'Applied').length;
  const interviewedCount = applicants.filter((a) => a.status === 'Interviewed').length;
  const filteredApplicants = applicants.filter((a) =>
    activeStep === 'Applied' ? a.status === 'Applied' : a.status === 'Interviewed'
  );
  const pageCount = Math.ceil(filteredApplicants.length / applicantsPerPage);
  const paginatedApplicants = filteredApplicants.slice((page - 1) * applicantsPerPage, page * applicantsPerPage);

  // Handlers
  const handleView = (applicant: Applicant) => {
    setSelectedApplicant(applicant);
    setViewModalOpen(true);
  };

  const handleDeny = async (applicant: Applicant) => {
    setPendingDenyApplicant(applicant);
    setConfirmDenyOpen(true);
  };

  const handleConfirmDeny = async () => {
    if (!pendingDenyApplicant) return;
    // Update in Airtable
    await base('Applications').update(pendingDenyApplicant.id, { Status: 'Denied' });
    // Also update in main list
    setApplicants((prev) => prev.map((a) => a.id === pendingDenyApplicant.id ? { ...a, status: 'Denied' } : a));
    // Update selectedApplicant in modal
    setSelectedApplicant((prev) => prev && prev.id === pendingDenyApplicant.id ? { ...prev, status: 'Denied' } : prev);
    setConfirmDenyOpen(false);
    setPendingDenyApplicant(null);
    toast.success('Applicant denied successfully.');
  };

  const handleCancelDeny = () => {
    setConfirmDenyOpen(false);
    setPendingDenyApplicant(null);
  };

  const handleCloseViewModal = () => {
    setViewModalOpen(false);
    setSelectedApplicant(null);
  };

  const handleInterview = (applicant: Applicant) => {
    setPendingInterviewApplicant(applicant);
    setCalendlyLink('');
    setCalendlyError('');
    setInterviewModalOpen(true);
  };

  const handleSubmitInterview = async () => {
    if (!pendingInterviewApplicant) return;
    if (!calendlyLink.trim()) {
      setCalendlyError('Please enter a scheduling link.');
      return;
    }
    // URL validation
    try {
      const url = new URL(calendlyLink.trim());
      if (!/^https?:/.test(url.protocol)) {
        setCalendlyError('Please enter a valid URL (must start with http:// or https://).');
        return;
      }
    } catch {
      setCalendlyError('Please enter a valid URL (must start with http:// or https://).');
      return;
    }
    // Update in Airtable
    await base('Applications').update(pendingInterviewApplicant.id, { Status: 'Interviewed', 'Scheduling Link': calendlyLink });
    // Also update in main list
    setApplicants((prev) => prev.map((a) => a.id === pendingInterviewApplicant.id ? { ...a, status: 'Interviewed', calendlyLink } : a));
    // Update selectedApplicant in modal
    setSelectedApplicant((prev) => prev && prev.id === pendingInterviewApplicant.id ? { ...prev, status: 'Interviewed', calendlyLink } : prev);
    setInterviewModalOpen(false);
    setPendingInterviewApplicant(null);
    setCalendlyLink('');
    setCalendlyError('');
    toast.success('Interview invitation sent and applicant moved to Interviewed.');
  };
  const handleCancelInterview = () => {
    setInterviewModalOpen(false);
    setPendingInterviewApplicant(null);
    setCalendlyLink('');
    setCalendlyError('');
  };

  // TODO: Add handlers for Deny and Interview actions

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ width: '100%', mb: 4 }}>
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#fff',
            borderRadius: 2,
            p: '10px 18px',
            border: '1px solid #E5E7EB',
            boxShadow: '0 2px 8px 0 rgba(0,0,0,0.04)',
            width: '100%',
            maxWidth: 500,
            mx: 'auto',
            mt: 2,
          }}
        >
          {/* Step 1 - Applied */}
          <Box
            onClick={() => { setActiveStep('Applied'); setPage(1); }}
            sx={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 15,
              bgcolor: activeStep === 'Applied' ? '#52cab1' : '#F3F4F6',
              color: activeStep === 'Applied' ? '#fff' : '#374151',
              borderRadius: 1,
              py: 1,
              px: 0,
              position: 'relative',
              zIndex: 1,
              boxShadow: activeStep === 'Applied' ? '0 1px 4px 0 rgba(34,197,94,0.08)' : undefined,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            APPLIED
            <Box sx={{ fontWeight: 400, fontSize: 12, color: activeStep === 'Applied' ? '#D1FADF' : '#6B7280', mt: 0.5 }}>
              {appliedCount} Applicants
            </Box>
          </Box>
          <Box sx={{ width: 0, height: 0, borderTop: '22px solid transparent', borderBottom: '22px solid transparent', borderLeft: `18px solid ${activeStep === 'Applied' ? '#52cab1' : '#F3F4F6'}` }} />
          {/* Step 2 - Interviewed */}
          <Box
            onClick={() => { setActiveStep('Interviewed'); setPage(1); }}
            sx={{
              flex: 1,
              textAlign: 'center',
              fontWeight: 700,
              fontSize: 15,
              bgcolor: activeStep === 'Interviewed' ? '#52cab1' : '#F3F4F6',
              color: activeStep === 'Interviewed' ? '#fff' : '#374151',
              borderRadius: 1,
              py: 1,
              px: 0,
              position: 'relative',
              zIndex: 1,
              boxShadow: activeStep === 'Interviewed' ? '0 1px 4px 0 rgba(34,197,94,0.08)' : undefined,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
          >
            INTERVIEWED
            <Box sx={{ fontWeight: 400, fontSize: 12, color: activeStep === 'Interviewed' ? '#D1FADF' : '#6B7280', mt: 0.5 }}>
              {interviewedCount} Applicants
            </Box>
          </Box>
        </Box>
      </Box>

      <Box sx={{ width: '90%', mx: 'auto', bgcolor: '#FAFAFB', borderRadius: 3, boxShadow: '0 2px 16px 0 rgba(0,0,0,0.04)', border: '1px solid #F3F4F6', p: { xs: 1, sm: 3 }, mt: 2 }}>
        <Stack spacing={0}>
          <Typography variant="h5" gutterBottom>
            Applicant List
          </Typography>
          {loading ? (
            <Typography sx={{ p: 3 }}>Loading...</Typography>
          ) : paginatedApplicants.length === 0 ? (
            <Typography sx={{ p: 3 }}>No applicants found.</Typography>
          ) : (
            paginatedApplicants.map((applicant: Applicant, idx: number) => (
              <React.Fragment key={applicant.id}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    px: { xs: 1, sm: 3 },
                    py: { xs: 2, sm: 3 },
                    bgcolor: '#fff',
                    borderRadius: 2,
                    transition: 'background 0.2s',
                    '&:hover': { bgcolor: '#F3F4F6' },
                    boxShadow: idx === 0 ? '0 1px 4px 0 rgba(0,0,0,0.03)' : undefined,
                    gap: 2,
                  }}
                >
                  <Avatar
                    sx={{ width: 56, height: 56, fontSize: 22, bgcolor: '#52cab1', mr: { sm: 3 }, mb: { xs: 2, sm: 0 } }}
                    src={applicant.photoUrl || undefined}
                  >
                    {applicant.name ? applicant.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : '?'}
                  </Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Typography variant="subtitle1" fontWeight={700} sx={{ color: '#222', fontSize: 18, mb: 0.5 }}>
                      {applicant.name}
                    </Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <Typography variant="body2" sx={{ color: '#374151' }}>
                        {applicant.university}
                      </Typography>
                      <Chip
                        label={applicant.currentGrade}
                        size="small"
                        sx={{ bgcolor: '#F3F4F6', color: '#52cab1', fontWeight: 500 }}
                      />
                      <Typography variant="body2" sx={{ color: '#B0B3B8' }}>
                        Submitted: {applicant.submissionDate?.split('T')[0]}
                      </Typography>
                    </Box>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ mt: 1, mb: 1, lineHeight: 1.7, maxWidth: '100%', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', textOverflow: 'ellipsis' }}
                    >
                      {applicant['About Yourself'] || 'No summary provided.'}
                    </Typography>
                    {applicant['Major / Minor'] && (
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mb: 1 }}>
                        {String(applicant['Major / Minor']).split(',').map((tag: string) => (
                          <Chip key={tag.trim()} label={tag.trim()} size="small" sx={{ bgcolor: '#F5F6FA', color: '#5A5DFF', fontWeight: 500 }} />
                        ))}
                      </Box>
                    )}
                    {/* Action buttons below info */}
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2, mt: 2, width: '100%' }}>
                      <Button
                        variant="outlined"
                        startIcon={<FaUser size={18} />}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          color: '#222',
                          borderColor: '#E5E7EB',
                          bgcolor: '#fff',
                          px: 2.5,
                          py: 1.2,
                          boxShadow: 'none',
                          '&:hover': { bgcolor: '#F3F4F6', borderColor: '#C7D2FE' },
                          flex: 1,
                        }}
                        onClick={() => handleView(applicant)}
                      >
                        View Profile
                      </Button>
                      <Button
                        variant="outlined"
                        color="error"
                        onClick={() => handleDeny(applicant)}
                        disabled={selectedApplicant?.status === 'Denied'}
                        sx={{
                          borderRadius: 2,
                          fontWeight: 600,
                          color: '#EF4444',
                          borderColor: '#FCA5A5',
                          bgcolor: '#fff',
                          px: 2.5,
                          py: 1.2,
                          boxShadow: 'none',
                          '&.Mui-disabled': {
                            color: '#FCA5A5',
                            borderColor: '#FCA5A5',
                            bgcolor: '#fff',
                          },
                          flex: 1,
                        }}
                      >
                        {selectedApplicant?.status === 'Denied' ? 'Denied' : 'Deny'}
                      </Button>
                      {applicant.status === 'Interviewed' ? (
                        <Button
                          component="a"
                          href={`mailto:${applicant.email}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            bgcolor: '#52cab1',
                            color: '#fff',
                            px: 2.5,
                            py: 1.2,
                            fontSize: 12,
                            boxShadow: 'none',
                            flex: 1,
                            whiteSpace: 'nowrap',
                          }}
                        >
                          Email Candidate
                        </Button>
                      ) : (
                        <Button

                          disabled={selectedApplicant?.status === 'Interviewed' || selectedApplicant?.status === 'Denied'}
                          sx={{
                            borderRadius: 2,
                            fontWeight: 600,
                            bgcolor: '#52cab1',
                            color: '#fff',
                            px: 1.5,
                            py: 1,
                            fontSize: 12,
                            boxShadow: 'none',
                            '&.Mui-disabled': {
                              bgcolor: '#52cab1',
                              color: '#fff',
                            },
                            flex: 1,
                          }}
                          onClick={() => handleInterview(applicant)}
                        >
                          Email for First Round Interview.
                        </Button>
                      )}
                    </Box>
                  </Box>
                </Box>
                {idx !== paginatedApplicants.length - 1 && <Divider sx={{ mx: 1, borderColor: '#F3F4F6' }} />}
              </React.Fragment>
            ))
          )}
        </Stack>
      </Box>
      {!loading && pageCount && pageCount > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <Pagination count={pageCount} page={page} onChange={handlePageChange} sx={{ color: '#52cab1' }} />
        </Box>
      )}
      {/* View Modal */}
      <Modal open={viewModalOpen} onClose={handleCloseViewModal}>
        <Box
          sx={{
            position: 'absolute',
            top: '51%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: { xs: '95%', sm: '80%' },
            height: '80%',
            maxHeight: '90vh',
            bgcolor: '#fff',
            borderRadius: 4,
            boxShadow: 24,
            p: 0,
            overflow: 'visible',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-start',
          }}
        >
          {selectedApplicant && (
            <Box sx={{ p: { xs: 2, sm: 3 }, pt: 0, textAlign: 'center', position: 'relative', flex: 1, display: 'flex', flexDirection: 'column' }}>
              {/* Avatar - floating above card */}
              <Box sx={{ position: 'absolute', left: '50%', top: -40, transform: 'translateX(-50%)', zIndex: 2 }}>
                <Avatar
                  sx={{ width: 80, height: 80, bgcolor: '#52cab1', fontSize: 32, border: '4px solid #fff', boxShadow: 2 }}
                  src={selectedApplicant.photoUrl || undefined}
                >
                  {selectedApplicant.name ? selectedApplicant.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2) : '?'}
                </Avatar>
              </Box>
              <Box sx={{ pt: 4, pb: 2 }}>
                <Typography variant="h6" fontWeight={700} sx={{ mb: 0.5 }}>
                  {selectedApplicant.name}
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1, flexWrap: 'wrap', mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#374151' }}>{selectedApplicant.currentGrade} @ {selectedApplicant.university}</Typography>

                </Box>
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ textAlign: 'left', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <FaUser size={16} style={{ marginRight: 8, color: '#A0AEC0' }} />
                  <Typography variant="body2" sx={{ color: '#222' }}>{selectedApplicant.email}</Typography>
                </Box>
                {selectedApplicant['Linkedin URL'] && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FaArrowRight size={16} style={{ marginRight: 8, color: '#A0AEC0' }} />
                    <a href={selectedApplicant['Linkedin URL']} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none', fontSize: 14 }}>
                      LinkedIn Profile
                    </a>
                  </Box>
                )}
                {selectedApplicant['Resume'] && (
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <FaArrowRight size={16} style={{ marginRight: 8, color: '#A0AEC0' }} />
                    <a href={selectedApplicant['Resume'][0].url} target="_blank" rel="noopener noreferrer" style={{ color: '#2563EB', textDecoration: 'none', fontSize: 14 }}>
                      Resume
                    </a>
                  </Box>
                )}
              </Box>
              <Divider sx={{ mb: 2 }} />
              <Box sx={{ mb: 2 }}>
                <Box sx={{ height: 150, overflow: 'auto', bgcolor: '#F8FAFC', borderRadius: 2, p: 1, mb: 1 }}>
                  <Typography variant="body2" sx={{ color: '#374151', lineHeight: 1.7 }}>
                    {selectedApplicant['About Yourself'] || 'No summary provided.'}
                  </Typography>
                </Box>
              </Box>
              {selectedApplicant['Major / Minor'] && (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ color: '#8A8F98', mb: 0.5 }}>Major / Minor</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {String(selectedApplicant['Major / Minor']).split(',').map((tag: string) => (
                      <Chip key={tag.trim()} label={tag.trim()} size="small" sx={{ bgcolor: '#F5F6FA', color: '#5A5DFF', fontWeight: 500 }} />
                    ))}
                  </Box>
                </Box>
              )}
              <Divider sx={{ mb: 2 }} />
              <Button onClick={handleCloseViewModal} sx={{ mt: 'auto', color: '#2563EB', fontWeight: 600 }} fullWidth>
                Close
              </Button>
            </Box>
          )}
        </Box>
      </Modal>
      {/* Deny Confirmation Modal */}
      <Dialog
        open={confirmDenyOpen}
        onClose={handleCancelDeny}
        PaperProps={{
          sx: {
            borderRadius: 3,
            boxShadow: 8,
            p: 0,
            minWidth: 340,
            maxWidth: '90vw',
          },
        }}
      >
        <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1, fontWeight: 700, fontSize: 22, letterSpacing: 0.2 }}>
          Deny Applicant?
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 0, color: '#374151', fontSize: 16 }}>
          {pendingDenyApplicant && (
            <>
              Are you sure you want to <b>deny</b> <span style={{ color: '#EF4444' }}>{pendingDenyApplicant.name}</span>?<br />
            </>
          )}
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 2, gap: 2 }}>
          <Button
            onClick={handleCancelDeny}
            variant="outlined"
            color="inherit"
            sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600, fontSize: 16 }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleConfirmDeny}
            color="error"
            variant="contained"
            sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600, fontSize: 16, boxShadow: '0 2px 8px 0 rgba(239,68,68,0.08)' }}
          >
            Deny
          </Button>
        </DialogActions>
      </Dialog>
      {/* Interview Modal */}
      <Dialog open={interviewModalOpen} onClose={handleCancelInterview} PaperProps={{ sx: { borderRadius: 3, boxShadow: 8, p: 0, minWidth: 340, maxWidth: '90vw' } }}>
        <DialogTitle sx={{ textAlign: 'center', pt: 3, pb: 1, fontWeight: 700, fontSize: 22, letterSpacing: 0.2 }}>
          First-Round Interview
        </DialogTitle>
        <DialogContent sx={{ textAlign: 'center', px: 4, pb: 0, color: '#374151', fontSize: 16 }}>
          <TextField
            label="Calendly or Scheduling Link"
            value={calendlyLink}
            onChange={e => { setCalendlyLink(e.target.value); setCalendlyError(''); }}
            error={!!calendlyError}
            helperText={calendlyError}
            fullWidth
            sx={{ mt: 2 }}
            autoFocus
          />
        </DialogContent>
        <DialogActions sx={{ justifyContent: 'center', pb: 3, pt: 2, gap: 2 }}>
          <Button onClick={handleCancelInterview} variant="outlined" color="inherit" sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600, fontSize: 16 }}>Cancel</Button>
          <Button onClick={handleSubmitInterview} sx={{ borderRadius: 2, px: 3, py: 1, fontWeight: 600, fontSize: 16, bgcolor: '#52cab1', color: '#fff' }}>Send Invite</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
