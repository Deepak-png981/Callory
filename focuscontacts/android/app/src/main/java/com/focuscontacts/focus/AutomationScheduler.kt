package com.focuscontacts.focus

import android.app.AlarmManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import java.util.Calendar

object AutomationScheduler {
  const val ACTION_START_TEMPLATE = "com.focuscontacts.action.START_TEMPLATE"
  const val ACTION_STOP_TEMPLATE = "com.focuscontacts.action.STOP_TEMPLATE"
  const val EXTRA_TEMPLATE_ID = "templateId"

  fun rescheduleAll(ctx: Context) {
    val templates = AutomationStore.loadTemplates(ctx)
    for (t in templates) {
      scheduleNextForTemplate(ctx, t)
    }
    // If we are currently inside a scheduled window (e.g. app reopened/rebooted mid-window),
    // apply the most relevant template immediately.
    applyActiveWindowIfAny(ctx, templates)
  }

  private fun scheduleNextForTemplate(ctx: Context, template: TemplateModel) {
    val schedule = template.schedule ?: run {
      cancel(ctx, template.id, isStart = true)
      cancel(ctx, template.id, isStart = false)
      return
    }

    if (!schedule.enabled || schedule.daysOfWeek.isEmpty()) {
      cancel(ctx, template.id, isStart = true)
      cancel(ctx, template.id, isStart = false)
      return
    }

    val now = Calendar.getInstance()
    val nextStartAt = computeNextOccurrence(now, schedule.daysOfWeek, schedule.startMinutes)
    val nextEndAt =
      computeNextEndOccurrence(now, schedule.daysOfWeek, schedule.startMinutes, schedule.endMinutes)

    setAlarm(ctx, template.id, isStart = true, atMillis = nextStartAt.timeInMillis)
    setAlarm(ctx, template.id, isStart = false, atMillis = nextEndAt.timeInMillis)
  }

  private fun setAlarm(ctx: Context, templateId: String, isStart: Boolean, atMillis: Long) {
    val alarmManager = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    val pi = pendingIntent(ctx, templateId, isStart)

    // If exact alarms aren't allowed, fall back to inexact best-effort.
    try {
      if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
        alarmManager.setExactAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, atMillis, pi)
      } else {
        alarmManager.setExact(AlarmManager.RTC_WAKEUP, atMillis, pi)
      }
    } catch (_: SecurityException) {
      alarmManager.set(AlarmManager.RTC_WAKEUP, atMillis, pi)
    }
  }

  private fun cancel(ctx: Context, templateId: String, isStart: Boolean) {
    val alarmManager = ctx.getSystemService(Context.ALARM_SERVICE) as AlarmManager
    alarmManager.cancel(pendingIntent(ctx, templateId, isStart))
  }

  private fun pendingIntent(ctx: Context, templateId: String, isStart: Boolean): PendingIntent {
    val intent =
      Intent(ctx, TemplateAlarmReceiver::class.java).apply {
        action = if (isStart) ACTION_START_TEMPLATE else ACTION_STOP_TEMPLATE
        putExtra(EXTRA_TEMPLATE_ID, templateId)
      }

    val requestCode = (templateId.hashCode() * 31) + (if (isStart) 1 else 2)
    val flags =
      PendingIntent.FLAG_UPDATE_CURRENT or
        (if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) PendingIntent.FLAG_IMMUTABLE else 0)

    return PendingIntent.getBroadcast(ctx, requestCode, intent, flags)
  }

  private fun computeNextOccurrence(
    now: Calendar,
    daysOfWeek: List<Int>,
    minutesSinceMidnight: Int,
  ): Calendar {
    val best = Calendar.getInstance()
    best.timeInMillis = Long.MAX_VALUE

    for (d in daysOfWeek) {
      val candidate = Calendar.getInstance()
      candidate.timeInMillis = now.timeInMillis

      // Align day of week
      val targetDow = mapDowToCalendar(d)
      val currentDow = candidate.get(Calendar.DAY_OF_WEEK)
      var deltaDays = targetDow - currentDow
      if (deltaDays < 0) deltaDays += 7

      candidate.add(Calendar.DAY_OF_YEAR, deltaDays)
      candidate.set(Calendar.HOUR_OF_DAY, minutesSinceMidnight / 60)
      candidate.set(Calendar.MINUTE, minutesSinceMidnight % 60)
      candidate.set(Calendar.SECOND, 0)
      candidate.set(Calendar.MILLISECOND, 0)

      // If it's today but already passed, push a week.
      if (candidate.timeInMillis <= now.timeInMillis) {
        candidate.add(Calendar.DAY_OF_YEAR, 7)
      }

      if (candidate.timeInMillis < best.timeInMillis) {
        best.timeInMillis = candidate.timeInMillis
      }
    }

    return best
  }

  private fun computeNextEndOccurrence(
    now: Calendar,
    daysOfWeek: List<Int>,
    startMinutes: Int,
    endMinutes: Int,
  ): Calendar {
    // Default behavior: end occurs on same day, unless endMinutes < startMinutes (overnight).
    val endBase = computeNextOccurrence(now, daysOfWeek, startMinutes)
    val endCal = Calendar.getInstance()
    endCal.timeInMillis = endBase.timeInMillis

    endCal.set(Calendar.HOUR_OF_DAY, endMinutes / 60)
    endCal.set(Calendar.MINUTE, endMinutes % 60)
    endCal.set(Calendar.SECOND, 0)
    endCal.set(Calendar.MILLISECOND, 0)

    if (endMinutes < startMinutes) {
      endCal.add(Calendar.DAY_OF_YEAR, 1)
    }

    // If computed end is somehow before "now", push by a week.
    if (endCal.timeInMillis <= now.timeInMillis) {
      endCal.add(Calendar.DAY_OF_YEAR, 7)
    }

    return endCal
  }

  private fun mapDowToCalendar(d: Int): Int {
    // 0=Sun..6=Sat  -> Calendar.SUNDAY..SATURDAY (1..7)
    return when (d) {
      0 -> Calendar.SUNDAY
      1 -> Calendar.MONDAY
      2 -> Calendar.TUESDAY
      3 -> Calendar.WEDNESDAY
      4 -> Calendar.THURSDAY
      5 -> Calendar.FRIDAY
      6 -> Calendar.SATURDAY
      else -> Calendar.MONDAY
    }
  }

  private fun applyActiveWindowIfAny(ctx: Context, templates: List<TemplateModel>) {
    val now = Calendar.getInstance()
    val day = calendarDowToModelDow(now.get(Calendar.DAY_OF_WEEK))
    val minutesNow = now.get(Calendar.HOUR_OF_DAY) * 60 + now.get(Calendar.MINUTE)

    val active =
      templates.firstOrNull { t ->
        val s = t.schedule ?: return@firstOrNull false
        if (!s.enabled || s.daysOfWeek.isEmpty()) return@firstOrNull false
        isWithinWindow(day, minutesNow, s)
      }

    if (active != null) {
      try {
        FocusAutomation.startTemplate(ctx, active.id)
      } catch (_: Exception) {
        // best-effort
      }
    }
  }

  private fun isWithinWindow(day: Int, minutesNow: Int, s: ScheduleModel): Boolean {
    val start = s.startMinutes
    val end = s.endMinutes

    // Normal window: start <= end on same day.
    if (end >= start) {
      if (!s.daysOfWeek.contains(day)) return false
      return minutesNow in start until end
    }

    // Overnight window (e.g. 22:00 -> 07:00):
    // - Active from start..24:00 on scheduled day
    // - Active from 00:00..end on next day (if scheduled day was yesterday)
    if (s.daysOfWeek.contains(day) && minutesNow >= start) return true

    val prevDay = (day + 6) % 7
    if (s.daysOfWeek.contains(prevDay) && minutesNow < end) return true

    return false
  }

  private fun calendarDowToModelDow(calendarDow: Int): Int {
    return when (calendarDow) {
      Calendar.SUNDAY -> 0
      Calendar.MONDAY -> 1
      Calendar.TUESDAY -> 2
      Calendar.WEDNESDAY -> 3
      Calendar.THURSDAY -> 4
      Calendar.FRIDAY -> 5
      Calendar.SATURDAY -> 6
      else -> 1
    }
  }
}

