// src/components/StatCard.js
import React from 'react';
import { Card, CardContent, Typography } from '@mui/material';

const StatCard = ({ title, value, icon }) => {
    return (
        <Card sx={{ height: '100%' }}>
            <CardContent>
                <Typography variant="h6" color="text.secondary" gutterBottom>
                    {title}
                </Typography>
                <Typography variant="h4" component="div">
                    {value}
                </Typography>
                {icon}
            </CardContent>
        </Card>
    );
};

export default StatCard;