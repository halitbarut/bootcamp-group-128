import { Routes, Route } from 'react-router-dom';
import { Container, ThemeProvider, CssBaseline } from '@mui/material';
import theme from './theme';
import AddContentPage from './pages/AddContentPage';

import HomePage from './pages/HomePage';
import ExamPage from './pages/ExamPage';
import MainLayout from './layouts/MainLayout';

function App() {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline /> {}
            <MainLayout> {}
                <Routes>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/exam/:examId" element={<ExamPage />} />
                    <Route path="/add-content" element={<AddContentPage />} />
                </Routes>
            </MainLayout>
        </ThemeProvider>
    );
}

export default App;