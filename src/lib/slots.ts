// src/lib/slots.ts - Slot Generation Engine
import { prisma } from './prisma'
import { addMinutes, format, parse, startOfDay, isBefore, isAfter } from 'date-fns'

export interface Slot {
  startTime: Date
  endTime: Date
  available: number
  capacity: number
  isAvailable: boolean
  providerId?: string
}

export interface SlotGenerationOptions {
  appointmentTypeId: string
  date: Date
  providerId?: string
}

/**
 * Generate available slots for a given appointment type and date
 * This is the core algorithm for real-time availability
 */
export async function generateSlots({
  appointmentTypeId,
  date,
  providerId,
}: SlotGenerationOptions): Promise<Slot[]> {
  // 1. Get appointment type details
  const appointmentType = await prisma.appointmentType.findUnique({
    where: { id: appointmentTypeId },
    include: {
      weeklySchedules: true,
      providers: {
        include: {
          provider: true,
        },
      },
    },
  })

  if (!appointmentType) {
    throw new Error('Appointment type not found')
  }

  // 2. Get the day of week (0 = Sunday, 6 = Saturday)
  const dayOfWeek = date.getDay()

  // 3. Find schedule for this day
  const schedule = appointmentType.weeklySchedules.find(
    (s) => s.dayOfWeek === dayOfWeek
  )

  if (!schedule) {
    // No schedule for this day
    return []
  }

  // 4. Parse start and end times
  const dateStr = format(date, 'yyyy-MM-dd')
  const scheduleStart = parse(
    `${dateStr} ${schedule.startTime}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  )
  const scheduleEnd = parse(
    `${dateStr} ${schedule.endTime}`,
    'yyyy-MM-dd HH:mm',
    new Date()
  )

  // 5. Generate all possible slots
  const allSlots: Slot[] = []
  let currentTime = scheduleStart

  while (isBefore(currentTime, scheduleEnd)) {
    const slotEnd = addMinutes(currentTime, appointmentType.duration)

    // Only add slot if it fits within schedule
    if (isBefore(slotEnd, scheduleEnd) || slotEnd.getTime() === scheduleEnd.getTime()) {
      allSlots.push({
        startTime: new Date(currentTime),
        endTime: slotEnd,
        available: appointmentType.maxBookingsPerSlot,
        capacity: appointmentType.maxBookingsPerSlot,
        isAvailable: true,
        providerId,
      })
    }

    currentTime = addMinutes(currentTime, appointmentType.duration)
  }

  // 6. Get existing bookings for this date
  const startOfDateDay = startOfDay(date)
  const endOfDateDay = addMinutes(startOfDateDay, 24 * 60)

  const existingBookings = await prisma.booking.findMany({
    where: {
      appointmentTypeId,
      startTime: {
        gte: startOfDateDay,
        lt: endOfDateDay,
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
      ...(providerId && { providerId }),
    },
    select: {
      startTime: true,
      endTime: true,
      capacity: true,
    },
  })

  // 7. Calculate availability for each slot
  const slotsWithAvailability = allSlots.map((slot) => {
    // Count bookings that overlap with this slot
    const overlappingBookings = existingBookings.filter((booking) => {
      return (
        (isAfter(booking.startTime, slot.startTime) ||
          booking.startTime.getTime() === slot.startTime.getTime()) &&
        isBefore(booking.startTime, slot.endTime)
      )
    })

    // Sum up capacity used by overlapping bookings
    const usedCapacity = overlappingBookings.reduce(
      (sum, booking) => sum + booking.capacity,
      0
    )

    const available = appointmentType.maxBookingsPerSlot - usedCapacity

    return {
      ...slot,
      available,
      isAvailable: available > 0,
    }
  })

  // 8. Filter out past slots (only for today)
  const now = new Date()
  const isToday = format(date, 'yyyy-MM-dd') === format(now, 'yyyy-MM-dd')

  if (isToday) {
    return slotsWithAvailability.filter((slot) => isAfter(slot.startTime, now))
  }

  return slotsWithAvailability
}

/**
 * Get available slots for multiple days
 */
export async function generateSlotsForRange({
  appointmentTypeId,
  startDate,
  endDate,
  providerId,
}: {
  appointmentTypeId: string
  startDate: Date
  endDate: Date
  providerId?: string
}): Promise<Record<string, Slot[]>> {
  const slots: Record<string, Slot[]> = {}
  let currentDate = startOfDay(startDate)
  const end = startOfDay(endDate)

  while (isBefore(currentDate, end) || currentDate.getTime() === end.getTime()) {
    const dateKey = format(currentDate, 'yyyy-MM-dd')
    slots[dateKey] = await generateSlots({
      appointmentTypeId,
      date: currentDate,
      providerId,
    })

    currentDate = addMinutes(currentDate, 24 * 60) // Next day
  }

  return slots
}

/**
 * Check if a specific slot is available
 */
export async function isSlotAvailable({
  appointmentTypeId,
  startTime,
  endTime,
  providerId,
  requestedCapacity = 1,
}: {
  appointmentTypeId: string
  startTime: Date
  endTime: Date
  providerId?: string
  requestedCapacity?: number
}): Promise<boolean> {
  // Get appointment type
  const appointmentType = await prisma.appointmentType.findUnique({
    where: { id: appointmentTypeId },
  })

  if (!appointmentType) {
    return false
  }

  // Count existing bookings for this slot
  const existingBookings = await prisma.booking.findMany({
    where: {
      appointmentTypeId,
      startTime: {
        gte: startTime,
        lt: endTime,
      },
      status: {
        in: ['PENDING', 'CONFIRMED'],
      },
      ...(providerId && { providerId }),
    },
    select: {
      capacity: true,
    },
  })

  const usedCapacity = existingBookings.reduce(
    (sum, booking) => sum + booking.capacity,
    0
  )

  const available = appointmentType.maxBookingsPerSlot - usedCapacity

  return available >= requestedCapacity
}

/**
 * Get next available slot
 */
export async function getNextAvailableSlot({
  appointmentTypeId,
  fromDate,
  providerId,
}: {
  appointmentTypeId: string
  fromDate: Date
  providerId?: string
}): Promise<Slot | null> {
  // Check next 30 days
  const endDate = addMinutes(fromDate, 30 * 24 * 60)
  const slotsRange = await generateSlotsForRange({
    appointmentTypeId,
    startDate: fromDate,
    endDate,
    providerId,
  })

  // Find first available slot
  for (const dateKey of Object.keys(slotsRange).sort()) {
    const daySlots = slotsRange[dateKey]
    const availableSlot = daySlots.find((slot) => slot.isAvailable)
    if (availableSlot) {
      return availableSlot
    }
  }

  return null
}
