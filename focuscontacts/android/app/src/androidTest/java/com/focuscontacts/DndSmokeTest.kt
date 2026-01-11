package com.focuscontacts

import android.app.NotificationManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import androidx.test.ext.junit.runners.AndroidJUnit4
import androidx.test.platform.app.InstrumentationRegistry
import org.junit.Assert.assertNotNull
import org.junit.Test
import org.junit.runner.RunWith

@RunWith(AndroidJUnit4::class)
class DndSmokeTest {
  @Test
  fun hasNotificationManager() {
    val ctx = InstrumentationRegistry.getInstrumentation().targetContext
    val nm = ctx.getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager?
    assertNotNull(nm)
  }

  @Test
  fun policySettingsIntentResolves() {
    val ctx = InstrumentationRegistry.getInstrumentation().targetContext
    val intent = Intent(Settings.ACTION_NOTIFICATION_POLICY_ACCESS_SETTINGS)
    val resolved = intent.resolveActivity(ctx.packageManager)
    assertNotNull(resolved)
  }
}


