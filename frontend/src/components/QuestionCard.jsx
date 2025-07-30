import React, { useState, useEffect } from 'react';
import {
    Card, CardContent, CardActions, Typography, Button, RadioGroup,
    FormControlLabel, Radio, FormControl, Alert, Box, CircularProgress, Divider, CardHeader
} from '@mui/material';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

function QuestionCard({ question, onNextQuestion, questionNumber, totalQuestions, onExplainRequest, onSimilarQuestionRequest, isSimilarLoading, onAnswerSubmit }) {
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

        const correct = selectedOption === question.answer;
        setIsCorrect(correct);
        setIsAnswered(true);

        onAnswerSubmit(question.id, correct);
    };

    const handleExplain = async () => {
        setAiLoading(true);
        setAiResponse('');
        const explanation = await onExplainRequest(question, selectedOption);
        setAiResponse(explanation);
        setAiLoading(false);
    };

    const handleSimilarQuestion = async () => {
        await onSimilarQuestionRequest(question);
    };

    return (
        <Card elevation={3}>
            <CardHeader
                title={`Soru ${questionNumber} / ${totalQuestions}`}
                titleTypographyProps={{ variant: 'subtitle1', color: 'text.secondary' }}
            />
            <Divider />
            <CardContent sx={{ p: 3 }}>
                <Typography variant="h5" component="div" sx={{ mb: 3 }}>
                    {question.question_text}
                </Typography>
                <FormControl component="fieldset" sx={{ width: '100%' }}>
                    <RadioGroup value={selectedOption} onChange={handleOptionChange}>
                        {question.options?.map((option, index) => (
                            <FormControlLabel
                                key={index}
                                value={option}
                                control={<Radio />}
                                label={option}
                                sx={{
                                    '&.Mui-disabled': { cursor: 'default' },
                                    borderRadius: 1, p: 1, mb: 1,
                                    backgroundColor: isAnswered ? (question.answer === option ? 'rgba(76, 175, 80, 0.1)' : (selectedOption === option ? 'rgba(211, 47, 47, 0.1)' : 'transparent')) : 'transparent',
                                }}
                                disabled={isAnswered}
                            />
                        ))}
                    </RadioGroup>
                </FormControl>
                {isAnswered && (
                    <Alert severity={isCorrect ? "success" : "error"} sx={{ mt: 2 }}>
                        {isCorrect ? "Doğru Cevap!" : `Yanlış! Doğru cevap: ${question.answer}`}
                    </Alert>
                )}
                {aiLoading && <Box sx={{display: 'flex', justifyContent: 'center', mt: 3}}><CircularProgress /></Box>}
                {aiResponse && (
                    <Box sx={{mt: 3, p: 2, backgroundColor: 'background.default', borderRadius: 1}}>
                        <Typography variant="body1" sx={{whiteSpace: 'pre-wrap'}}>{aiResponse}</Typography>
                    </Box>
                )}
            </CardContent>
            <Divider />
            <CardActions sx={{ p: 2, justifyContent: 'space-between', backgroundColor: 'background.default' }}>
                <Box>
                    {!isAnswered ? (
                        <Button size="large" variant="contained" onClick={handleCheckAnswer} disabled={!selectedOption}>Cevabı Kontrol Et</Button>
                    ) : (
                        <Button size="large" variant="contained" onClick={onNextQuestion}>
                            {questionNumber === totalQuestions ? 'Sınavı Bitir' : 'Sonraki Soru'}
                        </Button>
                    )}
                </Box>
                <Box>
                    <Button size="small" startIcon={<LightbulbIcon />} onClick={handleExplain} disabled={!isAnswered || aiLoading}>
                        {aiLoading ? 'Açıklanıyor...' : 'Açıklat'}
                    </Button>
                    <Button size="small" startIcon={<ContentCopyIcon />} onClick={handleSimilarQuestion} disabled={!isAnswered || isSimilarLoading}>
                        {isSimilarLoading ? 'Üretiliyor...' : 'Benzer Soru'}
                    </Button>
                </Box>
            </CardActions>
        </Card>
    );
}

export default QuestionCard;