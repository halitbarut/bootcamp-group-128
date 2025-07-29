import React, { useState, useEffect } from 'react';
import axios from 'axios'; // axios'u import ettiğimizden emin olalım
import { Container, Button, Typography, Box } from '@mui/material';

import UniversityList from '../components/UniversityList';
import DepartmentList from '../components/DepartmentList';
import ClassLevelList from '../components/ClassLevelList';
import ExamList from '../components/ExamList';

// API'mizin ana adresini tanımlayalım
const API_URL = 'http://127.0.0.1:8000';

function HomePage() {
    // Tüm state'ler aynı kalıyor
    const [universities, setUniversities] = useState([]);
    const [uniLoading, setUniLoading] = useState(true);
    const [selectedUniversity, setSelectedUniversity] = useState(null);

    const [departments, setDepartments] = useState([]);
    const [depLoading, setDepLoading] = useState(false);
    const [selectedDepartment, setSelectedDepartment] = useState(null);

    const [classLevels, setClassLevels] = useState([]);
    const [classLevelLoading, setClassLevelLoading] = useState(false);
    const [selectedClassLevel, setSelectedClassLevel] = useState(null);

    const [exams, setExams] = useState([]);
    const [examLoading, setExamLoading] = useState(false);

    // Genel hata yönetimi için bir state
    const [error, setError] = useState(null);

    // 1. Üniversiteleri getirme
    useEffect(() => {
        const fetchUniversities = async () => {
            setUniLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/exams/universities`);
                setUniversities(response.data);
            } catch (err) {
                console.error("Üniversiteler getirilirken hata:", err);
                setError("Üniversiteler yüklenemedi.");
            } finally {
                setUniLoading(false);
            }
        };
        fetchUniversities();
    }, []);

    // 2. Üniversite seçildiğinde bölümleri getir
    const handleUniversitySelect = async (university) => {
        setSelectedUniversity(university);
        setDepLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/exams/universities/${university.id}/departments`);
            setDepartments(response.data);
        } catch (err) {
            console.error("Bölümler getirilirken hata:", err);
            setError("Bölümler yüklenemedi.");
            setDepartments([]); // Hata durumunda listeyi boşalt
        } finally {
            setDepLoading(false);
        }
    };

    // 3. Bölüm seçildiğinde sınıfları getir
    const handleDepartmentSelect = async (department) => {
        setSelectedDepartment(department);
        setClassLevelLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/exams/departments/${department.id}/classes`);
            setClassLevels(response.data);
        } catch (err) {
            console.error("Sınıflar getirilirken hata:", err);
            setError("Sınıf seviyeleri yüklenemedi.");
            setClassLevels([]);
        } finally {
            setClassLevelLoading(false);
        }
    };

    // 4. Sınıf seçildiğinde sınavları getir
    const handleClassLevelSelect = async (classLevel) => {
        setSelectedClassLevel(classLevel);
        setExamLoading(true);
        setError(null);
        try {
            // Backend'deki yeni /exams/ endpoint'ini kullanıyoruz
            // Gerekli parametreleri gönderiyoruz
            const response = await axios.get(`${API_URL}/exams/`, {
                params: {
                    university_id: selectedUniversity.id,
                    department_id: selectedDepartment.id,
                    class_level: classLevel.level
                }
            });
            setExams(response.data);
        } catch (err) {
            console.error("Sınavlar getirilirken hata:", err);
            // Backend 404 döndüğünde bu bir hata değil, "bulunamadı" durumudur.
            if (err.response && err.response.status === 404) {
                setExams([]); // Sınav yoksa listeyi boşalt
            } else {
                setError("Sınavlar yüklenemedi.");
                setExams([]);
            }
        } finally {
            setExamLoading(false);
        }
    };

    // Geri dönme mantığı aynı kalıyor
    const handleGoBack = () => {
        setError(null); // Geri dönerken hata mesajını temizle
        if (selectedClassLevel) { setSelectedClassLevel(null); setExams([]); }
        else if (selectedDepartment) { setSelectedDepartment(null); setClassLevels([]); }
        else if (selectedUniversity) { setSelectedUniversity(null); setDepartments([]); }
    };

    const renderContent = () => {
        // Hata varsa, içeriği göstermeden önce hatayı göster
        if (error) return <Typography color="error" align="center">{error}</Typography>;

        if (!selectedUniversity) return <UniversityList universities={universities} loading={uniLoading} onUniversitySelect={handleUniversitySelect} />;
        if (!selectedDepartment) return <DepartmentList departments={departments} loading={depLoading} onDepartmentSelect={handleDepartmentSelect} />;
        if (!selectedClassLevel) return <ClassLevelList classLevels={classLevels} loading={classLevelLoading} onClassLevelSelect={handleClassLevelSelect} />;
        return <ExamList exams={exams} loading={examLoading} />;
    };

    return (
        // Return bloğu tamamen aynı kalıyor
        <>
            <Box sx={{ mb: 2 }}>
                {selectedUniversity && ( <Button onClick={handleGoBack} variant="outlined"> ← Geri Dön </Button> )}
                <Typography variant="h4" component="h1" sx={{ mt: 2 }}>
                    {selectedUniversity ? selectedUniversity.name : "Üniversiteler"}
                    {selectedDepartment ? ` / ${selectedDepartment.name}` : ''}
                    {selectedClassLevel ? ` / ${selectedClassLevel.level}. Sınıf` : ''}
                </Typography>
            </Box>
            {renderContent()}
        </>
    );
}

export default HomePage;