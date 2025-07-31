import React from "react";
import { useSelector } from "react-redux";
import {
  Table, TableBody, TableCaption, TableCell,
  TableHead, TableHeader, TableRow
} from "./ui/table";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  CheckCircle, XCircle, Clock, Building, Calendar, FileText
} from "lucide-react";
import "./AppliedJobTable.css";
import { motion } from "framer-motion";

const AppliedJobTable = () => {
  const { allAppliedJobs } = useSelector((store) => store.job);

  const getStatusBadge = (status) => {
    switch (status?.toLowerCase()) {
      case "accepted":
        return (
          <Badge className="badge accepted">
            <CheckCircle className="icon" /> Accepted
          </Badge>
        );
      case "rejected":
        return (
          <Badge className="badge rejected">
            <XCircle className="icon" /> Rejected
          </Badge>
        );
      default:
        return (
          <Badge className="badge pending">
            <Clock className="icon" /> Pending
          </Badge>
        );
    }
  };

  const handleResumeView = (resumeUrl) => {
    if (resumeUrl) {
      window.open(resumeUrl, "_blank");
    }
  };

  return (
    <div className="applied-jobs-wrapper">
      <div className="table-header">
        <h2>Applied Jobs</h2>
        <p>Track your job application status</p>
      </div>

      <Table>
        <TableCaption className="table-caption">
          A list of your applied jobs and their current status
        </TableCaption>
        <TableHeader>
          <TableRow className="table-heading-row">
            <TableHead><Calendar className="icon" /> Date Applied</TableHead>
            <TableHead>Job Role</TableHead>
            <TableHead><Building className="icon" /> Company</TableHead>
            <TableHead>Resume</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {allAppliedJobs.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="no-data-cell">
                <div className="no-data-content">
                  <div className="no-data-icon">
                    <Clock className="no-data-clock" />
                  </div>
                  <p className="no-data-title">No applications yet</p>
                  <p className="no-data-subtext">Start applying to jobs to see them here</p>
                </div>
              </TableCell>
            </TableRow>
          ) : (
            allAppliedJobs.map((appliedJob) => (
              <motion.tr
                key={appliedJob._id}
                whileHover={{ scale: 1.01 }}
                className="table-data-row"
              >
                <TableCell>{new Date(appliedJob?.createdAt).toLocaleDateString("en-IN", {
                  year: "numeric", month: "short", day: "numeric"
                })}</TableCell>
                <TableCell>
                  <div className="job-role">{appliedJob.job?.title}</div>
                  <div className="job-location">{appliedJob.job?.location}</div>
                </TableCell>
                <TableCell>
                  <div className="company-cell">
                    <div className="company-logo">
                      {appliedJob.job?.company?.name?.charAt(0).toUpperCase()}
                    </div>
                    <span className="company-name">{appliedJob.job?.company?.name}</span>
                  </div>
                </TableCell>
                <TableCell>
                  {appliedJob.applicant?.profile?.resume ? (
                    <Button
                      onClick={() => handleResumeView(appliedJob.applicant.profile.resume)}
                      variant="outline"
                      size="sm"
                      className="resume-button"
                    >
                      <FileText className="icon" /> View Resume
                    </Button>
                  ) : (
                    <span className="no-resume">No Resume</span>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  {getStatusBadge(appliedJob.status)}
                </TableCell>
              </motion.tr>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default AppliedJobTable;
