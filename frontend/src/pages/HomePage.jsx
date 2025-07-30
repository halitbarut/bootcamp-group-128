import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Typography, Box } from '@mui/material';

import UniversityList from '../components/UniversityList';
import DepartmentList from '../components/DepartmentList';
import ClassLevelList from '../components/ClassLevelList';
import ExamList from '../components/ExamList';

const API_URL = 'http://127.0.0.1:8000';

function HomePage() {
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

    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchUniversities = async () => {
            setUniLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/academics/universities`);
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

    const handleUniversitySelect = async (university) => {
        setSelectedUniversity(university);
        setDepLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/academics/universities/${university.id}/departments`);
            setDepartments(response.data);
        } catch (err) {
            console.error("Bölümler getirilirken hata:", err);
            setError(err.response?.status === 404 ? "Bu üniversiteye ait bölüm bulunamadı." : "Bölümler yüklenemedi.");
            setDepartments([]);
        } finally {
            setDepLoading(false);
        }
    };

    const handleDepartmentSelect = async (department) => {
        setSelectedDepartment(department);
        setClassLevelLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_URL}/academics/departments/${department.id}/classes`);
            setClassLevels(response.data);
        } catch (err) {
            console.error("Sınıflar getirilirken hata:", err);
            setError(err.response?.status === 404 ? "Bu bölüme ait sınıf seviyesi bulunamadı." : "Sınıf seviyeleri yüklenemedi.");
            setClassLevels([]);
        } finally {
            setClassLevelLoading(false);
        }
    };

    const handleClassLevelSelect = async (classLevel) => {
        setSelectedClassLevel(classLevel);
        setExamLoading(true);
        setError(null);
        try {
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
            if (err.response && err.response.status === 404) {
                setExams([]);
            } else {
                setError("Sınavlar yüklenemedi.");
                setExams([]);
            }
        } finally {
            setExamLoading(false);
        }
    };

    const handleGoBack = () => {
        setError(null);
        if (selectedClassLevel) { setSelectedClassLevel(null); setExams([]); }
        else if (selectedDepartment) { setSelectedDepartment(null); setClassLevels([]); }
        else if (selectedUniversity) { setSelectedUniversity(null); setDepartments([]); }
    };

    const renderContent = () => {
        if (error) return <Typography color="error" align="center">{error}</Typography>;
        if (!selectedUniversity) return <UniversityList universities={universities} loading={uniLoading} onUniversitySelect={handleUniversitySelect} />;
        if (!selectedDepartment) return <DepartmentList departments={departments} loading={depLoading} onDepartmentSelect={handleDepartmentSelect} />;
        if (!selectedClassLevel) return <ClassLevelList classLevels={classLevels} loading={classLevelLoading} onClassLevelSelect={handleClassLevelSelect} />;
        return <ExamList exams={exams} loading={examLoading} />;
    };

    return (
        <>
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', flexWrap: 'wrap' }}>
                {selectedUniversity && (
                    <Button onClick={handleGoBack} variant="outlined" sx={{ mr: 2, mb: { xs: 2, sm: 0 } }}>
                        ← Geri Dön
                    </Button>
                )}
                <Typography variant="h4" component="h1">
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