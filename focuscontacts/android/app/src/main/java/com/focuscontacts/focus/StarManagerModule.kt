package com.focuscontacts.focus

import android.content.ContentValues
import android.net.Uri
import android.provider.ContactsContract
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class StarManagerModule(private val reactContext: ReactApplicationContext) :
  ReactContextBaseJavaModule(reactContext) {
  override fun getName(): String = "StarManagerModule"

  @ReactMethod
  fun getStarredContacts(promise: Promise) {
    try {
      val resolver = reactContext.contentResolver
      val projection =
        arrayOf(
          ContactsContract.Contacts._ID,
          ContactsContract.Contacts.LOOKUP_KEY,
          ContactsContract.Contacts.DISPLAY_NAME_PRIMARY,
        )

      val cursor =
        resolver.query(
          ContactsContract.Contacts.CONTENT_URI,
          projection,
          "${ContactsContract.Contacts.STARRED} = 1",
          null,
          null,
        )

      val result = Arguments.createArray()
      cursor.use { c ->
        if (c == null) {
          promise.resolve(result)
          return
        }

        while (c.moveToNext()) {
          val id = c.getString(c.getColumnIndexOrThrow(ContactsContract.Contacts._ID))
          val lookupKey = c.getString(c.getColumnIndexOrThrow(ContactsContract.Contacts.LOOKUP_KEY))
          val displayName =
            c.getString(c.getColumnIndexOrThrow(ContactsContract.Contacts.DISPLAY_NAME_PRIMARY))

          val map = Arguments.createMap()
          map.putString("contactId", id)
          map.putString("lookupKey", lookupKey)
          map.putString("displayName", displayName)
          result.pushMap(map)
        }
      }

      promise.resolve(result)
    } catch (e: Exception) {
      promise.reject("star_get_error", e)
    }
  }

  @ReactMethod
  fun setStarredByLookupKey(lookupKey: String, starred: Boolean, promise: Promise) {
    try {
      val resolver = reactContext.contentResolver
      val lookupUri = Uri.withAppendedPath(ContactsContract.Contacts.CONTENT_LOOKUP_URI, lookupKey)
      val contactUri = ContactsContract.Contacts.lookupContact(resolver, lookupUri)
      if (contactUri == null) {
        promise.reject("star_contact_not_found", "No contact found for lookupKey=$lookupKey")
        return
      }

      val values = ContentValues()
      values.put(ContactsContract.Contacts.STARRED, if (starred) 1 else 0)
      resolver.update(contactUri, values, null, null)
      promise.resolve(null)
    } catch (e: Exception) {
      promise.reject("star_set_error", e)
    }
  }
}


