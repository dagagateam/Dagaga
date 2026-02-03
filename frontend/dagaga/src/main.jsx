import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './styles/index.css'
import router from './router/router.jsx'
import './i18n';

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} />
)
