'use client';

import * as React from 'react';
import { useContext } from 'react';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import Input from '@mui/material/Input';
import InputAdornment from '@mui/material/InputAdornment';
import Stack from '@mui/material/Stack';
import { styled } from '@mui/material/styles';
import Typography from '@mui/material/Typography';
import { CaretLeft as CaretLeftIcon } from '@phosphor-icons/react/dist/ssr/CaretLeft';
import { CaretRight as CaretRightIcon } from '@phosphor-icons/react/dist/ssr/CaretRight';
import { MagnifyingGlass as MagnifyingGlassIcon } from '@phosphor-icons/react/dist/ssr/MagnifyingGlass';
// import Airtable from 'airtable';
import { AnimatePresence, motion } from 'framer-motion';

import { config } from '@/config';
import { UserContext } from '@/contexts/auth/user-context';
import { MultiSelect } from '@/components/core/multi-select';
import { toast } from '@/components/core/toaster';
import { JobCard } from '@/components/dashboard/jobs/job-card';
import type { Job } from '@/components/dashboard/jobs/job-card';

interface ApiResponse {
  jobs: Job[];
  hasNextPage: boolean;
  totalPages: number;
  currentPage: number;
}

const workTypeOptions = [
  { label: 'Remote', value: 'Remote' },
  { label: 'In person', value: 'In person' },
] as const;

const paymentTypeOptions = [
  { label: 'Paid', value: 'Paid' },
  { label: 'Unpaid', value: 'Unpaid' },
] as const;

const jobTypeOptions = [
  { label: 'Early Career', value: 'Early Career' },
  { label: 'Experienced', value: 'Experienced' },
] as const;

interface JobsFiltersProps {
  onFilterChange: (filters: {
    keyword?: string;
    workTypes?: string[];
    paymentTypes?: string[];
    jobTypes?: string[];
  }) => void;
}

const StyledFilterWrapper = styled('div')(({ theme }) => ({
  '& .MuiSelect-select': {
    minWidth: '200px',
    padding: theme.spacing(1.5),
  },
}));

function JobsFilters({ onFilterChange }: JobsFiltersProps): React.JSX.Element {
  const [keyword, setKeyword] = React.useState('');
  const [selectedWorkTypes, setSelectedWorkTypes] = React.useState<string[]>([]);
  const [selectedPaymentTypes, setSelectedPaymentTypes] = React.useState<string[]>([]);
  const [selectedJobTypes, setSelectedJobTypes] = React.useState<string[]>([]);

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeyword(event.target.value);
    onFilterChange({
      keyword: event.target.value,
      workTypes: selectedWorkTypes,
      paymentTypes: selectedPaymentTypes,
      jobTypes: selectedJobTypes,
    });
  };

  const handleWorkTypeChange = (values: string[]) => {
    setSelectedWorkTypes(values);
    onFilterChange({
      keyword,
      workTypes: values,
      paymentTypes: selectedPaymentTypes,
      jobTypes: selectedJobTypes,
    });
  };

  const handlePaymentTypeChange = (values: string[]) => {
    setSelectedPaymentTypes(values);
    onFilterChange({
      keyword,
      workTypes: selectedWorkTypes,
      paymentTypes: values,
      jobTypes: selectedJobTypes,
    });
  };

  const handleJobTypeChange = (values: string[]) => {
    setSelectedJobTypes(values);
    onFilterChange({
      keyword,
      workTypes: selectedWorkTypes,
      paymentTypes: selectedPaymentTypes,
      jobTypes: values,
    });
  };

  return (
    <Card>
      <Input
        fullWidth
        placeholder="Enter a keyword"
        value={keyword}
        onChange={handleKeywordChange}
        startAdornment={
          <InputAdornment position="start">
            <MagnifyingGlassIcon />
          </InputAdornment>
        }
        sx={{ px: 3, py: 2 }}
      />
      <Divider />
      <Stack
        direction="row"
        spacing={2}
        sx={{ alignItems: 'center', flexWrap: 'wrap', justifyContent: 'space-between', p: 1 }}
      >
        <Stack direction="row" spacing={2} sx={{ flexWrap: 'wrap', gap: 1 }}>
          <StyledFilterWrapper>
            <MultiSelect
              label="Remote / In person"
              options={workTypeOptions}
              value={selectedWorkTypes}
              onChange={handleWorkTypeChange}
            />
          </StyledFilterWrapper>
          <StyledFilterWrapper>
            <MultiSelect
              label="Paid / Unpaid"
              options={paymentTypeOptions}
              value={selectedPaymentTypes}
              onChange={handlePaymentTypeChange}
            />
          </StyledFilterWrapper>
          <StyledFilterWrapper>
            <MultiSelect
              label="Job Type"
              options={jobTypeOptions}
              value={selectedJobTypes}
              onChange={handleJobTypeChange}
            />
          </StyledFilterWrapper>
        </Stack>
      </Stack>
    </Card>
  );
}

// const base = new Airtable({
//   apiKey: config.airtable.apiKey,
// }).base(config.airtable.baseId || '');

export function JobsList(): React.JSX.Element {
  const userContext = useContext(UserContext);
  if (!userContext) {
    throw new Error('UserContext is not available. Make sure the component is wrapped in a UserProvider.');
  }
  // const { user } = userContext;

  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [page, setPage] = React.useState(1);
  const [totalPages, setTotalPages] = React.useState(1);
  const [hasNextPage, setHasNextPage] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  // const [candidateType, setCandidateType] = React.useState<string | null>(null);
  // const [userEmail, setUserEmail] = React.useState<string>('');
  const [filters, setFilters] = React.useState({
    keyword: '',
    workTypes: [] as string[],
    paymentTypes: [] as string[],
    jobTypes: [] as string[],
  });

  if (!config.supabase.url || !config.supabase.roleKey) {
    throw new Error('Supabase URL or roleKey is not defined.');
  }

  // // Check for saved email on component mount
  // React.useEffect(() => {
  //   if (user?.email) {
  //     void checkUserType(user?.email);
  //   }
  // }, [user]);

  // const checkUserType = async (email: string) => {
  //   try {
  //     const userTypeRecords = await base('SFF Candidate Database')
  //       .select({
  //         view: 'All Applications',
  //         filterByFormula: `{Email} = '${email}'`,
  //         fields: ['Canidate Type'],
  //       })
  //       .all();

  //     if (!userTypeRecords || userTypeRecords.length === 0) {
  //       setCandidateType('Not Found');
  //       setUserEmail('');
  //     } else {
  //       const userCandidateType = userTypeRecords[0].get('Canidate Type') as string;
  //       setCandidateType(userCandidateType);
  //       setUserEmail(email);
  //       // Save email to localStorage
  //       localStorage.setItem('userEmail', email);
  //     }
  //   } catch (err) {
  //     toast.error('Error checking user type. Please try again.');
  //   }
  // };

  const fetchJobs = React.useCallback(async () => {
    // if (!candidateType) return;

    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        page: page.toString(),
        ...(filters.keyword && { keyword: filters.keyword }),
        ...(filters.workTypes.length > 0 && { workTypes: filters.workTypes.join(',') }),
        ...(filters.paymentTypes.length > 0 && { paymentTypes: filters.paymentTypes.join(',') }),
        ...(filters.jobTypes.length > 0 && { jobTypes: filters.jobTypes.join(',') }),
        // user: userEmail,
      });

      const response = await fetch(`https://backend.searchfundfellows.com/api/jobs/jobs?${queryParams.toString()}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = (await response.json()) as ApiResponse;

      setJobs(data.jobs);
      setHasNextPage(data.hasNextPage);
      setTotalPages(data.totalPages);
    } catch (error) {
      toast.error('Error fetching jobs. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [page, filters]);

  React.useEffect(() => {
    void fetchJobs();
  }, [fetchJobs]);

  const handleFilterChange = (newFilters: {
    keyword?: string;
    workTypes?: string[];
    paymentTypes?: string[];
    jobTypes?: string[];
  }) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setPage(1); // Reset to first page when filters change
  };

  const handleNextPage = () => {
    if (hasNextPage) {
      setPage((prev) => prev + 1);
    }
  };

  const handlePrevPage = () => {
    if (page > 1) {
      setPage((prev) => prev - 1);
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 'var(--Content-maxWidth)',
        m: 'var(--Content-margin)',
        p: 'var(--Content-padding)',
        width: 'var(--Content-width)',
      }}
    >
      <Stack spacing={4}>
        {/* {candidateType !== 'Not Found' ? ( */}
        <Box
          sx={{
            bgcolor: '#082439',
            borderRadius: 1,
            color: 'var(--mui-palette-common-white)',
            px: 4,
            py: 8,
          }}
        >
          <Grid container sx={{ alignItems: 'center' }}>
            <Grid
              size={{
                sm: 7,
                xs: 12,
              }}
            >
              <Stack spacing={3}>
                <Stack spacing={2}>
                  <Typography color="inherit" variant="h4">
                    {/* {candidateType === 'Experienced Professional'
                        ? 'Experienced Professionals and MBAs'
                        : 'Undergraduates and Recent Graduates'} */}
                    Gain Experience in Search Funds and Small Business M&A
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid
              sx={{ display: { xs: 'none', sm: 'flex' }, justifyContent: 'center' }}
              size={{
                sm: 5,
              }}
            >
              <Box
                alt="Shield"
                component="img"
                src="/assets/iconly-glass-shield.svg"
                sx={{ height: '100px', width: '100px' }}
              />
            </Grid>
          </Grid>
        </Box>
        {/* ) : null} */}
        <JobsFilters onFilterChange={handleFilterChange} />
        <AnimatePresence mode="wait">
          {isLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">Loading...</Typography>
            </Box>
          ) : jobs.length > 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Stack spacing={2}>
                {jobs.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.3 }}
                  >
                    <JobCard job={job} />
                  </motion.div>
                ))}
              </Stack>
            </motion.div>
          ) : (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography color="text.secondary">No jobs found</Typography>
            </Box>
          )}
        </AnimatePresence>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', justifyContent: 'center', px: 3 }}>
          <IconButton disabled={page === 1 || isLoading} onClick={handlePrevPage}>
            <CaretLeftIcon />
          </IconButton>
          <Typography variant="body2" color="text.secondary">
            Page {page} of {totalPages}
          </Typography>
          <IconButton disabled={!hasNextPage || isLoading} onClick={handleNextPage}>
            <CaretRightIcon />
          </IconButton>
        </Stack>
      </Stack>
    </Box>
  );
}
