package com.fajr.alarm

import android.app.AlarmManager
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.content.Context
import android.content.Intent
import android.os.Build
import androidx.core.app.NotificationCompat
import org.json.JSONArray
import org.json.JSONObject

/**
 * التطبيق يحسب مواقيت ٤٥ يوم قدام ويخزّنها. هنا نجدول أقرب حدث فقط،
 * ولما يرن نجدول اللي بعده. كذا يكفي منبه واحد في النظام دائماً.
 */
object Scheduler {
    const val ACTION_FIRE = "com.fajr.alarm.FIRE"
    private const val REQ = 100

    fun nextEvent(ctx: Context, afterMs: Long = System.currentTimeMillis() + 2000): JSONObject? {
        val arr = try { JSONArray(Prefs(ctx).events) } catch (e: Exception) { JSONArray() }
        var best: JSONObject? = null
        for (i in 0 until arr.length()) {
            val o = arr.optJSONObject(i) ?: continue
            val at = o.optLong("at", 0L)
            if (at > afterMs && (best == null || at < best.optLong("at"))) best = o
        }
        return best
    }

    fun remainingDays(ctx: Context): Long {
        val arr = try { JSONArray(Prefs(ctx).events) } catch (e: Exception) { JSONArray() }
        var last = 0L
        for (i in 0 until arr.length()) last = maxOf(last, arr.optJSONObject(i)?.optLong("at") ?: 0L)
        return (last - System.currentTimeMillis()) / 86_400_000L
    }

    private fun firePending(ctx: Context, ev: JSONObject?): PendingIntent {
        val i = Intent(ctx, AlarmReceiver::class.java).setAction(ACTION_FIRE)
        if (ev != null) {
            i.putExtra("type", ev.optString("type"))
            i.putExtra("prayer", ev.optString("prayer"))
            i.putExtra("at", ev.optLong("at"))
        }
        return PendingIntent.getBroadcast(ctx, REQ, i, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
    }

    fun scheduleNext(ctx: Context) {
        val am = ctx.getSystemService(AlarmManager::class.java) ?: return
        val ev = nextEvent(ctx)
        val pi = firePending(ctx, ev)
        if (ev == null) { am.cancel(pi); return }
        val at = ev.optLong("at")
        val canExact = Build.VERSION.SDK_INT < Build.VERSION_CODES.S || am.canScheduleExactAlarms()
        if (canExact) {
            val show = PendingIntent.getActivity(
                ctx, 1, Intent(ctx, MainActivity::class.java),
                PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
            )
            am.setAlarmClock(AlarmManager.AlarmClockInfo(at, show), pi)
        } else {
            am.setAndAllowWhileIdle(AlarmManager.RTC_WAKEUP, at, pi)
        }
        if (remainingDays(ctx) < 4) remindToOpen(ctx)
    }

    /** لو قربت المواقيت المحفوظة تخلص (ما فتح التطبيق شهر ونص) نذكّره يفتحه. */
    private fun remindToOpen(ctx: Context) {
        val nm = ctx.getSystemService(NotificationManager::class.java) ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            nm.createNotificationChannel(NotificationChannel("info", ctx.getString(R.string.ch_info), NotificationManager.IMPORTANCE_DEFAULT))
        }
        val open = PendingIntent.getActivity(ctx, 3, Intent(ctx, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(ctx, "info")
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle(ctx.getString(R.string.app_name))
            .setContentText(ctx.getString(R.string.refresh_times))
            .setContentIntent(open)
            .setAutoCancel(true)
            .build()
        try { nm.notify(9, n) } catch (_: SecurityException) { }
    }
}
