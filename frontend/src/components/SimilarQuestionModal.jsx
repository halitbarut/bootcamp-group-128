import React from 'react';
import { Modal, Box, Typography, List, ListItem, ListItemText, Button, Paper, Divider, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import QuizIcon from '@mui/icons-material/Quiz';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


const style = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: { xs: '90%', sm: 500 },
    bgcolor: 'background.paper',
    boxShadow: 24,
    borderRadius: 2,
    p: 0,
};

function SimilarQuestionModal({ open, onClose, questionData }) {
    if (!questionData) {
        return null;
    }

    return (
        <Modal
            open={open}
            onClose={onClose}
            aria-labelledby="similar-question-title"
        >
            <Paper sx={style}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1}}>
                        <QuizIcon color="primary"/>
                        <Typography id="similar-question-title" variant="h6" component="h2">
                            Benzer Soru Önerisi
                        </Typography>
                    </Box>
                    <IconButton onClick={onClose} aria-label="kapat">
                        <CloseIcon />
                    </IconButton>
                </Box>
                <Divider />
                <Box sx={{ p: 3 }}>
                    <Typography variant="body1" sx={{ mb: 2 }}>
                        {questionData.question}
                    </Typography>
                    <List dense>
                        {Array.isArray(questionData.options) && questionData.options.map((opt, index) => (
                            <ListItem key={opt.key || index} sx={{ p: 0 }}>
                                <ListItemText primary={`${opt.options || opt.key}) ${opt.text}`} />
                            </ListItem>
                        ))}
                    </List>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 2, p: 1.5, bgcolor: 'success.lighter', borderRadius: 1 }}>
                        <CheckCircleIcon color="success" />
                        <Typography color="success.dark" variant="body1">
                            <b>Doğru Cevap:</b> {questionData.correct_ans}
                        </Typography>
                    </Box>
                </Box>
                <Divider />
                <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
                    <Button onClick={onClose}>Kapat</Button>
                </Box>
            </Paper>
        </Modal>
    );
}

export default SimilarQuestionModal;