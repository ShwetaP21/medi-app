import { z } from 'zod'

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Must contain an uppercase letter')
    .regex(/[0-9]/, 'Must contain a number'),
})

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
})

export const healthRecordSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  type: z.enum(['VISIT', 'DIAGNOSIS', 'PROCEDURE', 'VACCINATION', 'ALLERGY', 'LAB_RESULT', 'OTHER']),
  description: z.string().min(5, 'Please provide more detail'),
  diagnosis: z.string().optional(),
  doctorName: z.string().optional(),
  visitDate: z.string().min(1, 'Visit date is required'),
})

export const appointmentSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  doctorName: z.string().min(2, 'Doctor name is required'),
  specialty: z.string().optional(),
  location: z.string().optional(),
  appointmentDate: z.string().min(1, 'Date is required'),
  duration: z.number().min(15).max(240).default(30),
  notes: z.string().optional(),
})

export const medicationSchema = z.object({
  name: z.string().min(2, 'Medication name is required'),
  dosage: z.string().min(1, 'Dosage is required'),
  frequency: z.string().min(1, 'Frequency is required'),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  prescribedBy: z.string().optional(),
  notes: z.string().optional(),
})

export const documentSchema = z.object({
  title: z.string().min(2, 'Title is required'),
  type: z.enum(['LAB_REPORT', 'PRESCRIPTION', 'IMAGING', 'DISCHARGE_SUMMARY', 'INSURANCE', 'OTHER']),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type HealthRecordInput = z.infer<typeof healthRecordSchema>
export type AppointmentInput = z.infer<typeof appointmentSchema>
export type MedicationInput = z.infer<typeof medicationSchema>
export type DocumentInput = z.infer<typeof documentSchema>
