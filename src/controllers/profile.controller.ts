import { Request, Response } from 'express';
import axios from 'axios';
import Profile from '../models/profile.model';

export const getProfiles = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    if (!userId) {
      res.status(400).json({ error: 'userId is required' });
      return;
    }
    const profiles = await Profile.find({ userId: String(userId) });
    res.status(200).json(profiles);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { userId, name, avatar } = req.body;
    if (!userId || !name || !avatar) {
      res.status(400).json({ error: 'userId, name, and avatar are required' });
      return;
    }
    const profile = new Profile({ userId, name, avatar });
    await profile.save();
    res.status(201).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, avatar } = req.body;
    if (!name || !avatar) {
      res.status(400).json({ error: 'name and avatar are required' });
      return;
    }
    const profile = await Profile.findByIdAndUpdate(
      id,
      { name, avatar },
      { new: true }
    );
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.status(200).json(profile);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const profile = await Profile.findByIdAndDelete(id);
    if (!profile) {
      res.status(404).json({ error: 'Profile not found' });
      return;
    }
    res.status(200).json({ message: 'Profile deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const uploadAvatar = async (req: Request, res: Response): Promise<void> => {
  try {
    const { image } = req.body; // base64 encoded image string
    if (!image) {
      res.status(400).json({ error: 'image base64 string is required' });
      return;
    }

    const apiKey = process.env.IMGBB_API_KEY;
    if (!apiKey) {
      res.status(500).json({ error: 'IMGBB_API_KEY is not configured on the server' });
      return;
    }

    // Strip out standard base64 content prefix if present (e.g. data:image/png;base64,)
    let base64Data = image;
    if (image.includes(';base64,')) {
      base64Data = image.split(';base64,')[1];
    }

    // Check size roughly from base64 string length
    const approximateSizeBytes = (base64Data.length * 3) / 4;
    const limitSizeBytes = 2 * 1024 * 1024; // 2MB
    if (approximateSizeBytes > limitSizeBytes) {
      res.status(400).json({ error: 'Image size exceeds the 2MB limit' });
      return;
    }

    // Upload to ImgBB via Axios
    const body = new URLSearchParams();
    body.append('image', base64Data);

    const imgbbRes = await axios.post(`https://api.imgbb.com/1/upload?key=${apiKey}`, body, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });

    const finalUrl = imgbbRes.data?.data?.url;
    if (!finalUrl) {
      res.status(500).json({ error: 'Failed to receive image URL from ImgBB' });
      return;
    }
    res.status(200).json({ url: finalUrl });
  } catch (error: any) {
    console.error('Error uploading image to ImgBB:', error.message);
    res.status(500).json({ error: error.message || 'Image upload failed' });
  }
};
