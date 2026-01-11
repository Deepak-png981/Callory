package com.focuscontacts.focus

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class DndModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "DndModule"

  private fun getNotificationManager(): NotificationManager =
    reactContext.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager

  @ReactMethod
  fun isPolicyAccessGranted(promise: Promise) {
    try {
      promise.resolve(getNotificationManager().isNotificationPolicyAccessGranted)
    } catch (e: Exception) {
      promise.reject("dnd_isPolicyAccessGranted_error", e)
    }
  }

  @ReactMethod
  fun openPolicyAccessSettings(promise: Promise) {
    try {
      val activity = getCurrentActivity()
      if (activity == null) {
        promise.reject("dnd_no_activity", "No current activity")
        return
      }

      val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
      activity.startActivity(intent)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("dnd_open_settings_error", e)
    }
  }

  @ReactMethod
  fun getInterruptionFilter(promise: Promise) {
    try {
      promise.resolve(getNotificationManager().currentInterruptionFilter)
    } catch (e: Exception) {
      promise.reject("dnd_get_filter_error", e)
    }
  }

  @ReactMethod
  fun setInterruptionFilter(interruptionFilter: Int, promise: Promise) {
    try {
      val manager = getNotificationManager()
      manager.setInterruptionFilter(interruptionFilter)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("dnd_set_filter_error", e)
    }
  }

  @ReactMethod
  fun getNotificationPolicy(promise: Promise) {
    try {
      val manager = getNotificationManager()
      val policy = manager.notificationPolicy
      val map = Arguments.createMap()
      map.putInt("priorityCategories", policy.priorityCategories)
      map.putInt("priorityCallSenders", policy.priorityCallSenders)
      map.putInt("priorityMessageSenders", policy.priorityMessageSenders)
      promise.resolve(map)
    } catch (e: Exception) {
      promise.reject("dnd_get_policy_error", e)
    }
  }

  @ReactMethod
  fun setNotificationPolicy(
    priorityCategories: Int,
    priorityCallSenders: Int,
    priorityMessageSenders: Int,
    promise: Promise,
  ) {
    try {
      val manager = getNotificationManager()
      if (!manager.isNotificationPolicyAccessGranted) {
        promise.reject("dnd_access_not_granted", "Notification policy access not granted")
        return
      }

      val policy =
        NotificationManager.Policy(
          priorityCategories,
          priorityCallSenders,
          priorityMessageSenders,
        )

      manager.notificationPolicy = policy
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("dnd_set_policy_error", e)
    }
  }

  @ReactMethod
  fun applyFocusPolicy(allowRepeatCallers: Boolean, promise: Promise) {
    try {
      val manager = getNotificationManager()
      if (!manager.isNotificationPolicyAccessGranted) {
        promise.reject("dnd_access_not_granted", "Notification policy access not granted")
        return
      }

      val categories =
        NotificationManager.Policy.PRIORITY_CATEGORY_CALLS or
          (if (allowRepeatCallers) NotificationManager.Policy.PRIORITY_CATEGORY_REPEAT_CALLERS else 0)

      val policy =
        NotificationManager.Policy(
          categories,
          NotificationManager.Policy.PRIORITY_SENDERS_STARRED,
          NotificationManager.Policy.PRIORITY_SENDERS_STARRED,
        )

      manager.notificationPolicy = policy
      manager.setInterruptionFilter(NotificationManager.INTERRUPTION_FILTER_PRIORITY)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("dnd_apply_policy_error", e)
    }
  }
}


