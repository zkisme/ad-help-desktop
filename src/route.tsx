
import { RouteObject } from 'react-router-dom'
import App from '@/App'
import Layout from './layouts/Layout'
import BatchExtractID from '@/pages/files/Rename1'
import { lazy } from 'react'

export const routes:RouteObject[] = [
  {
    path: '/',
    element: <Layout />,
    children: [
      {
        index: true,
        element: <App />
      },

      // files
      {
        path: '/files',
        children: [
          {
            index: true,
            lazy: () => import('@/pages/files/Rename1')
          },
          {
            path: 'rename',
            element: <BatchExtractID />
          }
        ]
      }
    ]
  }
]