import React from 'react';
import { AppBar, Toolbar, Typography, Container } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';

function MainLayout({ children }) {
    return (
        <>
            <AppBar position="static" elevation={1}>
                <Toolbar>
                    <SchoolIcon sx={{ mr: 2 }} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Çıkmış Soru Platformu
                    </Typography>
                </Toolbar>
            </AppBar>
            <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
                <main>{children}</main>
            </Container>
        </>
    );
}

export default MainLayout;