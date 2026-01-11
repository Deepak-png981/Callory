package com.focuscontacts.focus

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AutomationModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "AutomationModule"

  @ReactMethod
  fun syncTemplatesJson(templatesJson: String, promise: Promise) {
    try {
      AutomationStore.saveTemplatesJson(reactContext, templatesJson)
      AutomationScheduler.rescheduleAll(reactContext)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("automation_sync_error", e)
    }
  }

  @ReactMethod
  fun rescheduleAll(promise: Promise) {
    try {
      AutomationScheduler.rescheduleAll(reactContext)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("automation_reschedule_error", e)
    }
  }
}

