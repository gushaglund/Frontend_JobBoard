import { useEffect, useState } from 'react';
import { Box, Typography } from '@mui/material';
import { MdTimer } from 'react-icons/md';

interface RecordingTimerProps {
  isRecording: boolean;
  onTimeUpdate?: (time: number) => void;
}

export const RecordingTimer = ({ isRecording, onTimeUpdate }: RecordingTimerProps) => {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let intervalId: NodeJS.Timeout;

    if (isRecording) {
      intervalId = setInterval(() => {
        setTime((prevTime) => {
          const newTime = prevTime + 1;
          onTimeUpdate?.(newTime);
          return newTime;
        });
      }, 1000);
    } else {
      setTime(0);
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
    };
  }, [isRecording, onTimeUpdate]);

  const isTimeWarning = time >=90;

  return (
    <Typography
      variant="h6"
      sx={{
        color: isTimeWarning ? '#d32f2f' : '#1976d2',
        fontWeight: 600,
        display: 'flex',
        alignItems: 'center',
        gap: 1,
      }}
    >
      <MdTimer color={isTimeWarning ? '#d32f2f' : '#1976d2'} size={24} />
      {Math.floor(time / 60)}:{(time % 60).toString().padStart(2, '0')}
    </Typography>
  );
}; 