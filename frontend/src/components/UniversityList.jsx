import React from 'react';
import { Grid, Card, CardActionArea, CardContent, Typography, Box, CircularProgress } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

function UniversityList({ universities, loading, error, onUniversitySelect }) {
    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}><CircularProgress /></Box>;
    if (error) return <Typography color="error" align="center">{error}</Typography>;

    return (
        <Grid container spacing={3}>
            {universities.map((uni) => (
                <Grid item xs={12} sm={6} md={4} key={uni.id}>
                    <Card>
                        <CardActionArea onClick={() => onUniversitySelect(uni)} sx={{ p: 2 }}>
                            <CardContent sx={{ textAlign: 'center' }}>
                                <SchoolIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
                                <Typography gutterBottom variant="h6" component="div">
                                    {uni.name}
                                </Typography>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
}

export default UniversityList;