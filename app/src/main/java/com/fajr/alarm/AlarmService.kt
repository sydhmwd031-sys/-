package com.fajr.alarm

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.content.pm.ServiceInfo
import android.media.AudioAttributes
import android.media.AudioManager
import android.media.MediaPlayer
import android.media.RingtoneManager
import android.net.Uri
import android.os.Build
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.os.PowerManager
import android.os.VibrationEffect
import android.os.Vibrator
import android.os.VibratorManager
import androidx.core.app.NotificationCompat
import androidx.core.app.ServiceCompat
import java.io.File

/** يشغّل صوت المنبه أو الأذان في الخلفية حتى والجوال مقفل. */
class AlarmService : Service() {

    companion object {
        const val CH_ALARM = "alarm"
        const val CH_ADHAN = "adhan"
        const val NOTIF_ID = 7
        var isAlarmRunning = false
            private set
    }

    private var player: MediaPlayer? = null
    private var vibrator: Vibrator? = null
    private var wakeLock: PowerManager.WakeLock? = null
    private var savedAlarmVol = -1
    private val handler = Handler(Looper.getMainLooper())
    private var mode = ""

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        createChannels()
        when (intent?.getStringExtra("type")) {
            "alarm" -> startAlarm()
            "adhan" -> {
                if (isAlarmRunning) return START_NOT_STICKY
                startAdhan(intent.getStringExtra("prayer") ?: "")
            }
            else -> stopEverything()
        }
        return START_NOT_STICKY
    }

    private fun createChannels() {
        val nm = getSystemService(NotificationManager::class.java)
        val a = NotificationChannel(CH_ALARM, getString(R.string.ch_alarm), NotificationManager.IMPORTANCE_HIGH).apply {
            setSound(null, null); enableVibration(false); lockscreenVisibility = Notification.VISIBILITY_PUBLIC
            setBypassDnd(true)
        }
        val d = NotificationChannel(CH_ADHAN, getString(R.string.ch_adhan), NotificationManager.IMPORTANCE_HIGH).apply {
            setSound(null, null); lockscreenVisibility = Notification.VISIBILITY_PUBLIC
        }
        nm.createNotificationChannel(a); nm.createNotificationChannel(d)
    }

    private fun goForeground(n: Notification) {
        val type = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) ServiceInfo.FOREGROUND_SERVICE_TYPE_MEDIA_PLAYBACK else 0
        ServiceCompat.startForeground(this, NOTIF_ID, n, type)
    }

    // ---------- منبه الفجر ----------
    private fun startAlarm() {
        stopSound()
        mode = "alarm"; isAlarmRunning = true
        Prefs(this).ringing = true
        val ring = Intent(this, AlarmActivity::class.java)
            .addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_NO_USER_ACTION)
        val full = PendingIntent.getActivity(this, 2, ring, PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(this, CH_ALARM)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle(getString(R.string.alarm_title))
            .setContentText(getString(R.string.alarm_text))
            .setCategory(NotificationCompat.CATEGORY_ALARM)
            .setPriority(NotificationCompat.PRIORITY_MAX)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setOngoing(true)
            .setFullScreenIntent(full, true)
            .setContentIntent(full)
            .build()
        goForeground(n)
        try { startActivity(ring) } catch (_: Exception) { }

        wakeLock = getSystemService(PowerManager::class.java)
            .newWakeLock(PowerManager.PARTIAL_WAKE_LOCK, "fajr:alarm").apply { acquire(60 * 60_000L) }

        // نرفع صوت المنبه للحد الأقصى ونرجعه بعد الإيقاف
        try {
            val am = getSystemService(AudioManager::class.java)
            savedAlarmVol = am.getStreamVolume(AudioManager.STREAM_ALARM)
            am.setStreamVolume(AudioManager.STREAM_ALARM, am.getStreamMaxVolume(AudioManager.STREAM_ALARM), 0)
        } catch (_: Exception) { }

        startVolumeGuard()
        startVibration()

        val cfg = Prefs(this).configJson()
        val adhanFirst = cfg.optBoolean("fajrAdhanFirst", true)
        val fajrFile = SoundStore.file(this, cfg.optString("fajrSound"))
        if (adhanFirst && fajrFile != null) {
            play(Uri.fromFile(fajrFile), loop = false, alarm = true) { playAlarmLoop() }
        } else {
            playAlarmLoop()
        }
        // أمان: لو ما أحد أوقفه خلال ساعة، يوقف لحاله
        handler.postDelayed({ stopEverything() }, 60 * 60_000L)
    }

    /** قفل الصوت: طول ما المنبه يرن، أي تخفيض لصوت المنبه يرجع للأعلى خلال ربع ثانية. */
    private val volumeGuard = object : Runnable {
        override fun run() {
            if (!isAlarmRunning) return
            try {
                val am = getSystemService(AudioManager::class.java)
                val max = am.getStreamMaxVolume(AudioManager.STREAM_ALARM)
                if (am.getStreamVolume(AudioManager.STREAM_ALARM) < max) am.setStreamVolume(AudioManager.STREAM_ALARM, max, 0)
                player?.setVolume(1f, 1f)
            } catch (_: Exception) { }
            handler.postDelayed(this, 250L)
        }
    }

    private fun startVolumeGuard() {
        handler.removeCallbacks(volumeGuard)
        handler.postDelayed(volumeGuard, 250L)
    }

    private fun playAlarmLoop() {
        if (!isAlarmRunning) return
        val f = SoundStore.file(this, Prefs(this).configJson().optString("alarmSound"))
        val uri = f?.let { Uri.fromFile(it) } ?: defaultAlarmUri()
        play(uri, loop = true, alarm = true, onDone = null)
    }

    private fun defaultAlarmUri(): Uri =
        RingtoneManager.getActualDefaultRingtoneUri(this, RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_ALARM)
            ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE)

    // ---------- الأذان ----------
    private fun startAdhan(prayer: String) {
        stopSound()
        mode = "adhan"
        val name = Prefs(this).configJson().optJSONObject("names")?.optString(prayer).orEmpty().ifEmpty { prayer }
        val stop = PendingIntent.getService(
            this, 4, Intent(this, AlarmService::class.java).putExtra("type", "stop"),
            PendingIntent.FLAG_UPDATE_CURRENT or PendingIntent.FLAG_IMMUTABLE
        )
        val open = PendingIntent.getActivity(this, 5, Intent(this, MainActivity::class.java), PendingIntent.FLAG_IMMUTABLE)
        val n = NotificationCompat.Builder(this, CH_ADHAN)
            .setSmallIcon(R.drawable.ic_stat)
            .setContentTitle(getString(R.string.adhan_title, name))
            .setContentText(getString(R.string.adhan_text))
            .setCategory(NotificationCompat.CATEGORY_REMINDER)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setVisibility(NotificationCompat.VISIBILITY_PUBLIC)
            .setContentIntent(open)
            .addAction(0, getString(R.string.stop), stop)
            .setDeleteIntent(stop)
            .build()
        goForeground(n)
        val f = SoundStore.file(this, Prefs(this).configJson().optString("adhanSound"))
        val uri = f?.let { Uri.fromFile(it) } ?: RingtoneManager.getDefaultUri(RingtoneManager.TYPE_NOTIFICATION)
        play(uri, loop = false, alarm = false) { stopEverything() }
        handler.postDelayed({ if (mode == "adhan") stopEverything() }, 10 * 60_000L)
    }

    // ---------- تشغيل الصوت ----------
    private fun play(uri: Uri, loop: Boolean, alarm: Boolean, onDone: (() -> Unit)?) {
        stopSound()
        val attrs = AudioAttributes.Builder()
            .setUsage(if (alarm) AudioAttributes.USAGE_ALARM else AudioAttributes.USAGE_MEDIA)
            .setContentType(AudioAttributes.CONTENT_TYPE_SONIFICATION)
            .build()
        try {
            player = MediaPlayer().apply {
                setAudioAttributes(attrs)
                setDataSource(this@AlarmService, uri)
                isLooping = loop
                setOnCompletionListener { if (!loop) onDone?.invoke() }
                setOnErrorListener { _, _, _ -> handler.post { onDone?.invoke() ?: fallbackTone(alarm) }; true }
                prepare()
                start()
            }
        } catch (e: Exception) {
            if (onDone != null && !loop) onDone() else fallbackTone(alarm)
        }
    }

    private fun fallbackTone(alarm: Boolean) {
        if (!alarm) return
        try {
            player?.release()
            player = MediaPlayer().apply {
                setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_ALARM).build())
                setDataSource(this@AlarmService, RingtoneManager.getDefaultUri(RingtoneManager.TYPE_RINGTONE))
                isLooping = true; prepare(); start()
            }
        } catch (_: Exception) { }
    }

    private fun startVibration() {
        vibrator = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
            getSystemService(VibratorManager::class.java)?.defaultVibrator
        } else {
            @Suppress("DEPRECATION")
            val v = getSystemService(Context.VIBRATOR_SERVICE) as? Vibrator
            v
        }
        try { vibrator?.vibrate(VibrationEffect.createWaveform(longArrayOf(0, 800, 600), 0)) } catch (_: Exception) { }
    }

    private fun stopSound() {
        try { player?.stop() } catch (_: Exception) { }
        try { player?.release() } catch (_: Exception) { }
        player = null
    }

    private fun stopEverything() {
        handler.removeCallbacksAndMessages(null)
        stopSound()
        try { vibrator?.cancel() } catch (_: Exception) { }
        if (savedAlarmVol >= 0) {
            try { getSystemService(AudioManager::class.java).setStreamVolume(AudioManager.STREAM_ALARM, savedAlarmVol, 0) } catch (_: Exception) { }
            savedAlarmVol = -1
        }
        try { if (wakeLock?.isHeld == true) wakeLock?.release() } catch (_: Exception) { }
        isAlarmRunning = false; mode = ""
        Prefs(this).ringing = false
        ServiceCompat.stopForeground(this, ServiceCompat.STOP_FOREGROUND_REMOVE)
        stopSelf()
    }

    override fun onDestroy() {
        handler.removeCallbacksAndMessages(null)
        stopSound()
        try { vibrator?.cancel() } catch (_: Exception) { }
        super.onDestroy()
    }
}
