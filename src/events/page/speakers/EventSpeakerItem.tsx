import * as React from 'react'
import { Speaker } from '../../../types'
import { Button, Grid, Link, Typography } from '@mui/material'
import { Edit } from '@mui/icons-material'

type EventSpeakerItemProps = {
    speaker: Speaker
}

export const EventSpeakerItem = ({ speaker }: EventSpeakerItemProps) => {
    return (
        <Grid
            container
            sx={{
                justifyContent: 'space-between',
                alignItems: 'center',
                marginTop: 1,
                marginBottom: 1,
                borderBottom: '1px solid #ddd',
            }}>
            <Grid item xs={6}>
                <Typography fontWeight="bold">{speaker.name}</Typography>

                <Typography variant="caption">
                    {speaker.jobTitle} • {speaker.company} •{' '}
                </Typography>
            </Grid>

            <Grid item xs={2} sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
                <Button href={`/speakers/${speaker.id}`} component={Link}>
                    <Edit />
                    Edit
                </Button>
            </Grid>
        </Grid>
    )
}
