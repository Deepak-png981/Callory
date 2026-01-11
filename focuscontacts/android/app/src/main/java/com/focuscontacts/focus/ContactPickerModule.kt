package com.focuscontacts.focus

import android.app.Activity
import android.content.Intent
import android.database.Cursor
import android.net.Uri
import android.provider.ContactsContract
import com.facebook.react.bridge.ActivityEventListener
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class ContactPickerModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext),
  ActivityEventListener {
  override fun getName(): String = "ContactPickerModule"

  private var pendingPromise: Promise? = null

  private val requestCodePickContact = 7523

  init {
    reactContext.addActivityEventListener(this)
  }

  @ReactMethod
  fun pickContact(promise: Promise) {
    val activity = getCurrentActivity()
    if (activity == null) {
      promise.reject("contact_picker_no_activity", "No current activity")
      return
    }

    if (pendingPromise != null) {
      promise.reject("contact_picker_in_progress", "Contact picker already in progress")
      return
    }

    pendingPromise = promise
    val intent = Intent(Intent.ACTION_PICK, ContactsContract.Contacts.CONTENT_URI)
    activity.startActivityForResult(intent, requestCodePickContact)
  }

  override fun onActivityResult(activity: Activity, requestCode: Int, resultCode: Int, data: Intent?) {
    if (requestCode != requestCodePickContact) return

    val promise = pendingPromise
    pendingPromise = null

    if (promise == null) return

    if (resultCode != Activity.RESULT_OK || data?.data == null) {
      promise.resolve(null)
      return
    }

    try {
      val contactUri = data.data ?: run {
        promise.resolve(null)
        return
      }

      val contact = getContactByUri(contactUri)
      promise.resolve(contact)
    } catch (e: Exception) {
      promise.reject("contact_picker_error", e)
    }
  }

  override fun onNewIntent(intent: Intent) {
    // no-op
  }

  private fun getContactByUri(contactUri: Uri): Any? {
    val resolver = reactContext.contentResolver
    val projection =
      arrayOf(
        ContactsContract.Contacts._ID,
        ContactsContract.Contacts.LOOKUP_KEY,
        ContactsContract.Contacts.DISPLAY_NAME_PRIMARY,
        ContactsContract.Contacts.HAS_PHONE_NUMBER,
      )

    val cursor =
      resolver.query(
        contactUri,
        projection,
        null,
        null,
        null,
      )

    cursor.use { c ->
      if (c == null || !c.moveToFirst()) return null

      val id = c.getString(c.getColumnIndexOrThrow(ContactsContract.Contacts._ID))
      val lookupKey = c.getString(c.getColumnIndexOrThrow(ContactsContract.Contacts.LOOKUP_KEY))
      val displayName =
        c.getString(c.getColumnIndexOrThrow(ContactsContract.Contacts.DISPLAY_NAME_PRIMARY))
      val hasPhoneNumber =
        c.getInt(c.getColumnIndexOrThrow(ContactsContract.Contacts.HAS_PHONE_NUMBER)) > 0

      val numbers =
        if (hasPhoneNumber) getPhoneNumbersForContactId(id) else emptyList()

      val map = Arguments.createMap()
      map.putString("contactId", id)
      map.putString("lookupKey", lookupKey)
      map.putString("displayName", displayName)
      map.putString("contactUri", contactUri.toString())

      val arr = Arguments.createArray()
      for (number in numbers) arr.pushString(number)
      map.putArray("phoneNumbers", arr)
      return map
    }
  }

  private fun getPhoneNumbersForContactId(contactId: String): List<String> {
    val resolver = reactContext.contentResolver
    val numbers = mutableListOf<String>()

    val cursor: Cursor? =
      resolver.query(
        ContactsContract.CommonDataKinds.Phone.CONTENT_URI,
        arrayOf(ContactsContract.CommonDataKinds.Phone.NUMBER),
        "${ContactsContract.CommonDataKinds.Phone.CONTACT_ID} = ?",
        arrayOf(contactId),
        null,
      )

    cursor.use { c ->
      if (c == null) return numbers
      while (c.moveToNext()) {
        val number =
          c.getString(c.getColumnIndexOrThrow(ContactsContract.CommonDataKinds.Phone.NUMBER))
        numbers.add(number)
      }
    }

    return numbers
  }
}


