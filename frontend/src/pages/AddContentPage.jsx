import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Container, Stepper, Step, StepLabel, Box, Button, Typography, TextField,
    Select, MenuItem, FormControl, InputLabel, CircularProgress, Alert, Paper
} from '@mui/material';

import LoginForm from '../components/LoginForm';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
const steps = ['Akademik Birim Seç', 'Sınav Bilgilerini Gir', 'Soruları Yükle'];

function AddContentPage() {
    const [token, setToken] = useState(null);
    const [loginError, setLoginError] = useState('');

    const [activeStep, setActiveStep] = useState(0);
    const [selections, setSelections] = useState({ universityId: '', departmentId: '', classLevelId: '' });
    const [examData, setExamData] = useState({ title: '', description: '', course_name: '', year: new Date().getFullYear(), semester: '' });
    const [questions, setQuestions] = useState('');
    const [createdExamId, setCreatedExamId] = useState(null);

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

    const handleNextAndCreateExam = async () => {
        if (activeStep === 1) {
            try {
                const examPayload = { ...examData, class_level_id: selections.classLevelId };
                const response = await secureAxios.post(`/exams/`, examPayload);
                setCreatedExamId(response.data.id);
                setActiveStep((prev) => prev + 1);
            } catch (err) {
                alert('Sınav oluşturulurken hata oluştu: ' + (err.response?.data?.detail || err.message));
            }
        } else {
            setActiveStep((prev) => prev + 1);
        }
    };

    const handleBack = () => setActiveStep((prev) => prev - 1);

    const handleSubmit = async () => {
        try {
            const questionsPayload = JSON.parse(questions);
            if (!Array.isArray(questionsPayload)) throw new Error('Format hatalı, bir dizi (array) olmalı.');
            await secureAxios.post(`/exams/${createdExamId}/upload-questions`, questionsPayload);
        } catch (err) {
            console.error(err);
            throw err;
        }
    };

    const getStepContent = (step) => {
        switch (step) {
            case 0:
                return <AcademicUnitStep selections={selections} setSelections={setSelections} handleNext={handleNextAndCreateExam} />;
            case 1:
                return <ExamInfoStep examData={examData} setExamData={setExamData} handleNext={handleNextAndCreateExam} handleBack={handleBack} />;
            case 2:
                return <UploadQuestionsStep questions={questions} setQuestions={setQuestions} handleBack={handleBack} handleSubmit={handleSubmit} />;
            default:
                throw new Error('Unknown step');
        }
    };

    if (!token) {
        return <LoginForm onLogin={handleLogin} error={loginError} />;
    }

    return (
        <Container component="main" maxWidth="md" sx={{ mb: 4 }}>
            <Paper variant="outlined" sx={{ my: { xs: 3, md: 6 }, p: { xs: 2, md: 3 } }}>
                <Typography component="h1" variant="h4" align="center">
                    Sisteme Yeni İçerik Ekle
                </Typography>
                <Stepper activeStep={activeStep} sx={{ pt: 3, pb: 5 }}>
                    {steps.map((label) => <Step key={label}><StepLabel>{label}</StepLabel></Step>)}
                </Stepper>

                {getStepContent(activeStep)}
            </Paper>
        </Container>
    );
}

const AcademicUnitStep = ({ selections, setSelections, handleNext }) => {
    const [universities, setUniversities] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [classLevels, setClassLevels] = useState([]);
    const [loading, setLoading] = useState({ uni: true, dep: false, cls: false });

    useEffect(() => {
        axios.get(`${API_URL}/academics/universities`)
            .then(res => setUniversities(res.data))
            .catch(err => console.error(err))
            .finally(() => setLoading(prev => ({ ...prev, uni: false })));
    }, []);

    useEffect(() => {
        if (selections.universityId) {
            setLoading(prev => ({ ...prev, dep: true }));
            axios.get(`${API_URL}/academics/universities/${selections.universityId}/departments`)
                .then(res => setDepartments(res.data))
                .catch(err => { console.error(err); setDepartments([]); })
                .finally(() => setLoading(prev => ({ ...prev, dep: false })));
        }
    }, [selections.universityId]);

    useEffect(() => {
        if (selections.departmentId) {
            setLoading(prev => ({ ...prev, cls: true }));
            axios.get(`${API_URL}/academics/departments/${selections.departmentId}/classes`)
                .then(res => setClassLevels(res.data))
                .catch(err => { console.error(err); setClassLevels([]); })
                .finally(() => setLoading(prev => ({ ...prev, cls: false })));
        }
    }, [selections.departmentId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === 'universityId') setSelections({ universityId: value, departmentId: '', classLevelId: '' });
        else if (name === 'departmentId') setSelections(prev => ({ ...prev, departmentId: value, classLevelId: '' }));
        else setSelections(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>Akademik Birim Seçimi</Typography>
            <FormControl fullWidth margin="normal">
                <InputLabel>Üniversite</InputLabel>
                <Select name="universityId" value={selections.universityId} label="Üniversite" onChange={handleChange}>
                    {universities.map(u => <MenuItem key={u.id} value={u.id}>{u.name}</MenuItem>)}
                </Select>
            </FormControl>
            {loading.dep && <CircularProgress size={24} />}
            {selections.universityId && !loading.dep && (
                <FormControl fullWidth margin="normal" disabled={departments.length === 0}>
                    <InputLabel>Bölüm</InputLabel>
                    <Select name="departmentId" value={selections.departmentId} label="Bölüm" onChange={handleChange}>
                        {departments.map(d => <MenuItem key={d.id} value={d.id}>{d.name}</MenuItem>)}
                    </Select>
                </FormControl>
            )}
            {loading.cls && <CircularProgress size={24} />}
            {selections.departmentId && !loading.cls && (
                <FormControl fullWidth margin="normal" disabled={classLevels.length === 0}>
                    <InputLabel>Sınıf Seviyesi</InputLabel>
                    <Select name="classLevelId" value={selections.classLevelId} label="Sınıf Seviyesi" onChange={handleChange}>
                        {classLevels.map(c => <MenuItem key={c.id} value={c.id}>{c.level}. Sınıf</MenuItem>)}
                    </Select>
                </FormControl>
            )}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button variant="contained" onClick={handleNext} disabled={!selections.classLevelId} sx={{ mt: 3, ml: 1 }}>
                    İleri
                </Button>
            </Box>
        </>
    );
};

const ExamInfoStep = ({ examData, setExamData, handleNext, handleBack }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setExamData(prev => ({ ...prev, [name]: value }));
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>Sınav Bilgileri</Typography>
            <TextField name="title" label="Sınav Başlığı" fullWidth margin="normal" value={examData.title} onChange={handleChange} />
            <TextField name="course_name" label="Ders Adı" fullWidth margin="normal" value={examData.course_name} onChange={handleChange} />
            <TextField name="year" label="Yıl" type="number" fullWidth margin="normal" value={examData.year} onChange={handleChange} />
            <TextField name="semester" label="Dönem (Güz/Bahar)" fullWidth margin="normal" value={examData.semester} onChange={handleChange} />
            <TextField name="description" label="Açıklama" fullWidth margin="normal" multiline rows={2} value={examData.description} onChange={handleChange} />
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }}>Geri</Button>
                <Button variant="contained" onClick={handleNext} disabled={!examData.title || !examData.course_name} sx={{ mt: 3, ml: 1 }}>İleri</Button>
            </Box>
        </>
    );
};

const UploadQuestionsStep = ({ questions, setQuestions, handleBack, handleSubmit }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const onSubmit = async () => {
        setLoading(true);
        setError('');
        setSuccess('');
        try {
            await handleSubmit();
            setSuccess('Sorular başarıyla yüklendi!');
        } catch (err) {
            setError(err.response?.data?.detail || 'Bir hata oluştu. JSON formatını kontrol edin.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>Soruları Yükle</Typography>
            <Typography variant="body2" color="text.secondary">
                Soruları aşağıdaki JSON formatında yapıştırın. `question_text`, `answer` ve `options` alanları zorunludur.
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
]`}/>
            {error && <Alert severity="error" sx={{ mt: 2 }}>{error}</Alert>}
            {success && <Alert severity="success" sx={{ mt: 2 }}>{success}</Alert>}
            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button onClick={handleBack} sx={{ mt: 3, ml: 1 }} disabled={loading}>Geri</Button>
                <Button variant="contained" onClick={onSubmit} disabled={!questions || loading} sx={{ mt: 3, ml: 1 }}>
                    {loading ? <CircularProgress size={24} /> : 'Sınavı ve Soruları Yükle'}
                </Button>
            </Box>
        </>
    );
};

export default AddContentPage;