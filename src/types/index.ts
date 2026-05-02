// User Types
export type UserRole = 'CUSTOMER' | 'ORGANISER' | 'ADMIN'

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  isActive: boolean
  isVerified: boolean
  createdAt: Date
  updatedAt: Date
}

// Appointment Types
export type AppointmentStatus = 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED' | 'RESCHEDULED'
export type SlotScheduleType = 'WEEKLY' | 'FLEXIBLE'
export type AssignmentType = 'AUTO' | 'MANUAL'

export interface AppointmentType {
  id: string
  name: string
  description?: string
  duration: number
  isPublished: boolean
  shareToken: string
  maxBookingsPerSlot: number
  requiresPayment: boolean
  paymentAmount?: number
  requiresConfirmation: boolean
  scheduleType: SlotScheduleType
  assignmentType: AssignmentType
  location?: string
  organiserId: string
  createdAt: Date
  updatedAt: Date
}

export interface WeeklySchedule {
  id: string
  appointmentTypeId: string
  dayOfWeek: number // 0=Sunday, 6=Saturday
  startTime: string // "09:00"
  endTime: string // "17:00"
}

export interface Booking {
  id: string
  appointmentTypeId: string
  customerId: string
  providerId?: string
  startTime: Date
  endTime: Date
  status: AppointmentStatus
  capacity: number
  notes?: string
  confirmationCode: string
  isPaid: boolean
  createdAt: Date
  updatedAt: Date
}

export interface Question {
  id: string
  appointmentTypeId: string
  questionText: string
  isRequired: boolean
  order: number
}

export interface BookingAnswer {
  id: string
  bookingId: string
  questionId: string
  answer: string
}

// API Response Types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Form Types
export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export interface OTPFormData {
  otp: string
}

export interface BookingFormData {
  appointmentTypeId: string
  startTime: Date
  endTime: Date
  notes?: string
  answers: {
    questionId: string
    answer: string
  }[]
}
