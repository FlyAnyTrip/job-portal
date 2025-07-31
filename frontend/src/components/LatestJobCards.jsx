import React from 'react';
import { Badge } from './ui/badge';
import { useNavigate } from 'react-router-dom';
import './LatestJobCards.css';

const LatestJobCards = ({ job }) => {
  const navigate = useNavigate();

  return (
    <div className="job-card">
      <div className="job-card-header">
        <div className="job-company-info">
          <img
            src={job?.company?.logo || '/default-logo.png'}
            alt={`${job?.company?.name} logo`}
            className="company-logo"
          />
          <div>
            <h1 className="company-name">{job?.company?.name}</h1>
            <p className="job-location">India</p>
          </div>
        </div>
        <button
          className="view-details-button"
          onClick={() => navigate(`/description/${job._id}`)}
        >
          View Details →
        </button>
      </div>

      <div className="job-title-section">
        <h1 className="job-title">{job?.title}</h1>
        <p className="job-description">{job?.description}</p>
      </div>

      <div className="job-badges">
        <Badge className="badge badge-blue" variant="ghost">
          {job?.position} Positions
        </Badge>
        <Badge className="badge badge-red" variant="ghost">
          {job?.jobType}
        </Badge>
        <Badge className="badge badge-purple" variant="ghost">
          {job?.salary} LPA
        </Badge>
      </div>
    </div>
  );
};

export default LatestJobCards;
