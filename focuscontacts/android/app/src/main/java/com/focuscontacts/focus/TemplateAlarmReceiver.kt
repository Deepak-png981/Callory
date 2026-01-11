package com.focuscontacts.focus

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class TemplateAlarmReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent == null) return
    val templateId = intent.getStringExtra(AutomationScheduler.EXTRA_TEMPLATE_ID) ?: return

    when (intent.action) {
      AutomationScheduler.ACTION_START_TEMPLATE -> FocusAutomation.startTemplate(context, templateId)
      AutomationScheduler.ACTION_STOP_TEMPLATE -> FocusAutomation.stopTemplate(context, templateId)
      else -> return
    }

    // Always reschedule after an event so the next occurrence is set.
    try {
      AutomationScheduler.rescheduleAll(context)
    } catch (_: Exception) {
      // best-effort
    }
  }
}

