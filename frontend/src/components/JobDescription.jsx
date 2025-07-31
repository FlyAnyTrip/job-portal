"use client";

import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { APPLICATION_API_END_POINT, JOB_API_END_POINT } from "@/utils/constant";
import { setSingleJob } from "@/redux/jobSlice";
import Navbar from "./shared/Navbar";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import { ArrowLeft, MapPin, Clock, DollarSign, Users, Building } from "lucide-react";
import { motion } from "framer-motion";
import "./JobDescription.css";

const JobDescription = () => {
  const { singleJob } = useSelector((store) => store.job);
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { id: jobId } = useParams();

  const isInitiallyApplied = singleJob?.applications?.some(
    (app) => app.applicant === user?._id
  );
  const [isApplied, setIsApplied] = useState(isInitiallyApplied);
  const [loading, setLoading] = useState(false);

  const applyJobHandler = async () => {
    if (!user) {
      toast.error("Please login to apply for jobs");
      navigate("/login");
      return;
    }

    try {
      setLoading(true);
      const res = await axios.get(`${APPLICATION_API_END_POINT}/apply/${jobId}`, {
        withCredentials: true,
      });
      if (res.data.success) {
        setIsApplied(true);
        const updatedJob = {
          ...singleJob,
          applications: [...singleJob.applications, { applicant: user?._id }],
        };
        dispatch(setSingleJob(updatedJob));
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to apply");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await axios.get(`${JOB_API_END_POINT}/get/${jobId}`);
        if (res.data.success) {
          dispatch(setSingleJob(res.data.job));
          setIsApplied(
            res.data.job.applications.some((app) => app.applicant === user?._id)
          );
        }
      } catch {
        toast.error("Failed to fetch job details");
      }
    };
    fetchJob();
  }, [jobId, dispatch, user?._id]);

  if (!singleJob) {
    return (
      <div className="jobdesc-page">
        <Navbar />
        <div className="jobdesc-loading">
          <div className="spinner" />
          <p>Loading job details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="jobdesc-page">
      <Navbar />
      <motion.div
        className="jobdesc-container"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <Button
          onClick={() => navigate(-1)}
          variant="outline"
          className="jobdesc-back-btn"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <motion.div
          className="jobdesc-card"
          whileHover={{ scale: 1.01 }}
          transition={{ duration: 0.3 }}
        >
          <div className="jobdesc-header">
            <div className="jobdesc-logo-box">
              <Building className="w-8 h-8 text-white" />
            </div>
            <div className="jobdesc-title-section">
              <h1>{singleJob?.title}</h1>
              <p>{singleJob?.company?.name}</p>
              <div className="jobdesc-badges">
                <Badge>{singleJob?.position} Positions <Users className="icon" /></Badge>
                <Badge>₹{singleJob?.salary} LPA <DollarSign className="icon" /></Badge>
                <Badge>{singleJob?.jobType} <Clock className="icon" /></Badge>
                <Badge>{singleJob?.location} <MapPin className="icon" /></Badge>
              </div>
            </div>
            <Button
              onClick={!isApplied ? applyJobHandler : undefined}
              disabled={isApplied || loading}
              className={`jobdesc-apply-btn ${isApplied ? "applied" : ""}`}
            >
              {loading ? "Applying..." : isApplied ? "Already Applied" : "Apply Now"}
            </Button>
          </div>

          <div className="jobdesc-body">
            <h2>Job Description</h2>
            <div className="jobdesc-info-grid">
              <div>
                <strong>Role:</strong> {singleJob?.title}<br />
                <strong>Location:</strong> {singleJob?.location}<br />
                <strong>Experience:</strong> {singleJob?.experienceLevel} years<br />
                <strong>Salary:</strong> ₹{singleJob?.salary} LPA
              </div>
              <div>
                <strong>Total Applicants:</strong> {singleJob?.applications?.length || 0}<br />
                <strong>Posted:</strong> {new Date(singleJob?.createdAt).toLocaleDateString()}<br />
                <strong>Type:</strong> {singleJob?.jobType}
              </div>
            </div>
            <p className="jobdesc-text">{singleJob?.description}</p>

            {singleJob?.requirements?.length > 0 && (
              <>
                <h3>Requirements</h3>
                <div className="jobdesc-reqs">
                  {singleJob.requirements.map((req, i) => (
                    <Badge key={i} className="jobdesc-req-badge">{req}</Badge>
                  ))}
                </div>
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </div>
  );
};

export default JobDescription;
