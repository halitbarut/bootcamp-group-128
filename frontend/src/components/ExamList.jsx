import React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, Box } from '@mui/material';

function ExamList({ exams, loading, error }) {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" align="center">{error}</Typography>;
    if (exams.length === 0) return <Typography align="center">Bu seçim için gösterilecek sınav bulunamadı.</Typography>;

    return (
        <List>
            {exams.map((exam) => (
                <ListItem
                    key={exam.id}
                    disablePadding
                    component={RouterLink}
                    to={`/exam/${exam.id}`}
                    sx={{ color: 'inherit', textDecoration: 'none' }}
                >
                    <ListItemButton>
                        <ListItemText primary={exam.title} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

export default ExamList;