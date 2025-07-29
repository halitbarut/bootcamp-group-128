import React from 'react';
import { List, ListItem, ListItemButton, ListItemText, Typography, CircularProgress, Box } from '@mui/material';

function DepartmentList({ departments, loading, error, onDepartmentSelect }) {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" align="center">{error}</Typography>;

    return (
        <List>
            {departments.map((dep) => (
                <ListItem key={dep.id} disablePadding>
                    <ListItemButton onClick={() => onDepartmentSelect(dep)}>
                        <ListItemText primary={dep.name} />
                    </ListItemButton>
                </ListItem>
            ))}
        </List>
    );
}

export default DepartmentList;