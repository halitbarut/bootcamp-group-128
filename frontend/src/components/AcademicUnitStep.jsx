import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Box, Typography, Autocomplete, TextField, CircularProgress } from '@mui/material';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

function AcademicUnitStep({ academicData, setAcademicData }) {
    const [options, setOptions] = useState({ universities: [], departments: [], classLevels: [] });
    const [loading, setLoading] = useState({ uni: true, dep: false, cls: false });

    // Başlangıçta tüm üniversiteleri yükle
    useEffect(() => {
        axios.get(`${API_URL}/academics/universities`)
            .then(res => setOptions(prev => ({ ...prev, universities: res.data })))
            .catch(err => console.error(err))
            .finally(() => setLoading(prev => ({ ...prev, uni: false })));
    }, []);

    // Üniversite seçildiğinde veya temizlendiğinde bölümleri yükle/sıfırla
    useEffect(() => {
        const selectedUni = academicData.selected.university;
        if (selectedUni && selectedUni.id) {
            setLoading(prev => ({ ...prev, dep: true }));
            axios.get(`${API_URL}/academics/universities/${selectedUni.id}/departments`)
                .then(res => setOptions(prev => ({ ...prev, departments: res.data })))
                .catch(err => { console.error(err); setOptions(prev => ({ ...prev, departments: [] })); })
                .finally(() => setLoading(prev => ({ ...prev, dep: false })));
        } else {
            setOptions(prev => ({ ...prev, departments: [], classLevels: [] }));
        }
    }, [academicData.selected.university]);

    // Bölüm seçildiğinde veya temizlendiğinde sınıfları yükle/sıfırla
    useEffect(() => {
        const selectedDep = academicData.selected.department;
        if (selectedDep && selectedDep.id) {
            setLoading(prev => ({ ...prev, cls: true }));
            axios.get(`${API_URL}/academics/departments/${selectedDep.id}/classes`)
                .then(res => setOptions(prev => ({ ...prev, classLevels: res.data })))
                .catch(err => { console.error(err); setOptions(prev => ({ ...prev, classLevels: [] })); })
                .finally(() => setLoading(prev => ({ ...prev, cls: false })));
        } else {
            setOptions(prev => ({ ...prev, classLevels: [] }));
        }
    }, [academicData.selected.department]);

    const handleSelectionChange = (field, value) => {
        const newSelected = { ...academicData.selected, [field]: value };
        // Bir üst seviye temizlendiğinde alt seviyeleri de temizle
        if (field === 'university') {
            newSelected.department = null;
            newSelected.classLevel = null;
        } else if (field === 'department') {
            newSelected.classLevel = null;
        }
        setAcademicData(prev => ({ ...prev, selected: newSelected }));
    };

    const handleInputChange = (field, value) => {
        setAcademicData(prev => ({ ...prev, input: { ...prev.input, [field]: value } }));
    };

    return (
        <>
            <Typography variant="h6" gutterBottom>Akademik Birim Seçimi</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                Listede olmayan birim adını yazarak yeni kayıt oluşturabilirsiniz.
            </Typography>

            <Autocomplete
                freeSolo // <-- 1. KRİTİK DEĞİŞİKLİK
                options={options.universities}
                getOptionLabel={(option) => option.name || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={academicData.selected.university}
                onChange={(event, newValue) => handleSelectionChange('university', newValue)}
                inputValue={academicData.input.university}
                onInputChange={(event, newInputValue) => handleInputChange('university', newInputValue)}
                loading={loading.uni}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Üniversite Adı"
                        margin="normal"
                        InputProps={{ ...params.InputProps, endAdornment: <>{loading.uni ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</> }}
                    />
                )}
            />

            <Autocomplete
                freeSolo // <-- 2. KRİTİK DEĞİŞİKLİK
                options={options.departments}
                getOptionLabel={(option) => option.name || ""}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={academicData.selected.department}
                onChange={(event, newValue) => handleSelectionChange('department', newValue)}
                inputValue={academicData.input.department}
                onInputChange={(event, newInputValue) => handleInputChange('department', newInputValue)}
                loading={loading.dep}
                disabled={!academicData.selected.university && !academicData.input.university}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Bölüm Adı"
                        margin="normal"
                        InputProps={{ ...params.InputProps, endAdornment: <>{loading.dep ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</> }}
                    />
                )}
            />

            <Autocomplete
                freeSolo // <-- 3. KRİTİK DEĞİŞİKLİK
                options={options.classLevels}
                getOptionLabel={(option) => `${option.level || ""}. Sınıf`}
                isOptionEqualToValue={(option, value) => option.id === value.id}
                value={academicData.selected.classLevel}
                onChange={(event, newValue) => handleSelectionChange('classLevel', newValue)}
                inputValue={academicData.input.classLevel}
                onInputChange={(event, newInputValue) => handleInputChange('classLevel', newInputValue.replace(/\D/g, ''))} // Sadece sayı girilmesine izin ver
                loading={loading.cls}
                disabled={!academicData.selected.department && !academicData.input.department}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Sınıf Seviyesi"
                        margin="normal"
                        InputProps={{ ...params.InputProps, endAdornment: <>{loading.cls ? <CircularProgress color="inherit" size={20} /> : null}{params.InputProps.endAdornment}</> }}
                    />
                )}
            />
        </>
    );
}

export default AcademicUnitStep;