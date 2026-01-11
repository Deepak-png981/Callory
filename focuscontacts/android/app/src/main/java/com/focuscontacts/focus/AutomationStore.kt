package com.focuscontacts.focus

import android.content.Context
import android.content.SharedPreferences
import org.json.JSONArray
import org.json.JSONObject

data class ScheduleModel(
  val enabled: Boolean,
  val daysOfWeek: List<Int>,
  val startMinutes: Int,
  val endMinutes: Int,
)

data class TemplateSettingsModel(
  val restoreStarsEnabled: Boolean,
  val repeatCallersEnabled: Boolean,
)

data class AllowedContactModel(
  val lookupKey: String?,
)

data class TemplateModel(
  val id: String,
  val name: String,
  val allowedContacts: List<AllowedContactModel>,
  val settings: TemplateSettingsModel,
  val schedule: ScheduleModel?,
)

object AutomationStore {
  private const val PREFS = "callory_automation"
  private const val KEY_TEMPLATES_JSON = "templates_json"

  const val KEY_SESSION_TEMPLATE_ID = "session_template_id"
  const val KEY_SNAPSHOT_INTERRUPTION_FILTER = "snapshot_interruption_filter"
  const val KEY_SNAPSHOT_POLICY_CATEGORIES = "snapshot_policy_categories"
  const val KEY_SNAPSHOT_POLICY_CALL_SENDERS = "snapshot_policy_call_senders"
  const val KEY_SNAPSHOT_POLICY_MESSAGE_SENDERS = "snapshot_policy_message_senders"
  const val KEY_SNAPSHOT_POLICY_PRESENT = "snapshot_policy_present"
  const val KEY_SNAPSHOT_STARRED_LOOKUP_KEYS_JSON = "snapshot_starred_lookup_keys_json"

  fun prefs(ctx: Context): SharedPreferences = ctx.getSharedPreferences(PREFS, Context.MODE_PRIVATE)

  fun saveTemplatesJson(ctx: Context, json: String) {
    prefs(ctx).edit().putString(KEY_TEMPLATES_JSON, json).apply()
  }

  fun loadTemplatesJson(ctx: Context): String? = prefs(ctx).getString(KEY_TEMPLATES_JSON, null)

  fun loadTemplates(ctx: Context): List<TemplateModel> {
    val raw = loadTemplatesJson(ctx) ?: return emptyList()
    return parseTemplates(raw)
  }

  fun parseTemplates(raw: String): List<TemplateModel> {
    val arr = JSONArray(raw)
    val out = mutableListOf<TemplateModel>()
    for (i in 0 until arr.length()) {
      val obj = arr.optJSONObject(i) ?: continue
      val id = obj.optString("id", "")
      if (id.isBlank()) continue
      val name = obj.optString("name", "Mode")

      val settingsObj = obj.optJSONObject("settings") ?: JSONObject()
      val settings =
        TemplateSettingsModel(
          restoreStarsEnabled = settingsObj.optBoolean("restoreStarsEnabled", true),
          repeatCallersEnabled = settingsObj.optBoolean("repeatCallersEnabled", false),
        )

      val allowedArr = obj.optJSONArray("allowedContacts") ?: JSONArray()
      val allowed = mutableListOf<AllowedContactModel>()
      for (j in 0 until allowedArr.length()) {
        val cObj = allowedArr.optJSONObject(j) ?: continue
        val lookupKey = cObj.optString("contactLookupKey", "").ifBlank { null }
        allowed.add(AllowedContactModel(lookupKey = lookupKey))
      }

      val schedObj = obj.optJSONObject("schedule")
      val schedule =
        if (schedObj == null) null
        else {
          val days = schedObj.optJSONArray("daysOfWeek") ?: JSONArray()
          val dayList = mutableListOf<Int>()
          for (k in 0 until days.length()) {
            val d = days.optInt(k, -1)
            if (d in 0..6) dayList.add(d)
          }
          ScheduleModel(
            enabled = schedObj.optBoolean("enabled", false),
            daysOfWeek = dayList,
            startMinutes = schedObj.optInt("startMinutes", 9 * 60),
            endMinutes = schedObj.optInt("endMinutes", 18 * 60),
          )
        }

      out.add(
        TemplateModel(
          id = id,
          name = name,
          allowedContacts = allowed,
          settings = settings,
          schedule = schedule,
        ),
      )
    }
    return out
  }
}

