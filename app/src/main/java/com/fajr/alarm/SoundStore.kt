package com.fajr.alarm

import android.content.Context
import android.media.AudioAttributes
import android.media.MediaPlayer
import android.net.Uri
import android.provider.OpenableColumns
import org.json.JSONObject
import java.io.File
import java.net.HttpURLConnection
import java.net.URL

/** ملفات الأصوات اللي يضيفها المستخدم تنسخ داخل التطبيق عشان تشتغل حتى لو انحذف الأصل. */
object SoundStore {
    private val SLOT = Regex("^[a-z0-9_]{1,32}$")

    private fun dir(ctx: Context) = File(ctx.filesDir, "sounds").apply { mkdirs() }

    private val TONES = setOf("sunrise", "bells", "breeze", "birds", "pulse", "siren")
    private val SOURCES = listOf(
        "https://raw.githubusercontent.com/meypod/audio_files/",
        "https://raw.githubusercontent.com/abodehq/Athan-MP3/"
    )

    fun file(ctx: Context, slot: String?): File? {
        if (slot.isNullOrEmpty() || !SLOT.matches(slot)) return null
        val f = File(dir(ctx), "$slot.snd")
        if (f.exists() && f.length() > 0) return f
        // النغمات المدمجة: ننسخها من التطبيق أول مرة
        val tone = slot.removePrefix("tone_")
        if (slot.startsWith("tone_") && tone in TONES) {
            return try {
                ctx.assets.open("www/tones/$tone.ogg").use { i -> f.outputStream().use { i.copyTo(it) } }
                f
            } catch (e: Exception) { null }
        }
        return null
    }

    fun save(ctx: Context, slot: String, uri: Uri): String? {
        if (!SLOT.matches(slot)) return null
        val name = displayName(ctx, uri) ?: slot
        return try {
            ctx.contentResolver.openInputStream(uri)?.use { input ->
                File(dir(ctx), "$slot.snd").outputStream().use { input.copyTo(it) }
            } ?: return null
            val names = JSONObject(Prefs(ctx).soundNames)
            names.put(slot, name)
            Prefs(ctx).soundNames = names.toString()
            name
        } catch (e: Exception) { null }
    }

    /** تحميل أذان من مستودع الأصوات المفتوح على GitHub. يشتغل في خيط خلفي. */
    fun download(ctx: Context, slot: String, url: String, name: String): Boolean {
        if (!SLOT.matches(slot) || SOURCES.none { url.startsWith(it) }) return false
        val tmp = File(dir(ctx), "$slot.tmp")
        return try {
            var target = URL(url)
            var conn: HttpURLConnection
            var hops = 0
            while (true) {
                conn = target.openConnection() as HttpURLConnection
                conn.connectTimeout = 20_000; conn.readTimeout = 60_000
                conn.instanceFollowRedirects = false
                val code = conn.responseCode
                if (code in 300..399 && hops < 5) {
                    val loc = conn.getHeaderField("Location") ?: return false
                    target = URL(target, loc); hops++; conn.disconnect(); continue
                }
                if (code != 200) return false
                break
            }
            conn.inputStream.use { input -> tmp.outputStream().use { input.copyTo(it) } }
            conn.disconnect()
            if (tmp.length() < 20_000) { tmp.delete(); return false }
            val out = File(dir(ctx), "$slot.snd")
            out.delete()
            if (!tmp.renameTo(out)) return false
            val names = JSONObject(Prefs(ctx).soundNames)
            names.put(slot, name)
            Prefs(ctx).soundNames = names.toString()
            true
        } catch (e: Exception) { tmp.delete(); false }
    }

    fun delete(ctx: Context, slot: String) {
        if (!SLOT.matches(slot)) return
        File(dir(ctx), "$slot.snd").delete()
        val names = JSONObject(Prefs(ctx).soundNames)
        names.remove(slot)
        Prefs(ctx).soundNames = names.toString()
    }

    /** {slot: اسم الملف} للأصوات الموجودة فعلاً */
    fun list(ctx: Context): String {
        val names = try { JSONObject(Prefs(ctx).soundNames) } catch (e: Exception) { JSONObject() }
        val out = JSONObject()
        names.keys().forEach { k -> if (file(ctx, k) != null) out.put(k, names.optString(k)) }
        return out.toString()
    }

    private fun displayName(ctx: Context, uri: Uri): String? = try {
        ctx.contentResolver.query(uri, arrayOf(OpenableColumns.DISPLAY_NAME), null, null, null)?.use { c ->
            if (c.moveToFirst()) c.getString(0) else null
        }
    } catch (e: Exception) { null }

    // ---------- معاينة ----------
    private var preview: MediaPlayer? = null

    fun preview(ctx: Context, slot: String, onEnd: () -> Unit) {
        stopPreview()
        val f = file(ctx, slot) ?: return onEnd()
        try {
            preview = MediaPlayer().apply {
                setAudioAttributes(AudioAttributes.Builder().setUsage(AudioAttributes.USAGE_MEDIA).build())
                setDataSource(f.absolutePath)
                setOnCompletionListener { stopPreview(); onEnd() }
                prepare(); start()
            }
        } catch (e: Exception) { stopPreview(); onEnd() }
    }

    fun stopPreview() {
        try { preview?.stop() } catch (_: Exception) { }
        try { preview?.release() } catch (_: Exception) { }
        preview = null
    }
}
