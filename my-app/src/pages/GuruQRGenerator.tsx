import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Card,
  CardContent,
  Alert,
  Button,
  Input,
  Grid,
  Sheet
} from '@mui/joy';
import { 
  QrCode2 as QrCodeIcon,
  ContentCopy as CopyIcon,
  Download as DownloadIcon,
  Share as ShareIcon
} from '@mui/icons-material';
import { QRCodeSVG } from 'qrcode.react';
import SidebarGuru from '../components/SidebarGuru';
import { useAuth } from '../components/Middleware';

const GuruQRGenerator: React.FC = () => {  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [inputText, setInputText] = useState('');
  const [qrValue, setQrValue] = useState('https://pasti.school/attendance');

  const generateQR = () => {
    if (inputText.trim()) {
      setQrValue(inputText);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(qrValue);
  };

  return (
    <Box sx={{ display: 'flex', height: '100vh' }}>
      <SidebarGuru open={sidebarOpen} onToggle={setSidebarOpen} />
      
      <Box
        sx={{
          flexGrow: 1,
          ml: sidebarOpen ? '280px' : '70px',
          transition: 'margin 0.3s ease',
          bgcolor: '#f8f9fa',
          minHeight: '100vh',
          p: 3
        }}
      >
        {/* Header */}
        <Box sx={{ mb: 4 }}>
          <Typography level="h2" sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 2 }}>
            <QrCodeIcon sx={{ fontSize: 32, color: 'primary.600' }} />
            QR Code Generator
          </Typography>
          <Typography level="body-lg" sx={{ color: 'text.secondary' }}>
            Generate QR codes untuk link absensi dan keperluan lainnya
          </Typography>
        </Box>

        <Grid container spacing={3}>
          {/* Input Section */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography level="title-md" sx={{ mb: 2 }}>
                  Generate QR Code
                </Typography>
                
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Input
                    placeholder="Masukkan URL atau teks..."
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    size="lg"
                  />
                  
                  <Button 
                    onClick={generateQR}
                    startDecorator={<QrCodeIcon />}
                    size="lg"
                    fullWidth
                  >
                    Generate QR Code
                  </Button>
                </Box>

                <Alert
                  variant="soft"
                  color="primary"
                  sx={{ mt: 2 }}
                >
                  QR Code akan otomatis terupdate saat Anda mengetik atau mengklik generate
                </Alert>
              </CardContent>
            </Card>
          </Grid>

          {/* QR Code Display */}
          <Grid xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography level="title-md" sx={{ mb: 2 }}>
                  QR Code Preview
                </Typography>
                
                <Box sx={{ 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Sheet
                    sx={{
                      p: 3,
                      borderRadius: 'md',
                      border: '1px solid',
                      borderColor: 'divider',
                      bgcolor: 'white'
                    }}
                  >
                    <QRCodeSVG 
                      value={qrValue} 
                      size={200}
                      level="M"
                      includeMargin={true}
                    />
                  </Sheet>

                  <Typography 
                    level="body-sm" 
                    sx={{ 
                      textAlign: 'center',
                      color: 'text.secondary',
                      wordBreak: 'break-all',
                      maxWidth: '100%'
                    }}
                  >
                    {qrValue}
                  </Typography>

                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      variant="outlined"
                      size="sm"
                      startDecorator={<CopyIcon />}
                      onClick={copyToClipboard}
                    >
                      Copy Link
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="sm"
                      startDecorator={<DownloadIcon />}
                    >
                      Download
                    </Button>
                    
                    <Button
                      variant="outlined"
                      size="sm"
                      startDecorator={<ShareIcon />}
                    >
                      Share
                    </Button>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Quick Actions */}
          <Grid xs={12}>
            <Card>
              <CardContent>
                <Typography level="title-md" sx={{ mb: 2 }}>
                  Quick Actions
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <Button
                    variant="soft"
                    onClick={() => setQrValue('https://pasti.school/attendance/today')}
                  >
                    Absensi Hari Ini
                  </Button>
                  
                  <Button
                    variant="soft"
                    onClick={() => setQrValue('https://pasti.school/attendance/weekly')}
                  >
                    Absensi Mingguan
                  </Button>
                  
                  <Button
                    variant="soft"
                    onClick={() => setQrValue('https://pasti.school/assignment')}
                  >
                    Link Tugas
                  </Button>
                  
                  <Button
                    variant="soft"
                    onClick={() => setQrValue('https://pasti.school/material')}
                  >
                    Materi Pelajaran
                  </Button>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
};

export default GuruQRGenerator;
