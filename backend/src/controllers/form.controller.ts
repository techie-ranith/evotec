import { Request, Response } from 'express';
import { FormSubmission } from '../models/FormSubmission';

export async function createForm(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const data = req.body as {
      firstName: string;
      lastName: string;
      email: string;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      mobileNumber: string;
      address: string;
      feedback?: string;
    };

    const existing = await FormSubmission.findOne({
      email: data.email.toLowerCase(),
    });
    if (existing) {
      res.status(409).json({ message: 'A submission with this email already exists' });
      return;
    }

    const submission = await FormSubmission.create({
      ...data,
      email: data.email.toLowerCase(),
      userCreated: req.user.id,
      dateCreated: new Date(),
    });

    res.status(201).json({
      message: 'Form submitted successfully',
      submission,
    });
  } catch (error) {
    console.error('createForm error:', error);
    res.status(500).json({ message: 'Failed to submit form' });
  }
}

export async function listForms(req: Request, res: Response): Promise<void> {
  try {
    const query = (req as Request & { validatedQuery?: { gender?: string; search?: string } })
      .validatedQuery ?? (req.query as { gender?: string; search?: string });

    const filter: Record<string, unknown> = {};

    if (query.gender) {
      filter.gender = query.gender;
    }

    if (query.search?.trim()) {
      const term = query.search.trim();
      filter.$or = [
        { firstName: { $regex: term, $options: 'i' } },
        { lastName: { $regex: term, $options: 'i' } },
      ];
    }

    const submissions = await FormSubmission.find(filter)
      .populate('userCreated', 'email role')
      .populate('userModified', 'email role')
      .sort({ dateCreated: -1 });

    res.json({ submissions });
  } catch (error) {
    console.error('listForms error:', error);
    res.status(500).json({ message: 'Failed to fetch submissions' });
  }
}

export async function updateForm(req: Request, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    const updates = req.body as Partial<{
      firstName: string;
      lastName: string;
      email: string;
      gender: 'MALE' | 'FEMALE' | 'OTHER';
      mobileNumber: string;
      address: string;
      feedback: string;
    }>;

    if (updates.email) {
      const conflict = await FormSubmission.findOne({
        email: updates.email.toLowerCase(),
        _id: { $ne: id },
      });
      if (conflict) {
        res.status(409).json({ message: 'A submission with this email already exists' });
        return;
      }
      updates.email = updates.email.toLowerCase();
    }

    const submission = await FormSubmission.findByIdAndUpdate(
      id,
      {
        ...updates,
        userModified: req.user.id,
        dateModified: new Date(),
      },
      { new: true, runValidators: true }
    )
      .populate('userCreated', 'email role')
      .populate('userModified', 'email role');

    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    res.json({
      message: 'Submission updated successfully',
      submission,
    });
  } catch (error) {
    console.error('updateForm error:', error);
    res.status(500).json({ message: 'Failed to update submission' });
  }
}

export async function deleteForm(req: Request, res: Response): Promise<void> {
  try {
    const { id } = req.params;
    const submission = await FormSubmission.findByIdAndDelete(id);

    if (!submission) {
      res.status(404).json({ message: 'Submission not found' });
      return;
    }

    res.json({ message: 'Submission deleted successfully' });
  } catch (error) {
    console.error('deleteForm error:', error);
    res.status(500).json({ message: 'Failed to delete submission' });
  }
}
