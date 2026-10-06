import { createBrowserRouter, Navigate } from 'react-router-dom';
import { App } from '../App';
import { RoomsPage } from '../pages/RoomsPage/RoomsPage';
import { RoomDetailsPage } from '../pages/RoomDetailsPage/RoomDetailsPage';
import { BookingsPage } from '../pages/BookingsPage/BookingsPage';
import { NotFoundPage } from '../pages/NotFoundPage/NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Navigate to="/rooms" replace /> },
      { path: 'rooms', element: <RoomsPage /> },
      { path: 'rooms/:roomId', element: <RoomDetailsPage /> },
      { path: 'bookings', element: <BookingsPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);