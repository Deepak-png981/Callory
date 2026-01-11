package com.focuscontacts.focus

import android.Manifest
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.ContentValues
import android.content.Context
import android.content.pm.PackageManager
import android.os.Build
import android.provider.ContactsContract
import androidx.core.app.NotificationCompat
import androidx.core.content.ContextCompat
import org.json.JSONArray

object FocusAutomation {
  private const val NOTIF_CHANNEL_ID = "callory_automation"
  private const val NOTIF_ID = 4201

  fun startTemplate(ctx: Context, templateId: String) {
    val templates = AutomationStore.loadTemplates(ctx)
    val template = templates.firstOrNull { it.id == templateId } ?: return

    if (!hasRequiredPermissions(ctx)) {
      notifyNeedsPermissions(ctx, "Permissions required", "Open Callory to enable Contacts + DND access.")
      return
    }

    val prefs = AutomationStore.prefs(ctx)
    val currentSessionTemplateId = prefs.getString(AutomationStore.KEY_SESSION_TEMPLATE_ID, null)

    // If another template is active, restore it before applying the next one.
    if (!currentSessionTemplateId.isNullOrBlank() && currentSessionTemplateId != templateId) {
      val prev = templates.firstOrNull { it.id == currentSessionTemplateId }
      if (prev != null) {
        restoreTemplate(ctx, prev)
      }
    }

    snapshotSystem(ctx)
    applyTemplate(ctx, template)
    prefs.edit().putString(AutomationStore.KEY_SESSION_TEMPLATE_ID, templateId).apply()
  }

  fun stopTemplate(ctx: Context, templateId: String) {
    val templates = AutomationStore.loadTemplates(ctx)
    val template = templates.firstOrNull { it.id == templateId } ?: return

    if (!hasRequiredPermissions(ctx)) {
      notifyNeedsPermissions(ctx, "Permissions required", "Open Callory to restore state safely.")
      return
    }

    val prefs = AutomationStore.prefs(ctx)
    val currentSessionTemplateId = prefs.getString(AutomationStore.KEY_SESSION_TEMPLATE_ID, null)
    if (currentSessionTemplateId != templateId) {
      // Another mode started after this one; don't stop it.
      return
    }

    restoreTemplate(ctx, template)
    prefs.edit().putString(AutomationStore.KEY_SESSION_TEMPLATE_ID, null).apply()
  }

  private fun hasRequiredPermissions(ctx: Context): Boolean {
    val read =
      ContextCompat.checkSelfPermission(ctx, Manifest.permission.READ_CONTACTS) ==
        PackageManager.PERMISSION_GRANTED
    val write =
      ContextCompat.checkSelfPermission(ctx, Manifest.permission.WRITE_CONTACTS) ==
        PackageManager.PERMISSION_GRANTED
    return read && write
  }

  private fun snapshotSystem(ctx: Context) {
    val prefs = AutomationStore.prefs(ctx)
    val manager = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    prefs.edit().putInt(AutomationStore.KEY_SNAPSHOT_INTERRUPTION_FILTER, manager.currentInterruptionFilter).apply()

    val policy = manager.notificationPolicy
    prefs.edit()
      .putBoolean(AutomationStore.KEY_SNAPSHOT_POLICY_PRESENT, policy != null)
      .putInt(AutomationStore.KEY_SNAPSHOT_POLICY_CATEGORIES, policy.priorityCategories)
      .putInt(AutomationStore.KEY_SNAPSHOT_POLICY_CALL_SENDERS, policy.priorityCallSenders)
      .putInt(AutomationStore.KEY_SNAPSHOT_POLICY_MESSAGE_SENDERS, policy.priorityMessageSenders)
      .apply()

    val starredLookupKeys = JSONArray()
    val resolver = ctx.contentResolver
    val cursor =
      resolver.query(
        ContactsContract.Contacts.CONTENT_URI,
        arrayOf(ContactsContract.Contacts.LOOKUP_KEY),
        "${ContactsContract.Contacts.STARRED} = 1",
        null,
        null,
      )

    cursor.use { c ->
      if (c != null) {
        while (c.moveToNext()) {
          val lookupKey = c.getString(0) ?: continue
          if (lookupKey.isNotBlank()) starredLookupKeys.put(lookupKey)
        }
      }
    }

    prefs.edit().putString(AutomationStore.KEY_SNAPSHOT_STARRED_LOOKUP_KEYS_JSON, starredLookupKeys.toString()).apply()
  }

  private fun applyTemplate(ctx: Context, template: TemplateModel) {
    val manager = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (!manager.isNotificationPolicyAccessGranted) {
      notifyNeedsPermissions(ctx, "DND access needed", "Enable Do Not Disturb access in Callory settings.")
      return
    }

    // Strict allowlist: clear stars, then set stars for template contacts.
    clearAllStars(ctx)
    for (c in template.allowedContacts) {
      val lookupKey = c.lookupKey ?: continue
      setStarredByLookupKey(ctx, lookupKey, true)
    }

    val categories =
      NotificationManager.Policy.PRIORITY_CATEGORY_CALLS or
        (if (template.settings.repeatCallersEnabled) NotificationManager.Policy.PRIORITY_CATEGORY_REPEAT_CALLERS else 0)

    val policy =
      NotificationManager.Policy(
        categories,
        NotificationManager.Policy.PRIORITY_SENDERS_STARRED,
        NotificationManager.Policy.PRIORITY_SENDERS_STARRED,
      )

    manager.notificationPolicy = policy
    manager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
  }

  private fun restoreTemplate(ctx: Context, template: TemplateModel) {
    val manager = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
    if (!manager.isNotificationPolicyAccessGranted) {
      notifyNeedsPermissions(ctx, "DND access needed", "Enable Do Not Disturb access in Callory settings.")
      return
    }

    val prefs = AutomationStore.prefs(ctx)

    val hasPolicy = prefs.getBoolean(AutomationStore.KEY_SNAPSHOT_POLICY_PRESENT, false)
    if (hasPolicy) {
      val categories = prefs.getInt(AutomationStore.KEY_SNAPSHOT_POLICY_CATEGORIES, 0)
      val callSenders = prefs.getInt(AutomationStore.KEY_SNAPSHOT_POLICY_CALL_SENDERS, 0)
      val messageSenders = prefs.getInt(AutomationStore.KEY_SNAPSHOT_POLICY_MESSAGE_SENDERS, 0)
      val policy = NotificationManager.Policy(categories, callSenders, messageSenders)
      manager.notificationPolicy = policy
    }

    val filter = prefs.getInt(AutomationStore.KEY_SNAPSHOT_INTERRUPTION_FILTER, NotificationManager.INTERRUPTION_FILTER_ALL)
    manager.setInterruptionFilter(filter)

    if (!template.settings.restoreStarsEnabled) return

    clearAllStars(ctx)
    val raw = prefs.getString(AutomationStore.KEY_SNAPSHOT_STARRED_LOOKUP_KEYS_JSON, "[]") ?: "[]"
    val arr = JSONArray(raw)
    for (i in 0 until arr.length()) {
      val lookupKey = arr.optString(i, "").ifBlank { null } ?: continue
      setStarredByLookupKey(ctx, lookupKey, true)
    }
  }

  private fun clearAllStars(ctx: Context) {
    val resolver = ctx.contentResolver
    val cursor =
      resolver.query(
        ContactsContract.Contacts.CONTENT_URI,
        arrayOf(ContactsContract.Contacts.LOOKUP_KEY),
        "${ContactsContract.Contacts.STARRED} = 1",
        null,
        null,
      )

    cursor.use { c ->
      if (c != null) {
        while (c.moveToNext()) {
          val lookupKey = c.getString(0) ?: continue
          if (lookupKey.isNotBlank()) {
            setStarredByLookupKey(ctx, lookupKey, false)
          }
        }
      }
    }
  }

  private fun setStarredByLookupKey(ctx: Context, lookupKey: String, starred: Boolean) {
    try {
      val resolver = ctx.contentResolver
      val lookupUri =
        android.net.Uri.withAppendedPath(ContactsContract.Contacts.CONTENT_LOOKUP_URI, lookupKey)
      val contactUri = ContactsContract.Contacts.lookupContact(resolver, lookupUri) ?: return

      val values = ContentValues()
      values.put(ContactsContract.Contacts.STARRED, if (starred) 1 else 0)
      resolver.update(contactUri, values, null, null)
    } catch (_: Exception) {
      // best-effort
    }
  }

  private fun notifyNeedsPermissions(ctx: Context, title: String, body: String) {
    val manager = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val channel =
        NotificationChannel(
          NOTIF_CHANNEL_ID,
          "Callory automations",
          NotificationManager.IMPORTANCE_DEFAULT,
        )
      manager.createNotificationChannel(channel)
    }

    val notification =
      NotificationCompat.Builder(ctx, NOTIF_CHANNEL_ID)
        .setSmallIcon(android.R.drawable.ic_dialog_info)
        .setContentTitle(title)
        .setContentText(body)
        .setAutoCancel(true)
        .build()

    manager.notify(NOTIF_ID, notification)
  }
}

