import React, {useState, useEffect} from 'react';
import {useParams, Link as RouterLink} from 'react-router-dom';
import axios from 'axios';
import {Box, Typography, Button, Paper} from '@mui/material';
import QuestionCard from '../components/QuestionCard';

const API_URL = 'http://127.0.0.1:8000';

function ExamPage() {
    const {examId} = useParams();
    const [examTitle, setExamTitle] = useState('');
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [isExamFinished, setIsExamFinished] = useState(false);

    useEffect(() => {
        const fetchQuestions = async () => {
            setLoading(true);
            setError(null);
            try {
                const response = await axios.get(`${API_URL}/exams/${examId}/questions`);

                const parsedQuestions = response.data.map(q => ({
                    ...q,
                    options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
                }));
                setQuestions(parsedQuestions);
            } catch (err) {
                console.error("Sorular getirilirken hata:", err);
                if (err.response && err.response.status === 404) {
                    setError("Bu sınav için soru bulunamadı.");
                } else {
                    setError("Sorular yüklenirken bir hata oluştu.");
                }
                setQuestions([]);
            } finally {
                setLoading(false);
            }
        };
        fetchQuestions();

        setCurrentQuestionIndex(0);
        setIsExamFinished(false);

    }, [examId]);

    const handleNextQuestion = () => {
        const nextIndex = currentQuestionIndex + 1;
        if (nextIndex < questions.length) {
            setCurrentQuestionIndex(nextIndex);
        } else {
            setIsExamFinished(true);
        }
    };

    // 2. Yapay Zeka fonksiyonları
    const handleExplainRequest = async (question) => {
        try {
            const requestBody = {
                question_text: question.text,
                options: question.options,
                // user_answer ve correct_answer backend tarafından isteniyorsa eklenmeli
            };
            const response = await axios.post(`${API_URL}/exams/explain-question`, requestBody);
            return response.data.explanation; // Açıklama metnini döndür
        } catch (err) {
            console.error("Açıklama istenirken hata:", err);
            return "Yapay zekadan açıklama alınırken bir hata oluştu.";
        }
    };

    const handleSimilarQuestionRequest = async (question) => {
        try {
            const requestBody = {
                original_question: {
                    question: question.text,
                    options: question.options,
                    answer: question.answer
                }
            };
            const response = await axios.post(`${API_URL}/exams/generate-similar-question`, requestBody);
            // Backend'den gelen yeni soru formatını QuestionCard'ın anlayacağı hale getir
            const newQuestion = {
                text: response.data.question,
                options: response.data.options.map(opt => opt.text),
                answer: response.data.correct_ans
            };
            return newQuestion;
        } catch (err) {
            console.error("Benzer soru istenirken hata:", err);
            return null;
        }
    }

    if (loading) return <div>Sınav Yükleniyor...</div>;
    if (error) return <div>{error} <Button component={RouterLink} to="/">Ana Sayfaya Dön</Button></div>;
    if (questions.length === 0 && !loading) return <div>Bu sınav için soru bulunamadı. <Button component={RouterLink} to="/">Ana Sayfaya Dön</Button></div>;

    if (isExamFinished) {
        return (
            <Paper sx={{p: 4, textAlign: 'center'}}>
                <Typography variant="h4">Sınav Tamamlandı!</Typography>
                <Typography sx={{mt: 2}}>Tebrikler, {questions.length} soruluk sınavı bitirdiniz.</Typography>
                <Button component={RouterLink} to="/" variant="contained" sx={{mt: 3}}>
                    Ana Sayfaya Dön
                </Button>
            </Paper>
        );
    }

    const currentQuestion = questions[currentQuestionIndex];

    return (
        <QuestionCard
            key={currentQuestion.id}
            question={currentQuestion}
            onNextQuestion={handleNextQuestion}
            questionNumber={currentQuestionIndex + 1}
            totalQuestions={questions.length}
            onExplainRequest={handleExplainRequest}
            onSimilarQuestionRequest={handleSimilarQuestionRequest}
        />
    );
}

export default ExamPage;