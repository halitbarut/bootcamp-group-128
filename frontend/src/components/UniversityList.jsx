import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, CircularProgress, Box } from '@mui/material';

function UniversityList({ universities, loading, error, onUniversitySelect }) {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" align="center">{error}</Typography>;

    return (
        <List>
            {universities.map((uni) => (
                <ListItem key={uni.id} disablePadding>
                    <ListItemButton onClick={() => onUniversitySelect(uni)}>
                        <ListItemText primary={uni.name} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

export default UniversityList;