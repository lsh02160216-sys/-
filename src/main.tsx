import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import VideosPage from './VideosPage.tsx';
import './index.css';

const isVideosPage = window.location.pathname.replace(/\/+$/, '') === '/videos';

createRoot(document.getElementById('root')!).render(isVideosPage ? <VideosPage /> : <App />);
