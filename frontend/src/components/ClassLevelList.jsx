import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, Box } from '@mui/material';

function ClassLevelList({ classLevels, loading, error, onClassLevelSelect }) {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" align="center">{error}</Typography>;

    return (
        <>
            <Typography variant="h5" component="h2" gutterBottom>Sınıf Seviyeleri</Typography>
            <List>
                {classLevels.map((cls) => (
                    <ListItem key={cls.id} disablePadding>
                        <ListItemButton onClick={() => onClassLevelSelect(cls)}>
                            <ListItemText primary={`${cls.level}. Sınıf`} />
                        </ListItemButton>
                    </ListItem>
                ))}
            </List>
        </>
    );
}

export default ClassLevelList;