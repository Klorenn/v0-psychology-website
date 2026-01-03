/**
 * Ejemplo de cómo adaptar las funciones de BD
 * 
 * Este archivo muestra cómo adaptar lib/google-calendar-auth-db.ts
 * y otras funciones de BD a tu sistema
 */

// ============================================
// Ejemplo 1: Adaptar getGoogleTokens() para Prisma
// ============================================

import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

export async function getGoogleTokens() {
  const token = await prisma.googleCalendarToken.findFirst({
    where: { userEmail: process.env.GOOGLE_CALENDAR_EMAIL }
  })
  
  if (!token) return null
  
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiryDate: token.expiryDate?.getTime() || 0,
    calendarId: token.calendarId || undefined,
    userEmail: token.userEmail
  }
}

// ============================================
// Ejemplo 2: Adaptar saveGoogleTokens() para Prisma
// ============================================

export async function saveGoogleTokens(tokens: {
  accessToken: string
  refreshToken: string
  expiryDate: number
  calendarId?: string
  userEmail?: string
}) {
  await prisma.googleCalendarToken.upsert({
    where: { userEmail: tokens.userEmail || process.env.GOOGLE_CALENDAR_EMAIL! },
    update: {
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiryDate: new Date(tokens.expiryDate),
      calendarId: tokens.calendarId,
      updatedAt: new Date()
    },
    create: {
      userEmail: tokens.userEmail || process.env.GOOGLE_CALENDAR_EMAIL!,
      accessToken: tokens.accessToken,
      refreshToken: tokens.refreshToken,
      expiryDate: new Date(tokens.expiryDate),
      calendarId: tokens.calendarId
    }
  })
}

// ============================================
// Ejemplo 3: Adaptar updateAppointmentCalendarInfo() para Prisma
// ============================================

export async function updateAppointmentCalendarInfo(
  appointmentId: string,
  calendarEventId: string,
  meetLink: string | null
) {
  await prisma.appointment.update({
    where: { id: appointmentId },
    data: {
      calendarEventId,
      meetLink
    }
  })
}

// ============================================
// Ejemplo 4: Adaptar para MongoDB/Mongoose
// ============================================

import mongoose from 'mongoose'

const GoogleTokenSchema = new mongoose.Schema({
  userEmail: { type: String, required: true, unique: true },
  accessToken: { type: String, required: true },
  refreshToken: String,
  expiryDate: Date,
  calendarId: String
})

const GoogleToken = mongoose.model('GoogleToken', GoogleTokenSchema)

export async function getGoogleTokensMongo() {
  const token = await GoogleToken.findOne({
    userEmail: process.env.GOOGLE_CALENDAR_EMAIL
  })
  
  if (!token) return null
  
  return {
    accessToken: token.accessToken,
    refreshToken: token.refreshToken,
    expiryDate: token.expiryDate?.getTime() || 0,
    calendarId: token.calendarId,
    userEmail: token.userEmail
  }
}

// ============================================
// Ejemplo 5: Adaptar para SQL directo (sin ORM)
// ============================================

import { Pool } from 'pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })

export async function getGoogleTokensSQL() {
  const result = await pool.query(
    'SELECT * FROM google_calendar_tokens WHERE user_email = $1',
    [process.env.GOOGLE_CALENDAR_EMAIL]
  )
  
  if (result.rows.length === 0) return null
  
  const token = result.rows[0]
  return {
    accessToken: token.access_token,
    refreshToken: token.refresh_token,
    expiryDate: new Date(token.expiry_date).getTime(),
    calendarId: token.calendar_id,
    userEmail: token.user_email
  }
}

