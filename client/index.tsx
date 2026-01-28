import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'

import App from './app'
import VideoPlayerProvider from './player-provider'

createRoot(document.getElementById('root')!).render(
    <StrictMode>
        <VideoPlayerProvider>
            <App />
        </VideoPlayerProvider>
    </StrictMode>,
)