package com.focuscontacts.focus

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent

class BootReceiver : BroadcastReceiver() {
  override fun onReceive(context: Context, intent: Intent?) {
    if (intent == null) return

    when (intent.action) {
      Intent.ACTION_BOOT_COMPLETED,
      Intent.ACTION_MY_PACKAGE_REPLACED,
      -> {
        try {
          AutomationScheduler.rescheduleAll(context)
        } catch (_: Exception) {
          // best-effort
        }
      }
    }
  }
}

