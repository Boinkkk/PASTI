import React from 'react';
import { 
  Card, 
  CardContent, 
  Typography, 
  Avatar, 
  Button, 
  IconButton,
  Chip,
  Box 
} from '@mui/joy';
import { 
  Assignment as AssignmentIcon,
  CalendarMonth as CalendarIcon,
  Description as DescriptionIcon
} from '@mui/icons-material';

interface Teacher {
  name: string;
  nip: string;
  avatar?: string;
}

interface CardAbsensiProps {
  id: string;
  title: string;
  semester: string;
  teacher: Teacher;
  absensiCount?: number;
  onAbsensiClick?: () => void;
  onCalendarClick?: () => void;
  onDocumentClick?: () => void;
}

const CardAbsensi: React.FC<CardAbsensiProps> = ({
  title,
  semester,
  teacher,
  absensiCount = 0,
  onAbsensiClick,
  onCalendarClick,
  onDocumentClick
}) => {
  return (
    <Card 
      variant="outlined"
      sx={{ 
        p: 3,
        borderRadius: 'md',
        border: '1px solid',
        borderColor: 'divider',
        '&:hover': {
          boxShadow: 'sm',
          borderColor: 'primary.300'
        },
        transition: 'all 0.2s ease',
        position: 'relative'
      }}
    >
      <CardContent sx={{ p: 0 }}>
        {/* Course Title and Semester */}
        <Box sx={{ mb: 2 }}>
          <Typography 
            level="title-lg" 
            sx={{ 
              fontWeight: 'bold',
              color: 'primary.600',
              mb: 0.5,
              fontSize: '1.1rem'
            }}
          >
            {title}
          </Typography>
          <Typography 
            level="body-sm" 
            sx={{ color: 'text.secondary' }}
          >
            {semester}
          </Typography>
        </Box>

        {/* Teacher Info */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 3 }}>
          <Avatar 
            sx={{ 
              bgcolor: 'neutral.800',
              color: 'white',
              width: 40,
              height: 40
            }}
          >
            {teacher.name.split(' ')[0].charAt(0)}
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography 
              level="body-md" 
              sx={{ 
                fontWeight: 500,
                fontSize: '0.95rem'
              }}
            >
              {teacher.name}
            </Typography>
            <Typography 
              level="body-xs" 
              sx={{ 
                color: 'text.tertiary',
                fontSize: '0.8rem'
              }}
            >
              {teacher.nip}
            </Typography>
          </Box>
        </Box>

        {/* Action Buttons */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center' 
        }}>
          <Button 
            variant="outlined" 
            color="primary"
            startDecorator={<AssignmentIcon sx={{ fontSize: 18 }} />}
            onClick={onAbsensiClick}
            sx={{ 
              flex: 1, 
              mr: 1,
              fontSize: '0.85rem',
              py: 1
            }}
          >
            Absensi
          </Button>
          
          <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
            <IconButton 
              variant="outlined" 
              color="neutral"
              size="sm"
              onClick={onCalendarClick}
              sx={{ p: 1 }}
            >
              <CalendarIcon sx={{ fontSize: 18 }} />
            </IconButton>
            <IconButton 
              variant="outlined" 
              color="neutral"
              size="sm"
              onClick={onDocumentClick}
              sx={{ p: 1 }}
            >
              <DescriptionIcon sx={{ fontSize: 18 }} />
            </IconButton>
            {absensiCount > 0 && (
              <Chip 
                color="danger" 
                size="sm"
                sx={{ 
                  minWidth: 24, 
                  height: 24,
                  fontSize: '0.75rem',
                  fontWeight: 'bold'
                }}
              >
                {absensiCount}
              </Chip>
            )}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CardAbsensi;
