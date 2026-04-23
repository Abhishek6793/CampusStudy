import { render, screen } from '@testing-library/react';
import { AuthContext } from '../../context/AuthContext';
import Navbar from '../Navbar';
import { MemoryRouter } from 'react-router-dom';
import { Route, Routes } from 'react-router-dom';

describe('Navbar Component', () => {
  test('renders the Navbar with the correct title', () => {
    const mockUser = { name: 'Test User' };
    const mockLogout = jest.fn();

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
          <Navbar />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const titleElement = screen.getByText((content) => content.includes('CampusStudy'));
    expect(titleElement).toBeInTheDocument();
  });

  test('calls logout function when Logout button is clicked', () => {
    const mockUser = { name: 'Test User' };
    const mockLogout = jest.fn();

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
          <Navbar />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const logoutButton = screen.getByText('Logout');
    logoutButton.click();

    expect(mockLogout).toHaveBeenCalled();
  });

  test('renders Dashboard link with correct href', () => {
    const mockUser = { name: 'Test User' };
    const mockLogout = jest.fn();

    render(
      <MemoryRouter>
        <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
          <Navbar />
        </AuthContext.Provider>
      </MemoryRouter>
    );

    const dashboardLink = screen.getByText('Dashboard');
    expect(dashboardLink).toHaveAttribute('href', '/dashboard');
  });
});

describe('Navbar Integration Tests', () => {
  test('renders Navbar and navigates correctly', () => {
    const mockUser = { name: 'Test User' };
    const mockLogout = jest.fn();

    render(
      <MemoryRouter initialEntries={["/"]}>
        <AuthContext.Provider value={{ user: mockUser, logout: mockLogout }}>
          <Routes>
            <Route path="/" element={<Navbar />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
          </Routes>
        </AuthContext.Provider>
      </MemoryRouter>
    );

    // Verify Navbar is rendered
    const titleElement = screen.getByText((content) => content.includes('CampusStudy'));
    expect(titleElement).toBeInTheDocument();

    // Verify navigation to Dashboard
    const dashboardLink = screen.getByText('Dashboard');
    dashboardLink.click();
    const dashboardPage = screen.getByText('Dashboard Page');
    expect(dashboardPage).toBeInTheDocument();
  });
});