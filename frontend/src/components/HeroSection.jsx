import React, { useState } from 'react';
import { Button } from './ui/button';
import { Search } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setSearchedQuery } from '@/redux/jobSlice';
import { useNavigate } from 'react-router-dom';
import './HeroSection.css';

const HeroSection = () => {
  const [query, setQuery] = useState('');
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchJobHandler = () => {
    dispatch(setSearchedQuery(query));
    navigate('/browse');
  };

  return (
    <section className="hero">
      <div className="hero-content">
        <span className="hero-badge">🚀 No. 1 Job Hunt Platform</span>
        <h1 className="hero-title">
          Search, Apply & <br />
          Get Your <span className="highlight">Dream Jobs</span>
        </h1>
        <p className="hero-subtext">
          Discover thousands of remote & local jobs across India. Build your career with trusted companies.
        </p>

        <div className="hero-search">
          <input
            type="text"
            placeholder="Find your dream jobs"
            onChange={(e) => setQuery(e.target.value)}
            className="hero-input"
          />
          <Button onClick={searchJobHandler} className="hero-button">
            <Search className="hero-icon" />
          </Button>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
