import { Request, Response } from 'express';
import JobApplication from '../models/jobApplication.model';

// POST /api/careers/apply
export const submitJobApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, phone, jobTitle, department, experience, portfolioUrl, resumeUrl, coverLetter } = req.body;

    if (!name || !email || !phone || !jobTitle) {
      res.status(400).json({ success: false, message: 'Please fill in all required fields (name, email, phone, jobTitle).' });
      return;
    }

    const application = await JobApplication.create({
      name,
      email,
      phone,
      jobTitle,
      department: department || 'General',
      experience: experience || 'Mid Level',
      portfolioUrl: portfolioUrl || '',
      resumeUrl: resumeUrl || '',
      coverLetter: coverLetter || '',
      status: 'pending',
    });

    res.status(201).json({
      success: true,
      message: 'Job application submitted successfully!',
      data: application,
    });
  } catch (error: any) {
    console.error('Error submitting job application:', error);
    res.status(500).json({ success: false, message: 'Server error while submitting application.', error: error.message });
  }
};

// GET /api/careers/applications
export const getAllJobApplications = async (req: Request, res: Response): Promise<void> => {
  try {
    const { search, status, department } = req.query;
    const query: any = {};

    if (status && status !== 'all') {
      query.status = status;
    }

    if (department && department !== 'all') {
      query.department = department;
    }

    if (search) {
      const searchRegex = new RegExp(String(search), 'i');
      query.$or = [{ name: searchRegex }, { email: searchRegex }, { jobTitle: searchRegex }];
    }

    const applications = await JobApplication.find(query).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: applications.length,
      data: applications,
    });
  } catch (error: any) {
    console.error('Error fetching job applications:', error);
    res.status(500).json({ success: false, message: 'Server error while fetching applications.', error: error.message });
  }
};

// PATCH /api/careers/applications/:id
export const updateJobApplicationStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const validStatuses = ['pending', 'reviewed', 'interviewing', 'hired', 'rejected'];
    if (!status || !validStatuses.includes(status)) {
      res.status(400).json({ success: false, message: 'Invalid status provided.' });
      return;
    }

    const updatedApplication = await JobApplication.findByIdAndUpdate(
      id,
      { status },
      { new: true, runValidators: true }
    );

    if (!updatedApplication) {
      res.status(404).json({ success: false, message: 'Job application not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Application status updated successfully.',
      data: updatedApplication,
    });
  } catch (error: any) {
    console.error('Error updating application status:', error);
    res.status(500).json({ success: false, message: 'Server error while updating status.', error: error.message });
  }
};

// DELETE /api/careers/applications/:id
export const deleteJobApplication = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await JobApplication.findByIdAndDelete(id);

    if (!deleted) {
      res.status(404).json({ success: false, message: 'Job application not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Application deleted successfully.',
    });
  } catch (error: any) {
    console.error('Error deleting application:', error);
    res.status(500).json({ success: false, message: 'Server error while deleting application.', error: error.message });
  }
};
