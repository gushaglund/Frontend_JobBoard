'use client';

import * as React from 'react';
import { useSearchParams } from 'next/navigation';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import InputAdornment from '@mui/material/InputAdornment';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Calendar as CalendarMonthIcon } from '@phosphor-icons/react/dist/ssr/Calendar';
import { EnvelopeSimple as EmailIcon } from '@phosphor-icons/react/dist/ssr/EnvelopeSimple';
import Airtable, { FieldSet } from 'airtable';
import { createClient } from '@supabase/supabase-js';

import { config } from '@/config';
import { FileDropzone } from '@/components/core/file-dropzone';
import { TextEditor } from '@/components/core/text-editor/text-editor';
import { toast } from '@/components/core/toaster';

// Initialize Supabase client
const supabase = createClient(
  config.supabase.url || '',
  config.supabase.roleKey || ''
);

interface ApplicationRecord extends FieldSet {
  Name: string;
  Email: string;
  'Phone Number': string;
  University: string;
  'Current Grade': string;
  'Graduation Date': string;
  Resume?: any;
  'Linkedin URL': string;
  'About Yourself': string;
}

const phoneCountries = [
  { code: 'US', label: 'US (+1)', format: '+1 (XXX) XXX-XXXX' },
  { code: 'GB', label: 'UK (+44)', format: '+44 XXXX XXXXXX' },
  { code: 'IN', label: 'India (+91)', format: '+91 XXXXX XXXXX' },
  { code: 'DE', label: 'Germany (+49)', format: '+49 XXXXXXXXXX' },
  { code: 'FR', label: 'France (+33)', format: '+33 X XX XX XX XX' },
  { code: 'CA', label: 'Canada (+1)', format: '+1 (XXX) XXX-XXXX' },
  { code: 'AU', label: 'Australia (+61)', format: '+61 X XXXX XXXX' },
  { code: 'JP', label: 'Japan (+81)', format: '+81 XX XXXX XXXX' },
  { code: 'CN', label: 'China (+86)', format: '+86 XXX XXXX XXXX' },
  { code: 'BR', label: 'Brazil (+55)', format: '+55 XX XXXXX XXXX' },
  { code: 'RU', label: 'Russia (+7)', format: '+7 XXX XXX-XX-XX' },
  { code: 'ZA', label: 'South Africa (+27)', format: '+27 XX XXX XXXX' },
  { code: 'MX', label: 'Mexico (+52)', format: '+52 XXX XXX XXXX' },
  { code: 'SG', label: 'Singapore (+65)', format: '+65 XXXX XXXX' },
  { code: 'AE', label: 'UAE (+971)', format: '+971 XX XXX XXXX' },
  { code: 'SA', label: 'Saudi Arabia (+966)', format: '+966 XX XXX XXXX' },
  { code: 'IT', label: 'Italy (+39)', format: '+39 XXX XXX XXXX' },
  { code: 'ES', label: 'Spain (+34)', format: '+34 XXX XXX XXX' },
  { code: 'NL', label: 'Netherlands (+31)', format: '+31 X XXXXXXXX' },
  { code: 'SE', label: 'Sweden (+46)', format: '+46 XX XXX XXXX' },
  { code: 'CH', label: 'Switzerland (+41)', format: '+41 XX XXX XXXX' },
  { code: 'KR', label: 'South Korea (+82)', format: '+82 XX XXXX XXXX' },
  { code: 'NZ', label: 'New Zealand (+64)', format: '+64 X XXX XXXX' },
  { code: 'AR', label: 'Argentina (+54)', format: '+54 XX XXXX XXXX' },
  { code: 'TR', label: 'Turkey (+90)', format: '+90 XXX XXX XXXX' },
];

const years = [
  { value: 'Freshman', label: 'Freshman Year' },
  { value: 'Sophomore', label: 'Sophomore Year' },
  { value: 'Junior', label: 'Junior Year' },
  { value: 'Senior', label: 'Senior Year' },
];

const base = new Airtable({
  apiKey: config.airtable.apiKey,
}).base(config.airtable.baseId || '');

export default function ApplicationFormPage() {
  const searchParams = useSearchParams();
  const [form, setForm] = React.useState({
    id: searchParams?.get('id') || '',
    name: '',
    email: '',
    phoneCountry: 'US',
    phone: '',
    university: '',
    year: 'Freshman Year',
    graduation: '',
    resume: null,
    linkedin: '',
    about: '',
  });
  const [resumeFile, setResumeFile] = React.useState<File | null>(null);
  const [graduationError, setGraduationError] = React.useState<string>('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'graduation') {
      const selectedDate = new Date(value);
      const today = new Date();

      if (selectedDate < today) {
        setGraduationError('Graduation date cannot be in the past');
      } else {
        setGraduationError('');
      }
    }

    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      if (graduationError) return;

      // Create the record data
      const recordData: ApplicationRecord = {
        'Job Posting Id': form.id,
        Name: form.name,
        Email: form.email,
        'Phone Number': form.phone,
        University: form.university,
        'Current Grade': form.year,
        'Graduation Date': form.graduation,
        'Linkedin URL': form.linkedin,
        'About Yourself': form.about,
      };

      if (resumeFile) {
        try {
          // Upload file to Supabase Storage
          const fileName = resumeFile.name;
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from('resumes')
            .upload(fileName, resumeFile);

          if (uploadError) {
            throw new Error('Failed to upload resume to storage');
          }

          // Get the public URL
          const { data: { publicUrl } } = supabase.storage
            .from('resumes')
            .getPublicUrl(fileName);

          // First create the record without the attachment
          const record = await base('Applications').create({
            ...recordData,
            Resume: [], // Initialize with empty array
          });

          // Then update the record with the Supabase URL
          await base('Applications').update([
            {
              id: record.id,
              fields: {
                Resume: [
                  {
                    url: publicUrl as any,
                  } as any,
                ],
              },
            },
          ]);
          setTimeout(() => {
            supabase.storage.from('resumes').remove([fileName]);
          }, 3000);
        } catch (error) {
          console.error('Error uploading resume:', error);
          toast.error('Failed to upload resume. Please try again.');
          return;
        }
      } else {
        // Create the record without attachment
        await base('Applications').create(recordData);
      }

      toast.success('Application submitted successfully!');
      window.location.reload();
    } catch (error) {
      console.error('Error submitting application:', error);
      toast.error('Failed to submit application. Please try again.');
    }
  };

  return (
    <Box
      sx={{
        maxWidth: 800,
        mx: 'auto',
        my: { xs: 4, md: 8 },
        p: { xs: 3, sm: 5 },
        borderRadius: 4,
        boxShadow: '0 4px 24px rgba(0, 0, 0, 0.08)',
        bgcolor: 'background.paper',
        position: 'relative',
        '&::before': {
          content: '""',
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          background: '#52cab1',
          borderTopLeftRadius: 4,
          borderTopRightRadius: 4,
        },
      }}
    >
      <Typography
        variant="h4"
        align="center"
        fontWeight={700}
        mb={5}
        sx={{
          background: 'linear-gradient(90deg, #2d3748 0%, #4a5568 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
        }}
      >
        Application Form
      </Typography>
      <Stack spacing={4} component="form" autoComplete="off" onSubmit={handleSubmit}>
        <TextField
          label="Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#4fd1c5',
              },
            },
          }}
        />
        <TextField
          label="Email"
          name="email"
          value={form.email}
          onChange={handleChange}
          fullWidth
          required
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <EmailIcon weight="fill" color="#52cab1" />
              </InputAdornment>
            ),
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#52cab1',
              },
            },
          }}
        />
        <Box>
          <Typography variant="subtitle2" mb={1.5}>
            Phone *
          </Typography>
          <Stack direction="row" spacing={2}>
            <TextField
              select
              name="phoneCountry"
              value={form.phoneCountry}
              onChange={handleChange}
              sx={{
                width: 300,
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#3B82F6',
                  },
                },
              }}
            >
              {phoneCountries.map((option) => (
                <MenuItem key={option.code} value={option.code}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              name="phone"
              value={form.phone}
              onChange={handleChange}
              fullWidth
              placeholder={
                phoneCountries.find((country) => country.code === form.phoneCountry)?.format || 'Phone number'
              }
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  '&:hover .MuiOutlinedInput-notchedOutline': {
                    borderColor: '#52cab1',
                  },
                },
              }}
            />
          </Stack>
        </Box>
        <TextField
          label="University"
          name="university"
          value={form.university}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#52cab1',
              },
            },
          }}
        />
        <TextField
          select
          label="I am presently in my"
          name="year"
          value={form.year}
          onChange={handleChange}
          fullWidth
          required
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#52cab1',
              },
            },
          }}
        >
          {years.map((option) => (
            <MenuItem key={option.value} value={option.value}>
              {option.label}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Graduation Date"
          name="graduation"
          type="date"
          value={form.graduation}
          onChange={handleChange}
          fullWidth
          required
          error={!!graduationError}
          helperText={graduationError}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CalendarMonthIcon weight="fill" color="#52cab1" />
              </InputAdornment>
            ),
          }}
          inputProps={{
            min: new Date().toISOString().split('T')[0], // Set minimum date to today
          }}
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#52cab1',
              },
            },
          }}
        />
        <Box>
          <Typography variant="subtitle2" mb={1.5}>
            Resume
          </Typography>
          <FileDropzone
            caption="Upload your resume"
            onDrop={(acceptedFiles: File[]) => setResumeFile(acceptedFiles[0] || null)}
          />
          {resumeFile && (
            <Typography
              variant="body2"
              sx={{
                mt: 1,
                color: 'text.secondary',
                display: 'flex',
                alignItems: 'center',
                gap: 1,
              }}
            >
              Uploaded: {resumeFile.name}
            </Typography>
          )}
        </Box>
        <TextField
          label="Linkedin URL"
          name="linkedin"
          value={form.linkedin}
          onChange={handleChange}
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: 2,
              '&:hover .MuiOutlinedInput-notchedOutline': {
                borderColor: '#52cab1',
              },
            },
          }}
        />
        <Box>
          <Typography variant="subtitle2" mb={1.5}>
            About Yourself
          </Typography>
          <TextEditor
            content={form.about}
            onUpdate={({ editor }) => setForm((prev) => ({ ...prev, about: editor.getHTML() }))}
            placeholder="Write about yourself..."
          />
        </Box>
        <Button
          type="submit"
          size="large"
          sx={{
            bgcolor: '#52cab1',
            color: '#FFFFFF',
            fontWeight: 600,
            borderRadius: 2,
            mt: 3,
            mb: 2,
            py: 1.75,
            fontSize: '1.1rem',
            textTransform: 'none',
            boxShadow: '0 4px 12px rgba(59, 130, 246, 0.2)',
            transition: 'all 0.2s ease-in-out',
            '&:hover': {
              bgcolor: '#fff',
              color: '#52cab1',
              transform: 'translateY(-1px)',
              boxShadow: '0 6px 16px rgba(59, 130, 246, 0.3)',
            },
          }}
        >
          Submit Application
        </Button>
      </Stack>
    </Box>
  );
}
