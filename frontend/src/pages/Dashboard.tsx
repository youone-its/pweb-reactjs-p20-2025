import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const Dashboard = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/books');
  }, [navigate]);

  return null;
};

export default Dashboard;