import React, {useEffect, useState} from 'react';
import {
    Card, CardContent, CardActions, Typography, Button, RadioGroup,
    FormControlLabel, Radio, FormControl, Alert, Box, CircularProgress
} from '@mui/material';

function QuestionCard({ question, onNextQuestion, questionNumber, totalQuestions, onExplainRequest, onSimilarQuestionRequest }) {
    const [selectedOption, setSelectedOption] = useState(null);
    const [isAnswered, setIsAnswered] = useState(false);
    const [isCorrect, setIsCorrect] = useState(false);
    const [aiResponse, setAiResponse] = useState('');
    const [aiLoading, setAiLoading] = useState(false);

    useEffect(() => {
        setSelectedOption(null);
        setIsAnswered(false);
        setIsCorrect(false);
        setAiResponse('');
        setAiLoading(false);
    }, [question]);

    const handleOptionChange = (event) => {
        if (!isAnswered) {
            setSelectedOption(event.target.value);
        }
    };

    const handleCheckAnswer = () => {
        if (!selectedOption) return;
        setIsAnswered(true);
        if (selectedOption === question.answer) {
            setIsCorrect(true);
        }
    };

    const handleExplain = async () => {
        setAiLoading(true);
        setAiResponse('');
        // Artık API isteğini kendisi yapmıyor, prop olarak gelen fonksiyonu çağırıyor
        const explanation = await onExplainRequest(question);
        setAiResponse(explanation);
        setAiLoading(false);
    }



    const handleSimilarQuestion = async () => {
        alert("Bu özellik henüz tam olarak entegre edilmemiştir.");
        // const newQuestion = await onSimilarQuestionRequest(question);
        // if (newQuestion) {
        //   // Burada yeni soruyu göstermek için bir mekanizma kurmak gerekir.
        //   // Örneğin bir modal (popup) içinde gösterebiliriz.
        //   // Şimdilik sadece konsola yazdıralım.
        //   console.log("Üretilen Benzer Soru:", newQuestion);
        //   alert(`Yeni Soru: ${newQuestion.text}`);
        // }
    }




    return (
        <Card sx={{ minWidth: 275 }}>
            {/* CardContent ve RadioGroup kısımları tamamen aynı */}
            <CardContent>
                {/* ... */}
            </CardContent>
            <CardActions>
                {!isAnswered ? (
                    <Button /* ... */>Cevabı Kontrol Et</Button>
                ) : (
                    <Button /* ... */>Sonraki Soru</Button>
                )}
                <Button size="small" onClick={handleExplain} disabled={!isAnswered || aiLoading}>
                    {aiLoading ? 'Açıklama Getiriliyor...' : 'Yapay Zekaya Açıklat'}
                </Button>
                <Button size="small" onClick={handleSimilarQuestion} disabled={!isAnswered}>Benzer Soru Üret</Button>
            </CardActions>
        </Card>
    );
}

export default QuestionCard;
