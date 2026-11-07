package com.fajr.alarm

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import androidx.core.content.ContextCompat

class AlarmReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        val type = intent.getStringExtra("type")
        val at = intent.getLongExtra("at", 0L)
        val late = System.currentTimeMillis() - at
        // نتجاهل الحدث لو تأخر كثير (الجوال كان طافي مثلاً)
        if (type != null && late < 30 * 60_000L && !(type == "adhan" && Prefs(ctx).ringing)) {
            val s = Intent(ctx, AlarmService::class.java)
                .putExtra("type", type)
                .putExtra("prayer", intent.getStringExtra("prayer") ?: "")
            try { ContextCompat.startForegroundService(ctx, s) } catch (_: Exception) { }
        }
        Scheduler.scheduleNext(ctx)
    }
}

class BootReceiver : BroadcastReceiver() {
    override fun onReceive(ctx: Context, intent: Intent) {
        Scheduler.scheduleNext(ctx)
    }
}
