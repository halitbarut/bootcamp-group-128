import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import axios from 'axios';
import { Box, Typography, Button, Paper, CircularProgress, Stack } from '@mui/material';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import ReplayIcon from '@mui/icons-material/Replay';
import HomeIcon from '@mui/icons-material/Home';

import QuestionCard from '../components/QuestionCard';
import SimilarQuestionModal from "../components/SimilarQuestionModal";

const API_URL = 'http://127.0.0.1:8000';

function ExamPage() {
    const { examId } = useParams();
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isExamFinished, setIsExamFinished] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [similarQuestionData, setSimilarQuestionData] = useState(null);
    const [similarQuestionLoading, setSimilarQuestionLoading] = useState(false);
    const [results, setResults] = useState([]);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/exams/${examId}/questions`);
                const parsedQuestions = response.data.map(q => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || [])
                }));
                setQuestions(parsedQuestions);
            } catch (err) {
                console.error("Sorular getirilirken hata:", err);
                setError(err.response?.status === 404 ? "Bu sınav için soru bulunamadı." : "Sorular yüklenirken bir hata oluştu.");
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();
        setCurrentQuestionIndex(0);
        setIsExamFinished(false);
        setResults([]);
    }, [examId]);

    const handleNextQuestion = () => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            setIsExamFinished(true);
        }
    };

    const handleAnswerSubmit = (questionId, isCorrect) => {
        setResults(prevResults => [...prevResults, { questionId, isCorrect }]);
    };

    const handleRetry = () => {
        setResults([]);
        setCurrentQuestionIndex(0);
        setIsExamFinished(false);
    };

    const handleExplainRequest = async (question) => {
        try {
            const requestBody = {
                question: question.question_text,
                options: question.options.map((opt, index) => ({
                    options: String.fromCharCode(65 + index),
                    text: opt
                })),
                correct_answer: question.answer,
                user_answer: null
            };
            const response = await axios.post(`${API_URL}/exams/explain-question`, requestBody);
            return response.data.explanation;
        } catch (err) {
            console.error("Açıklama istenirken hata:", err);
            if (err.response) console.error("Hata Detayı:", err.response.data);
            return "Yapay zekadan açıklama alınamadı.";
        }
    };

    const handleSimilarQuestionRequest = async (question) => {
        setSimilarQuestionLoading(true);
        try {
            const optionsString = question.options
                .map((opt, index) => `${String.fromCharCode(65 + index)}) ${opt}`)
                .join('\n');

            const fullQuestionString = `Soru: ${question.question_text}\nSeçenekler:\n${optionsString}`;

            const requestBody = {
                original_question: fullQuestionString
            };
            const response = await axios.post(`${API_URL}/exams/generate-similar-question`, requestBody);
            setSimilarQuestionData(response.data);
            setIsModalOpen(true);
        } catch(err) {
            console.error("Benzer soru istenirken hata:", err);
            if (err.response) console.error("Hata Detayı:", err.response.data.detail);
            alert("Benzer soru üretilirken bir hata oluştu.");
        } finally {
            setSimilarQuestionLoading(false);
        }
    };

    if (loading) {
        return <Box sx={{ display: 'flex', justifyContent: 'center', mt: 5 }}><CircularProgress /></Box>;
    }

    if (error) {
        return <Typography color="error" align="center">{error} <Button component={RouterLink} to="/">Ana Sayfaya Dön</Button></Typography>;
    }

    if (isExamFinished) {
        const correctCount = results.filter(r => r.isCorrect).length;
        const wrongCount = questions.length - correctCount;

        return (
            <Paper sx={{p: 4, textAlign: 'center'}}>
                <Typography variant="h4" gutterBottom>Sınav Tamamlandı!</Typography>
                <Typography variant="h6" sx={{mt: 3}}>Sonuçlarınız:</Typography>

                <Stack direction="row" spacing={4} justifyContent="center" sx={{ my: 4 }}>
                    <Box>
                        <Typography variant="h4" color="success.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CheckCircleOutlineIcon fontSize="large" /> {correctCount}
                        </Typography>
                        <Typography color="text.secondary">Doğru</Typography>
                    </Box>
                    <Box>
                        <Typography variant="h4" color="error.main" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <HighlightOffIcon fontSize="large" /> {wrongCount}
                        </Typography>
                        <Typography color="text.secondary">Yanlış</Typography>
                    </Box>
                </Stack>

                <Stack direction="row" spacing={2} justifyContent="center">
                    <Button variant="outlined" startIcon={<ReplayIcon />} onClick={handleRetry}>
                        Yeniden Dene
                    </Button>
                    <Button component={RouterLink} to="/" variant="contained" startIcon={<HomeIcon />}>
                        Ana Sayfaya Dön
                    </Button>
                </Stack>
            </Paper>
        );
    }

    if (questions.length === 0) {
        return <Typography align="center">Bu sınav için soru bulunamadı. <Button component={RouterLink} to="/">Ana Sayfaya Dön</Button></Typography>;
    }

    const currentQuestion = questions[currentQuestionIndex];


    return (
        <>
            <QuestionCard
                key={currentQuestion.id}
                question={currentQuestion}
                onNextQuestion={handleNextQuestion}
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={questions.length}
                onExplainRequest={handleExplainRequest}
                onSimilarQuestionRequest={handleSimilarQuestionRequest}
                onAnswerSubmit={handleAnswerSubmit}
                isSimilarLoading={similarQuestionLoading}
            />
            <SimilarQuestionModal
                open={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                questionData={similarQuestionData}
            />
        </>
    );
}

export default ExamPage;