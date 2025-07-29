import { Routes, Route } from 'react-router-dom';
import { Typography, AppBar, Toolbar, Container } from '@mui/material';

import HomePage from './pages/HomePage';
import ExamPage from './pages/ExamPage';

function App() {
    return (
        <div>
            <AppBar position="static">
                <Toolbar>
                    <Typography variant="h6" component="div">
                        Çıkmış Soru Platformu
                    </Typography>
                </Toolbar>
            </AppBar>

            <main>
                <Container maxWidth="md" sx={{ mt: 4 }}>
                    <Routes>
                        <Route path="/" element={<HomePage />} />
                        <Route path="/exam/:examId" element={<ExamPage />} />
                    </Routes>
                </Container>
            </main>
        </div>
    );
}

export default App;