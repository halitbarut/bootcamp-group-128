import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Stepper, Step, StepLabel, Box, Button, Typography, TextField,
    CircularProgress, Alert, Paper
} from '@mui/material';

import LoginForm from '../components/LoginForm';
import AcademicUnitStep from '../components/AcademicUnitStep';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const steps = ['Akademik Birim Seç', 'Sınav Bilgilerini Gir', 'Soruları Yükle'];

// Adım 2: Sınav Bilgileri Bileşeni (Güncellendi)
const ExamInfoStep = ({ examData, setExamData }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setExamData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>Sınav Bilgileri</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Sınav adı, aşağıdaki alanlardan otomatik olarak oluşturulacaktır.
            </Typography>

            {/* "Sınav Başlığı" alanı kaldırıldı */}
            <TextField name="course_name" label="Ders Adı" fullWidth margin="normal" value={examData.course_name} onChange={handleChange} required />
            <TextField name="year" label="Yıl" type="number" fullWidth margin="normal" value={examData.year} onChange={handleChange} required />
            <TextField name="semester" label="Dönem (Güz/Bahar)" fullWidth margin="normal" value={examData.semester} onChange={handleChange} required />

            {/* "Açıklama" alanı kaldırıldı */}
        </>
    );
};

// Adım 3: Soru Yükleme Bileşeni (Değişiklik yok)
const UploadQuestionsStep = ({ questions, setQuestions, status }) => {
    return (
        <>
            <Typography variant="h6" gutterBottom>Soruları Yükle</Typography>
            <Typography variant="body2" color="text.secondary">
                Soruları aşağıdaki JSON formatında yapıştırın.
            </Typography>
            <TextField
                label="Sorular (JSON Formatında)"
                fullWidth
                multiline
                rows={15}
                margin="normal"
                value={questions}
                onChange={(e) => setQuestions(e.target.value)}
                placeholder={`[
  {
    "question_text": "Örnek soru metni?",
    "answer": "Doğru cevap",
    "options": ["Doğru cevap", "Yanlış cevap 1", "Yanlış cevap 2"]
  }
]`}
            />
            {status.error && <Alert severity="error" sx={{ mt: 2 }}>{status.error}</Alert>}
            {status.success && <Alert severity="success" sx={{ mt: 2 }}>{status.success}</Alert>}
        </>
    );
};

// Ana Sayfa Bileşeni (Değişiklik var)
function AddContentPage() {
    const [token, setToken] = useState(null);
    const [loginError, setLoginError] = useState('');
    const [activeStep, setActiveStep] = useState(0);

    const [academicData, setAcademicData] = useState({
        selected: { university: null, department: null, classLevel: null },
        input: { university: '', department: '', classLevel: '' }
    });
    const [finalIds, setFinalIds] = useState({ universityId: null, departmentId: null, classLevelId: null });

    // "title" ve "description" başlangıç state'inden kaldırıldı
    const [examData, setExamData] = useState({ course_name: '', year: new Date().getFullYear(), semester: '' });
    const [questions, setQuestions] = useState('');

    const [loadingNext, setLoadingNext] = useState(false);
    const [submissionStatus, setSubmissionStatus] = useState({ success: '', error: '' });

    const secureAxios = axios.create({ baseURL: API_URL });
    if (token) {
        secureAxios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }

    const handleLogin = async (email, password) => {
        setLoginError('');
        try {
            const formData = new URLSearchParams();
            formData.append('username', email);
            formData.append('password', password);
            const response = await axios.post(`${API_URL}/auth/login`, formData, {
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            });
            setToken(response.data.access_token);
        } catch (err) {
            console.error(err);
            setLoginError(err.response?.data?.detail || "Giriş yapılamadı. Bilgilerinizi kontrol edin.");
        }
    };

    const handleNext = async () => {
        setLoadingNext(true);

        if (activeStep === 0) {
            try {
                let universityId = academicData.selected.university?.id;
                if (!universityId && academicData.input.university) {
                    const res = await secureAxios.post('/academics/universities', { name: academicData.input.university });
                    universityId = res.data.id;
                }

                let departmentId = academicData.selected.department?.id;
                if (!departmentId && academicData.input.department) {
                    const res = await secureAxios.post('/academics/departments', { name: academicData.input.department, university_id: universityId });
                    departmentId = res.data.id;
                }

                let classLevelId = academicData.selected.classLevel?.id;
                if (!classLevelId && academicData.input.classLevel) {
                    const res = await secureAxios.post('/academics/class-levels', { level: parseInt(academicData.input.classLevel), department_id: departmentId });
                    classLevelId = res.data.id;
                }

                if (!classLevelId) {
                    alert('Lütfen tüm akademik birimleri seçin veya yeni bir tane oluşturun.');
                    setLoadingNext(false);
                    return;
                }

                setFinalIds({ universityId, departmentId, classLevelId });
                setActiveStep(1);

            } catch (err) {
                console.error(err);
                alert('Birimler işlenirken bir hata oluştu: ' + (err.response?.data?.detail || err.message));
            }
        } else if (activeStep === 1) {
            setActiveStep(2);
        }

        setLoadingNext(false);
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    // Yükleme mantığı güncellendi
    const handleSubmit = async () => {
        setLoadingNext(true);
        setSubmissionStatus({ success: '', error: '' });
        try {
            // Adım 1: Yeni sınav başlığını oluştur
            const newTitle = `${examData.course_name} ${examData.year} ${examData.semester}`;

            // Adım 2: Sınavı bu yeni başlıkla oluştur
            const examPayload = {
                ...examData,
                title: newTitle, // Otomatik oluşturulan başlığı kullan
                description: '', // Açıklama alanı artık boş
                class_level_id: finalIds.classLevelId
            };
            const examRes = await secureAxios.post('/exams/', examPayload);
            const createdExamId = examRes.data.id;

            // Adım 3: Soruları yükle
            const questionsPayload = JSON.parse(questions);
            if (!Array.isArray(questionsPayload)) throw new Error('Format hatalı, bir dizi (array) olmalı.');
            await secureAxios.post(`/exams/${createdExamId}/upload-questions`, questionsPayload);

            setSubmissionStatus({ success: 'Sınav ve sorular başarıyla yüklendi!', error: '' });
            setTimeout(() => {
                window.location.reload();
            }, 2000);

        } catch (err) {
            console.error(err);
            setSubmissionStatus({ success: '', error: err.response?.data?.detail || 'Yükleme sırasında bir hata oluştu. JSON formatını kontrol edin.' });
        } finally {
            setLoadingNext(false);
        }
    };

    const isNextDisabled = () => {
        if (activeStep === 0) {
            return !academicData.selected.classLevel && !academicData.input.classLevel;
        }
        if (activeStep === 1) {
            return !examData.course_name || !examData.year || !examData.semester;
        }
        return false;
    }

    const getStepContent = (step) => {
        switch (step) {
            case 0: return <AcademicUnitStep academicData={academicData} setAcademicData={setAcademicData} />;
            case 1: return <ExamInfoStep examData={examData} setExamData={setExamData} />;
            case 2: return <UploadQuestionsStep questions={questions} setQuestions={setQuestions} status={submissionStatus} />;
            default: throw new Error('Unknown step');
        }
    };

    if (!token) {
        return <LoginForm onLogin={handleLogin} error={loginError} />;
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center">Sisteme Yeni İçerik Ekle</Typography>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                    {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                <React.Fragment>
                    {getStepContent(activeStep)}
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                        {activeStep !== 0 && (
                            <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }} disabled={loadingNext}>Geri</Button>
                        )}
                        {activeStep < steps.length - 1 ? (
                            <Button variant="contained" onClick={handleNext} disabled={loadingNext || isNextDisabled()} sx={{ mt: 3, ml: 1 }}>
                                {loadingNext ? <CircularProgress size={24} /> : 'İleri'}
                            </Button>
                        ) : (
                            <Button variant="contained" onClick={handleSubmit} disabled={loadingNext || !questions} sx={{ mt: 3, ml: 1 }}>
                                {loadingNext ? <CircularProgress size={24} /> : 'Yüklemeyi Tamamla'}
                            </Button>
                        )}
                    </Box>
                </React.Fragment>
            </Paper>
        </Container>
    );
}

export default AddContentPage;